"""Accept a ROM or the bounded original.nes member of an NES LAB export."""
import io
import zipfile
from .rom import MAX_ROM, RomError, analyze


def read_input(data):
    if len(data) > MAX_ROM:
        raise RomError('Limit pliku wejściowego to 32 MiB.')
    if data.startswith(b'PK'):
        try:
            with zipfile.ZipFile(io.BytesIO(data)) as archive:
                matches = [i for i in archive.infolist() if i.filename == 'original.nes']
                if len(matches) != 1:
                    raise RomError('ZIP musi zawierać dokładnie jeden plik original.nes w katalogu głównym. Wybierz eksport NES LAB albo plik .nes.')
                member = matches[0]
                if member.file_size > MAX_ROM:
                    raise RomError('ROM wewnątrz ZIP-a przekracza 32 MiB.')
                with archive.open(member) as stream:
                    data = stream.read(MAX_ROM + 1)
                if len(data) > MAX_ROM:
                    raise RomError('ROM wewnątrz ZIP-a przekracza 32 MiB.')
        except (zipfile.BadZipFile, RuntimeError, NotImplementedError, OSError) as exc:
            raise RomError('Nie można odczytać ZIP-a: plik jest uszkodzony, zaszyfrowany lub ma nieobsługiwaną kompresję.') from exc
    analyze(data)
    return data
