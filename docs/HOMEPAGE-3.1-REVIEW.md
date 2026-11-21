# RuMaZ 3.1 — homepage en bestaande check-inroute

20 november 2026. Basis: actuele main 15a54a4ea31ebfcc057c787479dd0fd59640cb18. Lokale featurebranch: feat/rumaz-homepage-3-1.

## Status

Implementatie lokaal gereed. GitHub weigerde op 20 november schrijven met HTTP 403, Resource not accessible by integration. Geen remote featurebranch, PR, stagingbuild of productiepublicatie aangemaakt. De bestaande staging-URL toont nog RC5 en is geen preview van deze wijziging. Geen database- of env-wijzigingen uitgevoerd.

## Wijziging

De bestaande /app/-home toont de goedgekeurde richting: donkergroene hero, originele sluitsteen/huisillustratie, vier kaarten met uitsneden van de aangeleverde afbeeldingen, compacte uitleg en footer. Mobiel bladerbare kaarten met scroll-snap, vijf bestaande tabs, zwevende balk; desktop behoudt de zijbalk. Een onjuiste bestaande HTML-sluiting is hersteld zodat alle hoofdschermen binnen main vallen. De publieke /-homepage en alle 48 pagina's blijven bestaan. Bestaande SVG-bestanden, backend, mails, Objects/Mollie en URL-structuur zijn behouden.

Vier kaartintenties gebruiken bestaande registratie en Mijn plek. Alleen de categorie wordt 24 uur lokaal bewaard; geen persoonsgegevens, tokens of plekgegevens. De bevestigingscallback blijft exact /app/account/welkom/; geen wijziging aan Supabase allowlist. Dezelfde browser kan een nieuwe mailtab gebruiken; na bevestiging/inloggen opent Mijn plek met Plek toevoegen. Andere browser of verdwenen opslag: expliciete link om de pleksoort opnieuw te kiezen. Uitnodigingsbestemming behoudt voorrang. Annuleren maakt niets aan. De oude conceptplekflow blijft aanwezig.

Chalet en Appartement worden als kind home opgeslagen met {id:placeSubtype,value:chalet|appartement} in de bestaande details-array. Code en SQL in de huidige bron ondersteunen deze array. Deze release wijzigt geen schema. De echte opslag/terugkeer moet nog op staging bevestigd worden.

## Kaarten en lokaal gemockte ketentests

| Kaart | Bestaande gastlink | Na auth / ingelogd | Opslagmodel | Lokaal resultaat |
|---|---|---|---|---|
| Camper | /app/account/registreren/?pleksoort=camper | /app/?pleksoort=camper#plek | camper | geslaagd |
| Chalet | /app/account/registreren/?pleksoort=chalet | /app/?pleksoort=chalet#plek | home + subtype chalet | geslaagd |
| Appartement | /app/account/registreren/?pleksoort=appartement | /app/?pleksoort=appartement#plek | home + subtype appartement | geslaagd |
| Boot | /app/account/registreren/?pleksoort=boot | /app/?pleksoort=boot#plek | boat | geslaagd |

## Uitgevoerde controles

- 35 automatische tests geslaagd. Auth en database zijn in deze tests gesimuleerd: geen bewijs van daadwerkelijke e-mailbezorging of hosted databasewrites.
- Bestaande tests voor kalender, planner, prikbord, meerdere plekken, rechten en mailbeveiliging blijven slagen.
- 48 HTML-pagina's; geen gebroken lokale href/src-links. Stagingbuild geslaagd; robots Disallow / en X-Robots-Tag noindex aanwezig. git diff --check schoon.
- Lokale Chromium-controle in frames van 375, 430, 768 en 1280 CSS-pixels: geen horizontale pagina-overloop; mobile kaartstrip blijft horizontaal scrollbaar. Toetsenbordfocus verplaatst de strip naar de juiste kaart. Chaletklik opent het bestaande formulier met Chalet geselecteerd; annuleren sluit het formulier.
- Screenshots tonen uitsluitend de lokale visuele preview met demonstratiemodus. Die tijdelijke instelling is niet opgenomen in de bron of patch. Geen site-consolefouten aangetroffen in de gecontroleerde lokale preview; browserextensiefouten zijn geen sitefouten.
- Aanraak-swipe op een echt iOS/Safari-apparaat, schermzoom en volledige hosted flow met echte e-mail zijn nog NIET getest.

## Foto's en sociale links

Alle vier assets zijn uitsneden/compressies van de aangeleverde referentiebestanden, niet van de mock-up. De bestanden bevatten al social-opmaak; deze is door croppen buiten de fotokaarten gehouden. Het kind is uit de appartementuitsnede verwijderd door uitsnijden. Geen generatieve beeldbewerking.
Instagram https://www.instagram.com/rumaz.nl/ is bevestigd in de projecthistorie. Een vaste officiële Facebook-profiel-URL ontbreekt; daarom geen Facebook-placeholder.

## Nog uit te voeren vóór productie

1. Push deze featurebranch via werkende GitHub-schrijftoegang en maak een draft PR. Geen merge naar main.
2. Gebruik uitsluitend de bestaande afgeschermde rumaz-staging-route voor de uiteindelijke test. Voorkom automatische dubbele PR-previews; de eerdere opschoningspatch van 15 november is nog apart en niet in deze homepagewijziging vermengd.
3. Test met echte stagingaccounts alle vier gast- en ledenroutes, bevestigingsmail, login, opslaan, uitloggen/terugkeren, bestaande plekken en agenda/planner/prikbord. Noteer werkelijke resultaten.
4. Test Safari/iOS, touch, zoom, accountbalk, focus en modals.
5. Vraag pas bij geslaagde stagingacceptatie expliciet: Mag deze geteste versie naar productie?

Productie is ongewijzigd. Deze review is geen goedkeuring voor livegang.
