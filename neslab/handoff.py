"""Evidence bundle for a future independent browser implementation."""
import base64
import hashlib
import io
import json
import zipfile
from .rom import RomError, analyze, export_zip, chr_png
from .project import inspect
from .disasm import decode, listing


def octets(value, length, name):
    if not isinstance(value,list) or len(value)!=length or any(type(x) is not int or not 0<=x<=255 for x in value):
        raise RomError(f'Nieprawidłowa sekcja {name}.')
    return bytes(value)


def binary(value, limit, name):
    if not isinstance(value,str) or len(value)>limit*2:
        raise RomError(f'Nieprawidłowe dane {name}.')
    try:data=base64.b64decode(value,validate=True)
    except (ValueError,TypeError) as exc:raise RomError(f'Nieprawidłowe base64: {name}.') from exc
    if len(data)>limit:raise RomError(f'Przekroczony limit {name}.')
    return data


def handoff_zip(rom, observations=None, notes=''):
    if not isinstance(notes,str) or len(notes)>50000:raise RomError('Limit notatek: 50 000 znaków.')
    observations=[] if observations is None else observations
    if not isinstance(observations,list) or len(observations)>12:raise RomError('Limit 12 obserwacji.')
    report=inspect(rom);_,parts=analyze(rom)
    files={}
    with zipfile.ZipFile(io.BytesIO(export_zip(rom))) as archive:
        for name in archive.namelist():
            if name!='README.txt':files['source/'+name]=archive.read(name)
    code=decode(parts['prg.bin'],report['mapper'])
    files['code/6502.asm']=listing(code).encode()
    files['code/static-analysis.json']=json.dumps(code,ensure_ascii=False,indent=2).encode()
    summary=[];previous=None
    for index,item in enumerate(observations):
        if not isinstance(item,dict) or item.get('rom_sha256')!=report['sha256']:
            raise RomError('Obserwacja pochodzi z innego ROM-u. Wyczyść obserwacje i wczytaj właściwy plik.')
        frame=item.get('frame');label=item.get('label','')
        if type(frame) is not int or not 0<frame<1000000000 or not isinstance(label,str) or len(label)>200:raise RomError('Nieprawidłowa klatka lub nazwa obserwacji.')
        ram=octets(item.get('ram'),2048,'RAM');oam=octets(item.get('oam'),256,'OAM')
        vram=octets(item.get('ppu_vram'),16384,'VRAM')
        patterns=binary(item.get('chr_base64'),8192,'CHR')
        if len(patterns)!=8192:raise RomError('Oczekiwano 8192 bajtów wzorców PPU.')
        png=binary(item.get('screenshot_png','').removeprefix('data:image/png;base64,'),1024*1024,'PNG')
        if not png.startswith(b'\x89PNG\r\n\x1a\n'):raise RomError('Nieprawidłowy zrzut PNG.')
        inputs=item.get('inputs',[])
        if not isinstance(inputs,list) or len(inputs)>20000:raise RomError('Nieprawidłowy log wejść.')
        clean_inputs=[];last=0
        for event in inputs:
            if not isinstance(event,dict) or type(event.get('frame')) is not int or not last<=event['frame']<=frame or type(event.get('button')) is not int or not 0<=event['button']<8 or type(event.get('down')) is not bool:raise RomError('Nieprawidłowe zdarzenie sterowania.')
            last=event['frame'];clean_inputs.append({k:event[k] for k in ('frame','button','down')})
        prefix=f'observations/{index+1:02d}'
        files[prefix+'/screen.png']=png;files[prefix+'/ram.bin']=ram;files[prefix+'/oam.bin']=oam;files[prefix+'/ppu-vram.bin']=vram
        files[prefix+'/patterns.chr']=patterns;files[prefix+'/patterns.png']=chr_png(patterns)
        files[prefix+'/palette-indices.bin']=vram[0x3f00:0x3f20]
        changes=[] if previous is None else [{'address':address,'before':before,'after':after} for address,(before,after) in enumerate(zip(previous,ram)) if before!=after]
        previous=ram
        metadata={'label':label,'frame':frame,'rom_sha256':report['sha256'],'inputs':clean_inputs,
                  'input_log_may_be_truncated':bool(item.get('input_log_may_be_truncated',False)),
                  'changed_ram_since_previous_capture':changes,'source':'Observed in JSNES, not semantic decoding',
                  'engine':report['runtime']['engine'],'capture_settings':{'overscan':False,'frame_width':256,'frame_height':240},
                  'notice':'RAM addresses have no assigned game meaning. VRAM is an emulator memory snapshot, not a decoded level.'}
        files[prefix+'/metadata.json']=json.dumps(metadata,ensure_ascii=False,indent=2).encode()
        summary.append({'path':prefix,'label':label,'frame':frame})
    spec={'format':'nes-room-reconstruction-v1','rom_sha256':report['sha256'],'target':'Independent JavaScript/TypeScript + Canvas browser game',
          'ready_for_faithful_port':False,'profile':report['game'],'observations':summary,'user_notes':notes,
          'evidence':{'rom_sections':'lossless','chr_rom':'raw bitplanes and neutral-palette PNG' if report['chr_bytes'] else 'absent: capture CHR-RAM during play',
                      'cpu_code':'static candidates for standard NROM only','runtime_states':len(summary)},
          'unresolved':['game-specific text encodings','level encoding and collision rules','physics and speeds','enemy AI','animation state machines','audio sequencing','unvisited scenes and bank-dependent code'],
          'validation':{'method':'Replay identical input sequences against original and native implementation; compare images, timing, movement, collisions and sound.',
                        'reference_engine':report['runtime']['engine'],'independent_emulator_or_hardware_confirmation':False}}
    files['reconstruction-spec.json']=json.dumps(spec,ensure_ascii=False,indent=2).encode()
    files['HANDOFF.md']=('''# Pakiet do rekonstrukcji gry przeglądarkowej

Cel: napisać własną, edytowalną logikę JavaScript/TypeScript i poziomy, bez wykonywania oryginalnego ROM-u w finalnym silniku.

Ten pakiet jest materiałem do analizy, nie gotowym klonem ani kompletną specyfikacją. Nie deklaruj zgodności 1:1 przed testami.

- source/: oryginalny ROM, wszystkie surowe sekcje, grafika CHR-ROM i raport.
- code/: statyczni kandydaci na kod 6502. Nie są wysokopoziomowym kodem źródłowym.
- observations/: obrazy, wzorce PPU (także CHR-RAM), RAM, VRAM, OAM i sekwencje wejść z wybranych momentów. Nie obejmują całej gry.
- reconstruction-spec.json: pochodzenie danych, obserwacje, notatki i nierozpoznane elementy.

Najpierw rozpoznaj formaty poziomów, sprite'y, palety, kolizje i reguły; mierz zachowanie na zapisanych sekwencjach wejść. Nazwij źródło każdej ustalonej reguły. Nie wymyślaj brakujących liczb ani nie traktuj tablic PPU jako map kolizji. Ręczny profil opisowy gry nie jest dekompilacją.

Następnie zbuduj oddzielny projekt przeglądarkowy: własna pętla gry, jawne dane poziomów i encji oraz testy porównujące zachowanie z referencją. Emulator służy jako materiał porównawczy. Nie zastępuj portu osadzeniem ROM-u w emulatorze.

Obserwacje powstały w dołączonym emulatorze, który ma ograniczenia zgodności. Przed przyjęciem ich za wzorzec porównaj scenę z niezależnym emulatorem lub sprzętem. Zmiany RAM wskazują różnice bajtów, nie identyfikują automatycznie obiektów gry. Pierwsza obserwacja nie ma poprzednika do porównania.
''').encode()
    manifest={'format':'nes-room-evidence-manifest-v1','files':{name:{'sha256':hashlib.sha256(content).hexdigest(),'size':len(content)} for name,content in sorted(files.items())}}
    files['manifest.json']=json.dumps(manifest,indent=2).encode()
    output=io.BytesIO()
    with zipfile.ZipFile(output,'w',zipfile.ZIP_DEFLATED) as archive:
        for name,content in files.items():archive.writestr(name,content)
    return output.getvalue()
