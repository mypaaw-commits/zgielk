"""Explicitly sourced game briefs. Unknown ROMs never inherit another game's rules."""
BATTLE_CITY = '166ec235b062aa337045832843e2916f96f12dcf08972ad747016dbe77db761c'


def dossier(report):
    known = report['sha256'] == BATTLE_CITY
    return {
        'title': 'Battle City' if known else 'Gra nierozpoznana',
        'identification': 'Dokładny SHA-256 przesłanego wariantu; tytuł potwierdzony na ekranie gry.' if known else 'Brak profilu dla tego SHA-256. Nagłówek NES nie zawiera standardowego tytułu gry.',
        'source': 'Ręcznie przygotowany opis referencyjny, nie dekompilacja mechanik.' if known else 'Do uzupełnienia przez obserwację gry.',
        'description': 'Zręcznościowa gra czołgowa z widokiem z góry. Gracz broni bazy, niszczy wrogie czołgi i wykorzystuje teren oraz bonusy.' if known else 'ROM został podzielony na sekcje. Gatunek, zasady i format poziomów nie zostały rozpoznane.',
        'mechanics': [
            {'name': 'Ruch i strzelanie', 'description': 'Ruch w czterech kierunkach i pociski zgodne z kierunkiem czołgu.', 'evidence': 'Opis referencyjny; wartości prędkości i częstotliwości strzału do pomiaru.'},
            {'name': 'Obrona bazy', 'description': 'Chroń bazę przed trafieniem; eliminuj nadciągających przeciwników.', 'evidence': 'Opis referencyjny; dokładne warunki i liczniki do potwierdzenia.'},
            {'name': 'Teren i kolizje', 'description': 'Cegły, stal, woda i roślinność wpływają na ruch, pociski lub widoczność.', 'evidence': 'Opis referencyjny; tablica kolizji nie została wydobyta z kodu.'},
            {'name': 'Bonusy i ulepszenia', 'description': 'Przedmioty zmieniają m.in. siłę ognia, ochronę i stan przeciwników.', 'evidence': 'Opis referencyjny; czas działania i wszystkie warianty wymagają testów.'}
        ] if known else [],
        'level_example': {'available': known, 'label': 'Etap 1 — obserwacja rozgrywki', 'source': 'Wykonanie tego ROM-u: Start w klatce 180, zwolnienie w 185, zrzut w 1800. Nie jest to dekoder poziomów.', 'recipe': [{'frame':180,'button':'Enter','down':True},{'frame':185,'button':'Enter','down':False}], 'capture_frame':1800},
        'port_plan': [
            {'area':'Grafika i palety','status':'Surowe CHR dostępne; rzeczywiste palety i układy sprite’ów wymagają obserwacji PPU.'},
            {'area':'Poziomy i kolizje','status':'Zrzuty ekranu i tablice PPU to referencje wizualne; format map i kolizji nie jest jeszcze rozpoznany.'},
            {'area':'Ruch, pociski, AI','status':'Do zmierzenia na sekwencjach wejść i porównaniach stanów RAM.'},
            {'area':'Dźwięk, timing i zgodność','status':'Do porównania z niezależnym emulatorem; uruchomienie nie dowodzi zgodności 1:1.'}
        ],
        'native_port_ready': False,
        'port_target': {'engine': 'Canvas 2D / przeglądarka', 'language': 'JavaScript / TypeScript', 'status': 'Wybrany kierunek; implementacja natywnego klona jest kolejnym etapem.'},
    }
