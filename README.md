# Dáta o autizme na Slovensku — zdroje a metodika

Tento dokument popisuje, odkiaľ pochádzajú dáta v tomto dashboarde, ako sa
spracovali do súborov v `/data`, kde presne sa v appke používajú, a ako
postupovať pri aktualizácii o ďalší rok. (Technickú dokumentáciu ku kódu a
architektúre appky nájdeš v [CLAUDE.md](CLAUDE.md).)

## Zdroje dát

Základom sú **agregované tabuľky od troch zdravotných poisťovní** — VšZP,
Dôvera, Union — s počtom poistencov s diagnózou z okruhu autizmu (F84.x),
2015–2025. Do repa prišli ako dva Excel súbory, postupne za sebou:

1. **`sumar 2015-2025.xlsx`** (prvý, jednoduchší) — jeden hárok `sumar` s
   ročnými súčtami podľa poisťovne (VšZP/Dôvera/Union/Spolu) a medziročným
   rastom v %.
2. **`autizmus_agregovane_tabulky_2015_2025_claude.xlsx`** (druhý, podrobnejší,
   nahradil prvý ako autoritatívny zdroj) — tri hárky:
   - `Spolu` — ročné súčty podľa poisťovne (rovnaké ako v prvom súbore, s
     drobnými revíziami, pozri nižšie),
   - `Podľa krajov` — rozpad rok × poisťovňa × kraj,
   - `Podľa veku` — rozpad rok × poisťovňa × veková skupina (10-ročné pásma
     0-9 až 90-99).

Neskôr pribudla ešte **diagnostická štruktúra podľa F84 podkódov** (F84.0
Detský autizmus, F84.1 Atypický autizmus, F84.2 Rettov syndróm, F84.3, F84.4,
F84.5 Aspergerov syndróm, F84.8, F84.9) a **odhad populácie podľa kraja**
(Štatistický úrad SR, koniec roka 2024). Tieto dve veci sme nedostali ako
samostatný Excel — boli už spracované (natvrdo v JS) v samostatnom
dashboarde, ktorý pripravila kolegyňa (Zuzana Franek) v `public/dashboard/`;
pri zlúčení oboch dashboardov do jedného sme tieto dáta vyextrahovali do JSON
(pozri nižšie „Spracovanie dát"). Sú preto o niečo menej priamo overiteľné
než dva Excely vyššie — ich metodika je zdedená z poznámok v tom dashboarde,
nie z hárku, ktorý by sme si sami prezreli bunku po bunke.

### Metodika zberu (podľa poznámok priamo v dodaných tabuľkách)

Poznámky nižšie sú **doslovné citácie** poznámok/hlavičiek z dodaných súborov,
nie naša interpretácia:

- *„Diagnózy F88 a F89 (samostatne) nie sú zarátané. Poistenci sú rátaní bez
  duplicít (unikátne rodné čísla) v rámci danej poisťovne."*
- *„Kraj je určený podľa okresu trvalého pobytu poistenca (mapovanie okres →
  kraj podľa číselníka VšZP)."*
- *„Vek je aktuálny vek poistenca ku koncu príslušného roka."*
- *„Dáta sú kumulatívne od roku 2007/2010 (podľa poisťovne) — poistenec musel
  mať v sledovanom období vykázanú aspoň jednu z týchto diagnóz, samostatne
  alebo v kombinácii. Číslo za daný rok predstavuje všetkých identifikovaných
  (žijúcich, aktívnych) poistencov s touto diagnózou k 31. 12. daného roka,
  nie iba novodiagnostikovaných v danom roku."*

Zhrnuté, čo teda zadanie pre poisťovne efektívne znamenalo (rekonštruované z
týchto poznámok, nie z formálneho zadávacieho dokumentu, ktorý k dispozícii
nemáme): **ročný, kumulatívny, neduplicitný (podľa rodného čísla) počet
žijúcich/aktívnych poistencov s aspoň jednou diagnózou F84.0–F84.9 k 31. 12.
daného roka**, rozpadnutý podľa kraja trvalého pobytu a vekového pásma.

### Známe limity a potenciálne chyby v dátach

- **Duplicity naprieč poisťovňami.** Rodné číslo je dostupné len v rámci
  jednej poisťovne, nie naprieč nimi. Súčet „Spolu" (VšZP+Dôvera+Union) preto
  **nevie odstrániť osobu, ktorá v sledovanom období zmenila poisťovňu** —
  taká osoba sa v danom prechodnom roku môže v súčte objaviť pod oboma
  poisťovňami. Toto je limit priamo v zdrojových dátach, nie chyba v našom
  spracovaní.
- **Vnútorná nezrovnalosť v druhom Exceli.** Hárok `Spolu` uvádza pre VšZP
  2019 hodnotu **10 156**, ale hárok `Podľa veku` pre ten istý rok/poisťovňu
  má súčet vekových pásiem **10 148** (rozdiel 8 osôb). Nevieme, ktorá hodnota
  je „správnejšia" — použili sme `Spolu` ako autoritatívnu pre celkové počty a
  vlastný súčet každého rozpadového hárku (veku/kraja) ako autoritatívny pre
  ten konkrétny rozpad. V praxi to znamená, že súčet vekových skupín pre
  VšZP/2019 nebude presne sedieť s celkovým počtom VšZP/2019 o 8 osôb —
  zanedbateľné pri desiatkach tisíc, ale stojí za zmienku.
- **Revízia medzi prvým a druhým súborom.** Druhý (podrobnejší) Excel mal pre
  dva údaje mierne odlišné čísla oproti prvému: VšZP 2019 (10 148 → 10 156) a
  Union 2024 (3 493 → 3 483). Zobrali sme druhý súbor ako autoritatívny
  (podrobnejší, novší), čo posunulo aj celkový súčet za rok 2024 z pôvodných
  30 997 na **30 987**.
- **„Zahraničie a iné" v rozpade podľa kraja** je zberná kategória (poistenci
  bez priradeného slovenského kraja) — rastie v čase (z jednotiek na nízke
  stovky), ale ostáva okrajová.
