# Zasady pracy w repozytorium

## GitHub Pages — zachowaj działającą konfigurację

Użytkownik zatwierdził poniższą konfigurację 8 września 2026 i polecił jej nie zmieniać. Zachowuj ją przy kolejnych pracach, chyba że użytkownik wyraźnie poprosi o zmianę sposobu publikacji.

- Adres strony: https://c-pirx.github.io/nowy-ui-omega/#start
- Settings → Pages → Build and deployment → Source: **GitHub Actions** (`build_type: workflow`).
- Workflow `.github/workflows/pages.yml` publikuje katalog **`public`** z gałęzi **`main`** po pushu do `main`.
- Nie przełączaj Pages na „Deploy from a branch” ani publikację katalogu głównego (`/`). Ta konfiguracja uruchamiała Jekyll, który wyświetlał README i nadpisywał prawidłowe wdrożenie strony.
- Zachowuj względne ścieżki zasobów, aby strona działała pod prefiksem `/nowy-ui-omega/`.
- Gałęzie robocze, w tym `new-sitemap`, nie są źródłem publikacji. Nie przełączaj na nie Pages w ramach zwykłych prac nad stroną.

Naprawa dotyczyła ustawień GitHub Pages; nie wymagała zmian kodu strony.
