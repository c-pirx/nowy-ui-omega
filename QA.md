# Weryfikacja redesignu Omega MG

## Wykonane

- Przegląd oryginalnej strony na komputerze, tablecie i telefonie; analiza HTML, CSS, wszystkich obrazów, odnośników i publicznego kodu kalkulatora.
- Wizualny przegląd nowego widoku w przeglądarce: hero, biografia, oferta, pełna lista usług, argumenty, formularz, wynik, logotypy i kontakt.
- Szerokości 1440, 1280, 1024, 768, 430, 390 i 360 px. Brak poziomego overflow dokumentu w każdej z nich. Logotypy przewijają się tylko we własnym kontenerze.
- Menu mobilne: otwieranie, zamykanie, Escape, przywracanie fokusu i wybór sekcji. Nawigacja po anchorach z uwzględnieniem sticky headera.
- Kalkulator wylicza cenę anonimowo. Dopiero pusty formularz potwierdzenia pokazuje błędy przy imieniu, telefonie, e-mailu i zgodzie; wynik pozostaje widoczny.
- Wycena kontrolna: JDG / ryczałt, 30 dokumentów, 2 osoby UoP, 1 osoba UoZ, VAT i eksport/import → **770 zł**, zgodnie z oryginałem. Nie wysłano wiadomości.
- Spółka z o.o. wymusza pełną księgowość. Reset przywraca JDG / ryczałt, odblokowuje opcje, czyści zgodę, dane i wynik. Edycja pól ukrywa nieaktualny wynik.
- Przewijanie logotypów i stany przycisków na krańcach. Otwieranie i zamykanie panelu C.I.K., pełna treść i oryginalny link.
- Telefon `tel:+48505448081`, poczta `mailto:biuro@omega-mg.pl`, oryginalna polityka prywatności. Bez inicjowania połączenia lub wysyłania wiadomości.
- Jeden H1, język polski, etykiety formularza, powiązane błędy, live region wyniku, widoczne focus states, skip link, lokalne fonty z polskimi znakami, `prefers-reduced-motion`.
- Zdjęcia mają wymiary i teksty alternatywne, portret hero ma priorytet ładowania, pozostałe zdjęcia korzystają z lazy loading. Brak bibliotek w kodzie uruchamianym przez stronę.
- 26 testów automatycznych: 5 logiki cenowej, 10 zachowania treści, materiałów, danych i SEO oraz 11 przebiegu formularza i ikon. Nowe testy sprawdzają wymagane potwierdzenie polityki prywatności przed obliczeniem, brak żądań przed potwierdzeniem, walidację, payload z wiadomością i parametrami, reset, brak podwójnej wysyłki, błędy serwera i tryb podglądu. Żądania sieciowe w testach są atrapami. Oryginalne obrazy i logotypy sprawdzane przez SHA-256.
- Składnia obu plików adaptera zgodna z PHP 7.4; zawartość paczki ZIP sprawdzona niezależnie.
- Po zmianie kalkulatora: przegląd mobilny 390 i 360 px oraz desktop 1280 px; wynik „od 650 zł netto/mies.”, otwarcie kontaktu, poprawne zgłoszenie w trybie podglądu, powrót do danych i reset. Brak poziomego overflow na sprawdzonych szerokościach mobilnych i brak błędów konsoli. Wszystkie 22 strzałki interfejsu to SVG.
- Rozszerzenie `wp_mail` dopisujące wiadomość sprawdzone składniowo. Rzeczywista treść dostarczonego e-maila i zgodność ze sposobem wysyłki oryginalnej wtyczki wymagają testu na WordPressie.

## Wprowadzone poprawki po przeglądzie

- Naprawione łączenie słów przy ukrywanych mobilnie elementach `br`, które powodowało overflow hero.
- Poprawiony reset kalkulatora po wybraniu spółki, walidacja liczb, nieaktualny wynik i odtwarzanie przycisku po wysyłce.
- Uzupełnione polskie znaki w tej samej rodzinie Open Sans; poprawiony kontrast granic pól i placeholderów.
- C.I.K. ma dostępny panel zamiast zasłaniającego treść elementu przy krawędzi. Zachowano wszystkie źródłowe informacje oraz link do aktualnego certyfikatu.
- Siedem niezależnych usług pozostaje siedmioma pozycjami; pomoc w wyborze formy opodatkowania nie jest opisana jako część zakładania działalności.

## Granice weryfikacji

Dodane wejścia elementów: delikatna sekwencja hero, jednokrotne odsłanianie wybranych modułów przy przewijaniu oraz krótkie pojawienie się wyniku i certyfikatu. Animowane są wyłącznie opacity i transform. Treść pozostaje dostępna bez animacji; preferencja ograniczonego ruchu, fokus klawiatury i druk przerywają ruch. Przegląd w przeglądarce bez błędów konsoli; istniejące 15 testów nadal przechodzi.

Nie uruchomiono backendu WordPressa, dostarczenia e-maila ani pełnego audytu WCAG / pomiaru Core Web Vitals w środowisku produkcyjnym. Wysyłka w podglądzie lokalnym jest celowo wyłączona. Adapter wymaga sprawdzenia na kopii istniejącego WordPressa przed publikacją. Nie wykonano żadnego zapisu w witrynie produkcyjnej.
