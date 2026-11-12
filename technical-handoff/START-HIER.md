# Rumaz 3.0 — technische Work-overdracht (RC5)

**Status:** volledig uitgewerkte technische indeling en een minimale doorklikpatch, maar **niet** automatisch live. Geen nieuwe designbestanden, geen nieuwe website.

## Open in deze volgorde

1. `docs/07-WORK-OPDRACHT.md` (direct overneembare Work-opdracht)
2. `docs/01-PAGINASTRUCTUUR.md` (wat elke pagina doet)
3. `docs/02-DOORKLIKROUTES.md` (customer journeys)
4. `docs/03-MAIL-EN-AUTH.md` + `E-MAIL-EVENTS.csv` (e-mail en login)
5. `docs/04-BACKEND-EN-VEILIGHEID.md` (model, rechten en API-contract)
6. `docs/05-STAGING-EN-LIVE-CHECKLIST.md` (wat eerst geverifieerd moet worden)

`ROUTE-MAP.csv` bevat alle 48 bestaande RC5-pagina's. `patch/` bevat precies 5 **gerichte** doorklikwijzigingen boven op RC5. `reference/` bewaart het bestaande RC1-schema uitsluitend als reviewmateriaal.

**NIET uitvoeren als automatische deploy.** De gebruiker geeft na stagingcontrole goedkeuring voor productie. Geen secrets, wachtwoorden of persoonsgegevens in dit pakket.
