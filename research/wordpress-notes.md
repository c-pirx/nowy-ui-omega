# Omega MG — integracja z istniejącym WordPressem

## Zakres

Oryginalna witryna publiczna korzysta z WordPressa, motywu Astra, Elementora i wtyczki `omega-kalkulator`. Pakiet jest dodatkową, domyślnie wyłączoną wtyczką podmieniającą wyłącznie szablon strony głównej. Nie migruje technologii, nie zapisuje zawartości stron, nie zastępuje bazy danych i nie implementuje nowego backendu formularza.

Zawartość `public/` jest zatwierdzonym wizualnym szablonem. Zmiany później wykonane w edytorze Elementor nie aktualizują automatycznie tego szablonu — należy odpowiednio zmienić źródła i ponownie zbudować paczkę. Wyłączenie opcji lub wtyczki natychmiast przywraca poprzedni szablon; po obu operacjach należy wyczyścić cache.

## Budowanie i uruchomienie na kopii testowej

1. W katalogu projektu uruchom `node scripts/package-wordpress.mjs`.
2. Powstanie `dist/omega-mg-redesign.zip` oraz katalog `dist/omega-mg-redesign/`.
3. Na kopii testowej obecnego WordPressa zainstaluj ZIP przez **Wtyczki → Dodaj nową → Wyślij wtyczkę na serwer**. Zachowaj aktywny oryginalny kalkulator, Elementor, motyw i pozostałe wtyczki.
4. Aktywuj wtyczkę; samo jej aktywowanie nie włącza nowego wyglądu.
5. W **Ustawienia → Omega MG — redesign** włącz szablon i wyczyść cache strony.
6. Sprawdź wizualnie stronę główną oraz jej formularz. Pozostałe adresy, w tym polityka prywatności, powinny nadal obsługiwać dotychczasowe szablony.

Nie wykonywano instalacji, zmian ani wysyłki formularza na produkcyjnej stronie Omega MG. Dostępny był publiczny frontend, bez plików PHP pierwotnej wtyczki, dostępu do panelu i konfiguracji wysyłki.

## Połączenie z kalkulatorem

Adapter przepuszcza istniejącą treść strony głównej przez standardowy filtr `the_content` na końcu `wp_enqueue_scripts`, po rejestracji zasobów innych wtyczek i przed ich wypisaniem. Ustawia na czas renderowania kontekst oryginalnej strony dla `get_the_ID()` Elementora i przywraca wszystkie zmienione zmienne WordPressa w bloku `finally`. Dzięki temu oryginalny Elementor i shortcode mogą przygotować bieżącą konfigurację kalkulatora. Adapter nie zgaduje nazwy shortcode ani akcji generującej nonce. Z istniejącego uchwytu `omega-kalk-js` kopiuje wyłącznie fragmenty skryptu zawierające `OmegaKalkData`. Oryginalna witryna używała `wp_add_inline_script` w pozycji `before`; obsługiwane jest też `wp_localize_script`.

Świeże `rules`, `ajax_url`, `nonce` i `i18n` są przekazywane do nowego modułu przez WordPress. Stary kontroler `omega-kalk-js` zostaje zdjęty z kolejki na nowym szablonie, aby nie dodawał drugiego handlera wysyłki. Oryginalny endpoint `omega_kalk_lead`, payload, polityka prywatności oraz backend pozostają odpowiedzialnością istniejącej wtyczki.

Nowy frontend nie może wysyłać żądań bez aktualnej konfiguracji i zgodnego originu endpointu. Lokalny podgląd służy weryfikacji wyglądu i obliczeń; nie stanowi potwierdzenia dostarczenia zgłoszenia. Uchwycona w audycie publiczna wartość nonce nie jest umieszczana w paczce.

**Wymagana weryfikacja na kopii WordPressa:** potwierdź aktualną obecność `window.OmegaKalkData`, naliczanie zgodne z oryginalnymi regułami oraz jedną wysyłkę do istniejącego endpointu po prawidłowym formularzu. Sprawdź też odpowiedzi błędów, wygasły nonce, działanie poczty/odbiorcy i konfigurację cache. Cache całej strony nie może serwować nieaktualnego nonce dłużej niż dopuszcza pierwotna wtyczka.

## SEO, style i pozostałe wtyczki

Szablon importuje wyłącznie `body` lokalnego pliku HTML. Metadane, tytuł, canonical, schema, analityka i dodatki przechodzą przez oryginalne `wp_head()`, `wp_body_open()` oraz `wp_footer()`, więc statyczny head nie duplikuje metadanych SEO. Zachowano polski język dokumentu. Nie następuje automatyczna zmiana globalnego języka WordPressa.

Nowy szablon usuwa z kolejki wyłącznie wymienione w kodzie uchwyty CSS Astry, Elementora i HFE obecne w audycie. Nie dezaktywuje tych wtyczek ani nie usuwa ich ustawień. Pozostałe skrypty i style pozostają dostępne. Nowy kalkulator nie powinien używać klasy `omega-kalk-container`, ponieważ oryginalny CSS stosuje do niej własne style `!important`. Przy innej konfiguracji cache/minifikacji należy potwierdzić kolejność ładowania oraz brak ponownie dołączonego starego kontrolera kalkulatora.

## Stan weryfikacji

Pakowanie ZIP jest niezależne od npm i dodatkowych bibliotek. Składnia obu plików PHP została sprawdzona parserem PHP 7.4, a zbudowany ZIP odczytano niezależnym mechanizmem .NET i porównano SHA-256 każdego wypakowanego wpisu z plikiem źródłowym paczki. Pakowanie sprawdza przenośne ścieżki CSS, a import modułu kalkulatora w paczce otrzymuje wersję wyliczoną z zawartości, aby ograniczyć problem starej wersji z cache.

W środowisku pracy nie był dostępny interpreter PHP ani pełna instalacja WordPressa, więc adapter wymaga testu integracyjnego na kopii istniejącej witryny. Nie należy traktować sprawdzenia składni ani testów statycznego frontendu jako dowodu działania PHP, formularza pocztowego czy widgetów na docelowej instalacji.

Dokumentacja mechanizmów: [template_include](https://developer.wordpress.org/reference/hooks/template_include/), [wp_add_inline_script](https://developer.wordpress.org/reference/functions/wp_add_inline_script/), [wp_enqueue_scripts](https://developer.wordpress.org/reference/hooks/wp_enqueue_scripts/), [wp_print_footer_scripts](https://developer.wordpress.org/reference/hooks/wp_print_footer_scripts/).
