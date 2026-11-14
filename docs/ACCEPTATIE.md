# Afname op de echte stagingwebsite

Nog uit te voeren na installatie; vink alleen af na waarneming. Gebruik twee eigen/geautoriseerde testaccounts en twee plekken. Staging blijft afgeschermd; beide testers moeten door de sitebescherming kunnen.

- [ ] Zonder site-login is de stagingwebsite afgeschermd. Headers bevatten noindex; robots blokkeert alles.
- [ ] Plek invullen → registreren → echte bevestigingsmail → bevestigen in dezelfde browser → inloggen → plek is één keer opgeslagen. Vernieuwen maakt geen duplicaat.
- [ ] Uitloggen en terugkeren op een ander apparaat toont de opgeslagen plek. Een nog niet opgeslagen concept blijft alleen 24 uur in de oorspronkelijke tabsessie.
- [ ] Tweede plek toevoegen; wisselen toont gescheiden kalender, taken en prikbord.
- [ ] Lid uitnodigen per e-mail. Link bij correct bevestigd account geeft uitsluitend de bedoelde plek. Verkeerd account, verlopen/hergebruikte link geeft geen toegang.
- [ ] Bericht met afbeelding (<2 MB), reactie en like opslaan; tweede account ziet deze. Buitenstaander ziet noch records noch foto’s. Bestandsupload en downloaden werkelijk controleren.
- [ ] Planner toevoegen en afvinken; na herladen blijft de stand bewaard.
- [ ] Handleiding als beheerder toevoegen; gewoon lid kan lezen maar niet wijzigen.
- [ ] Kalender vorige/volgende maand, vertrekdag weer vrij, aanvraag pending, beheerder goed/af, status na herladen gelijk.
- [ ] Twee gelijktijdige overlappende goedkeuringen: maximaal één goedgekeurd. De bestaande database gebruikt een plek-lock; echte gelijktijdigheid is nog niet getest.
- [ ] Aanvraag-, goedkeurings- en afwijzingsmail werkelijk ontvangen. Controleer queue sent/failed. Wijziging blijft bewaard als mail later faalt.
- [ ] Activiteit en deelname zijn bewaard en blokkeren geen verblijf.
- [ ] Accountnaam wijzigen, downloaden, uitloggen, herstelmail en wachtwoord wijzigen testen; gewone login geeft geen herstelrecht.
- [ ] Alle bestaande openbare pagina’s, vijfdelige balk, sluitsteen en illustraties op mobiel/desktop controleren.
- [ ] Objects-pagina’s bestaan; geen livebetaling gestart.

Noteer per regel datum, versie/commit, accountrol (geen wachtwoord), verwacht/werkelijk resultaat en eventuele fout. Na alle relevante regels pas productie vrijgeven. Een lokale DOM-test is geen vervanging voor deze keten.
