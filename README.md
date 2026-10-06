# Dáta o autizme na Slovensku — zdroje a metodika

Tento dokument popisuje, odkiaľ pochádzajú dáta v dashboarde, ako sa spracúvajú do súborov v `/data`, kde sa v appke
používajú a ako ich aktualizovať o ďalší rok. (Technickú dokumentáciu kódu nájdeš v [CLAUDE.md](CLAUDE.md).)

## Zdroje dát

- **Počty poistencov** s diagnózou z okruhu autizmu (F84.x) v rokoch 2015–2025 pochádzajú od troch zdravotných
  poisťovní: VšZP, Dôvera a Union. Každá poisťovňa poslala svoje súbory samostatne:
  - **VšZP:** tabuľky podľa kraja (bez veku) a podľa vekového intervalu (10-ročné pásma), každú zvlášť,
  - **Dôvera a Union:** riadky podľa okresu, veku a diagnózy.
- Súbory sme zlúčili do jedného spoločného Excelu (hárky `Spolu`, `Podľa krajov`, `Podľa veku`), z ktorého vznikli JSON
  súbory v `/data`. Pôvodné súbory poisťovní nie sú súčasťou repozitára.
- **Diagnostická štruktúra** (F84 podkódy) pochádza z Excelu `autizmus_veková_a_diagnosticka_struktura_2015_2025`
  (hárok „Štruktúra diagnóz") a bola overená proti surovým súborom poisťovní.
- **Populácia krajov** (pre prepočet na 10 000 obyvateľov): Štatistický úrad SR, DATAcube (tabuľka om7001rr), stav
  k 31. 12. príslušného roka (2015–2025).

## Metodika zberu

Poznámky z dodaných tabuliek poisťovní (doslovne):

- *„Diagnózy F88 a F89 (samostatne) nie sú zarátané. Poistenci sú rátaní bez duplicít (unikátne rodné čísla) v rámci
  danej poisťovne."*
- *„Kraj je určený podľa okresu trvalého pobytu poistenca (mapovanie okres → kraj podľa číselníka VšZP)."*
- *„Vek je aktuálny vek poistenca ku koncu príslušného roka."*
- *„Dáta sú kumulatívne od roku 2007/2010 (podľa poisťovne) — poistenec musel mať v sledovanom období vykázanú aspoň
  jednu z týchto diagnóz, samostatne alebo v kombinácii. Číslo za daný rok predstavuje všetkých identifikovaných
  (žijúcich, aktívnych) poistencov s touto diagnózou k 31. 12. daného roka, nie iba novodiagnostikovaných v danom
  roku."*

Zhrnutie: **ročný, kumulatívny, neduplicitný (podľa rodného čísla) počet žijúcich a aktívnych poistencov s aspoň jednou
diagnózou F84.0–F84.9 k 31. 12. daného roka**, rozpadnutý podľa kraja trvalého pobytu a vekového pásma. Kraj a vek sú
dve oddelené tabuľky (spoločný rozpad kraj × vek nemáme).

## Pravidlá spracovania

- Samostatné diagnózy F88 a F89 sa nepočítajú. Ak sú v kombinácii s F84.x, poistenec sa počíta.
- Okres sa prevádza na kraj podľa oficiálnej štruktúry okresov a krajov ŠÚ SR (DATAcube). Pozor na rôzny zápis názvov
  okresov (napríklad „n.Váhom" a „nad Váhom", „Košice-okolie"). „N/A" a „Zahraničie" idú do „Zahraničie a iné".
- Vek sa delí do 10-ročných pásiem (0–9 až 90–99), 90 a viac patrí do posledného.
- VšZP: kraje sú z tabuľky „VUC (bez veku)", vek z posledného stĺpca „počet jedinečných URČ (a žijúcich)". V tabuľkách
  za 2024 a 2025 sú posledné dva riadky (F89 a F88_F84.8) označené prehodene.
- Diagnózy sa počítajú s prekrývaním: poistenec s viacerými podkódmi sa počíta do každého.

## Kontrola pri spracovaní

Pri každom spracovaní sa automaticky overuje, že:

- súčet VšZP + Dôvera + Union sa rovná „Spolu" pre každý rok,
- súčet vekových pásiem sa rovná „Spolu" v rozpade podľa veku,
- súčet krajov (vrátane „Zahraničie a iné") sa rovná „Spolu" v rozpade podľa krajov.

Toto odhalilo 8-osobovú nezrovnalosť vo VšZP/2019 (pozri „Známe limity") — vedeli sme presne, kde a o koľko sa čísla
rozchádzajú, namiesto aby sa to nepozorovane preniesplo do appky. Samotné súčty ale nestačia, preto sa kraje a vek
porovnávajú aj priamo so surovými súbormi poisťovní.

## Známe limity

- **Duplicity medzi poisťovňami.** Rodné číslo je dostupné len v rámci jednej poisťovne. Súčet za tri poisťovne preto
  nevie odstrániť osobu, ktorá v sledovanom období zmenila poisťovňu.
- **Vek a kraj spolu.** Vek a kraj máme len v dvoch oddelených tabuľkách, nie spolu. Pri súčasnom výbere oboch
  filtrov v grafe je výsledok odhad (predpoklad nezávislosti veku a kraja).
- **VšZP 2019:** súčet krajov je 10 156, súčet vekových pásiem 10 148 (rozdiel 8 osôb, nepresnosť v súbore VšZP).
- **„Zahraničie a iné"** je zberná kategória poistencov bez priradeného slovenského kraja.
- **Populácia krajov** je podľa ŠÚ SR k 31. 12. príslušného roka. V údajoch ŠÚ SR je medzi rokmi 2020 a 2021 skok
  v počte obyvateľov niektorých krajov (Bratislavský +6,9 %, Banskobystrický −3,4 %), preto sa „na 10 000 obyvateľov"
  v roku 2021 môže zmeniť aj bez zmeny počtu poistencov.
- **Diagnózy** môžu dokopy presiahnuť 100 %, lebo poistenec môže mať viac diagnóz naraz (v priemere okolo 1,25–1,28
  na osobu).
- **Dôvera:** pracovali sme s pôvodne dodanými dátami (2024: 9 409, 2025: 11 111). Novšia dodávka má 9 622 a 11 290
  a nepoužila sa.

## Kde sa dáta čítajú a čo z nich vzniká

| Súbor | Obsah | Číta ho | Čo z neho vzniká |
|---|---|---|---|
| `data/insuranceHistory.json` | rok × poisťovňa → počet | `TrendChart` (Prehľad) | hlavný skladaný graf 2015–2025 |
| | | `OverviewTab` | KPI karty: celkový počet, medziročný rast, 10-ročný násobok |
| | | `InsurersTab` (Poisťovne) | čiarový graf počty/rast % + tabuľka podľa rokov |
| `data/ageBreakdown.json` | rok × poisťovňa × veková skupina | `TrendChart` | filter „Veková štruktúra" (kombinovateľný s poisťovňou/krajom) |
| | | `AgeStructureChart` (Veková štruktúra) | 100% skladaný plošný graf + filter poisťovne + prepínač % / počty |
| `data/regionBreakdown.json` | rok × poisťovňa × kraj | `TrendChart` | filter „Kraje" |
| | | `RegionsTab` (Kraje) | schematická mriežka, rebríček, drill-down graf pre vybraný kraj |
| `data/diagnosisBreakdown.json` | rok × F84 podkód → % aj počet | `DiagnosesTab` (Diagnózy) | viacročný čiarový graf 8 podkódov + tabuľka zmien |
| `data/regionPopulation.json` | populácia krajov po rokoch (ŠÚ SR, k 31. 12.) | `RegionsTab` | prepínač „na 10 000 obyvateľov" |
| | | `OverviewTab` | KPI karta „na 10 000 obyvateľov SR" |

Insighty („Kľúčové zistenia" pod grafmi) **nie sú nikde uložené ako text s číslami** — počítajú sa za behu z týchto dát
(napríklad najrýchlejšie rastúci/klesajúci kraj alebo diagnóza), takže veta zostane pravdivá aj po aktualizácii.

## Ako aktualizovať dáta o ďalší rok

1. **Vstup od poisťovní:** súbory k 31. 12. daného roka. Najlepšie je získať dáta na úrovni **vek × okres × diagnóza**
   (ako dodávajú Dôvera a Union), nie len podľa kraja a 10-ročných intervalov (ako VšZP). Z podrobnejších dát sa dá
   spočítať všetko, vrátane spoločného rozpadu kraj × vek, ktorý teraz nemáme.
2. **Spracovanie zo surových súborov** podľa pravidiel vyššie (robí to Claude alebo skript). Ručné hárky nie sú
   potrebné, môžu slúžiť len na ľudskú kontrolu.
3. **Kontrola** podľa sekcie „Kontrola pri spracovaní": súčty a aj rozdelenie podľa kraja a veku proti surovým súborom
   po poisťovniach a rokoch. Ak niečo nesedí, over to s poisťovňou.
4. **Zápis do JSON:** len pridaj nový rok, nemeň poradie ani tvar existujúcich rokov:
   - `insuranceHistory.json`: pridaj rok do `years` a hodnotu na koniec každého `values` poľa (pre všetky 3 poisťovne).
   - `ageBreakdown.json` / `regionBreakdown.json`: pridaj rok do `years` a nový kľúč `"<rok>": [...]` do
     `insurers.<poisťovňa>` pre všetky 3 poisťovne.
   - `diagnosisBreakdown.json`: pridaj rok do `years`, na koniec `percentByYear` aj `countByYear` pre všetkých 8
     diagnóz.

   KPI karty, grafy, tabuľky, nadpisy s rokmi aj insighty sa prepočítajú samé, nič iné meniť netreba.
5. **Populácia:** pridaj populáciu za nový rok z DATAcube ŠÚ SR (tabuľka om7001rr, stav k 31. 12.) do
   `regionPopulation.json`: rok do `years` a hodnotu na koniec poľa pre každý kraj. Kým populácia za nový rok nie je,
   zobrazí sa „na 10 000 obyvateľov" pre ten rok ako „—".
6. **Over lokálne pred pushom:** `npm install && npm run build && npm run dev`, prejdi všetky taby a skontroluj, že sa
   nový rok objavil v grafoch a že KPI a insighty dávajú zmysel. Build musí prejsť bez chýb.

## História

Záznam zmien dát: [docs/historia-spracovania.md](docs/historia-spracovania.md).
Pôvodné znenie tohto README (archív): [docs/povodne-readme.md](docs/povodne-readme.md).
