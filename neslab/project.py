"""Generate an offline JavaScript runtime project; never claim a native port."""
import base64
import io
import json
import zipfile
from pathlib import Path
from .rom import RomError, analyze, export_zip
from .disasm import decode, listing
from .dossier import dossier, BATTLE_CITY

WEB = Path(__file__).resolve().parent.parent / 'web'
MAPPERS = (0, 1, 2, 3, 4, 5, 7, 9, 11, 34, 38, 66, 71, 79, 94, 118, 119, 140, 180, 240, 241)


def compatibility(data, report):
    reasons = []
    if report['mapper'] not in MAPPERS:
        reasons.append(f"Runtime nie obsługuje mappera {report['mapper']}.")
    if report['submapper'] not in (None, 0):
        reasons.append('Warianty submapperów nie są zweryfikowane w tym generatorze.')
    if report['console_type'] != 0:
        reasons.append('Runtime jest przeznaczony dla standardowego NES/Famicom, bez Vs. System i PlayChoice.')
    timing = data[12] & 3 if report['format'] == 'NES 2.0' else data[9] & 1
    if timing not in (0,):
        reasons.append('Generator obsługuje obecnie timing NTSC. PAL, Dendy i wybór regionu wymagają innego runtime.')
    if data[6] & 4:
        reasons.append('Uruchamianie ROM-ów z trainerem nie jest jeszcze obsługiwane przez generator.')
    if not report['prg_bytes'] or report['prg_bytes'] % 16384 or report['chr_bytes'] % 8192:
        reasons.append('Runtime wymaga całych banków PRG 16 KiB i CHR 8 KiB.')
    if report['format'] == 'iNES' and any(data[8:16]) and report['mapper'] >= 16:
        reasons.append('Niejednoznaczny stary nagłówek: parser i runtime mogłyby inaczej rozpoznać mapper.')
    return {'available': not reasons, 'reasons': reasons, 'mode': 'original-rom-emulation', 'engine': 'JSNES 2.1.0 + NES LAB PPU fixes 1-2',
            'notice': 'Projekt wykonuje oryginalny kod ROM-u w emulatorze JavaScript. Nie jest automatycznym przepisaniem gry ani gwarancją zgodności 1:1.'}


def inspect(data):
    report, parts = analyze(data)
    report['runtime'] = compatibility(data, report)
    report['runtime']['verification'] = 'Przetestowany wariant ROM-u; pełna zgodność niepotwierdzona.' if report['sha256'] == BATTLE_CITY else 'Niezweryfikowany ROM. Obsługa mappera nie gwarantuje poprawnego obrazu ani działania.'
    report['game'] = dossier(report)
    code = decode(parts['prg.bin'], report['mapper'])
    report['code_analysis'] = {key: value for key, value in code.items() if key != 'instructions'}
    report['code_analysis']['instruction_count'] = len(code['instructions'])
    report['limitations'][2] = 'Statyczna analiza kodu 6502 jest dostępna dla NROM; cele skoków przez RAM, nieoficjalne instrukcje i semantyka gry wymagają dalszej analizy.'
    return report


def project_zip(data):
    report = inspect(data)
    if not report['runtime']['available']:
        raise RomError(' '.join(report['runtime']['reasons']))
    config = {'romBase64': base64.b64encode(data).decode(), 'sha256': report['sha256'], 'mapper': report['mapper'], 'name': 'Projekt NES'}
    vendor = (WEB / 'vendor/jsnes-patched.min.js').read_text()
    runtime = (WEB / 'player.js').read_text()
    # All injected variable content is fixed metadata or base64; escape end tags in scripts.
    def safe(script):
        return script.replace('</', '<\\/')
    html = '''<!doctype html><html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Projekt NES — runtime JavaScript</title><style>'''
    html += (WEB / 'player.css').read_text() + '</style></head><body><main><h1>Projekt NES</h1><p>Oryginalny kod ROM-u wykonywany przez JSNES 2.1.0. To emulacja, nie natywny port ani potwierdzona zgodność 1:1.</p><div id="player"></div></main>'
    html += '<script>' + safe(vendor) + '</script><script>' + safe(runtime) + '</script><script>'
    html += 'window.neslabPlayer = new NESLabPlayer(document.getElementById("player")); window.neslabPlayer.load(' + json.dumps(config) + ');</script></body></html>'
    _, parts = analyze(data)
    code = decode(parts['prg.bin'], report['mapper'])
    output = io.BytesIO()
    with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED) as archive:
        with zipfile.ZipFile(io.BytesIO(export_zip(data))) as raw:
            for name in raw.namelist():
                if name not in ('analysis.json', 'README.txt'):
                    archive.writestr(name, raw.read(name))
        report.pop('preview_chr_base64')
        archive.writestr('analysis.json', json.dumps(report, ensure_ascii=False, indent=2))
        archive.writestr('design/game-design.json', json.dumps(report['game'], ensure_ascii=False, indent=2))
        archive.writestr('code/6502.asm', listing(code))
        archive.writestr('code/control-flow.json', json.dumps(code, ensure_ascii=False, indent=2))
        archive.writestr('play.html', html)
        archive.writestr('src/player.js', runtime)
        archive.writestr('src/player.css', (WEB / 'player.css').read_bytes())
        archive.writestr('src/jsnes.min.js', vendor)
        archive.writestr('licenses/JSNES-LICENSE.txt', (WEB / 'vendor/JSNES-LICENSE.txt').read_bytes())
        archive.writestr('licenses/JSNES-PATCHES.txt', (WEB / 'vendor/JSNES-PATCHES.txt').read_bytes())
        archive.writestr('README.txt', 'NES LAB — projekt runtime JavaScript\n\nRozpakuj CAŁOŚĆ i otwórz play.html w przeglądarce. Nie wymaga Pythona ani internetu.\n'
            'Kliknij Uruchom. Sterowanie: strzałki, X=A, Z=B, Enter=Start, Shift=Select. Dostępne także przyciski ekranowe.\n'
            'Pauza, pojedyncza klatka, restart i zrzut stanu służą do analizy działania. Zrzut obejmuje stan emulatora, RAM, PPU, OAM i wejścia.\n'
            'Original.nes i surowe sekcje zachowują bajty ROM-u. Grafika CHR: graphics/.\n'
            'code/6502.asm: statyczni kandydaci na kod dla NROM. To nie jest odzyskany kod źródłowy, gotowy port ani opis mechanik.\n'
            'Gra wymaga oryginalnego ROM-u osadzonego w play.html. Nie usuwa to zależności od programu 6502.\n'
            'Runtime: JSNES 2.1.0 + NES LAB PPU fixes 1-2, Apache-2.0. Licencja i opis zmian w licenses/. Zgodność wszystkich scen i dźwięku 1:1 nie została potwierdzona.\n')
    return output.getvalue()
