# Omega MG — redesign

Gotowy frontend w HTML, CSS i JavaScript, z lokalnym podglądem oraz odwracalnym adapterem do istniejącego WordPressa. Źródło treści i materiałów: [omega-mg.pl](https://omega-mg.pl/), stan odczytany 8 września 2026 (czas polski).

## Uruchomienie

Wymagany Node.js 20 lub nowszy. Bez instalowania zależności:

```sh
npm run dev
```

Podgląd: <http://localhost:4173>. Serwer jest dostępny wyłącznie lokalnie.

```sh
npm ci
npm test
npm run package:wordpress
```

## Pliki

- `public/index.html` — wszystkie sekcje i źródłowe treści.
- `public/styles.css` — tokeny oryginalnej marki, typografia, komponenty i breakpointy.
- `public/app.js` — nawigacja, logotypy i dostępny panel certyfikacji.
- `public/calculator.js` — zachowana logika wyceny, walidacja i integracja wysyłki.
- `public/assets` — oryginalne obrazy, logo i lokalne fonty.
- `dist/omega-mg-redesign.zip` — paczka wtyczki WordPress.
- `research/asset-manifest.json` — pochodzenie i sumy kontrolne materiałów.
- `research/wordpress-notes.md` — instalacja, przywrócenie starego widoku i ograniczenia integracji.
- `QA.md` — zakres przeprowadzonej weryfikacji.

## WordPress i kalkulator

Wtyczka jest domyślnie wyłączona. Zmienia wyłącznie szablon strony głównej po włączeniu opcji w **Ustawienia → Omega MG — redesign**. Nie zmienia treści w bazie, Astry, Elementora, polityki prywatności ani backendu kalkulatora. Dezaktywacja przywraca oryginalny widok.

Kalkulator najpierw anonimowo pokazuje orientacyjną cenę w formacie **„od 650 zł netto/mies.”** (kwota zależy od danych, stawki nie zostały zmienione). Obliczenie nie wysyła żądania. Przycisk **„Wyślij wynik do potwierdzenia”** otwiera formularz: imię, telefon, e-mail i opcjonalna wiadomość do 3000 znaków, wraz z dotychczasową zgodą. **„Zmień dane”** przywraca parametry do edycji. Dopiero zatwierdzenie formularza wysyła wynik, jego parametry i wiadomość.

Na WordPressie stawki, nonce i adres AJAX pochodzą z aktualnej konfiguracji istniejącej wtyczki `omega-kalkulator`. Jej endpoint nadal odpowiada za walidację i wysyłkę. Adapter dopisuje wiadomość i orientacyjne podsumowanie do e-maila przez filtr `wp_mail`, wyłącznie dla nowych zgłoszeń oznaczonych przez ten formularz. Bez aktualnej konfiguracji lub adaptera wysyłka informuje o niedostępności.

Na `localhost`, `127.0.0.1` oraz statycznym GitHub Pages bez konfiguracji WordPressa kalkulator oblicza wycenę ze źródłowych stawek, ale **nigdy nie wysyła zapytania**. Próba zatwierdzenia formularza jasno informuje o trybie podglądu. Lokalny katalog nie zawiera instalacji WordPressa ani źródeł prywatnego backendu; rzeczywiste dostarczenie e-maila wraz z wiadomością wymaga testu na kopii działającej witryny.

Strzałki na całej stronie są ikonami SVG z kolorem `currentColor`, więc nie zmieniają się w emoji na urządzeniach mobilnych. Zależność `jsdom` służy wyłącznie testom formularza; frontend i pakowanie WordPressa nie wymagają bibliotek runtime.

Treść nowego widoku znajduje się w pliku HTML. Późniejsze zmiany tekstów w Elementorze nie synchronizują się automatycznie z tym szablonem. Dane C.I.K. zachowują treść odczytanego widgetu; panel zawiera odnośnik do aktualnego certyfikatu.

Witryna produkcyjna nie została zmodyfikowana.
