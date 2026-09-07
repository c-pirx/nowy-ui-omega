# Omega MG — redesign

Gotowy frontend w HTML, CSS i JavaScript, z lokalnym podglądem oraz odwracalnym adapterem do istniejącego WordPressa. Źródło treści i materiałów: [omega-mg.pl](https://omega-mg.pl/), stan odczytany 8 września 2026 (czas polski).

## Uruchomienie

Wymagany Node.js 20 lub nowszy. Bez instalowania zależności:

```sh
npm run dev
```

Podgląd: <http://localhost:4173>. Serwer jest dostępny wyłącznie lokalnie.

```sh
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

Na WordPressie stawki, nonce i adres AJAX pochodzą z aktualnej konfiguracji istniejącej wtyczki `omega-kalkulator`. Zachowany jest oryginalny mechanizm: obliczenie po wypełnieniu wymaganych danych i zgody wysyła zapytanie do biura. Bez bieżącej konfiguracji formularz informuje o niedostępności; nie deklaruje wysłania wiadomości.

Na `localhost` i `127.0.0.1` kalkulator oblicza wycenę ze źródłowych stawek, ale **nigdy nie wysyła zapytania**. Wynik jasno informuje o trybie podglądu. Lokalny katalog nie zawiera instalacji WordPressa ani źródeł prywatnego backendu; rzeczywiste dostarczenie e-maila wymaga testu na kopii działającej witryny.

Treść nowego widoku znajduje się w pliku HTML. Późniejsze zmiany tekstów w Elementorze nie synchronizują się automatycznie z tym szablonem. Dane C.I.K. zachowują treść odczytanego widgetu; panel zawiera odnośnik do aktualnego certyfikatu.

Witryna produkcyjna nie została zmodyfikowana.
