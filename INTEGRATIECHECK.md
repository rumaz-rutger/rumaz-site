# Rumaz 3.0 — integratiecheck, 11 november 2026

Status: Supabase-stagingproject aangemaakt; databaseschema toegepast en kernrechten getest; bron en vijf doorklikwijzigingen voorbereid; GEEN operationele platform-staging of toestemming tot publicatie. Geen GitHub-schrijfactie, deploy, databasewijziging, betaling of e-mail uitgevoerd.

## Eén gekozen bron

`site/` is de huidige lokale integratiekandidaat: het complete RC5 Work-pakket van 11 november plus exact vijf hash-gecontroleerde patches uit de technische overdracht. Deze bron bevat 48 HTML-pagina’s. Alle 27 bestaande GitHub-HTML-routes blijven aanwezig. CSS, SVG, afbeeldingen, sluitsteen, vijfdelige social bar en Objects zijn byte-identiek aan RC5 gebleven. De oude Work 2.0-commercebron is teruggevonden in het RC1-pakket; alleen het commercecluster is afzonderlijk bewaard buiten `site/`. Geen tweede sociale implementatie.

GitHub `rumaz-rutger/rumaz-site`: alleen main, HEAD `2ffd518d1893f382bd6c950f0662d24bd1af933d`, geen open PR’s. Productie is nog v1.21. De laatste aangetroffen Actions-run is de geslaagde handmatige Import RuMaZ FINAL van 14 september. De workflow gebruikt rsync --delete en kan de oude v1.21-bron terugzetten: eerst gericht buiten gebruik stellen vóór integratie. Er staat geen netlify.toml op main.

Netlify productie `rumaz`: deploy `6aa855445766b40008ace8f0`, ready, dezelfde main-commit, geen functies. Netlify `rumaz-staging`: deploy `6aa6f01c31deb28dd072f255`, ready, handmatige statische deploy, geen functies. De huidige buildinstellingen/publish directory zijn niet uit de beschikbare projectmetadata vastgesteld; die moeten vóór deploy worden geverifieerd.

## Aangetroffen functionaliteit en ontbrekend werk

| Onderdeel | Bestaat | Nog nodig / blokkade |
|---|---|---|
| RC5 pagina’s, illustraties, social bar | 48 pagina’s; bestanden gecontroleerd | Visuele browsertest nog niet uitgevoerd |
| Vier publieke ingangen | Vijf exacte patches lokaal toegepast | Interactieve browsertest op beschermde staging |
| Plek toevoegen, kalender, planner, prikbord | Browserdemo met localStorage | Authenticated database-adapter, meerdere gebruikers, servervalidatie |
| Accountschermen | Zes schermen en Supabase-startcode | Auth staat uit, URL/key leeg; echte callback en herstel/terugkeer ontbreken |
| Auth callback | PKCE configuratie voorbereid | Welkompagina initialiseert client niet vanzelf; bevestiging/session exchange testen en afhandelen |
| CSP | Noindex en restrictieve policy in kandidaat | jsDelivr-import en Supabase connect worden geblokkeerd; SDK lokaal bundelen en exacte backendhost toestaan |
| Database | RC1-schema identiek aan overdrachtsreferentie | Geen toegang tot actuele database vastgesteld; schema niet uitgevoerd |
| Rechten | RLS per plek en booking-RPC met place-row lock aanwezig in SQL | Test met twee gebruikers, verwijderde leden, beheerders, concurrentie en vertrouwelijke data |
| Planner/reacties/berichten | Demo UI | Opslagschema en rechten ontbreken in aangetroffen SQL |
| Uitnodigingen | Teksttemplate en demoformulier | Tokenopslag/expiry/single-use, geverifieerde ontvanger, acceptatie en intrekking |
| Notificaties | Zes teksttemplates, outbox en besluit-event in SQL | Aanvraag-event naar beheerders ontbreekt, uitnodigingstypes ontbreken; sender, claim/retry/idempotency en sandbox ontbreken |
| Accountbeheer/privacy | Voorbeeldschermen en teksten | Export/verwijderen, echte profielwijzigingen, sessiebeëindiging en privacycontrole |
| Objects/Mollie | Bestaande testbackend teruggevonden en bewaard | Geen live modus; databasevariabele ontbreekt op staging; echte testbetaling/e-mail niet bewezen |

