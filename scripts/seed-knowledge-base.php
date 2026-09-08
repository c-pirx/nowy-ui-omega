<?php
/**
 * Baza wiedzy: strona wpisów pod /baza-wiedzy/, adresy zagnieżdżone, trzy kategorie i trzy przykładowe artykuły.
 * Uruchomienie (LocalWP): wp eval-file scripts/seed-knowledge-base.php --path=app/public
 * Skrypt jest idempotentny: istniejące strony, kategorie i artykuły aktualizuje po slugu.
 */

require_once ABSPATH . 'wp-admin/includes/image.php';

// Strony: statyczna strona główna (renderuje ją front-page.php) i strona wpisów jako baza wiedzy.
function omega_seed_page( $title, $slug, $content = '' ) {
	$page = get_page_by_path( $slug, OBJECT, 'page' );
	if ( $page ) {
		wp_update_post( array( 'ID' => $page->ID, 'post_title' => $title, 'post_status' => 'publish' ) );
		return (int) $page->ID;
	}
	$id = wp_insert_post( array( 'post_type' => 'page', 'post_title' => $title, 'post_name' => $slug, 'post_content' => $content, 'post_status' => 'publish', 'comment_status' => 'closed' ), true );
	if ( is_wp_error( $id ) ) {
		WP_CLI::error( $id->get_error_message() );
	}
	return (int) $id;
}

$front_id = (int) get_option( 'page_on_front' ) ?: omega_seed_page( 'Strona główna', 'strona-glowna' );
$kb_id    = omega_seed_page( 'Baza wiedzy', 'baza-wiedzy', '<p>Praktyczne odpowiedzi na pytania, które słyszymy w biurze najczęściej: podatki, KSeF, kadry i prowadzenie firmy bez niespodzianek. Piszemy tak, jak tłumaczymy klientom.</p>' );

foreach ( array(
	'show_on_front'          => 'page',
	'page_on_front'          => $front_id,
	'page_for_posts'         => $kb_id,
	'posts_per_page'         => 9,
	'default_comment_status' => 'closed',
) as $key => $value ) {
	update_option( $key, $value );
}

// Adresy: /baza-wiedzy/ (lista), /baza-wiedzy/tytul/ (artykuł), /baza-wiedzy/kategoria/podatki/ (kategoria).
// Reguły kategorii i tagów są sprawdzane przed regułą wpisu, więc nie kolidują z %postname%.
global $wp_rewrite;
$wp_rewrite->set_permalink_structure( '/baza-wiedzy/%postname%/' );
$wp_rewrite->set_category_base( 'baza-wiedzy/kategoria' );
$wp_rewrite->set_tag_base( 'baza-wiedzy/tag' );

// Domyślny wpis instalacyjny trafia do kosza (bez trwałego usuwania).
foreach ( array( 'hello-world', 'witaj-swiecie' ) as $slug ) {
	$hello = get_page_by_path( $slug, OBJECT, 'post' );
	if ( $hello && 'trash' !== $hello->post_status ) {
		wp_trash_post( $hello->ID );
		WP_CLI::log( 'Wpis „' . $hello->post_title . '” przeniesiony do kosza.' );
	}
}

