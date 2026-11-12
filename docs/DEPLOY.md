# Zelf publiceren — bestaande Rumaz-omgeving

## 1. Eén bron behouden

Pak de ZIP uit. De map met package.json, netlify.toml en START-HIER.md is de projectroot. Werk in de bestaande repository rumaz-rutger/rumaz-site. Maak geen nieuwe repository of Netlify-site.

Vergelijk eerst de actuele GitHub-versie met de uitgangsversie `2ffd518d1893f382bd6c950f0662d24bd1af933d`. Als er sindsdien wijzigingen zijn, behoud die bij het samenvoegen; dit ZIP-bestand mag die niet blind overschrijven. Bewaar de huidige commit als terugvalpunt.

Zet de pakketmappen op de root van de bestaande repository. Voeg .github/workflows/import-final.yml toe ter vervanging van de gevaarlijke oude ZIP-import. Die oude workflow gebruikte rsync --delete en kon RC5 overschrijven. De meegeleverde vervanger doet geen import.

Gebruik voor de voorbereiding een commit met `[skip netlify]` om onbedoelde dubbele builds te vermijden. Voer niet tegelijkertijd een Git-build en handmatige CLI-deploy uit. Productie mag pas de geaccepteerde commit bouwen. Oude root-HTML is niet langer de bron: publish is dist, bron is site/.

## 2. Supabase voorbereiden

Bestaand project: rumaz-staging, referentie `lwqttzzyzfvxqerltmoi`.

Deze vier wijzigingen zijn eerder toegepast: core-schema.sql, planner-replies.sql, invitations.sql, place-onboarding.sql. **Voer die op dit project niet opnieuw uit.** Op een aantoonbaar lege andere database is dit de volgorde, maar maak voor deze overdracht niet automatisch een nieuw project.

Voer op het bestaande stagingproject uitsluitend backend/completion.sql één keer uit via SQL Editor, na controle van de aanwezige tabellen. Het script staat in een transactie en bevat nieuwe activiteiten-/like-/deelnametabellen, private bucket rumaz-photos, foto-RLS en claim_notifications. Een gedeeltelijke eerdere installatie niet oplossen door beveiliging of foutmeldingen weg te halen; vergelijk eerst het schema.

Houd e-mailbevestiging aan. Site URL: https://rumaz-staging.netlify.app. Exacte toegestane callbacks:

- https://rumaz-staging.netlify.app/app/account/welkom/
- https://rumaz-staging.netlify.app/app/account/wachtwoord-instellen/

SMTP voor Supabase Auth is apart van SMTP in Netlify Functions. De eerder ingestelde iCloud-authmail is bevestigd; dat betekent niet dat Netlify de secrets al heeft.

## 3. Netlify staging instellen

Gebruik uitsluitend project rumaz-staging, ID `df9e55f3-066a-4017-8544-4f74002e26b1`.

Netlify moet de projectroot bouwen met `npm run build`; publish `dist`; functions `netlify/functions`; Node 24. Dit staat in netlify.toml. npm ci gebruikt package-lock.json.

Stel via Netlify Environment variables de waarden uit .env.example in. Bewaar echte secrets uitsluitend daar; nooit in GitHub, HTML, chat of ZIP.

| Variabele | Stagingwaarde / waar vandaan | Scope |
|---|---|---|
| RUMAZ_ENV | staging | Builds |
| RUMAZ_SITE_ORIGIN | https://rumaz-staging.netlify.app | Builds + Functions |
| SUPABASE_URL | https://lwqttzzyzfvxqerltmoi.supabase.co | Builds + Functions |
| SUPABASE_PUBLISHABLE_KEY | Openbare sleutel uit .env.example | Builds + Functions |
| SUPABASE_SERVICE_ROLE_KEY | Bestaande projectsleutel uit Supabase, geheim | Functions |
| RUMAZ_SMTP_HOST | smtp.mail.me.com | Functions |
| RUMAZ_SMTP_PORT | 587 | Functions |
| RUMAZ_SMTP_USER | Geconfigureerde iCloud SMTP-gebruikersnaam | Functions |
| RUMAZ_SMTP_PASSWORD | Het bestaande app-specifieke SMTP-wachtwoord | Functions |
| RUMAZ_MAIL_FROM | info@rumaz.nl | Functions |
| RUMAZ_MAIL_MODE | test | Functions |
| RUMAZ_TEST_EMAIL | info@rumaz.nl | Functions |

