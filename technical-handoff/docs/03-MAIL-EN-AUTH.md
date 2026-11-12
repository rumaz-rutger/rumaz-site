# E-mail en account — klaar voor technische aansluiting, niet actief

De ontwerp- en teksttemplates staan in `email-templates/`; eventcontract in `E-MAIL-EVENTS.csv`. **Nog geen echt mailverkeer**. Geen wachtwoord- of tokenwaarden in logs, e-mailtemplates of GitHub.

## Auth

- Bestaand: `/app/account/registreren/`, `/inloggen/`, `/wachtwoord-vergeten/`, `/wachtwoord-instellen/`, `/controleer-je-mail/`, `/welkom/`.
- Huidige `assets/js/rumaz3-auth-config.js`: `enabled: false`, geen echte backend.
- Voorgestelde aansluiting: Supabase Auth + bestaande RC1 SQL **na security review**. Wachtwoorden uitsluitend bij authprovider.
- In Supabase: `SITE_URL` correct; redirect-allowlist per staging/production. Check e-mailconfirmatie, reset PKCE, verlopen links en ontbreken van sessie.
- `rumaz3-auth.js` importeert `supabase-js` van jsDelivr, maar huidige `_headers` CSP laat alleen `'self'` toe voor scripts/connect. **Bundel SDK lokaal** of pas CSP beperkt per vereiste host aan en test. Niet globaal onbeperkt openen.
- Geen onnodige 'welkom' e-mail bij iedere login; na eerste geverifieerde registratie één keer via outbox.

## Transactionele berichten

| Gebeurtenis | Ontvanger | Actie | Status |
|---|---|---|---|
| E-mail bevestigen | Nieuwe gebruiker | Beveiligde verificatielink | Provider-template voorbereiden |
| Wachtwoord herstellen | Gebruiker | Tijdelijke herstellink | Provider-template voorbereiden |
| Welkom | Na bevestiging | Naar Mijn plekken | Template aanwezig, sender ontbreekt |
| Uitnodigen | Genodigde | Token, accepteren na login | Template aanwezig, uitnodigingsbackend ontbreekt |
| Verblijfsaanvraag | Alle beheerders van plek | Naar beveiligde aanvraag, inloggen en beslissen | Template aanwezig, outbox-trigger ontbreekt |
| Goedgekeurd / afgewezen | Aanvrager | Naar agenda | Templates aanwezig, sender ontbreekt |

## Minimale technische service

1. `Supabase Auth` beheert bevestigings- en herstelmail; ander systeem alleen na bewuste keuze.
2. `notification_outbox` vanuit **zelfde DB-transactie** als goedkeuring/aanvraag of uitnodiging. Maak outbox-record met uniek event-ID; geen e-mail direct vanuit browser.
3. Netlify Function/worker pakt records veilig op, verstuurt via geverifieerde transactional e-mailprovider, bewaart `sent_at`/retry/status. Zo voorkom je dubbele mails. Gebruik oude SMTP-credentials alleen na test; iCloud-koppeling alleen is geen servermailservice.
4. Link in e-mail is alleen een navigatiehulp; server verifieert authenticatie en beheerdersrol. Links mogen geen aanvraag zonder login goedkeuren.
5. Sender/adres: `info@rumaz.nl` na domeinverificatie (SPF/DKIM/DMARC) en ontvanger-/spamtests. Niet automatisch afgaan op bestaan van `RUMAZ_SMTP_*` variabelen.
6. Gebruik privacyvriendelijke e-mailinhoud: geen sleutelcodes, wachtwoorden, alle gezinsgegevens of verborgen contactgegevens in e-mail.

## In bestaande schema gevonden hiaat

`reference/001_rumaz_kernschema_STAGING_ONLY.sql` bevat `request_stay` en `decide_stay`. In `decide_stay` wordt een outbox-item voor goed-/afkeuring aangemaakt, maar `request_stay` maakt **nog geen notification_outbox-item voor de beheerder**. Bouw die in één transactie en test meerdere beheerders, dubbele aanvragen, afwijzing, retries en tijdzones. Het schema is een uitgangspunt, **niet** direct uitvoeren.

## Productiecontrole

- Registreer met testadres → mail ontvangen → bevestigen → nieuwe sessie → plek openen.
- Wachtwoord vergeten → neutraal antwoord voor bestaand en niet-bestaand e-mailadres → één geldige herstelroute.
- Verblijf aanvragen → beheerder ontvangt één e-mail → login → aanvraag zichtbaar → goed-/afkeuren → aanvrager ontvangt één e-mail en status is consistent.
- Genodigde mag alleen eigen plek lezen en niets bij een andere plek; na verwijdering vervalt toegang onmiddellijk.
