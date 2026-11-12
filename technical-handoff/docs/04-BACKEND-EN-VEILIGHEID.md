# Backend contract en plaatsgebonden autorisatie

**Geen nieuw framework.** Houd de bestaande HTML/CSS/SVG en de sociale onderbalk. De nieuwe laag moet de bestaande demo vervangen op **staging**, niet alle bestaande pagina's herbouwen.

## Gegevens

- `auth.users` (beheerde accounts), `profiles` (naam), `places` (type, naam, broninformatie, locatie), `place_memberships` (per plek admin/member/guest), `place_settings` (approval aan/uit, activiteiten aan/uit).
- `booking_requests` (start inclusief, vertrek exclusief, status pending/approved/rejected/cancelled), `place_posts`, `place_guides`, `place_tips`, `notification_outbox`, `audit_events`.
- Hergebruik RC1-schema in `reference/`, controleer eerst met actuele Work-code, review RLS en transacties. NIET uitvoeren zonder expliciete toestemming.

## API-contract (ontwerpspecificatie, geen bestaande endpoints)

| Actie | Contract | Wie? |
|---|---|---|
| Maak plek | `POST /api/places` {kind,relationship,name,location,source} | Ingelogd |
| Mijn plekken | `GET /api/places` | Ingelogd, alleen memberships |
| Plek lezen | `GET /api/places/:id` | Lid van die plek |
| Uitnodigen | `POST /api/places/:id/invitations` {email,role} | Beheerder |
| Beschikbaarheid | `GET /api/places/:id/bookings?month=YYYY-MM` | Lid van die plek |
| Aanvraag | `POST /api/places/:id/bookings` {arrives_on,leaves_on,note} | Lid van die plek |
| Beslissing | `POST /api/bookings/:id/decision` {approve} | Beheerder, na login |
| Prikbord | `GET/POST /api/places/:id/posts` | Lid van die plek |
| Handleiding | `GET /api/places/:id/guides` | Lid, gevoelige informatie apart |

Work mag RPC's direct gebruiken i.p.v. zulke Netlify-routes; **één** model kiezen, niet beide parallel bouwen. Alle schrijfrechten en boekingsconflicten server-side afgedwongen. Geen client alleen op `role` laten vertrouwen.

## Veiligheid

- Publieke GitHub-repo bevat uitsluitend broncode; geen service-role keys, SMTP-wachtwoorden of persoonsgegevens.
- Strikte RLS per plek + server-side asserts voor groepslid, beheerder, eigen gegevens, getagde personen.
- Dagenconcurrentie atomisch (DB-lock/constraint), bij afkeuring status aanpassen maar niet automatisch andere datum reserveren.
- Importeer van URL/kenteken uitsluitend geautoriseerde broninformatie; provenance, controledatum en gebruikersbijdrage apart labelen.
- Geen scraping die gebruiksvoorwaarden schendt; geen ongeverifieerde voertuigeigenaar, adresgegevens of privéfoto's publiceren.
- Veilige opslag van foto's met rechten en beperkte omvang, nooit browser-URL's van privédocumenten lekken.
- Voor adres/kenteken precieze privacy en bewaartermijnen opnemen; recht op verwijdering/export.
- Verhuurder kan publieke profielgegevens na verificatie claimen, **geen** toegang tot privékringen/berichten.
- Voor advertenties alleen herkenbaar gesponsorde lokale vermeldingen in `In de buurt`; geen persoonlijke data voor targeting.
