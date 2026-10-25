import io
import json
import struct
import unittest
import zipfile
import zlib
from neslab.rom import RomError, analyze, chr_png, export_zip


def fixture(flags=0, nes2=False):
    h=bytearray(b'NES\x1a'+bytes(12)); h[4]=1; h[5]=1; h[6]=flags
    if nes2: h[7]=8; h[8]=0x21
    prg=bytearray(16384);prg[20:25]=b'HELLO';prg[-6:]=struct.pack('<HHH',0x8000,0x8123,0x9000)
    return bytes(h)+(b'T'*512 if flags&4 else b'')+prg+bytes([255]*8+[0]*8)+bytes(8192-16)+b'EXTRA'


class RomTests(unittest.TestCase):
    def test_ines_vectors_strings(self):
        report,parts=analyze(fixture())
        self.assertEqual(report['vectors']['RESET'],'$8123')
        self.assertEqual(report['strings'][0],{'prg_offset':20,'text':'HELLO'})
        self.assertEqual(report['tiles'],512)
        self.assertEqual(parts['trailing.bin'],b'EXTRA')

    def test_trainer_and_lossless_export(self):
        data=fixture(4)
        with zipfile.ZipFile(io.BytesIO(export_zip(data))) as z:
            restored=b''.join(z.read('raw/'+name) for name in ['header.bin','trainer.bin','prg.bin','chr.bin','trailing.bin'])
            self.assertEqual(restored,data)
            self.assertEqual(z.read('original.nes'),data)
            self.assertTrue(z.read('graphics/chr-bank-0000.png').startswith(b'\x89PNG'))
            self.assertEqual(json.loads(z.read('analysis.json'))['format'],'iNES')

    def test_nes2_mapper(self):
        report,_=analyze(fixture(nes2=True))
        self.assertEqual((report['mapper'],report['submapper']),(256,2))
        self.assertIsNone(report['vectors'])

    def test_nes2_exponent_size(self):
        h=bytearray(b'NES\x1a'+bytes(12));h[7]=8;h[4]=14<<2;h[9]=15
        report,_=analyze(bytes(h)+bytes(16384))
        self.assertEqual(report['prg_bytes'],16384)
        self.assertEqual(report['chr_bytes'],0)

    def test_bad_and_truncated(self):
        for data in (b'bad',fixture()[:100],b'NES\x1a'):
            with self.assertRaises(RomError): analyze(data)

    def test_png_bitplanes(self):
        png=chr_png(bytes([128]+[0]*7+[64]+[0]*7))
        offset=8;compressed=b''
        while offset<len(png):
            size=struct.unpack('>I',png[offset:offset+4])[0]
            kind=png[offset+4:offset+8];payload=png[offset+8:offset+8+size]
            self.assertEqual(zlib.crc32(kind+payload)&0xffffffff,struct.unpack('>I',png[offset+8+size:offset+12+size])[0])
            if kind==b'IDAT':compressed+=payload
            offset+=12+size
        self.assertEqual(zlib.decompress(compressed)[:4],bytes([0,83,158,18]))


if __name__=='__main__':unittest.main()
