"""Parse iNES / NES 2.0 containers without interpreting game-specific data."""
import base64
import hashlib
import io
import json
import re
import struct
import zipfile
import zlib

MAX_ROM = 32 * 1024 * 1024


class RomError(ValueError):
    pass


def _size(low, high, unit):
    return (1 << (low >> 2)) * ((low & 3) * 2 + 1) if high == 15 else ((high << 8) | low) * unit


def analyze(data):
    if len(data) > MAX_ROM:
        raise RomError('Limit pliku to 32 MiB.')
    if len(data) < 16 or data[:4] != b'NES\x1a':
        raise RomError('To nie jest poprawny nagłówek iNES / NES 2.0.')
    h = data[:16]
    variant = h[7] & 12
    if variant not in (0, 8):
        raise RomError('Nieobsługiwany wariant nagłówka NES.')
    nes2 = variant == 8
    prg = _size(h[4], h[9] & 15, 16384) if nes2 else h[4] * 16384
    chr_size = _size(h[5], h[9] >> 4, 8192) if nes2 else h[5] * 8192
    mapper = (h[6] >> 4) | (h[7] & 240) | ((h[8] & 15) << 8 if nes2 else 0)
    warnings = []
    if not nes2 and any(h[12:]):
        warnings.append('Niezerowe bajty zarezerwowane: stary lub zabrudzony nagłówek; mapper wymaga sprawdzenia.')
    if chr_size == 0:
        warnings.append('Brak CHR-ROM. Gra używa CHR-RAM; grafika może być generowana lub rozpakowywana podczas działania.')
    if mapper != 0:
        warnings.append('Mapowanie banków zależy od mappera. Adresów CPU nie można ustalić z samego offsetu pliku.')
    parts = {'header.bin': h}
    offset = 16
    regions = [{'name': 'Nagłówek', 'offset': 0, 'size': 16}]
    for filename, title, size in [('trainer.bin', 'Trainer', 512 if h[6] & 4 else 0), ('prg.bin', 'PRG-ROM', prg), ('chr.bin', 'CHR-ROM', chr_size)]:
        if offset + size > len(data):
            raise RomError(f'Plik jest ucięty: sekcja {title} wymaga {size} bajtów od offsetu {offset}.')
        parts[filename] = data[offset:offset + size]
        regions.append({'name': title, 'offset': offset, 'size': size})
        offset += size
    parts['trailing.bin'] = data[offset:]
    if offset < len(data):
        regions.append({'name': 'Dane dodatkowe', 'offset': offset, 'size': len(data) - offset})
        warnings.append('Dane po CHR-ROM zachowano bez interpretacji (np. PlayChoice / dodatkowe ROM-y / metadane).')
    vectors = None
    if mapper == 0 and prg in (16384, 32768):
        vectors = dict(zip(('NMI', 'RESET', 'IRQ'), [f'${x:04X}' for x in struct.unpack('<HHH', parts['prg.bin'][-6:])]))
    strings = []
    for match in re.finditer(rb'[\x20-\x7e]{5,}', parts['prg.bin']):
        strings.append({'prg_offset': match.start(), 'text': match.group()[:256].decode('ascii')})
        if len(strings) == 1000:
            break
    report = {
        'format': 'NES 2.0' if nes2 else 'iNES', 'size': len(data),
        'sha256': hashlib.sha256(data).hexdigest(), 'mapper': mapper,
        'submapper': h[8] >> 4 if nes2 else None,
        'prg_bytes': prg, 'chr_bytes': chr_size, 'tiles': chr_size // 16,
        'battery': bool(h[6] & 2), 'console_type': h[7] & 3,
        'mirroring': 'four-screen / mapper' if h[6] & 8 else ('vertical' if h[6] & 1 else 'horizontal'),
        'regions': regions, 'vectors': vectors, 'warnings': warnings,
        'strings': strings,
        'preview_chr_base64': base64.b64encode(parts['chr.bin'][:8192]).decode(),
        'limitations': [
            'CHR to kafelki 8×8 w 2 bitach na piksel, a nie gotowe sprite’y, tekstury czy animacje. Paleta podglądu jest umowna.',
            'Ciągi ASCII są kandydatami, nie rozpoznanym tekstem gry. Gry często stosują własne kodowania.',
            'PRG zawiera kod i dane. Ta wersja nie rozpoznaje instrukcji, kompresji, poziomów, fizyki ani skryptów.',
            'Eksport zachowuje wszystkie bajty ROM-u, ale nie rekonstruuje semantyki gry ani kodu źródłowego.'
        ],
    }
    return report, parts


def chr_png(data):
    """Render complete or partial 8 KiB CHR bank using an explicit neutral palette."""
    tiles = len(data) // 16
    width, height = 128, max(8, ((tiles + 15) // 16) * 8)
    pixels = bytearray(width * height)
    palette = (18, 83, 158, 241)
    for tile in range(tiles):
        for y in range(8):
            lo, hi = data[tile * 16 + y], data[tile * 16 + y + 8]
            for x in range(8):
                value = ((lo >> (7 - x)) & 1) | (((hi >> (7 - x)) & 1) << 1)
                pixels[((tile // 16) * 8 + y) * width + (tile % 16) * 8 + x] = palette[value]
    def chunk(kind, payload):
        return struct.pack('>I', len(payload)) + kind + payload + struct.pack('>I', zlib.crc32(kind + payload) & 0xffffffff)
    rows = b''.join(b'\0' + pixels[y * width:(y + 1) * width] for y in range(height))
    return b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 0, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(rows)) + chunk(b'IEND', b'')


def export_zip(data):
    report, parts = analyze(data)
    report.pop('preview_chr_base64')
    output = io.BytesIO()
    with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED) as archive:
        archive.writestr('original.nes', data)
        archive.writestr('analysis.json', json.dumps(report, ensure_ascii=False, indent=2))
        for name, content in parts.items():
            archive.writestr('raw/' + name, content)
        chr_data = parts['chr.bin']
        for offset in range(0, len(chr_data), 8192):
            archive.writestr(f'graphics/chr-bank-{offset // 8192:04d}.png', chr_png(chr_data[offset:offset + 8192]))
        archive.writestr('README.txt', 'NES LAB — surowy eksport, nie rekonstrukcja gry.\n'
            'original.nes zachowuje wszystkie bajty. Suma SHA-256 jest w analysis.json.\n'
            'raw/: header + trainer + prg + chr + trailing pozwalają odtworzyć plik wejściowy.\n'
            'graphics/: banki CHR po 8 KiB, 16 kafelków w wierszu, umowna skala szarości.\n'
            'Nie wyodrębniono semantyki mechanik, fizyki, poziomów ani animacji.\n')
    return output.getvalue()