- **Populácia krajov pre „na 10 000 obyvateľov"** je jeden pevný odhad k
  **koncu roka 2024** aplikovaný na všetkých 11 rokov — reálna populácia
  krajov sa medzičasom mierne mení, takže táto metrika je vyslovene
  orientačná, nie presný prepočet pre každý rok zvlášť.
- **Diagnostická štruktúra (F84 podkódy) môže presahovať 100 %** súčtom naprieč
  rokom — poistenec môže mať vykázaných viac diagnóz naraz (priemerne cca
  1,25–1,28 diagnózy na osobu).

## Spracovanie dát — ako sme sa k JSON súborom dostali

1. **Excel → JSON skriptom, nie ručným prepisovaním.** Oba Excely sme čítali
   cez `openpyxl` (Python) a hodnoty rovno zapisovali do JSON. Pri každom
   kroku sme automaticky overili (`assert` v skripte), že:
   - súčet VšZP + Dôvera + Union sa rovná stĺpcu „Spolu" pre každý rok,
   - súčet vekových pásiem sa rovná stĺpcu „Spolu" v hárku `Podľa veku`,
   - súčet krajov (vrátane „Zahraničie a iné") sa rovná stĺpcu „Spolu" v
     hárku `Podľa krajov`.

   Toto odhalilo spomínanú 8-osobovú nezrovnalosť vo VšZP/2019 (bod vyššie) —
   vedeli sme presne, kde a o koľko sa čísla rozchádzajú, namiesto aby sa to
   nepozorovane preniesplo do appky.

2. **Dáta z kolegynej samostatnej stránky (diagnózy, populácia) sme
   neprepisovali ručne, ale vyextrahovali skriptom** priamo z jej
   `public/dashboard/index.html` (Node `vm` modul spustil presne tú časť jej
   `<script>` bloku, čo definuje dátové konštanty, a výsledok sme uložili ako
   JSON). Pred tým, než sme túto novú vrstvu (diagnózy, populácia) prijali ako
   dôveryhodnú, sme **skrížovo overili prekrývajúce sa dáta** (poisťovne ×
   rok, vek × poisťovňa × rok, kraj × poisťovňa × rok) medzi jej stránkou a
   našimi už overenými súbormi — sedeli **bit po bite** (žiadny rozdiel), čo
   potvrdilo, že obe strany čerpali z toho istého zdroja.

3. **Rozdelenie do súborov podľa dimenzie, nie podľa toho, ktorý graf ich
   práve potrebuje.** Namiesto jedného súboru „na graf A" a druhého „na graf
   B" so vzájomne prekrývajúcimi sa číslami (čo bola pôvodná chyba — pozri
   nižšie) je teraz každý súbor jedna dátová dimenzia (poisťovne-v-čase,
   vek-rozpad, kraj-rozpad, diagnóza-rozpad, populácia), a komponenty si z
   nich počítajú, čo potrebujú, za behu.

