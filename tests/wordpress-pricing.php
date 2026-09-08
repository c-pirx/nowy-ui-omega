<?php

if ( ! class_exists( 'Omega_Core' ) ) {
	fwrite( STDERR, "Omega Core nie jest aktywny.\n" );
	exit( 1 );
}

$base = array(
	'forma' => 'JDG', 'rodzaj' => 'RYCZALT', 'dokumenty' => 0,
	'pracUop' => 0, 'pracUoz' => 0, 'vat' => false, 'eksport' => false,
);
$cases = array(
	'10 dokumentów' => array( array_merge( $base, array( 'dokumenty' => 10 ) ), 150 ),
	'30 dokumentów' => array( array_merge( $base, array( 'dokumenty' => 30 ) ), 310 ),
	'31 dokumentów, nowy próg' => array( array_merge( $base, array( 'dokumenty' => 31 ) ), 276 ),
	'60 dokumentów' => array( array_merge( $base, array( 'dokumenty' => 60 ) ), 450 ),
	'61 dokumentów, nowy próg' => array( array_merge( $base, array( 'dokumenty' => 61 ) ), 405 ),
	'spółka wymusza pełną księgowość' => array( array_merge( $base, array( 'forma' => 'SPOLKA_ZOO', 'rodzaj' => 'RYCZALT' ) ), 900 ),
	'dopłaty i pracownicy' => array( array_merge( $base, array( 'rodzaj' => 'KPIR', 'pracUop' => 2, 'pracUoz' => 1, 'vat' => true, 'eksport' => true ) ), 710 ),
);

foreach ( $cases as $label => $case ) {
	$actual = Omega_Core::calculate( $case[0] );
	if ( abs( $actual - $case[1] ) > 0.001 ) {
		fwrite( STDERR, sprintf( "%s: oczekiwano %s, otrzymano %s\n", $label, $case[1], $actual ) );
		exit( 1 );
	}
}

echo 'PHP pricing: ' . count( $cases ) . " przypadków OK\n";
