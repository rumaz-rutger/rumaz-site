# RuMaZ RC5 — technisch werkpakket

12 november 2026. Dit is de actuele bewerkte broncode, voortbouwend op RC5. Geen nieuw ontwerp, repository of Netlify-project. Publiceren gebeurt door Rutger in de bestaande omgeving.

**Lees eerst docs/DEPLOY.md. Dit is geen ZIP om volledig naar Netlify Drop te slepen.** De sociale website heeft naast HTML ook Supabase en serverfuncties nodig. Alleen HTML publiceren levert geen werkende uitnodigingsmail op.

## Inbegrepen

- Alle 48 bestaande pagina’s, oorspronkelijke URL’s, sluitsteen, illustraties, kleuren en vijfdelige navigatie.
- Auth met bevestiging/herstel, opgeslagen plekken, meerdere plekken, maandkalender, verblijfsaanvragen en beslissingen, planner, prikbord/reacties/likes, activiteiten/deelname, tips, handleidingen en private foto-opslag.
- Uitnodigingen per bevestigd e-mailadres, tijdelijke eenmalige token, geen beheerdersverhoging via uitnodiging. Uitnodiging per mail; fout bij mailaanlevering trekt de link in.
- Boekingsnotificaties via afgeschermde outbox en geplande serverfunctie; bestaande Nederlandse templates.
- Accountpagina: naam, gegevensdownload, wachtwoordherstel en uitloggen. E-mailadres wijzigen en account verwijderen verlopen bewust via contact en menselijke controle van gedeelde plekken; er is geen automatische verwijderfunctie.
- Afzonderlijke modules; zie docs/ONDERDELEN-UPDATEN.md. Objects/Mollie bewaard, niet geactiveerd.

## Wat nog bij installatie moet gebeuren

De code is geleverd; de nieuwe schema-aanvulling is alleen in een teruggedraaide test uitgevoerd en moet nog geïnstalleerd worden. Servergeheimen, callbacks en mailinstellingen moeten in de doelomgeving staan. Daarna moet de complete route op staging worden afgenomen. Dit pakket is **niet als volledig end-to-end werkend of productie-goedgekeurd gecertificeerd**.

Niet in dit pakket gerealiseerd: privéchat, versleutelde kluis, accountverwijdering met automatische overdracht, automatische externe verhuurimport, lokale evenementenfeed, livebetalingen. Deze zijn niet stilzwijgend nagebootst. De handleiding waarschuwt terecht tegen toegangscodes.

## Bestanden

| Map/bestand | Betekenis |
|---|---|
| site/ | Enige bron voor websitepagina’s en assets |
| site/assets/js/modules/ | Afzonderlijk bij te werken schermonderdelen |
| backend/ | Vier reeds toegepaste basisscripts + nieuwe completion.sql |
| netlify/functions/ | Uitnodiging en geplande notificaties; nooit statisch publiceren |
| server/ | Gedeelde serverfuncties en gegenereerde templates |
| technical-handoff/email-templates/ | Bewerkbare originele mailteksten |
| preserved-commerce/ | Bewaarde Objects/Mollie-servercode, buiten actieve functions-map |
| scripts/build.mjs | Maakt dist/ uit site/ en omgevingsconfiguratie |
| qa/ | Testbron en resultaten; onderscheid mock/database/handmatig |
| docs/ | Installatie, updates en acceptatie |
| INTEGRATIECHECK.md | Historisch log; actuele status staat in docs/TESTRESULTATEN.md |

Gebruik Node 24 en `npm ci`, `npm test`, `npm run build`. Alleen `dist/` is de statische publicatiemap. `dist/` is reproduceerbaar en staat niet als tweede bron in de ZIP.

Er zijn in deze overdracht geen GitHub-schrijfacties, Netlifydeploys, betalingen of echte uitnodigingsmails uitgevoerd.
