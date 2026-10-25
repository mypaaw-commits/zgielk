# Bubble Native 0.1 — niezależna rekonstrukcja robocza

Rozpakuj całą paczkę i otwórz `index.html` w przeglądarce. Nie potrzebujesz Pythona, Node ani internetu do gry. Kod nie ładuje ROM-u i nie wykonuje instrukcji 6502. Nie jest to pełny port 1:1.

## Jak grać

- Strzałki lewo/prawo lub A/D: ruch.
- X lub strzałka w górę: skok.
- Z lub spacja: wypuszczanie baniek.
- Złap przeciwnika w bańkę i dotknij bańki, aby go pokonać. Zbieraj pozostawione owoce.
- Dostępne są punkty, życia, koniec gry i ukończenie jedynej odtworzonej planszy.
- Na małych ekranach są przyciski dotykowe.

## Modyfikacje

- Suwaki zmieniają szybkość ruchu, skok i bańki.
- Włącz „Edytuj planszę” i klikaj kratki: dodawaj lub usuwaj platformy. Wyłącz edytor, aby kontynuować grę.
- „Pobierz poziom JSON” zapisuje planszę wraz z ustawieniami. „Wczytaj poziom JSON” przywraca taki wariant.
- `engine.js`: własna logika ruchu, kolizji, przeciwników, baniek i punktów.
- `app.js`: rysowanie i UI.
- `game-data.js`: dane ładowane przez przeglądarkę bez serwera.
- `level.json`: czytelny zapis planszy do pracy nad nowymi wariantami. Do importu w UI potrzebny jest dokument eksportowany z aplikacji z nagłówkiem `native-bubble-level-v1`.
- `assets/actors.png`: sprite'y; `assets/tiles.png`: kafelki. Są odtworzone z wzorców i palet przesłanego ROM-u.
- `assets/provenance.json`: źródła danych, pomiary oraz ograniczenia.

## Stan zgodności — przeczytaj

Gra wejściowa to Bubble Bobble na NES (ekran tytułowy: Taito America, 1988), SHA-256 `fc521e891d074369d67579fd56617460b9c9949dec67cc4a37d46b4e4bb09d29`.

Odtworzono układ kafelków z obserwacji w klatce 3848 oraz wybrane klatki animacji po odtworzeniu dostarczonej sekwencji wejść w JSNES. Numer etapu nie został zidentyfikowany. Kolizje zostały roboczo przypisane do kafelka 138; nie są wynikiem kompletnej analizy kodu oryginału.

Samodzielnie zaimplementowano mechaniki, ale ich parametry i zachowania nie są jeszcze dokładnym odwzorowaniem. Ruch 1 px/klatkę i skok do -3 px/klatkę mają wsparcie w pomiarach przemieszczeń OAM; grawitacja, prędkość AI, czas bańki i liczniki są przybliżone. Referencją był emulator, którego zgodność z konsolą nie została niezależnie potwierdzona.

Do dalszej pracy: pozostałe poziomy i ich format w ROM-ie, wszystkie typy przeciwników, dokładna fizyka i AI, wszystkie animacje, bonusy i sekrety, oryginalne audio, dwóch graczy i porównania klatka po klatce. Do czasu ukończenia tej analizy nie deklarujemy identyczności ani pełnej gry.

## Testy programistyczne

Opcjonalnie z Node: `node test-engine.cjs`. Testy obejmują ruch, skok, łapanie i przebijanie baniek, owoce, restart, walidację map i deterministyczną symulację. Są to testy nowego silnika, a nie dowód zgodności z NES-em.