4. **Zrušili sme oddelený „KPI snapshot" súbor.** Predtým existoval
   `summary.json` s ručne dopísanými hodnotami (medziročný rast, prevalencia,
   najpočetnejšia veková skupina) — vznikol na začiatku projektu ako
   ukážkové dáta pred príchodom reálneho Excelu, no nikdy sa neupdatol a
   rozišiel sa od reálnych čísel v ostatných grafoch na tej istej stránke.
   Spolu s ním zanikli aj `ageDistribution.json`, `regionDistribution.json` a
   `diagnosisStructure.json` (rovnaký problém, len pre iné grafy). Všetko, čo
   tieto súbory kedysi niesli, sa teraz **počíta priamo z kanonických dát v
   momente vykreslenia** (pozri CLAUDE.md, sekcia „Taby").

## Kde sa dáta čítajú a čo z nich vzniká

| Súbor | Obsah | Číta ho | Čo z neho vzniká v reporte |
|---|---|---|---|
| `data/insuranceHistory.json` | rok × poisťovňa → počet | `TrendChart` (Prehľad) | hlavný skladaný stĺpcový graf 2015–2025 |
| | | `OverviewTab` | KPI karty: celkový počet, medziročný rast, 10-ročný násobok |
| | | `InsurersTab` (Poisťovne) | čiarový graf počty/rast % + tabuľka podľa rokov |
| `data/ageBreakdown.json` | rok × poisťovňa × veková skupina | `TrendChart` | filter „Veková štruktúra" (kombinovateľný s poisťovňou/krajom) |
| | | `AgeStructureChart` (Veková štruktúra) | 100% skladaný plošný graf + filter poisťovne + prepínač % / počty |
| `data/regionBreakdown.json` | rok × poisťovňa × kraj | `TrendChart` | filter „Kraje" |
| | | `RegionsTab` (Kraje) | schematická mriežka, rebríček, drill-down graf pre vybraný kraj |
| `data/diagnosisBreakdown.json` | rok × F84 podkód → % aj počet | `DiagnosesTab` (Diagnózy) | viacročný čiarový graf 8 podkódov + tabuľka zmien 2015→2025 |
| `data/regionPopulation.json` | populácia podľa kraja (ŠÚ SR, 2024) | `RegionsTab` | prepínač „na 10 000 obyvateľov" |
| | | `OverviewTab` | KPI karta „na 10 000 obyvateľov SR" |

Insighty („Kľúčové zistenia" pod grafmi) **nie sú nikde uložené ako text s
číslami** — v `RegionsTab.jsx`, `AgeStructureChart.jsx` a `DiagnosesTab.jsx`
sa napríklad najrýchlejšie rastúci/klesajúci kraj či diagnóza nájde
programovo (`reduce` cez delty 2015→2025), takže veta zostane pravdivá aj keď
sa po aktualizácii dát zmení poradie.

## Ako aktualizovať dáta o ďalší rok (2026 a ďalej)

1. **Ideálny formát vstupu od poisťovní** — rovnaká štruktúra ako druhý Excel
   (`autizmus_agregovane_tabulky_2015_2025_claude.xlsx`): tri hárky `Spolu` /
   `Podľa krajov` / `Podľa veku`, rovnaké stĺpce, len s pridaným riadkom/rokom
   navyše. Ak vieš pri objednávaní dát u poisťovní ovplyvniť formát, over, či
   sa dá dostať aj **diagnostická štruktúra podľa F84 podkódov priamo od nich**
   (momentálne ju máme len odvodenú z kolegynej stránky, nie z vlastného
   Excelu — bolo by dobré mať pre ňu rovnako priamy zdroj ako pre ostatné tri
   tabuľky).
2. **Pri spracovaní nového Excelu znovu over súčty** (rovnaký princíp ako v
   bode „Spracovanie dát" vyššie — sumár poisťovní = súčet veku = súčet kraja),
   skôr než nové čísla zapíšeš do JSON. Ak niečo nesedí, over si to
   s poisťovňou/dodávateľom dát namiesto tichého prijatia rozdielu.
3. **Do každého JSON súboru len pridaj nový rok** — nemeň poradie ani tvar
   existujúcich rokov:
   - `insuranceHistory.json`: pridaj rok do `years` a hodnotu na koniec
     každého `values` poľa (pre všetky 3 poisťovne).
   - `ageBreakdown.json` / `regionBreakdown.json`: pridaj rok do `years` a nový
     kľúč `"<rok>": [...]` do `insurers.<poisťovňa>` pre všetky 3 poisťovne.
   - `diagnosisBreakdown.json`: pridaj rok do `years`, na koniec `percentByYear`
     aj `countByYear` pre všetkých 8 diagnóz.
   - `regionPopulation.json`: aktualizuj čísla, ak máš novší odhad ŠÚ SR (nie
     je viazaný na rok, je to jedna aktuálna hodnota na kraj).
4. **Nič iné meniť netreba.** KPI karty, grafy, tabuľky aj insighty sa
   prepočítajú samé — nie sú nikde inde natvrdo zapísané čísla, ktoré by bolo
   treba dohľadať a ručne opraviť (presne to sme týmto zlúčením odstránili).
5. **Over lokálne pred pushom**: `npm install && npm run build && npm run dev`,
   prejsť všetky taby, skontrolovať že sa nový rok objavil v grafoch a že
   KPI/insighty dávajú zmysel. Build musí prejsť bez chýb (`npm run build`).
