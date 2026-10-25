# NES ROOM 0.6

Prosty emulator NES w przeglądarce, w ilustracyjnym pokoju z lat 90. Wybierz własny plik `.nes` lub upuść go na ekran kineskopowego telewizora — gra uruchamia się automatycznie. Interfejs skupia się na graniu.

## Uruchomienie

Wymagany Python 3.12+. Bez instalowania bibliotek i bez dostępu do internetu podczas gry.

- Windows: rozpakuj całą paczkę i uruchom `START-WINDOWS.bat`.
- macOS: `START-MAC-LINUX.command`.
- Linux: `sh START-MAC-LINUX.command`.
- Terminal: `python -m neslab.launch` z katalogu projektu.

Przeglądarka otworzy się automatycznie. Pozostaw terminal otwarty. Ctrl+C zatrzymuje serwer. Nie otwieraj samego pliku HTML: aplikacja korzysta z lokalnego serwera Pythona. W środowisku chmurowym: `python -m neslab.server --host 0.0.0.0 --port 8000`.

## Granie

- Ruch: strzałki. A: X, B: Z. Start: Enter. Select: Shift.
- Kliknij ekran TV, aby aktywować klawiaturę.
- Pod telewizorem: pauza/wznowienie, restart i pełny ekran. Escape opuszcza pełny ekran. Pełny ekran obejmuje cały pokój z przybliżonym telewizorem i dostępnymi przyciskami.
- Pokrętło VOLUME wycisza lub przywraca dźwięk.
- Przełącznik CRT wyłącza nakładkę linii kineskopu.
- Na małych ekranach dostępny jest pad dotykowy.
- Zmiana karty przeglądarki zatrzymuje grę.
- „Zmień” pozwala włożyć nowy kartridż. Nieprawidłowy plik nie usuwa poprzedniej działającej gry.

Własne pliki do 32 MiB. Obsługiwane są także wcześniejsze eksporty NES LAB ZIP zawierające `original.nes`. ROM jest przetwarzany w pamięci lokalnego serwera, a następnie wykonywany przez emulator w przeglądarce. Nie zapisujemy ROM-ów na dysku i nie dołączamy gier do paczki.

## Zgodność

Runtime: lokalny JSNES 2.1.0 z poprawkami NES ROOM dla sprite'ów 8×16 i synchronizacji sprite zero. Apache-2.0; licencja, pochodzenie i opis zmian w `web/vendor/`. Nie wszystkie mappery, regiony i warianty konsol są obsługiwane. Błąd kompatybilności jest wyświetlany po wybraniu pliku. To serwer do lokalnego użytku, bez uwierzytelniania.

## Weryfikacja dla programisty

```sh
python -m unittest discover -s tests
node tests/test_ppu.js
node tests/test_sprite_zero.js
node tests/test_chr_patterns.js
node tests/test_frame_bounds.js
```

Node jest potrzebny tylko do tych testów regresji, nie do uruchamiania aplikacji. Poprzednie moduły analizy pozostają w repozytorium, ale nie są ładowane przez nowy interfejs emulatora.

Paczka bez ROM-ów: `python scripts/package.py`.

Wersja 0.5: pełna klatka 256×240 bez overscanu. Gra zachowuje natywne proporcje i mieści się wewnątrz ramki; linie CRT można wyłączyć. Pełny ekran pokazuje całą scenę, a nie tylko TV. Lokalna scenografia `web/assets/room-1994.png` została wygenerowana do tej aplikacji i jest dołączona do paczki, więc nie wymaga internetu.

Wersja 0.5.1 przybliża kadr i TV: lekko w zwykłym widoku, wyraźnie mocniej na pełnym ekranie. Telewizor i scenografia są skalowane razem, z zachowaniem ustawienia na szafce.

## Pakiet do rekonstrukcji niezależnej gry

W górnym menu wybierz „Przygotuj rekonstrukcję”. Możesz wskazać ROM / wcześniejszy ZIP także bez uruchamiania gry. Eksport zawiera oryginalne sekcje, grafikę CHR-ROM, kandydatów na kod 6502 (NROM), manifest SHA-256 oraz dokumentację nierozpoznanych elementów. Nie jest to automatyczny natywny port.

Aby zebrać dowody dynamiczne, wczytaj tę grę w emulatorze, pokaż interesujący moment i otwórz dialog rekonstrukcji. „Zachowaj obserwację” zapisuje klatkę, wzorce PPU także z CHR-RAM, RAM, OAM, VRAM, indeksy palet i log wejść. Limit 12 obserwacji, 20 000 zdarzeń na log; ewentualne ucięcie logu jest oznaczone. Obserwacje i notatki pozostają tylko w otwartej karcie do pobrania pakietu. Zmiana pliku czyści je.

Przekaż cały `reconstruction-pack.zip` do pracy nad grą od zera. `HANDOFF.md` określa cel JavaScript/TypeScript + Canvas bez wykonywania ROM-u w finalnej implementacji. `reconstruction-spec.json` i manifest wskazują dowody, braki i pochodzenie. Pakiet nie ma gotowego silnika ani odzyskanych reguł; dekodery poziomów, fizyka, AI i audio wymagają analizy konkretnej gry. Emulator nie jest niezależnym wzorcem sprzętowym — przed przyjęciem danych za referencję porównaj istotne sceny z innym emulatorem lub NES-em.
