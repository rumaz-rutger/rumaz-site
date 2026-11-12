# Doorklikroutes — van echte gebruiker uit gedacht

## A. Nieuw gezin met eigen chalet

`/` → `Mijn eigen plek` → `/eigen-plek/` → `Voeg jouw plek toe` → `/app/?start=own` → soort plek/adres → controle → account aanmaken → **e-mailadres bevestigen** → Mijn plekken → Mijn plek → familie uitnodigen.

## B. Wintersportgroep zonder verhuurder

`/` → `Een plek die ik huur` → `/gehuurde-plek/` → `/app/?start=rent` → link naar accommodatie óf zelf invullen → **bronstatus ongeverifieerd tot gecontroleerd** → groep → account → gehuurde plek. Een host of verhuurder krijgt geen automatische toegang.

## C. Schoonouders/familiehuis

`Mijn plek` → `Is er nog plek?` → maandkalender → aankomst/vertrek kiezen → aanvraag → **pending** → serverbericht naar beheerder → beheerder via e-mail op aanvraagpagina → **eerst inloggen** → goed-/afkeuren → status in kalender + bevestiging aan aanvrager.

## D. Aankomst

`Mijn plek` → `Goed voorbereid` → checklist → `Hoe werkt het?` → lokale instructie → afvinken. Geen sleutelcodes in openbare velden; vertrouwelijke kluis is aparte toekomstige feature.

## E. Sociaal

`Mijn plek` → `Wat speelt er?` → prikbord → mention/antwoord → optioneel tip/activiteit delen → activiteiten alleen optioneel in agenda; geen onbedoelde blokkering van overnachtingen.

## F. Ontdekken en partners

`Mijn plek` → `In de buurt` → restaurants via Google Maps URL / gemeentelijke UITagenda → link delen → eigen kring op prikbord/agenda. Bedrijf → `/voor-partners/` → `mailto:info@rumaz.nl?subject=Samenwerking%20met%20Rumaz`.

## Waar doorklik nog werk is

- Patch in `patch/`: links op de 4 bestaande keuze­pagina's + in de app de rolkeuze en buurt-deeplink. **Demo uitsluitend**, veilig als losstaande lokale wijziging, pas toepassen na diff.
- De app-sessie heeft nog **geen** echte accounts/rollen. Niet publiek als echte functionaliteit labelen.
- E-mail-links naar **specifieke** boeking in de backend: `booking`-query veilig uitlezen, rechten checken, juiste plek openen. De query mag geen machtiging geven.
- `/app/uitnodiging/` en `/app/instellingen/` bestaan nog niet als live pagina. Geen knoppen ernaartoe toevoegen voordat backend/routes bestaan.
- Naar publieke pagina's vanuit Mijn omgeving: route moet lokaal via dezelfde origin open kunnen; `https://rumaz.nl` hardcoderingen in demo vervangen door originrelatieve paden vóór staging.
- Voor echte plekselectie: huidige hardcoded demo-'family' uit hashes vervangen door plek-ID uit geautoriseerde gebruikerssessie.
