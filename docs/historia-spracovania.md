# História spracovania a zmien dát

Aktuálny stav, metodika a postup aktualizácie sú v [README](../README.md). Tento súbor zachytáva, čo sa v dátach menilo.
Pôvodné znenie README (stav pred 6. 10. 2026) je v [povodne-readme.md](povodne-readme.md).

## Zmeny dát

### 6. 10. 2026 — kontrola proti zdrojovým súborom poisťovní

Kraje a vek sme prepočítali znova priamo zo súborov poisťovní (VšZP, Dôvera, Union) a porovnali s JSON po poisťovniach
a rokoch (11 rokov × 3 poisťovne). Rovnako sa overili diagnózy a populácia krajov. Ručne vytvorené hárky sa pri kontrole
nepoužili. Kontrola samotných súčtov chyby nezachytila, lebo sa v nich hodnoty len prehodili medzi krajmi a súčet ostal správny.

Opravené:

- **Dôvera 2024, kraje** (`regionBreakdown.json`): `1041, 1054, 1768, 1224, 1655, 1200, 820, 621, 26` → `1012, 1054, 1971, 1253, 1452, 1200, 820, 621, 26`
- **Union 2024, kraje** (`regionBreakdown.json`): `349, 475, 786, 356, 656, 328, 225, 288, 20` → `335, 475, 854, 347, 611, 328, 225, 288, 20`
- **Dôvera 2025, vek** (`ageBreakdown.json`): jeden 90-ročný poistenec bol zaradený do pásma 80–89 (80–89: 9 → 8, 90–99: 0 → 1)
- **Populácia krajov** (`regionPopulation.json`, ŠÚ SR DATAcube, tabuľka om7001rr, 31. 12. 2024): tri hodnoty boli z roku 2020.
  Banskobystrický 643 102 → 611 124, Žilinský 691 136 → 686 063, Trnavský 565 324 → 565 900. Súčet 5 455 926 → 5 419 451.

Dopad na zobrazené čísla:

- Kraje, rok 2024: Košický 5 242 → 5 513, Prešovský 5 102 → 4 854, Nitriansky 3 211 → 3 231, Banskobystrický 2 945 → 2 902
- „Na 10 000 obyvateľov SR" (2025): 64,2 → 64,6. Po krajoch: Banskobystrický 50,4 → 53,1, Žilinský 55,6 → 56,0, Trnavský 59,8 → 59,7

Overené bez rozdielu: kraje a vek 2015–2025 (VšZP, Dôvera, Union), celkové počty, diagnózy 2015–2025 a populácia ostatných
piatich krajov (Prešovský, Košický, Bratislavský, Nitriansky, Trenčiansky).

Poznámky:

- VšZP 2019: súčet krajov je 10 156, súčet vekových pásiem 10 148 (rozdiel 8 osôb, nepresnosť v súbore VšZP).
- Dôvera: používajú sa pôvodne dodané dáta (2024: 9 409, 2025: 11 111). Novšia dodávka má 9 622 a 11 290 a nepoužila sa.

### 6. 10. 2026 — roky v nadpisoch

Roky v podtitule stránky a v nadpisoch grafov (Autizmus na Slovensku, Vývoj vekovej štruktúry) sa berú automaticky z dát,
takže pri pridaní ďalšieho roka sa nemusia prepisovať ručne.
