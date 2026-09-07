# Audyt treści i materiałów Omega MG

Źródło: https://omega-mg.pl/ — pobrane 7/8 września 2026. Oryginalny HTML: `research/original.html`. Wyniki ekstrakcji: `research/content.json`. Dokładne adresy, rozmiary, wymiary i SHA-256 każdego pliku: `research/asset-manifest.json`. Reprodukcja pobrania: `node scripts/collect-assets.mjs`.

## Identyfikacja wizualna

Aktywny zestaw Elementor z `research/styles/06-elementor-post-333-css.css`:

| Rola | Wartość źródłowa |
| --- | --- |
| Primary — czerwień marki | `#D40000` |
| Secondary — ciepły brąz hero | `#5E4C3B` |
| Tekst | `#1F232A` |
| Tło jasne — Astra | `#F7F8F8` |
| Białe powierzchnie | `#FFFFFF` |
| Stopka | `#242A36` |
| Tekst stopki | `#CAD0DB` |
| Lead hero | `#E9EBEF` |
| Tekst z bazowego motywu | `#67757F` |

Motyw Astra zawiera niebieski `#1A5CE0`, a plugin kalkulatora fioletowy `#4F46E5`; są to osobne domyślne kolory, nie charakterystyczna czerwień/brąz Omega MG. Nie należy wybierać palety na podstawie samego pierwszego bloku `:root`. CIK ma własną czerwień zewnętrznej marki `#DA251C`.

Obecna typografia strony: Poppins 700 w nagłówkach, Open Sans 400/600 w treści. Kalkulator ładuje Poppins 400/500/600/700. Wszystkie fonty z obu deklaracji Google Fonts zostały pobrane lokalnie bez zmiany plików; źródłowe reguły są w `content.json.fontStyles`. Pozostałe Roboto/Roboto Slab to ustawienia ogólnego zestawu Elementor; faktyczne nadpisania motywu wybierają Poppins/Open Sans.

## Materiały źródłowe

| Lokalny plik w `public/assets` | Wymiary | Rola na oryginale |
| --- | --- | --- |
| `aktualne-cropped.svg` | 159.82 × 154.62 | Logo w headerze, białe okręgi i czerwień OMG, oryginalny SVG |
| `projekt-bez-nazwy-2.png` | 1080 × 1080 | Logo w hero i stopce, także obraz Open Graph; zachowane wszystkie warianty WP |
| `dsc_1052-scaled.jpg` | 2560 × 1709 | Zdjęcie Moniki Glonek w sekcji O mnie; zachowane wszystkie warianty WP |
| `crop-woman-using-calculator-and-taking-notes-on-paper.jpg` | 640 × 426 | Księgowość; również rozmyte tło innego modułu |
| `crop-payroll-clerk-counting-money-while-sitting-at-table.jpg` | 640 × 426 | Kadry i płace; również rozmyte tło zdjęcia w O mnie |
| `heap-of-american-money-cash-and-vintage-light-box.jpg` | 640 × 426 | Fotografia „TAXES” jako tło CSS przy pełnym zakresie usług |
| `bg-01-free-img.jpg` | 1920 × 1080 | Fotografia rozmytego jasnego biura jako tło kalkulatora |
| `logo-5.svg` | 144 × 80 | Pierwszy logotyp w karuzeli klientów |
| `logo-4.svg`, `logo-3.svg`, `logo-2.svg`, `logo-1.svg` | 143 × 80 | Pozostałe cztery logotypy w kolejności oryginału |
| `grad-white-curve-bg.svg`, `bg-blob-blue.svg` | patrz manifest | Oryginalne dekoracje CSS; nie są fotografiami |
| `cik-widget-logo.png` | 50 × 50 | Oryginalny PNG zakodowany w skrypcie CIK; zapis identycznych bajtów |

