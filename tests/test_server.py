import io
import json
import threading
import unittest
import urllib.error
import urllib.request
import zipfile
from http.server import ThreadingHTTPServer
from neslab.server import Handler
from test_rom import fixture
from test_project import runnable_rom
from neslab.rom import export_zip


class ServerTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.base = f'http://127.0.0.1:{cls.server.server_port}'

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join()

    def test_health_and_assets(self):
        with urllib.request.urlopen(self.base + '/api/health') as response:
            self.assertEqual(json.load(response)['app'], 'neslab')
        with urllib.request.urlopen(self.base + '/app.js?v=2') as response:
            self.assertIn(b'initialize()', response.read())

    def test_analysis_upload(self):
        with urllib.request.urlopen(self.base + '/api/analyze', data=fixture()) as response:
            self.assertEqual(json.load(response)['tiles'], 512)

    def test_invalid_upload(self):
        with self.assertRaises(urllib.error.HTTPError) as error:
            urllib.request.urlopen(self.base + '/api/analyze', data=b'bad')
        self.assertEqual(error.exception.code, 400)
        self.assertIn('error', json.load(error.exception))

    def test_export(self):
        data = fixture()
        with urllib.request.urlopen(self.base + '/api/export', data=data) as response:
            self.assertEqual(response.headers.get_content_type(), 'application/zip')
            with zipfile.ZipFile(io.BytesIO(response.read())) as archive:
                self.assertEqual(archive.read('original.nes'), data)

    def test_project_from_export(self):
        rom=runnable_rom()
        with urllib.request.urlopen(self.base+'/api/project',data=export_zip(rom)) as response:
            self.assertIn('neslab-project.zip',response.headers['Content-Disposition'])
            with zipfile.ZipFile(io.BytesIO(response.read())) as archive:
                self.assertEqual(archive.read('original.nes'),rom)
                self.assertIn('play.html',archive.namelist())

    def test_runtime_and_analysis_from_export(self):
        rom=runnable_rom()
        with urllib.request.urlopen(self.base+'/api/analyze',data=export_zip(rom)) as response:
            report=json.load(response)
            self.assertTrue(report['runtime']['available'])
            self.assertEqual(report['code_analysis']['instruction_count'],3)
        with urllib.request.urlopen(self.base+'/api/runtime',data=export_zip(rom)) as response:
            import base64
            self.assertEqual(base64.b64decode(json.load(response)['romBase64']),rom)

    def test_chr_bank_selection_and_bounds(self):
        import base64
        rom=bytearray(runnable_rom());rom[5]=2;rom.extend(bytes([42])*8192)
        request=urllib.request.Request(self.base+'/api/chr',data=rom,headers={'X-CHR-Bank':'1'})
        with urllib.request.urlopen(request) as response:
            self.assertEqual(base64.b64decode(json.load(response)['preview_chr_base64']),bytes([42])*8192)
        for bank in ('-1','2','invalid'):
            with self.assertRaises(urllib.error.HTTPError) as error:
                urllib.request.urlopen(urllib.request.Request(self.base+'/api/chr',data=rom,headers={'X-CHR-Bank':bank}))
            self.assertEqual(error.exception.code,400)
