# Work uitvoeringsvolgorde — bestaande infrastructuur

## Laatst extern geverifieerd

- GitHub `rumaz-rutger/rumaz-site`, `main` commit `2ffd518d1893f382bd6c950f0662d24bd1af933d`; branch was **niet beschermd**.
- Netlify `rumaz` live deploy `6aa855445766b40008ace8f0`; `rumaz-staging` live deploy `6aa6f01c31deb28dd072f255`. Beide oude statische versies, zonder functies.
- RC5 is **lokaal** en staat NIET in die productierepo. RC5 `site/` 48 HTML-pagina's. Verifieer de meest complete Work-build eerst.
- Site `_headers` bevat sitebrede `X-Robots-Tag: noindex, nofollow` en restrictieve CSP; **staging behouden, productie aanpassen op goedgekeurde publieke routes**.
- Oude Work/Netlify SMTP/Mollie-variabelen aanwezig volgens eerdere controle maar geen end-to-end betaling/e-mail bewezen. Controleer naam en scope, toon nooit waarden.

## Nu in Work

1. Haal RC5 via RuMaZ-bibliotheek op; lees `START-HIER.md`, deze map en bestaande Work-build. Diff RC5 tegen Work, niet tegen oude GitHub `main` alleen.
2. Breng één actuele broncodeversie tot stand. Gebruik een branch/PR; `main` niet wijzigen zonder akkoord. Nooit hele ZIP over `main` uitpakken.
3. Controleer correcte Netlify publish directory en Functions-dir. Voor toekomstige functies: `netlify/functions/` **buiten** publish directory. Bijbehorende Netlify-configuratie gericht aanpassen.
4. Pas alleen de vijf bestanden uit `patch/` toe nadat SHA-256 en routes overeenkomen.
5. Sluit echte auth/database via gekozen backend aan, test RLS. De bestaande account-URL's blijven gelijk.
6. Sluit outbox mail triggers aan en test op staging; eerst fake/sandbox ontvangers. Geen mails aan echte leden.
7. Test alle vier publieke keuzes, login, plek aanmaken, maand, aanvraag/goedkeuren, planner, feed, account en Mijn omgeving. Mobile bottom-nav persistent bij alles achter `/app/`.
8. Maak staging afgeschermd en noindex. Maximaal één gebundelde deploy nadat lokale checks klaar zijn.
9. Production gate: privacy/voorwaarden actueel, HTTPS/robots/canonical, backend, e-mail, gegevensisolatie, Objects checkout apart. Pas na expliciet akkoord `main` en rumaz.nl bijwerken.

## Beslisboom voor live

- Alleen professionele openbare website met partnercontact: **mogelijk** na route-/SEO-/inhoudcontrole, zónder niet-werkende knoppen of misleidende login.
- Echt platform met accounts, agenda en privéberichten: **niet live** voordat opslag, rechten, uitnodigingen en mail door integratietests zijn bewezen.
- Objects: Mollie bewaren maar **livebetaling uit** totdat orderverwerking en financiële controles geslaagd zijn.

## Clustercontract

Per werkcluster: `wat` + `welke bestanden` + `welke routes` + `welke tests` + `risico voor bestaande functionaliteit` + `rollback`. Staging voordat productie. Gezamenlijke stylesheet/script niet aanpassen zonder regressietest van Home, Mijn plek, mobile nav en account.
