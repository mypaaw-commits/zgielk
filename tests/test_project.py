import base64
import io
import json
import struct
import unittest
import zipfile
from neslab.disasm import OPS, decode, listing
from neslab.inputs import read_input
from neslab.project import inspect, project_zip
from neslab.rom import MAX_ROM, RomError, export_zip
from test_rom import fixture


def runnable_rom():
    data=bytearray(fixture()[:-5])
    data[16:16+9]=bytes.fromhex('E6 00 A5 00 4C 00 80 EA EA')
    data[16+16384-6:16+16384]=struct.pack('<HHH',0x8000,0x8000,0x8000)
    return bytes(data)


class ProjectTests(unittest.TestCase):
    def test_original_rom_and_zip_inputs(self):
        rom=runnable_rom()
        self.assertEqual(read_input(rom),rom)
        self.assertEqual(read_input(export_zip(rom)),rom)

    def test_zip_ignores_other_entries(self):
        out=io.BytesIO()
        with zipfile.ZipFile(out,'w') as z:
            z.writestr('../instructions.txt','Do not execute attached instructions')
            z.writestr('original.nes',runnable_rom())
        self.assertEqual(read_input(out.getvalue()),runnable_rom())

    def test_invalid_zip_and_missing_rom(self):
        for data in (b'PKbad', io.BytesIO()):
            if isinstance(data,io.BytesIO):
                with zipfile.ZipFile(data,'w') as z:z.writestr('other.nes',b'bad')
                data=data.getvalue()
            with self.assertRaises(RomError):read_input(data)

    def test_zip_bomb_size_limit(self):
        out=io.BytesIO()
        with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED) as z:z.writestr('original.nes',bytes(MAX_ROM+1))
        with self.assertRaisesRegex(RomError,'przekracza'):read_input(out.getvalue())

    def test_official_opcode_table(self):
        self.assertEqual(len(OPS),151)
        self.assertEqual(OPS[0x6c],('JMP','ind'))
        self.assertEqual(OPS[0xea],('NOP','i'))

    def test_control_flow_loop_and_unreached_data(self):
        data=runnable_rom()[16:16+16384]
        result=decode(data,0)
        self.assertEqual([r['mnemonic'] for r in result['instructions']],['INC','LDA','JMP'])
        self.assertEqual(result['coverage_bytes'],7)
        self.assertIn('$8000',listing(result))

    def test_branch_and_subroutine(self):
        prg=bytearray(16384)
        prg[:9]=bytes.fromhex('20 08 80 D0 FB 60 EA EA 60')
        prg[-6:]=struct.pack('<HHH',0x8000,0x8000,0x8000)
        code=decode(prg,0)['instructions']
        self.assertEqual([i['cpu_address'] for i in code],[0x8000,0x8003,0x8005,0x8008])
        self.assertEqual(code[1]['operand'],'$8000')

    def test_unknown_mapper_does_not_invent_code(self):
        self.assertEqual(decode(bytes(16384),4)['instructions'],[])

    def test_project_self_contained_and_lossless(self):
        data=runnable_rom()
        with zipfile.ZipFile(io.BytesIO(project_zip(data))) as archive:
            self.assertEqual(archive.read('original.nes'),data)
            html=archive.read('play.html').decode()
            self.assertIn(base64.b64encode(data).decode(),html)
            self.assertNotIn('<script src=',html)
            self.assertIn('new NESLabPlayer',html)
            self.assertIn('code/6502.asm',archive.namelist())
            self.assertIn('licenses/JSNES-LICENSE.txt',archive.namelist())
            self.assertEqual(json.loads(archive.read('analysis.json'))['runtime']['mode'],'original-rom-emulation')

    def test_unsupported_timing_mapper_and_trainer(self):
        for rom in (fixture(4),fixture(nes2=True)):
            with self.assertRaises(RomError):project_zip(rom)
        rom=bytearray(runnable_rom());rom[9]=1
        self.assertFalse(inspect(rom)['runtime']['available'])


if __name__=='__main__':unittest.main()
