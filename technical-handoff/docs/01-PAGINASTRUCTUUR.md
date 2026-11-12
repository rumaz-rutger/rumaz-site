# Rumaz — technische paginakaart (vast, geen herontwerp)

## Eén plek per gebruikersvraag

| Ingang | Route | Wat ziet iemand? | Volgende stap |
|---|---|---|---|
| Home | `/` | Eén kernzin, vier getekende keuzes | Eigen, delen, huren of omgeving |
| Mijn eigen plek | `/eigen-plek/` | Korte situatieschets; geen lange uitleg | `/app/?start=own` |
| Een plek die ik deel | `/gedeelde-plek/` | Samen familiehuis/camper gebruiken | `/app/?start=shared` |
| Een plek die ik huur | `/gehuurde-plek/` | Ook zonder verhuurder beginnen | `/app/?start=rent` |
| Mijn omgeving / In de buurt | `/in-de-buurt/` | Links en tips, geen evenementensite | `/app/#plek-buurt` |
| Zo werkt het | `/zo-werkt-het/` | Compact 3 stappen en vier ingangen | Kies een plek |
| Persoonlijke Home | `/app/#home` | Komende afspraak, kringupdates, eigen plekken | Kies Mijn plek |
| Plekken | `/app/#plekken` | Meerdere plekken, toevoegen/wisselen | Plek-home |
| Mijn plek | `/app/#plek` | Plekdetails, is er plek, planner, feed, handleiding | Juiste onderdeel |
| Agenda | `/app/#plek-agenda` | Maand, vrij/aangevraagd/bevestigd | Verblijf aanvragen |
| Planner | `/app/#plek-planner` | Aankomst, verblijf, vertrek, taken | Afvinken |
| Prikbord | `/app/#plek-prikbord` | Bericht, reactie, tip, kring | Bericht plaatsen |
| Praktisch | Binnen `Mijn plek` | Wifi, airco, stroom, water, aankomst/vertrek | Instructie toevoegen |
| Berichten | `/app/#berichten` | Berichten uit geautoriseerde kringen | Gesprek bekijken |
| Mijn omgeving | `/app/#profiel` | Account, hulp, servicepagina's, Objects | Gekozen pagina |

**Vaste mobiele balk:** Home · Plekken · Mijn plek (sluitsteen) · Berichten · Mijn omgeving. Niet vervangen door een extra paginakeuzebalk. Bij accountschermen dezelfde balk; bij openbare pagina's de bestaande header/footer.

## Eén keer inhoud; geen dubbele uitleg

- `Home`: **wat je kunt doen**, niet vertellen wat Rumaz allemaal is.
- `Zo werkt het`: **hoe het gaat**, maximaal drie stappen + link naar details.
- De 4 keuze­pagina's: **voor wie**, met één duidelijke volgende stap.
- `Mijn plek`: echte gebruikswaarde, geen tweede marketinghomepage.
- `Mijn omgeving`: service, beleid, FAQ, Contact, Objects. Geen herhaling van de vier keuzes.
- `/over/`, `/transparantie/`, `/privacy/`, `/disclaimer/`, `/algemene-voorwaarden/` blijven aparte pagina's op hun huidige URL.
- Oude zakelijke routes: behouden voor migratie/SEO; bewust niet in de nieuwe hoofdnavigatie. Pas na inhoudelijke review eventuele redirects/noindex.

## Productblokken binnen Mijn plek

1. Is er nog plek? → **maandbeschikbaarheid**; dagstatus vrij/pending/approved.
2. Goed voorbereid → **planner**, afvinklijst rond aankomst-verblijf-vertrek.
3. Wat speelt er? → **prikbord**, ervaringen en reacties.
4. Hoe werkt het? → **handleiding**, per plek, alleen voor de kring.

*In de buurt* is secundair; optioneel bij plek, met externe Google Maps-/UITagenda-links en gedeelde tips. Activiteitenkalender staat per plek optioneel **uit** en blokkeert nooit een verblijf.

## Clustergrenzen

| Cluster | Eigen bestanden/onderdelen | Bescherm tegen neveneffecten |
|---|---|---|
| Publiek | `index.html`, `zo-werkt-het/`, `eigen-plek/`, `gedeelde-plek/`, `gehuurde-plek/`, `in-de-buurt/` | Geen wijziging aan checkout |
| Plek toevoegen | `assets/js/rumaz3-social.js` → rol/type/aanmaak | Agenda en berichten onveranderd |
| Agenda | `renderAgenda`, aanvraag/goedkeuring en backend-RPC | Geen kalenderwijziging in activiteiten |
| Planner | `renderPlanner`, taken | Geen wijziging in beschikbaarheid |
| Prikbord | `renderBoard`, reacties | Geen wijziging in rechten |
| Accounts | `/app/account/*`, `rumaz3-auth.js`, authprovider | Geen wijziging aan Objects |
| E-mail | outbox + e-mailtemplates | Geen e-mails uit de browser |
| Objects | `/objects/*`, `/winkelwagen/`, `/afrekenen/`, `shop.js` | Niet activeren zonder aparte Mollie-test |

RC5 heeft nog gedeelde `rumaz3-social.js`. Splits pas **gericht bij een echte clusterwijziging** met tests; geen refactor voor het refactoren.