// Kategorie i artykuły. Zdjęcia pochodzą z assetów motywu.
$omega_articles = array(
	array(
		'category' => array(
			'name'        => 'Podatki',
			'slug'        => 'podatki',
			'description' => 'Formy opodatkowania, ulgi, terminy i rozliczenia roczne wyjaśnione na przykładach z biura.',
		),
		'post'     => array(
			'title'   => 'Ryczałt, skala czy podatek liniowy? Jak wybrać formę opodatkowania na 2027 rok',
			'slug'    => 'ryczalt-skala-czy-podatek-liniowy',
			'days'    => 2,
			'image'   => 'heap-of-american-money-cash-and-vintage-light-box.jpg',
			'excerpt' => 'Trzy formy opodatkowania, jedna decyzja na cały rok. Sprawdź, od czego naprawdę zależy wybór i jakie pytania zadać sobie przed styczniem.',
			'content' => "<p>Formę opodatkowania wybiera się na cały rok, a zmienić ją można dopiero w kolejnym. Dlatego rozmowę o niej zaczynamy z klientami już jesienią, kiedy widać wyniki trzech kwartałów i da się rozsądnie oszacować cały rok. Poniżej opisujemy, na co patrzymy w biurze, zanim polecimy konkretne rozwiązanie.</p>\n<h2>Kiedy można zmienić formę opodatkowania</h2>\n<p>Zmianę zgłasza się do 20. dnia miesiąca następującego po miesiącu, w którym uzyskano pierwszy przychód w roku. Dla większości firm oznacza to termin 20 lutego. Spóźnienie zamyka temat na kolejne dwanaście miesięcy, więc decyzję warto podjąć wcześniej, a nie w ostatnim tygodniu.</p>\n<h2>Skala podatkowa</h2>\n<p>Podstawowa forma, dostępna dla każdego. Podatek liczy się od dochodu, czyli przychodu pomniejszonego o koszty. Obowiązują dwie stawki zależne od wysokości dochodu, kwota wolna oraz najszerszy katalog ulg, w tym wspólne rozliczenie z małżonkiem i ulga na dzieci.</p>\n<ul>\n<li>Najlepsza przy umiarkowanych dochodach i wysokich kosztach.</li>\n<li>Jedyna forma, która pozwala na wspólne rozliczenie z małżonkiem.</li>\n<li>Wysokie dochody wpadają w wyższą stawkę, co trzeba policzyć, a nie zakładać.</li>\n</ul>\n<h2>Podatek liniowy</h2>\n<p>Jedna stawka niezależnie od dochodu. Rozliczasz koszty, ale tracisz kwotę wolną, wspólne rozliczenie i większość ulg. Ma sens, gdy dochód jest na tyle wysoki, że na skali wpadłbyś w wyższy próg, a jednocześnie nie korzystasz z ulg rodzinnych.</p>\n<h2>Ryczałt od przychodów ewidencjonowanych</h2>\n<p>Podatek liczony od przychodu, bez odliczania kosztów, według stawki zależnej od rodzaju działalności. Najprostsza ewidencja i często najniższa składka zdrowotna, ale każda złotówka wydana na firmę nie zmniejsza podatku. Opłaca się, gdy koszty są niskie w stosunku do przychodu.</p>\n<table>\n<thead>\n<tr><th>Kryterium</th><th>Skala</th><th>Liniowy</th><th>Ryczałt</th></tr>\n</thead>\n<tbody>\n<tr><td>Podstawa opodatkowania</td><td>Dochód</td><td>Dochód</td><td>Przychód</td></tr>\n<tr><td>Koszty obniżają podatek</td><td>Tak</td><td>Tak</td><td>Nie</td></tr>\n<tr><td>Wspólne rozliczenie z małżonkiem</td><td>Tak</td><td>Nie</td><td>Nie</td></tr>\n<tr><td>Ulga na dzieci</td><td>Tak</td><td>Nie</td><td>Nie</td></tr>\n<tr><td>Składka zdrowotna</td><td>Procent dochodu</td><td>Procent dochodu</td><td>Ryczałtowa, według progów przychodu</td></tr>\n</tbody>\n</table>\n<blockquote>\n<p>Najczęstszy błąd to porównywanie samych stawek podatku. Do rachunku trzeba dołożyć składkę zdrowotną, utracone ulgi i to, jak wygląda struktura kosztów w Twojej firmie. Dopiero wtedy widać realną różnicę.</p>\n</blockquote>\n<h2>Jak liczymy to w biurze</h2>\n<ul>\n<li>Bierzemy realne przychody i koszty z bieżącego roku, a nie plany.</li>\n<li>Liczymy podatek i składkę zdrowotną w trzech wariantach na tych samych danych.</li>\n<li>Sprawdzamy ulgi, z których korzystasz dziś i które stracisz po zmianie.</li>\n<li>Pytamy o plany na kolejny rok: nowe zatrudnienie, inwestycje, sprzedaż majątku.</li>\n</ul>\n<p>Aktualne stawki i progi zmieniają się w kolejnych latach, dlatego przed decyzją zawsze sprawdzamy je na dany rok podatkowy. Jeśli chcesz, policzymy trzy warianty dla Twojej firmy w ramach jednej rozmowy.</p>",
		),
	),
	array(
		'category' => array(
			'name'        => 'KSeF',
			'slug'        => 'ksef',
			'description' => 'Krajowy System e-Faktur w praktyce: uprawnienia, obieg dokumentów i błędy, których da się uniknąć.',
		),
		'post'     => array(
			'title'   => 'KSeF po pierwszych miesiącach: 7 błędów, które najczęściej poprawiamy u klientów',
			'slug'    => 'ksef-7-najczestszych-bledow',
			'days'    => 9,
			'image'   => 'crop-woman-using-calculator-and-taking-notes-on-paper.jpg',
			'excerpt' => 'Obowiązkowy KSeF przestał być teorią. Zebraliśmy siedem błędów, które powtarzają się u naszych klientów, i pokazujemy, jak je wyeliminować raz na zawsze.',
			'content' => "<p>Po kilku miesiącach obowiązkowego fakturowania w Krajowym Systemie e-Faktur widać już wyraźnie, gdzie firmy potykają się najczęściej. Nie chodzi o samą technologię, ale o organizację pracy. Oto siedem błędów, które poprawiamy u klientów regularnie, w kolejności od najczęstszego.</p>\n<h2>1. Uprawnienia nadane jednej osobie</h2>\n<p>Właściciel nadaje uprawnienia sobie i na tym kończy. Gdy jest na urlopie albo choruje, nikt nie może wystawić ani odebrać faktury. Uprawnienia do wystawiania i odbierania powinny mieć co najmniej dwie osoby, a biuro rachunkowe powinno mieć dostęp do odbioru dokumentów.</p>\n<h2>2. Brak kontroli faktur odrzuconych</h2>\n<p>Faktura odrzucona przez system nie istnieje w obrocie prawnym. Jeśli nikt nie sprawdza statusów, sprzedaż jest wystawiona tylko w programie, a w KSeF jej nie ma. Raz w tygodniu warto przejrzeć listę dokumentów ze statusem odrzucenia i wyjaśnić każdy przypadek.</p>\n<h2>3. Data wystawienia a data przesłania</h2>\n<p>Dla faktury w KSeF liczy się data przesłania do systemu, a nie data wpisana w programie. Wystawianie faktur w ostatnim dniu miesiąca z datą wsteczną przestało działać. Faktury wysyłamy na bieżąco, a nie hurtowo na koniec okresu.</p>\n<h2>4. Faktury dla konsumentów i zagranicznych kontrahentów</h2>\n<p>Nie każda faktura trafia do KSeF na tych samych zasadach. Sprzedaż dla osób prywatnych i część transakcji zagranicznych ma odrębne reguły. Firmy, które wrzucają wszystko jednym trybem, tworzą sobie problemy przy korektach.</p>\n<h2>5. Numer KSeF nie trafia na przelew</h2>\n<p>Kontrahenci coraz częściej wymagają numeru KSeF w tytule przelewu, a przy części płatności jest to obowiązek. Jeśli program księgowy nie podpowiada tego numeru, wpisuje się go ręcznie i łatwo o pomyłkę. Warto włączyć automatyczne uzupełnianie w bankowości firmowej lub programie fakturowym.</p>\n<h2>6. Duplikaty po awarii i trybie offline</h2>\n<p>Podczas przerwy w dostępie do systemu faktury wystawia się w trybie awaryjnym i wysyła później. Najczęstszy problem to wysłanie tego samego dokumentu dwa razy. Po każdej przerwie sprawdzamy, czy liczba faktur w programie zgadza się z liczbą w KSeF.</p>\n<h2>7. Załączniki wysyłane starym kanałem</h2>\n<p>KSeF przenosi fakturę, ale nie protokoły odbioru, specyfikacje czy umowy. Firmy, które zakładają, że kontrahent dostanie komplet, potem gonią za dokumentami. Załączniki nadal wysyła się osobno i warto ustalić z odbiorcą, którym kanałem.</p>\n<blockquote>\n<p>KSeF nie zmienił tego, co trzeba zaksięgować. Zmienił moment, w którym faktura staje się faktyczna. Kto ułoży pod to obieg dokumentów, ten przestaje mieć z systemem problemy.</p>\n</blockquote>\n<h2>Checklista na koniec każdego miesiąca</h2>\n<ul>\n<li>Wszystkie faktury sprzedaży mają numer KSeF i status przyjęcia.</li>\n<li>Lista odrzuceń jest pusta albo każdy przypadek ma wyjaśnienie.</li>\n<li>Faktury zakupu z KSeF zostały pobrane i przekazane do księgowania.</li>\n<li>Po trybie awaryjnym sprawdzono duplikaty.</li>\n<li>Uprawnienia mają aktualne osoby, w tym biuro rachunkowe.</li>\n</ul>\n<p>Jeżeli któryś z punktów brzmi znajomo, przejrzyjmy razem Twój obieg faktur. Zwykle wystarczy jedna zmiana w procedurze, żeby problem zniknął na stałe.</p>",
		),
	),
	array(
		'category' => array(
			'name'        => 'Kadry i płace',
			'slug'        => 'kadry-i-place',
			'description' => 'Umowy, składki, urlopy i dokumentacja pracownicza bez żargonu.',
		),
		'post'     => array(
			'title'   => 'Umowa zlecenia czy umowa o dzieło? Składki, koszty i ryzyko przekwalifikowania',
			'slug'    => 'umowa-zlecenia-czy-umowa-o-dzielo',
			'days'    => 20,
			'image'   => 'crop-payroll-clerk-counting-money-while-sitting-at-table.jpg',
			'excerpt' => 'Obie umowy wyglądają podobnie, ale różnią się składkami, kosztami i tym, co się dzieje podczas kontroli ZUS. Wyjaśniamy, kiedy która jest właściwa.',
			'content' => "<p>Pytanie „zlecenie czy dzieło?” pada w biurze niemal co tydzień. Odpowiedź rzadko zależy od tego, która umowa jest tańsza, a niemal zawsze od tego, co faktycznie ma zrobić wykonawca. Dobór umowy do wygody, a nie do treści pracy, to najprostsza droga do dopłaty składek za kilka lat wstecz.</p>\n<h2>Na czym polega różnica</h2>\n<p>Umowa zlecenia to umowa starannego działania: zleceniobiorca zobowiązuje się wykonywać określone czynności, a nie osiągnąć konkretny rezultat. Umowa o dzieło to umowa rezultatu: liczy się gotowy, sprawdzalny efekt, na przykład projekt logo, przetłumaczony dokument czy wykonany mebel.</p>\n<table>\n<thead>\n<tr><th>Cecha</th><th>Umowa zlecenia</th><th>Umowa o dzieło</th></tr>\n</thead>\n<tbody>\n<tr><td>Przedmiot</td><td>Wykonywanie czynności</td><td>Konkretny rezultat</td></tr>\n<tr><td>Składki ZUS</td><td>Co do zasady tak, z wyjątkami dla studentów i zbiegów tytułów</td><td>Co do zasady nie, poza umową z własnym pracodawcą</td></tr>\n<tr><td>Zgłoszenie do ZUS</td><td>Zgłoszenie zleceniobiorcy</td><td>Informacja o zawarciu umowy</td></tr>\n<tr><td>Minimalna stawka godzinowa</td><td>Obowiązuje</td><td>Nie dotyczy</td></tr>\n<tr><td>Ewidencja godzin</td><td>Wymagana</td><td>Brak</td></tr>\n<tr><td>Ryzyko przekwalifikowania</td><td>Niskie</td><td>Wysokie przy pracach powtarzalnych</td></tr>\n</tbody>\n</table>\n<h2>Kiedy umowa o dzieło jest bezpieczna</h2>\n<ul>\n<li>Efekt da się opisać w umowie i sprawdzić przy odbiorze.</li>\n<li>Wykonawca ma swobodę co do sposobu, miejsca i czasu pracy.</li>\n<li>Umowa dotyczy jednorazowego zadania, a nie cyklicznych czynności.</li>\n<li>Wynagrodzenie jest za rezultat, nie za godziny.</li>\n</ul>\n<h2>Kiedy kontrola uzna dzieło za zlecenie</h2>\n<p>Najczęściej wtedy, gdy „dzieło” to comiesięczna obsługa, sprzątanie, prowadzenie szkoleń według cudzego programu, obsługa klientów albo inne czynności powtarzalne, których efektu nie da się oddzielić od samej pracy. W takich przypadkach kontrola ZUS przekwalifikowuje umowę i nalicza składki wstecz, razem z odsetkami.</p>\n<blockquote>\n<p>Zasada, którą powtarzamy klientom: jeśli potrafisz napisać, co dokładnie odbierzesz i po czym poznasz, że jest zrobione, to prawdopodobnie dzieło. Jeśli opisujesz, co wykonawca ma robić w tygodniu, to zlecenie.</p>\n</blockquote>\n<h2>Co przygotować przed podpisaniem</h2>\n<ul>\n<li>Opis przedmiotu umowy, z którego wynika rezultat albo zakres czynności.</li>\n<li>Oświadczenie wykonawcy o innych tytułach do ubezpieczeń, jeśli to zlecenie.</li>\n<li>Ustalony sposób potwierdzania godzin przy zleceniu.</li>\n<li>Protokół odbioru przy dziele.</li>\n</ul>\n<p>Stawki składek i limity zmieniają się co roku, dlatego kalkulację kosztu umowy robimy zawsze na aktualnych danych. Jeśli nie masz pewności, którą umowę wybrać, wyślij nam krótki opis zadania. Zwykle odpowiedź mieści się w jednym zdaniu.</p>",
		),
	),
);

