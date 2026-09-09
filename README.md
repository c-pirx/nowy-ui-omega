# Omega MG — redesign

Gotowy frontend w HTML, CSS i JavaScript oraz samodzielny motyw i wtyczka WordPress. Źródło treści i materiałów: [omega-mg.pl](https://omega-mg.pl/), stan odczytany 8 września 2026 (czas polski).

## Uruchomienie

Wymagany Node.js 20 lub nowszy. Bez instalowania zależności:

```sh
npm run dev
```

Podgląd: <http://localhost:4173>. Serwer jest dostępny wyłącznie lokalnie.

```sh
npm ci
npm test
npm run build:wordpress
npm run package:local
```

## Lokalne środowisko WordPress

W LocalWP jako ścieżkę witryny ustaw katalog repozytorium:
`S:\21agency\omega-test`. LocalWP utworzy w nim `app/`, `conf/` i
`logs/`, a pliki WordPressa umieści w `app/public/`. Te ścieżki nie
kolidują z katalogiem `public/`, który nadal zawiera statyczny frontend
publikowany przez GitHub Pages.

Motyw rozwijamy w `app/public/wp-content/themes/omega/`, a funkcje niezależne
od wyglądu w `app/public/wp-content/plugins/omega-core/`. Git śledzi wyłącznie
te dwa katalogi; rdzeń WordPressa, baza danych, konfiguracja środowiska, media
oraz cudze wtyczki i motywy pozostają lokalne.

Po zmianie źródłowego frontendu uruchom `npm run build:wordpress`. Polecenie
odtwarza szablony i assety motywu oraz frontend kalkulatora. Gotowe paczki
instalacyjne tworzy `npm run package:local` jako `dist/omega.zip` i
`dist/omega-core.zip`.

## Pliki

- `public/index.html` — wszystkie sekcje i źródłowe treści.
- `public/styles.css` — tokeny oryginalnej marki, typografia, komponenty i breakpointy.
- `public/app.js` — nawigacja, logotypy i dostępny panel certyfikacji.
- `public/calculator.js` — zachowana logika wyceny, walidacja i integracja wysyłki.
- `public/assets` — oryginalne obrazy, logo i lokalne fonty.
- `app/public/wp-content/themes/omega` — aktywny motyw LocalWP.
- `app/public/wp-content/plugins/omega-core` — kalkulator, e-mail i SMTP.
- `dist/omega.zip` oraz `dist/omega-core.zip` — samodzielne paczki instalacyjne.
- `research/asset-manifest.json` — pochodzenie i sumy kontrolne materiałów.
- `research/wordpress-notes.md` — instalacja, przywrócenie starego widoku i ograniczenia integracji.
- `QA.md` — zakres przeprowadzonej weryfikacji.

## WordPress i kalkulator

Motyw `omega` odwzorowuje statyczny frontend 1:1. Treści strony pozostają w kodzie. Kalkulator jest osadzany przez shortcode `[omega_calculator]` i działa dzięki osobnej wtyczce `omega-core`. Po jej dezaktywacji strona nadal działa i pokazuje komunikat o niedostępności kalkulatora.

Kalkulator najpierw anonimowo pokazuje orientacyjną cenę w formacie **„od 650 zł netto/mies.”** (kwota zależy od danych, stawki nie zostały zmienione). Obliczenie nie wysyła żądania. Przycisk **„Wyślij wynik do potwierdzenia”** otwiera formularz: imię, telefon, e-mail i opcjonalna wiadomość do 3000 znaków, wraz z dotychczasową zgodą. **„Zmień dane”** przywraca parametry do edycji. Dopiero zatwierdzenie formularza wysyła wynik, jego parametry i wiadomość.

Przed obliczeniem należy zaznaczyć domyślnie niezaznaczony checkbox „Zapoznałem/-am się z Polityką prywatności”, z linkiem do oryginalnej polityki. Potwierdzenie nie zaznacza automatycznie osobnej zgody na przetwarzanie danych przy wysyłce kontaktu.

Stawki oraz ustawienia poczty są dostępne w **Ustawienia → Omega Core**. Backend ponownie wylicza cenę z zapisanych stawek, więc nie ufa kwocie przesłanej z przeglądarki. Formularz sprawdza nonce, dane, obie zgody, honeypot i limit liczby wysyłek. Wiadomość zawiera kontakt, parametry wyceny, wynik serwerowy i opcjonalną wiadomość klienta.

Domyślny transport WordPressa trafia w LocalWP do Mailpit. Opcjonalnie można podać własny SMTP: host, port, szyfrowanie, uwierzytelnianie, login i hasło. Puste pole hasła zachowuje poprzednią wartość. Przycisk wiadomości testowej znajduje się na tej samej stronie ustawień.

Na `localhost`, `127.0.0.1` oraz statycznym GitHub Pages bez konfiguracji WordPressa kalkulator oblicza wycenę ze źródłowych stawek, ale nie wysyła zapytania. W LocalWP pod domeną `omega-new.local` korzysta z backendu `omega-core`.

Strzałki na całej stronie są ikonami SVG z kolorem `currentColor`, więc nie zmieniają się w emoji na urządzeniach mobilnych. Zależność `jsdom` służy wyłącznie testom formularza; frontend i pakowanie WordPressa nie wymagają bibliotek runtime.

Źródłowa treść widoku znajduje się w pliku HTML, a generator przenosi ją do szablonów PHP. Dane C.I.K. zachowują treść odczytanego widgetu; panel zawiera odnośnik do aktualnego certyfikatu.

Witryna produkcyjna nie została zmodyfikowana.

## Podstrona O mnie

Źródło dziewięciu sekcji: `pages/o-mnie.html`. Style: `public/o-mnie.css`.
`npm run build:wordpress` tworzy jednocześnie `public/o-mnie/index.html` oraz
szablon `page-o-mnie.php` w motywie. Statyczne menu i stopka są generowane ze
strony głównej, a WordPress używa wspólnych plików motywu.

Podgląd statyczny: <http://localhost:4173/o-mnie/>. Założenie strony w LocalWP:
`wp eval-file scripts/seed-about.php --path=app/public`. Skrypt nie zmienia
treści, statusu ani metadanych istniejącej strony. Nowa strona korzysta
z szablonu przypisanego automatycznie według slugu `o-mnie`.

Treści są robocze, a fotografie biura i podróży ilustracyjne. Pochodzenie
materiałów i sposób podmiany opisano w `research/about-assets.md`.
