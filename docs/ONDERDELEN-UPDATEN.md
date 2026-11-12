# Losse onderdelen bijwerken

Eén bron: site/. Geen tweede website, geen bewerking van dist/. Iedere update maakt één nieuwe complete Netlify-snapshot; je hoeft alleen de gewenste bronbestanden te wijzigen.

| Onderdeel | Bestanden | Controle |
|---|---|---|
| Openbare pagina | site/<bestaande-url>/index.html | URL, titel, canonical, links |
| Agenda | site/assets/js/modules/agenda.js | maand, aankomst/vertrek, beheerder/lid |
| Planner | site/assets/js/modules/planner.js | toevoegen en afvinken |
| Prikbord | site/assets/js/modules/prikbord.js | bericht, reactie, foto, like |
| Kring | site/assets/js/modules/kring.js | uitnodiging/rol |
| Handleiding | site/assets/js/modules/handleiding.js | lezen en toevoegen met juiste rol |
| Buurt/tips | site/assets/js/modules/omgeving.js | links en gedeelde tips |
| Navigatie en actieafhandeling | site/assets/js/rumaz3-social.js | vijf tabs + terugkeer |
| Database-adapter | site/assets/js/rumaz3-data.js | mapping/API-fouten, geen clientrechten vertrouwen |
| Auth/account | rumaz3-client.js, rumaz3-auth.js, rumaz3-account.js onder site/assets/js/ | callback, herstel, login |
| E-mails | technical-handoff/email-templates/*.txt | variabelen behouden; npm run build genereert server/templates.mjs |
| Mailverzending | netlify/functions/, server/common.mjs | afzender, rechten, foutscenario’s |
| Objects | site/objects/, site/winkel/, preserved-commerce/ | afzonderlijke commerce-afname |
| Huisstijl/beeld | site/assets/css/, site/assets/img/ | vastgelegd; niet wijzigen bij techniekupdates |

De viewmodules veranderen alleen de bestaande rendering; events en opslag staan centraal in social/data. Bij een nieuwe databasekolom wijzig je dus adapter + aanvullend SQL-script, niet alleen de view. De mailmodule staat buiten publish en mag nooit naar site/ worden verplaatst.

Werkwijze: wijzig één onderdeel → npm test → python3 qa/check-static.py → npm run build → één stagingdeploy → gerichte afname → dezelfde versie productie. Geen nieuwe repository of project. Nieuwe databasewijzigingen append-only in een afzonderlijk script; draai oude basisscripts niet opnieuw.

Foto’s staan in een private bucket. Tijdelijke leeslinks leven 60 seconden; reeds geladen/downloadbare beelden kunnen niet worden teruggenomen. Rechtenwijzigingen blokkeren nieuwe links. Toon hier geen wachtwoorden of sleutelcodes.

Voor productpagina’s kunnen de drie bestaande mappen afzonderlijk worden vervangen met behoud van URL, assets en navigatie. De bewaarde checkoutcode is geen actieve checkout. Een aparte betaaltest blijft nodig.