De gecontroleerde Netlify-sitevariabelen: productie bevat MOLLIE_TEST_API_KEY, RUMAZ_SMTP_USER en RUMAZ_SMTP_PASSWORD. Staging bevat daarnaast RUMAZ_CHECKOUT_MODE, RUMAZ_ORDER_SECRET en RUMAZ_STAGING_ORIGIN. Er zijn geen Supabase-sitevariabelen of RUMAZ_TEST_DATABASE_URL aangetroffen. Een gerichte teamcontrole op SUPABASE_URL gaf geen match. Dit bewijst niet dat er elders geen Supabase-project bestaat. Er zijn geen waarden opgeslagen of opgenomen in deze rapportage.

## Concrete beveiligingsblokkade op bestaande staging

Zonder login gaf https://rumaz-staging.netlify.app/ HTTP 200. Geen X-Robots-Tag-header. robots.txt bevat Allow: /. De ingestelde SSO-bescherming geldt alleen voor non_production, terwijl de gepubliceerde stagingdeploy context production heeft. Het hoofdadres van staging is dus momenteel publiek bereikbaar en niet door robots uitgesloten. Niet aangepast vanwege de gevraagde goedkeuringsgrens. Voor de volgende stagingdeploy: bescherming op ALLE deploys van uitsluitend rumaz-staging; noindex en Disallow behouden. Robots alleen is geen toegangsbescherming.

## Vijf uitgevoerde wijzigingen

- eigen-plek/index.html: primaire link naar /app/?start=own.
- gedeelde-plek/index.html: primaire link naar /app/?start=shared.
- gehuurde-plek/index.html: primaire link naar /app/?start=rent.
- in-de-buurt/index.html: primaire link naar /app/#plek-buurt.
- assets/js/rumaz3-social.js: intent opent bestaande invoer; buurt-hash opent bestaande buurtsectie. Geeft geen echte rechten.

Alle vijf before- en after-SHA256’s voldeden aan het overdrachtsmanifest. Een vergelijking met de originele RC5-ZIP toont precies deze vijf gewijzigde sitebestanden. Geen opmaak- of merkbestand gewijzigd. Publieke hub-links blijken al item.route te gebruiken; de ongebruikte absolute URL-metadata vraagt geen aanvullende gedragswijziging.

## Daadwerkelijk geteste resultaten

- 48 HTML-bestanden; 1.531 lokale href/src-verwijzingen gecontroleerd; 0 ontbrekende bestanden. Dit is een bestandscontrole, geen hash-anchor- of backendtest.
- Alle 8 JavaScript-bestanden slagen voor node --check.
- Alle 27 GitHub-HTML-routes behouden.
- Vijf patchhashes vóór en na gecontroleerd, exact passend.
- 13 bestaande commerce-tests opnieuw geslaagd. Deze gebruiken testdoubles: GEEN echte Molliebetaling, PostgreSQL-integratie of mailbezorging bewezen.
- Read-only HTTP-controle van productie en staging uitgevoerd; beide homepage en robots.txt geven 200.
- Browserrooktest geprobeerd maar niet uitgevoerd: Chromium kon in deze omgeving geen process-singleton socket openen (Operation not permitted). Geen geslaagde visuele, mobile, klik- of end-to-end-tests geclaimd.
- Geen stagingtest van registratie, e-mail, autorisatie, uitnodigingen of kalenderconcurrentie mogelijk zonder de werkende backend en goedgekeurde deploy.

## Gerichte vervolgstappen

