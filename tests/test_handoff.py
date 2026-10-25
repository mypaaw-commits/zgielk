import base64
import hashlib
import io
import json
import unittest
import zipfile
from neslab.handoff import handoff_zip
from neslab.rom import analyze,chr_png,RomError
from test_project import runnable_rom


def observation(rom,frame=2):
    return {'rom_sha256':analyze(rom)[0]['sha256'],'frame':frame,'label':'Ruch',
            'ram':[0]*2048,'oam':[0]*256,'ppu_vram':[0]*16384,
            'chr_base64':base64.b64encode(bytes(8192)).decode(),
            'screenshot_png':'data:image/png;base64,'+base64.b64encode(chr_png(bytes(8192))).decode(),
            'inputs':[{'frame':0,'button':7,'down':True}]}


class HandoffTests(unittest.TestCase):
    def test_static_bundle_lossless_with_explicit_gaps(self):
        rom=runnable_rom()
        with zipfile.ZipFile(io.BytesIO(handoff_zip(rom))) as z:
            self.assertEqual(z.read('source/original.nes'),rom)
            spec=json.loads(z.read('reconstruction-spec.json'))
            self.assertFalse(spec['ready_for_faithful_port'])
            self.assertTrue(spec['unresolved'])
            manifest=json.loads(z.read('manifest.json'))
            for name,entry in manifest['files'].items():self.assertEqual(hashlib.sha256(z.read(name)).hexdigest(),entry['sha256'])
            self.assertNotIn('play.html',z.namelist())

    def test_observation_and_ram_delta(self):
        rom=runnable_rom();a=observation(rom);b=observation(rom,4);b['ram'][32]=7
        with zipfile.ZipFile(io.BytesIO(handoff_zip(rom,[a,b],'test'))) as z:
            self.assertEqual(len(z.read('observations/01/patterns.chr')),8192)
            diff=json.loads(z.read('observations/02/metadata.json'))['changed_ram_since_previous_capture']
            self.assertEqual(diff,[{'address':32,'before':0,'after':7}])

    def test_reject_foreign_and_malformed_observations(self):
        rom=runnable_rom()
        for field,value in [('rom_sha256','wrong'),('frame',-1),('ram',[0]),('chr_base64','abc'),('inputs',[{'frame':-1,'button':0,'down':True}])]:
            item=observation(rom);item[field]=value
            with self.assertRaises(RomError,msg=field):handoff_zip(rom,[item])

    def test_unknown_mapper_still_exports_static_material(self):
        rom=bytearray(runnable_rom());rom[6]=0xf0;rom[7]=0xf0
        with zipfile.ZipFile(io.BytesIO(handoff_zip(rom))) as z:
            self.assertEqual(z.read('source/original.nes'),rom)
            self.assertEqual(json.loads(z.read('code/static-analysis.json'))['instructions'],[])
