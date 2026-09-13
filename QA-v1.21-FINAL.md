# RuMaZ QA — v1.21 FINAL

Datum: 13-09-2026

## Finale wijzigingen gecontroleerd
- Home toegevoegd als eerste item in de primaire navigatie op alle 25 pagina's.
- Actieve hoofdsectie gemarkeerd met aria-current, vetter gewicht, subtiele arcering en onderlijn.
- Parent-state gecontroleerd op subpagina's van Diensten, Uitgezocht, Rekenen en Start.
- Oorspronkelijke RuMaZ-brandbookafbeelding teruggeplaatst op de homepage.
- Brandbooksectie responsive getest op desktop en mobiel.
- Homepage-sectienummering loopt nu 01 → 05.

## Technische controle
- HTML-pagina's: 25
- Interne/overige links gecontroleerd: 692
- Ontbrekende interne routes: 0
- Navigatiestructuurfouten: 0
- Fouten in actieve menu-state: 0
- JSON-LD fouten: 0
- JavaScript syntaxcheck: geslaagd (OK)
- Brandbook asset aanwezig: ja
- Staging pagina's met noindex: 25/25
- Staging X-Robots-Tag aanwezig: ja

## Responsive spotcheck
Homepage getest op 1440, 1280, 1120, 1024, 900, 821, 820, 768 en 390 px. Geen horizontale overflow gevonden. Desktop-menu schakelt bij 820 px correct over naar mobiel menu. De actieve Home-state blijft op beide varianten zichtbaar.

## Status
**v1.21 FINAL is production-ready als sitebuild.**

Bewust nog niet definitief inhoudelijk: artikelpagina's onder Uitgezocht, rekentools, Startercheck en juridische werkversies blijven volgens ROUTES.json noindex waar van toepassing.