1. Identificeer/toegang tot bestaand Supabase-stagingproject en actuele migraties. Geen nieuw project of nieuw schema naast een onbekende bestaande installatie maken. Benodigd: projectreferentie/URL en beheerstoegang via veilige koppeling; geen secrets in chat.
2. Hergebruik bestaand authscript en RC1-model; voeg minimaal ontbrekende uitnodigingen, planner/reacties, accountbeheer en outbox-verwerking toe. Los callback en CSP samen op. Laat demo-opslag geen echte sessie voorstellen.
3. Test RLS en boekingsconcurrentie tegen echte stagingdatabase; mail eerst naar sandbox/testontvangers. Accountbevestiging, herstel en uitnodiging hebben afzonderlijke controles nodig.
4. Maak één concreet diff tegen de bestaande repository, inclusief bescherming tegen de oude importworkflow en expliciete publish/functions-grens. Alleen site/ publiceren; commerce en SQL nooit als statische bestanden meesturen. Commercefunctie niet activeren zolang de aparte betaaltest niet rond is.
5. Pas NA lokale review goedkeuring vragen voor één GitHub-branch/PR en één afgeschermde stagingdeploy. Niet mergen naar main. Vervolgens browser- en e-mailketen testen; productie blijft apart akkoord vereisen.

Rollback: lokale vijf bestanden zijn reproduceerbaar uit de oorspronkelijke RC5-ZIP en manifesthashes; externe omgevingen zijn ongewijzigd. Bij een latere stagingdeploy terug naar het vastgelegde stagingdeploy-ID; dat herstelt geen database, waarvoor vooraf een apart migratie/backupplan nodig is.


## Update: Supabase gekoppeld en project aangemaakt

De gebruiker bevestigde organisatie Rumaz en regio Frankfurt. Project rumaz-staging is aangemaakt: lwqttzzyzfvxqerltmoi, eu-central-1, ACTIVE_HEALTHY. API-URL: https://lwqttzzyzfvxqerltmoi.supabase.co. Geen nieuw websiteproject of repository aangemaakt.

backend/core-schema.sql is een beoordeelde afleiding van het bestaande RC1-schema: private helpers en RPC-implementaties, expliciete beperkte tabel-/kolomrechten, ontbrekende outbox-events voor aanvraag en automatische goedkeuring, Nederlandse datumgrens, null-validatie en indexen. CSS/HTML/branding zijn in deze stap niet gewijzigd. Dit is een kandidaat, geen bewezen migratie.

Het toepassen via apply_migration vroeg een Supabase-bevestiging. Beide pogingen eindigden met status expired. Geen andere uitvoeringsroute gebruikt om die bevestiging te omzeilen. De public-schema-inspectie erna blijft leeg. Database-, RLS- en boekingstests zijn nog NIET uitgevoerd; eerst de bevestigde migratie uitvoeren. Geen GitHub-schrijfactie, Netlifydeploy, e-mail of betaling uitgevoerd.

Volgende stap: de concrete Supabase-migratie rumaz_core_with_place_authorization bevestigen, daarna testtransacties met meerdere rollen/plekken uitvoeren en advisories controleren. Auth-callbacks, uitnodigingen, frontend/database-adapter en notificatieworker blijven aansluitend werk vóór staging- en livegoedkeuring.


## Laatste status: migratie en databasetests geslaagd

Migratie 20261111111820 / rumaz_core_with_place_authorization is bevestigd en toegepast op lwqttzzyzfvxqerltmoi. Alle 10 public-tabellen hebben RLS. In één teruggedraaide testtransactie zijn eigenaar-aanmaak/lezen, automatische admin-membership, buitenstaanderisolatie, anonieme RPC-weigering, verbod op goedkeuren door een gewoon lid, aanvraag-outbox aan beheerder, goedkeurings-outbox aan aanvrager, afwijzen van overlappende reserveringen, afwijzen van een herhaald besluit en onmiddellijke leesuitsluiting van een verwijderd lid geslaagd. Testdata is via ROLLBACK verwijderd; geen e-mails verstuurd. Testbron: qa/database-security.sql.

Security-advisor meldt alleen twee INFO-items: audit_events en notification_outbox hebben RLS zonder clientpolicy. Dit is bewust: clients hebben op beide tabellen geen privileges; writes lopen via gecontroleerde serverfuncties. Referentie: https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy

