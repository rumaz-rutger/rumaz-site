# Opdracht voor WORK! Rumaz 3.0 — exact uitvoeren, niet opnieuw ontwerpen

Hervat de bestaande Work-build in het RuMaZ-project. Lees eerst deze Work-overdracht en de meest complete huidige Work-broncode. GitHub `rumaz-rutger/rumaz-site` + Netlify `rumaz` en `rumaz-staging` zijn bestaande infrastructuur. De broncode van GitHub `main` is ouder dan de RC5-kandidaat. **Kies één actuele broncode; geen nieuwe repo en geen dubbele implementatie.**

## Opdracht

1. Inspecteer Work, GitHub, Netlify read-only. Verifieer exact welke RC5-bestanden al bestaan en welke ontbreken.
2. Neem de vaststaande structuur over: Home · Plekken · Mijn plek (sluitsteen) · Berichten · Mijn omgeving; vier openbare ingangen. Blijf bij de bestaande SVG-set en vijf kleuren. **Geen nieuwe lay-out, geen extra ontwerpronde.**
3. Review het `patch/`-manifest, pas alleen de vijf doorklikwijzigingen toe in een stagingbranch na vergelijking. Laat 48 bestaande pagina's ongewijzigd waar niet nodig.
4. Gebruik `ROUTE-MAP.csv` en `docs/02-DOORKLIKROUTES.md` om van de openbare vier keuzes tot de juiste plek-invoer en van elke e-mail naar een geautoriseerde plek/aanvraag te navigeren.
5. Gebruik bestaand `rumaz3-auth.js` en RC1 schema als vertrekpunt, géén nieuwe backend ontwikkelen voordat is gecontroleerd wat Work al heeft. Fix de CSP/SDK-contra-indicatie, auth callback, RLS en veilig accountbeheer.
6. Gebruik `E-MAIL-EVENTS.csv` + `email-templates/` voor welkom, uitnodiging, verblijfsaanvraag en statusupdates. Bevestigings- en herstelmails via de gekozen authprovider. Outbox per transactie en idempotent versturen, eerst sandbox/staging.
7. Realiseer één volledige stagingflow: plek toevoegen → account verifiëren → plek echt opgeslagen → kring uitnodigen → aanvraag → beheerder mail → login → besluit → aanvrager mail → kalenderstatus. Test ook direct geweigerde toegang tot een andere plek.
8. Publiceer geen betalingen en geen werkende social accounts op rumaz.nl voordat de gehele flow bewezen is. Geen GitHub merge / Netlify deploy / wijziging secrets zonder expliciete toestemming.

## Oplevering

- Een concreet diff-/statusoverzicht (al aanwezig, ontbrekend, getest, geblokkeerd).
- Eén reviewbare branch/PR en één beschermde staging-preview (pas na goedkeuring voor schrijf- en deployhandelingen).
- Automatische en handmatige QA per route, mobiel en desktop, inclusief e-mailbezorging en autorisaties.
- Advies voor afzonderlijke publieke livegang of totale platformlivegang; nooit een lege huls of nepfunctionaliteit.
- Aparte lijst met klantgegevens-/juridische controles en herstelplan.

Werk met bestaande plugins en hergebruik. Houd Codex- en Netlify-credits zuinig. Regie in Work, code alleen gerichte wijzigingen; niets dubbel. Antwoord eerst met de daadwerkelijk aangetroffen broncode en blockers, daarna met het kortste uitvoerplan.