$assets = trailingslashit( get_theme_file_path( '/assets' ) );

foreach ( $omega_articles as $entry ) {
	$category = $entry['category'];
	$term     = term_exists( $category['slug'], 'category' );
	if ( ! $term ) {
		$term = wp_insert_term( $category['name'], 'category', array( 'slug' => $category['slug'], 'description' => $category['description'] ) );
	} else {
		wp_update_term( (int) $term['term_id'], 'category', array( 'name' => $category['name'], 'description' => $category['description'] ) );
	}
	if ( is_wp_error( $term ) ) {
		WP_CLI::error( $term->get_error_message() );
	}
	$term_id = (int) $term['term_id'];

	$data     = $entry['post'];
	$existing = get_page_by_path( $data['slug'], OBJECT, 'post' );
	$postarr  = array(
		'post_type'      => 'post',
		'post_title'     => $data['title'],
		'post_name'      => $data['slug'],
		'post_status'    => 'publish',
		'post_content'   => $data['content'],
		'post_excerpt'   => $data['excerpt'],
		'post_date'      => wp_date( 'Y-m-d H:i:s', strtotime( '-' . $data['days'] . ' days 09:30' ) ),
		'comment_status' => 'closed',
		'post_category'  => array( $term_id ),
	);
	if ( $existing ) {
		$postarr['ID'] = $existing->ID;
		$post_id       = wp_update_post( $postarr, true );
	} else {
		$post_id = wp_insert_post( $postarr, true );
	}
	if ( is_wp_error( $post_id ) ) {
		WP_CLI::error( $post_id->get_error_message() );
	}

	if ( ! has_post_thumbnail( $post_id ) ) {
		$source = $assets . $data['image'];
		if ( ! is_readable( $source ) ) {
			WP_CLI::warning( 'Brak zdjęcia: ' . $source );
		} else {
			$upload = wp_upload_bits( $data['slug'] . '.jpg', null, file_get_contents( $source ) );
			if ( empty( $upload['error'] ) ) {
				$attachment_id = wp_insert_attachment(
					array( 'post_mime_type' => 'image/jpeg', 'post_title' => $data['title'], 'post_status' => 'inherit' ),
					$upload['file'],
					$post_id
				);
				wp_update_attachment_metadata( $attachment_id, wp_generate_attachment_metadata( $attachment_id, $upload['file'] ) );
				set_post_thumbnail( $post_id, $attachment_id );
			} else {
				WP_CLI::warning( $upload['error'] );
			}
		}
	}

	WP_CLI::log( sprintf( '%s -> %s (#%d)', $category['name'], $data['title'], $post_id ) );
}

// Taksonomie zarejestrowały się na starcie WP-CLI ze starą bazą kategorii, więc flush zapisałby nieaktualne reguły.
// Po usunięciu opcji WordPress odbuduje je przy pierwszym żądaniu, już z nową bazą.
delete_option( 'rewrite_rules' );
WP_CLI::success( 'Baza wiedzy gotowa: ' . get_permalink( $kb_id ) );