Dit bewijst databasekernrechten en sequentiële conflictcontrole; nog geen gelijktijdige transactietest of volledige browser/Auth/mailketen. Uitnodigingen, planner/reactie-opslag, authcallbacks, notificatieverzending en frontendadapter blijven werk vóór staging/live. Geen GitHub-schrijfactie of Netlifydeploy uitgevoerd.


## Update 11 november: planner en prikbordreacties

Migratie rumaz_planner_and_replies is toegepast op het bestaande Supabase-stagingproject. Toegevoegd: place_tasks en post_replies, beide met RLS en beperkte kolomrechten. Reactierechten volgen het zichtbare bovenliggende prikbordbericht. Taken kunnen niet via een update naar een andere plek worden verplaatst. Testtransactie geslaagd voor taak/reactie-aanmaak, afvinken, verbod op plekverplaatsing, lees- en schrijfweigering voor buitenstaanders en weigering van anonieme toegang. Testgegevens zijn teruggedraaid. Bron en tests: backend/planner-replies.sql en qa/planner-replies-security.sql.

Security-advisor: geen nieuwe meldingen; alleen de twee bewuste INFO-meldingen voor de afgesloten audit/outbox-tabellen. De website gebruikt nog niet deze opslag. Auth, uitnodigingen, frontendkoppeling en echte mailverzending blijven open. Geen deploy, GitHub-write, CSS- of brandingwijziging uitgevoerd.


## Uitnodigingsbackend toegepast en getest
Migratie rumaz_verified_place_invitations toegepast. Alleen bevestigde beheerders kunnen uitnodigen; rollen member/guest, geen adminverhoging via uitnodiging. Tokens: 32 willekeurige bytes, alleen SHA256 opgeslagen, 7 dagen geldig, eenmalig en intrekbaar. Acceptatie controleert het bevestigde e-mailadres tegen auth.users en de nog actieve beheerdersrol van de uitnodiger. Bestaande actieve rollen blijven behouden. Aanmaak begrensd tot 20 per uur per uitnodiger.
Databasetests geslaagd: correct account krijgt plektoegang; verkeerd account, buitenstaander/lid als uitnodiger, hergebruik, adminrol, ingetrokken en verlopen token geweigerd. Testdata teruggedraaid. Bron: backend/invitations.sql; tests: qa/invitation-security.sql.
Security-advisor: drie INFO-meldingen voor bewust gesloten tabellen zonder clientpolicy (audit, outbox, uitnodigingen). Geen clienttabelrechten; toegang via gecontroleerde RPCs. Zie https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy .
Nog niet aangesloten: uitnodigingsmail/outbox-event, browseracceptatie, frontendopslag en echte auth/mailketen. Uitnodigings-RPC retourneert het token eenmaal aan de bevoegde aanmaker; de mailworker moet later veilige uitgifte/verzending regelen. Geen livegang of wijziging aan branding.


## Hervatting na dashboardaanmelding
Supabase-dashboardtoegang geverifieerd. Site URL opgeslagen als https://rumaz-staging.netlify.app; exacte callbacks voor /app/account/welkom/ en /app/account/wachtwoord-instellen/ toegevoegd en zichtbaar geverifieerd. Geen wildcards of productiecallbacks toegevoegd.

Lokale authcode: supabase-js 2.119.0 lokaal gebundeld met esbuild 0.25.12; versies en lockfile in build/. Singleton client, verwerking callback bij paginaopening, geverifieerde gebruiker, interne terugkeerroute, geen demo-success bij registratie, geen 12-tekenregistratieregel op bestaande loginwachtwoorden, herstel alleen na PASSWORD_RECOVERY en uitloggen na wijziging. Vijf gesimuleerde authflowtests geslaagd (qa/auth-flow-results.txt), syntaxcontroles geslaagd. Dit zijn GEEN echte browser/mailketentests.

