# NES LAB 0.2.1

Wersja 0.2.1 poprawia indeksowanie sprite’ów 8×16 z tablicy wzorców $1000 (błędne bonusy i pociski). Poprawka działa w podglądzie i w nowo wygenerowanym `play.html`. Stare projekty należy wygenerować ponownie. Oryginalny ROM nie jest zmieniany. Szczegóły i odtwarzalny patch: `web/vendor/JSNES-PATCHES.txt`, `scripts/patch_jsnes.py`. Oryginalny bundle JSNES pozostaje bez zmian; aplikacja używa osobnego pliku z poprawką.

Laboratorium analizy ROM-ów NES i generator samodzielnych projektów uruchamiających grę w JavaScript. Python 3.12+, bez instalowania bibliotek, CDN, bazy danych i kluczy API. Emulator JSNES 2.1.0 jest dołączony lokalnie wraz z licencją Apache-2.0.

```sh
cd /workspace/zgielk
python -m neslab.launch
```

Przeglądarka otwiera się automatycznie. Można też użyć START-WINDOWS.bat albo START-MAC-LINUX.command. Serwer wiąże się tylko z interfejsem lokalnym. Do pracy w środowisku chmurowym: `python -m neslab.server --host 0.0.0.0 --port 8000`. Nie otwieraj `web/index.html` bezpośrednio ani przez Live Server: analizator wymaga API serwera NES LAB.

Wybierz `.nes` lub ZIP wyeksportowany z NES LAB. „Podgląd gry” otwiera panel emulatora; kliknij w nim Uruchom. „Generuj projekt ZIP” tworzy osobny projekt. Rozpakuj go i otwórz `play.html`: zawiera runtime, ROM i wszystkie zasoby, działa bez serwera i bez internetu. Przyciski: pauza, pojedyncza klatka, restart, dźwięk i zrzut stanu JSON. Klawiatura: strzałki, X=A, Z=B, Enter=Start, Shift=Select; dostępne też przyciski ekranowe.

Wejście maksymalnie 32 MiB. Plik trafia do serwera aplikacji, jest analizowany w pamięci i nie jest zapisywany na dysku. Z ZIP-a odczytywany jest wyłącznie `original.nes`, z kontrolą rozmiaru; pozostała zawartość nie jest wykonywana ani rozpakowywana na dysk. Serwer przeznaczony do lokalnego rozwoju, bez uwierzytelniania. Wygenerowany projekt zawiera ROM, dlatego nie jest częścią publicznej paczki narzędzia.

## Dostępne funkcje

- Nagłówki iNES i NES 2.0, mapper/submapper, deklarowane rozmiary i mirroring.
- Bezstratny podział: nagłówek, trainer, PRG-ROM, CHR-ROM i dane dodatkowe; SHA-256.
- Podgląd pierwszego banku CHR; eksport wszystkich banków jako PNG w umownej skali szarości.
- Kandydaci na ciągi ASCII i wektory NMI/RESET/IRQ dla standardowego NROM.
- ZIP: oryginalny plik, wszystkie surowe sekcje, raport JSON i grafika.
- Rekurencyjne dekodowanie 151 oficjalnych opcode'ów 6502 dla NROM 16/32 KiB, zaczynając od wektorów. Listing i raport skoków są dołączone do wygenerowanego projektu. Nieosiągnięte bajty pozostają surowymi danymi.
- Projekt runtime JavaScript: samodzielny `play.html`, kod adaptera w `src/`, raport i materiały do analizy.
- Zrzut stanu: klatka PNG, RAM, VRAM PPU, OAM, stan emulatora i log wejść (limit 20 000 zmian przycisków). Nie rozpoznaje semantyki tych danych.

## Obsługa runtime

JSNES 2.1.0 zawiera mappery 0, 1, 2, 3, 4, 5, 7, 9, 11, 34, 38, 66, 71, 79, 94, 118, 119, 140, 180, 240 i 241. Generator dodatkowo wymaga standardowego NES/Famicom, NTSC, submappera 0, całych banków PRG/CHR oraz braku trainera. Pozostałe pliki mogą być analizowane i eksportowane surowo, ale generowanie jest blokowane z wyjaśnieniem. Obecność mappera na liście nie jest gwarancją zgodności każdej gry.

Dołączony JSNES pobrano z npm i zweryfikowano sumą SHA-512. Pochodzenie i licencja: `web/vendor/`.

## Granice i kierunek rozwoju

Wszystkie bajty są zachowane. Nie oznacza to rozpoznania ich znaczenia. Kafelki CHR nie są automatycznie sprite’ami ani animacjami. Grafika z CHR-RAM, kompresja, własne kodowania tekstu, poziomy, mechaniki, fizyka i skrypty wymagają analizy konkretnej gry.

Projekt odtwarza działanie przez wykonanie oryginalnego kodu maszynowego w emulatorze JavaScript. **Nie jest natywnym portem ani odzyskanym kodem źródłowym gry.** Wymaga osadzonego ROM-u. Nie daje automatycznie nazwanych funkcji, formatów poziomów, animacji i reguł fizyki. Statyczna analiza kodu ma ograniczenia przy skokach pośrednich, kodzie kopiowanym do RAM, nieoficjalnych instrukcjach i nakładającym się kodzie/danych. Rekonstrukcja niezależna od ROM-u oraz zgodność 1:1 wymagają dalszej analizy i porównań zachowania, obrazu, wejść oraz dźwięku.

## Weryfikacja

```sh
python -m unittest discover -s tests -v
node tests/test_ppu.js
```

Testy używają syntetycznych ROM-ów: nagłówki, rozmiary NES 2.0, trainer, pliki ucięte, wektory, teksty, bezstratny ZIP, bitplany PNG i CRC, analiza skoków 6502, nieobsługiwane warianty, import ZIP z limitem rozpakowanego rozmiaru oraz pełne API analizy i generatora.

Budowanie paczki narzędzia (bez ROM-ów użytkownika): `python scripts/package.py`.
