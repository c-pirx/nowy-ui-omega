# Nawigacja i przyszłe podstrony

Ten etap zmienia wyłącznie header i jego obsługę. Strona główna, kalkulator i konfiguracja GitHub Pages pozostają zachowane.

## Mapa docelowych adresów

| Menu | Adres docelowy | Status |
| --- | --- | --- |
| O MNIE | `/o-mnie` | Link przygotowany |
| USŁUGI → JDG | `/ksiegowosc-dla-jdg` | Link przygotowany |
| USŁUGI → Spółki z o.o. | `/pelna-ksiegowosc-spolek` | Link przygotowany |
| USŁUGI → Kadry i płace | `/kadry-i-place` | Link przygotowany |
| USŁUGI → KSeF | `/ksef-dla-firm` | Link przygotowany |
| USŁUGI → Zmiana biura | `/zmiana-biura-rachunkowego` | Link przygotowany |
| USŁUGI → Księgowość online | `/ksiegowosc-online` | Link przygotowany |
| SKLEP → E-booki dla księgowych | `/sklep/e-booki-dla-ksiegowych` | Link przygotowany |
| SKLEP → E-booki dla przedsiębiorców | `/sklep/e-booki-dla-przedsiebiorcow` | Link przygotowany |
| SKLEP → Wzory i checklisty | `/sklep/wzory-i-checklisty` | Link przygotowany |
| SKLEP → Pakiety materiałów | `/sklep/pakiety-materialow` | Link przygotowany |
| BAZA WIEDZY | `/baza-wiedzy` | Link przygotowany |
| Kalkulator | `#kalkulator` | Istniejąca sekcja strony głównej |
| KONTAKT | `#kontakt` | Istniejąca sekcja strony głównej |

Adresy Bazy Wiedzy i kategorii sklepu przyjęto roboczo, ponieważ brief nie określał ich slugów. Adresy podstron są zarezerwowane w menu; ten etap nie tworzy dokumentów, treści, szablonów, sklepu ani archiwum wpisów. Do czasu wdrożenia podstron ich adresy zwracają 404. Nie przekierowujemy ich na inne sekcje homepage i nie udajemy gotowych podstron.

W HTML linki są względne, np. `o-mnie`, dzięki czemu na GitHub Pages prowadzą pod `/nowy-ui-omega/o-mnie`, a przy hostowaniu homepage w katalogu głównym pod `/o-mnie`. Przed dodaniem menu do przyszłych zagnieżdżonych podstron należy generować adresy względem katalogu głównego serwisu, z uwzględnieniem prefiksu wdrożenia.

## Podział odpowiedzialności

- `public/index.html`: semantyczny HTML menu desktopowego i mobilnego. Zachowuj zgodność etykiet, kolejności i linków obu wariantów.
- `public/navigation.js`: niezależna obsługa rozwijania, klawiatury, zamykania i istniejących kotwic. Bez zależności od kalkulatora, sklepu czy frameworka.
- `public/styles.css`: style menu korzystające z istniejących tokenów marki.

USŁUGI i SKLEP to przyciski rozwijające listy linków. Enter/Spacja przełącza menu; strzałki, Home/End poruszają się po podmenu; Escape zamyka je i przywraca fokus. Tab zachowuje naturalną kolejność. Kliknięcie poza menu, przejście linkiem lub zmiana breakpointu zamyka otwarte panele. Na mobile podmenu rozwija się w przewijanym panelu nawigacji.

## Późniejsza migracja

W przyszłym customowym motywie WordPress ten sam HTML można generować przez menu CMS i walker, zachowując klasy oraz unikalne powiązania `aria-controls`/`id`. Adresy należy uzyskiwać z permalinków WordPressa i linków kategorii WooCommerce. Cztery kategorie sklepu odpowiadają przyszłym kategoriom produktów; Baza Wiedzy odpowiada przyszłemu archiwum wpisów.

Koszyk należy wprowadzić wraz z częścią sklepową i wyświetlać tylko w jej kontekście. W tym etapie nie dodano koszyka ani kodu WordPress/WooCommerce.