MAIL_MODE=test weigert verzending naar andere adressen. Voor een echte tweede testdeelnemer moet Rutger de testontvanger of mailmodus bewust aanpassen. Zo wordt niet per ongeluk een hele kring gemaild.

Behoud team-loginbescherming voor **alle deploys** van rumaz-staging. Dit is eerder ingesteld; controleer dat de publicatie dit behoudt. De build schrijft daarnaast robots Disallow:/ en X-Robots-Tag noindex,nofollow. Noindex is geen toegangsbescherming.

Laat Netlify één build uitvoeren van de voorbereide commit. Controleer na succes dat de functies invitation en notifications bestaan. Een alleen statische drag-and-drop upload is onvoldoende. Als je toch handmatig deployt met Netlify CLI, laat eerst `netlify deploy --help` zien en gebruik de bestaande site-ID; laat de CLI de serverfuncties bundelen. Maak geen nieuwe site. Een volgende Git-push kan een handmatige deploy overschrijven; werk daarom altijd dezelfde wijziging terug naar deze ene repository.

## 4. Afname vóór productie

Loop docs/ACCEPTATIE.md volledig door. Open Netlify-functielogs bij een fout, maar kopieer nooit tokens, wachtwoorden of mailinhoud naar een openbaar log.

De geplande notifications-functie verwerkt elke vijf minuten maximaal één queued melding. Bij verzending wordt die sent. Bij fouten wordt die failed. Sending na een crash of failed wordt **niet automatisch herhaald**, omdat een SMTP-server de mail al geaccepteerd kan hebben. Controleer bezorging en oorzaak vóór gecontroleerd opnieuw in de queue zetten. Configureer operationeel toezicht op failed/sending. Deze eerste versie is voor klein gebruik, niet hoge mailvolumes.

Een 200 voor uitnodiging betekent SMTP-aanlevering, niet gegarandeerde inboxbezorging. Bij een mailfout is de uitnodiging ingetrokken en verschijnt geen succesmelding.

## 5. Naar rumaz.nl — pas na afname

Gebruik project rumaz, ID `80708be2-801e-4f09-8986-afd39fc6efc3`, en exact dezelfde geaccepteerde broncommit. Nieuwe inhoud niet tegelijk meenemen.

Controleer expliciet welke database productie gaat gebruiken. Dit pakket verwijst standaard naar het bestaande stagingproject. Als je dat project als productiedatabase in gebruik neemt, mag je er daarna geen destructieve tests meer op uitvoeren; de naam van het project beschermt geen gegevens. Koppel geen productie aan een onbedoelde testdatabase.

Stel voor productie RUMAZ_ENV=production, RUMAZ_SITE_ORIGIN=https://rumaz.nl, RUMAZ_RELEASE_APPROVED=yes en (na de mailtest) RUMAZ_MAIL_MODE=live in. Zet de correcte productie-databasesleutels en SMTP-waarden in dat project. Voeg exacte rumaz.nl-callbacks voor welkom en wachtwoord-instellen toe in Supabase en stel de productie Site URL in. Geen wildcardcallbacks.

De build weigert productie zonder het expliciete releasevlaggetje. Productie krijgt openbare robots voor openbare pagina’s; /app blijft noindex. Bestaande sitemap-URL’s zijn behouden. Test de bestaande domeinredirects en canonicals. Activeer Objects/Mollie niet met deze release.

Bij een mislukte build blijft de bestaande publicatie staan. Bij een slechte gepubliceerde release: revert de betreffende codecommit en deploy die correctie. Verwijder geen databasegegevens om een frontend terug te zetten.

## Vervolgprompt voor een gewone chat

“Gebruik het bijgevoegde RuMaZ-werkpakket. Lees START-HIER.md, docs/DEPLOY.md en docs/TESTRESULTATEN.md. Begeleid mij bij het configureren en publiceren in de bestaande projecten rumaz-staging en rumaz en repository rumaz-rutger/rumaz-site. Ontwerp niets opnieuw, bewaar alle branding en activeer geen Mollie-livebetalingen. Werk eerst de staging-afname af; noem geen onuitgevoerde test geslaagd. Vraag secrets uitsluitend via veilige invoer of laat mij ze zelf in het betreffende dashboard zetten. Productie pas op mijn expliciete akkoord.”