Wszystkie fotografie należy zachować — w tym dwa obrazy znalezione wyłącznie w CSS. `eicons.svg` i `fa-*.svg` to fonty ikon wykryte w CSS, pobrane dla kompletności archiwum; nie trzeba ich ładować do redesignu. Logotypy klientów nie zawierają tekstowych nazw firm; oryginalne alty to „logo 5” do „logo 1”. Nie dopisywać niezweryfikowanych nazw klientów.

## Treść i struktura

Uporządkowany komplet treści jest dostępny w `content.json.sections`:

1. Hero: „Monika Glonek – Biuro Rachunkowe Omega MG”, „Twoja rzetelna księgowość w Jaworznie”, CTA do kalkulatora i O nas.
2. O mnie: pełny lead o indywidualnym podejściu, rzetelności i zaangażowaniu; dwa pełne akapity o doświadczeniu, kwalifikacjach i obsługiwanych podmiotach.
3. Usługi: pełny wstęp, dwie rozwinięte usługi: prowadzenie ksiąg rachunkowych oraz kadry i płace.
4. Pełny zakres: pięć usług z opisami i dwie dodatkowe pozycje bez opisów. Łącznie: pełna księgowość, KPiR, ryczałt, kadry i płace, roczne rozliczenia, pomoc w zakładaniu działalności, pomoc w wyborze opodatkowania.
5. Dlaczego Omega MG: nagłówek „Doświadczona księgowa to 80% sukcesu Twojej firmy”, pełny akapit i powtórne zdanie „Rzetelna księgowość to 80% sukcesu Twojego biznesu”. To oryginalny przekaz marketingowy, nie nowo dopisana statystyka. Pięć argumentów z krótkimi opisami: Klient na pierwszym miejscu; Doświadczenie; Terminowość, poufność i rzetelność; Transparentność; Wsparcie.
6. Kalkulator — osobny audyt implementacji wykonywany równolegle.
7. Współpraca / Nasi klienci: pięć oryginalnych logotypów w karuzeli.
8. Kontakt: pełne dane podane poniżej.
9. Stopka: pełne zdanie o profesjonalnej obsłudze, NIP/REGON/certyfikat, powtórzone dane kontaktowe, cztery linki usług, polityka prywatności, ikona e-mail.

Nie stwierdzono tekstowych opinii, ocen gwiazdkowych, Google Reviews, mapy ani zewnętrznego widgetu opinii. `#opinie` **istnieje** i prowadzi do „Nasi klienci”; problem jest semantyczny (nazwa menu wskazuje Opinie), a nie brak celu anchor. Należy zachować pozycję menu i działający anchor, bez dodawania fikcyjnych opinii.

## Dane i linki

- Telefon: `+48 505 448 081`, href: `tel:+48505448081`.
- E-mail: `biuro@omega-mg.pl`. Oryginał stosuje Cloudflare email protection; adres odkodowany z `data-cfemail`, zgodny we wszystkich kopiach.
- Adres: ul. Heleny i Jana Prześlaków 15C, 43-600 Jaworzno.
- Nazwa: Omega MG Monika Glonek.
- NIP: 6321808677.
- REGON: 243006460.
- Certyfikat Księgowy nr 54701/2012.
- Polityka: https://omega-mg.pl/polityka-prywatnosci/ — HTTP 200.
- Menu: strona główna, `#onas`, `#oferta`, `#opinie`, `#kontakt`, `#kalkulator`.
- CTA usług: `#kontakt`.
- Linki poszczególnych usług w stopce: `#oferta`.
- Oryginalne elementy list pełnego zakresu są linkami `href="#"`; nie reprezentują podstron usług. Redesign może prezentować je jako tekst bez bezcelowego skoku do góry.

## CIK — istniejący element wiarygodności

Na stronie ładowany jest skrypt `https://www.cik.org.pl/widget.js?id=28162&mobile=left&desktop=right`. Pełna odpowiedź skryptu i dane znajdują się w `content.json.certificationWidget`. Link profilu: https://www.cik.org.pl/biuro/omega-monika-glonek-28162.

Widget „Certyfikowane Biuro Rachunkowe” ujawnia na desktopie po hoverze:

- Uprawnienia: Certyfikat Księgowy nr 54701/2012.
- Ubezpieczenie OC: Leadenhall.
- Brak zaległości finansowych w BIG.
- Nienaganna opinia.
- Licencjonowany program księgowy: InsERT.
- Min. 2 lata doświadczenia (od 2017-08-02).
- Ostatnia weryfikacja wiedzy podatkowej: 2026 – czerwiec.

Należy zachować istniejący widget lub pełny równoważny komponent dostępny klawiaturą z jego prawdziwym linkiem. Nie należy dopisywać własnych certyfikatów ani interpretować sformułowania „Nienaganna opinia” jako tekstowej opinii klienta.

## Polityka prywatności

Strona źródłowa podaje datę aktualizacji 31.07.2026. Zachowano pełny HTML i tekst w `content.json.privacySource`. Dokument ma 9 punktów: administrator, przetwarzane dane, cel/podstawa, czas przechowywania (nie dłużej niż 6 miesięcy), odbiorcy, prawa, dobrowolność, cookies, kontakt. Polityka określa podstawę art. 6 ust. 1 lit. f RODO; tekst zgody w kalkulatorze należy zachować dokładnie, bez samodzielnej zmiany prawnej.

## SEO i zidentyfikowane drobne błędy

Tytuł źródłowy: „Księgowość Jaworzno - Monika Glonek”. Description: „Profesjonalne usługi księgowe dla firm i osób prywatnych w Jaworznie! Biuro Rachunkowe Omega Monika Glonek zaprasza!”. Canonical wskazuje https://omega-mg.pl/.

Oryginał deklaruje `lang="en-US"` mimo polskiej treści i ma nielogiczne poziomy H5/H6. Redesign powinien użyć `lang="pl"`, jednego H1 i logicznych H2/H3 bez utraty treści. Oryginalny JSON-LD przypisuje wydawcę do „21agency”; nie przenosić tego jako danych właścicielki. Widoczne dane firmy są podane powyżej.

## Kontrola kompletności po implementacji

Niezależny audyt plików `public/index.html`, `public/styles.css`, `public/app.js` względem źródła zakończony. `node --test tests/content.test.mjs`: **10/10 testów zaliczonych**. Potwierdzono pełne akapity biografii, opisy usług i pięć powodów wyboru; siedem niezależnie oznaczonych usług; pięć fotografii; oba warianty logo Omega; pięć logotypów klientów w oryginalnej kolejności; dane kontaktowe i identyfikatory; dokładną zgodę oraz pełną informację o przetwarzaniu danych; wszystkie kryteria certyfikatu CIK; opis SEO, canonical, polski język i działające cele anchor. SHA-256 wszystkich 40 zarchiwizowanych plików materiałów i fontów zgadza się z manifestem.

W trakcie kontroli wychwycono i usunięto problem późnego ładowania zewnętrznego widgetu CIK: jego źródłowy skrypt czeka na zdarzenie `window.load`, które przy ładowaniu po kliknięciu już minęło. Wersja końcowa udostępnia pełną rzeczywistą treść certyfikatu w natywnym panelu z oryginalnym logo i linkiem profilu.

Kontrola tabel `cmap` źródłowych plików TTF wykazała brak większości polskich znaków w obu plikach Open Sans zwracanych przez stary adres Google Fonts. Dla zachowania tego samego kroju pobrano z oficjalnego Google Fonts warianty WOFF2 Latin i Latin Extended, łącznie 83 KB. Źródło reguł: `research/styles/31-open-sans-polish.css`; źródła i sumy kontrolne dodano do manifestu. Poppins 400/500/600 od początku zawiera polskie znaki.

Testy rozpoznają adresy `assets/...` i `/assets/...`, ponieważ względne adresy CSS zachowują poprawne ładowanie po osadzeniu w katalogu pluginu WordPress. Kontrola dotyczy kompletności źródeł; testy interakcji kalkulatora i wizualne QA prowadzone są odrębnie.