Config heeft staging-URL/publishable key maar enabled blijft false totdat frontendadapter, CSP en mailketen compleet zijn. Geen styling, SVG of HTML gewijzigd.

Concrete blokkade: custom SMTP staat uit. Dashboard geeft aan dat eigen templates pas met custom SMTP kunnen worden gebruikt. SMTP-formulier geopend voor veilige invoer door gebruiker; nog niet opgeslagen. Bestaande Netlify SMTP-credentials zijn niet naar chat gekopieerd of in bestanden opgeslagen.

Gebruiker heeft inmiddels uitvoering tot live toegestaan. Dat vervangt de eerdere afzonderlijke goedkeuringsstappen; livegang blijft afhankelijk van geslaagde stagingtests. Nog open: frontend/database-adapter, veilige notificatieworker, SMTP/templates, afscherming staging, volledige route/gelijktijdige boekingstest en productieconfiguratie. Geen GitHub-write of deploy in deze hervatting.


## 12 november — hervatting en bewijsstatus
SMTP-configuratie na herladen dashboard geverifieerd: iCloud smtp.mail.me.com:587, ingeschakeld, opgeslagen wachtwoord. Gebruiker autoriseerde info@rumaz.nl voor tests. Eén echte Supabase-bevestigingsmail verzonden, in gekoppelde mailbox teruggevonden, door gebruiker bevestigd. Daarna echte signInWithPassword succesvol en emailConfirmed=true. Op 12 november opnieuw via database bevestigd: één bevestigd testaccount.

Migratie rumaz_atomic_place_onboarding toegepast: bestaande plekvelden plus kringnaam; atomische/idempotente create_place-RPC; profielnamen zichtbaar voor gedeelde actieve kringleden. SQL-tests qa/place-onboarding-security.sql geslaagd en teruggedraaid: herhaling zonder dubbele posts/guides, geen gedeeltelijke plek bij fout, afscherming buitenstaander, gedeelde profielnaam.

Frontendadapter toegevoegd voor plekken, berichten/reacties, planner, tips, handleiding en verblijfsaanvraag/besluit. RC5-schermen gebruiken deze alleen bij enabled=true; gewone demo-opslag wordt dan geblokkeerd. Tijdelijk plekconcept in sessionStorage voor registratie, UUID voor herhaalbare aanmaak. Foto's, activiteiten, uitnodigingsmail en overige niet-aangesloten acties melden dit expliciet. Config blijft enabled=false; niet gepubliceerd.

De daarop gestarte echte API-opslagtest is onderbroken en heeft geen bewaard eindresultaat. Tijdelijke testsessie verdwenen. Databasecontrole toont nul technische testplekken, nul testtaken en nul goedgekeurde testboekingen. Deze keten NIET als geslaagd tellen. Vier nieuwe adapter-unitchecks slagen: onbevestigd account leest niets; serverweigering boeking doorgegeven; onzichtbare taak kan niet als bijgewerkt worden gemeld; auteur wordt niet uit formulier overgenomen. Aanvullend laadfoutafhandeling verbeterd.

Open vóór live: herstel van bruikbare testsessie, volledige API/browserroute, uitnodiging/verzending/outbox-worker, accountbeheer, resterende bestaande functies, CSP, stagingafscherming, productieconfiguratie en deploy. Geen GitHub-schrijfactie of deploy uitgevoerd. Geen CSS/SVG/brandingwijziging.

## 12 november — overdraagbaar modulair werkpakket

Op verzoek geen verdere dashboard-login of deploy. Toegevoegd: aparte views agenda/planner/prikbord/kring/handleiding/omgeving; accountbeheer; uitnodigingsfunctie; beperkte geplande mailworker; activiteiten/deelname/likes/foto-adapter; aanvullend schema; expliciete build voor staging/productie; handmatige installatie- en update-instructies. Originele assets identiek. Actuele bewijsstatus en beperkingen staan in docs/TESTRESULTATEN.md; START-HIER.md is nu het startpunt. Geen claim van volledige end-to-end gereedheid. GitHub en Netlify niet beschreven.
