# RuMaZ site structure v1.21 FINAL

Definitieve sitebuild na gebruikersronde op staging.

## Laatste wijzigingen
- Home is toegevoegd als eerste item in de primaire navigatie.
- De actieve hoofdsectie is altijd duidelijk gemarkeerd met gewicht, subtiele arcering en een onderlijn.
- Dezelfde navigatie werkt desktop en mobiel; subpagina's markeren hun hoofdsectie (bijv. Rekenen of Diensten).
- De oorspronkelijke RuMaZ-brandbookfoto met boek, pen, visitekaart en huisstijlelementen is terug op de homepage als volwaardige merksectie.
- Homepage-sectienummering is bijgewerkt naar 01–05.

## Hoofdstructuur
- primaire navigatie: Home · Diensten · Uitgezocht · Rekenen · Start · Over · Contact
- footer/trust: Home · FAQ · Transparantie · Disclaimer · Algemene voorwaarden · Privacy
- consistente breadcrumbs, mobiele navigatie, focus-states en scroll reveals
- 3D/parallax en kaart-tilt blijven behouden waar ze functioneel zijn

## Indexeerbaar in productie
De hoofdpagina's plus de afgeronde dienstpagina's Projectbasis, Korte sprint en Sparring. Zie `ROUTES.json` en `sitemap.xml`.

## Bewust noindex
Onvoltooide artikelen, calculators, Startercheck en juridische werkversies blijven `noindex,follow` totdat de inhoud definitief is.

## Staging
De stagingbundle blokkeert indexatie op drie niveaus: `robots.txt`, `X-Robots-Tag` en pagina-meta. Zo kan `rumaz-staging.netlify.app` veilig worden gebruikt zonder duplicaten in Google.

## Legacy routes
Drie oude dienstenroutes zijn verwijderd en via `_redirects` doorgezet naar de actuele samenwerkingsvormen.
