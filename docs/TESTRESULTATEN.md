# Werkelijk geteste resultaten — 12 november 2026

## Geslaagd in deze overdracht

- 17 geautomatiseerde unit-/DOM-tests: authregels, herstelrecht, weigering onbevestigd account, foutpropagatie, auteurschap, mailtemplates, weigering verkeerde origin/bearer, testontvangerbeperking, intrekken uitnodiging bij SMTP-fout, geen token in succesresponse, vijfdelige navigatie, maandweergave, twee plekken wisselen, planner, uitnodigingsformulier en alle zeven pleksecties. Bron: qa/*.test.mjs; resultaten: qa/current-unit-results.txt. De DOM/API-onderdelen gebruiken mocks.
- Nieuwe schema-aanvulling op echte Supabase PostgreSQL 17 in één teruggedraaide transactie uitgevoerd: activiteiten, deelname, likes, eigenaarstoegang, buitenstaanderlees-/schrijfweigering inclusief foto-metadata, en geen clienttoegang tot mailqueueclaim. Testbron: qa/completion-security.sql. Dit bewijst geen binaire Storage-upload of mailbezorging.
- De eerste extra fototest vond een SQL-kolomambiguïteit. Gecorrigeerd naar objects.name; herhaalde test geslaagd. Nieuwe schemawijzigingen en testdata zijn teruggedraaid, niet geïnstalleerd.
- 48 HTML-pagina’s; alle bestaande GitHub-HTML-routes aanwezig; geen gebroken lokale href/src-verwijzingen.
- 41 oorspronkelijke RC5 CSS-/beeldbestanden byte-voor-byte gelijk. Geen huisstijl- of illustratieaanpassing.
- Lokale staging- en productiebuildconfiguratie gecontroleerd. Productie vereist expliciet release-akkoord; staging noindex; private code niet in publicatiemap.
- npm audit van productieafhankelijkheden: 0 bekende kwetsbaarheden op controlemoment. Nodemailer naar gecontroleerde vastgepinde 10.5.0 gebracht; lockfile inbegrepen.

## Eerder vastgesteld (historisch, niet opnieuw uitgevoerd)

- Vier basisschemawijzigingen toegepast en SQL-rechten-/uitnodigings-/onboardingtests geslaagd.
- Eén echte bevestigingsmail aan info@rumaz.nl ontvangen en bevestigd; daarna signInWithPassword succesvol.
- Staging-sitebescherming ingesteld op alle deploys.

## Niet bewezen / nog te doen

Geen nieuwe Netlifydeploy, echte volledige browserroute, binaire foto-upload, herstelmailketen, uitnodigings-/boekingsmailbezorging of gelijktijdige boekingsrace getest. Geen productieconfiguratie of livebetaling getest. De eerdere poging tot volledige API-opslagtest was onderbroken; die telt niet als succes.

De nieuwe code en database-aanvulling zijn voorbereid en lokaal/deels transactioneel getest. Pas na installatie en docs/ACCEPTATIE.md mag dit een volledig werkende release heten. SMTP-aanlevering en bezorging zijn verschillende controles. Handmatig accountverwijderen/e-mailwijzigen, privéchat en kluis zijn geen geïmplementeerde selfservicefuncties.

## Bekende operationele grenzen

- Queue verwerkt één melding per vijf minuten; failed/sending vereist menselijke beoordeling vóór herhaling. Geen exactly-once-bezorggarantie via SMTP.
- Instellingen voor activiteiten/goedkeuring zijn beheerderacties; onbevoegde writes worden server-side geweigerd.
- Download bevat gegevens die het account mag lezen, inclusief gedeelde kringinhoud; bewaar lokaal zorgvuldig.
- Foto-leeslinks zijn 60 seconden geldig; reeds gedownloade foto’s blijven buiten technische intrekking.
- Nog te bewaren plekconcept gebruikt sessionStorage; bevestiging in andere browser neemt dit concept niet mee.
