# data-o-autizme dashboard

Vite + React dashboard s grafmi (Recharts), ktorý sa embeduje do cudzej stránky
cez `<div id="dashboard">`. Nasadzuje sa na GitHub Pages pod `/data-o-autizme/`.

Je to **jedna stránka s tabmi** (Prehľad / Poisťovne / Kraje / Veková štruktúra /
Diagnózy), nie viacero samostatných stránok — zámerne, keďže výsledok sa embeduje
ako jeden blok do kompasio.sk. Predtým existovala aj alternatívna samostatná
verzia v `public/dashboard/index.html` (statický HTML s natvrdo zapísanými
dátami); tá bola zlúčená do tejto appky a odstránená — nový obsah z nej (Kraje,
Diagnózy, per-capita metrika, prepínače počty/rast) je teraz tu, dátovo napojený
na `/data` JSON namiesto hardcodu.

## Štruktúra

```
data/            JSON dáta (mimo src/, aby sa dali ľahko editovať/generovať)
src/
  main.jsx       mount do #dashboard
  App.jsx        tab shell (header + TabNav + aktívny tab)
  format.js      formatCount/formatPercent1 (sk-SK formátovanie čísel)
  dashboard.css  všetky štýly, scopované pod #dashboard
  components/    taby, grafy a zdieľané UI kúsky
```

## Dáta — jediný zdroj pravdy

Všetky dáta pochádzajú z reálnych agregovaných tabuliek poisťovní (VšZP, Dôvera,
Union), 2015–2025. Nič sa neduplikuje do samostatného „KPI snapshotu" — hodnoty
ako medziročný rast, 10-ročný násobok, najpočetnejšia veková skupina a pod. sa
**počítajú za behu z týchto súborov** v komponentoch/taboch, nie z ručne
udržiavaného sumára. (Predtým existoval `data/summary.json` +
`ageDistribution.json` + `regionDistribution.json` s ukážkovými/zastaranými
číslami, ktoré sa rozišli od reálnych dát v ostatných grafoch na tej istej
stránke — presne to táto štruktúra odstraňuje.)

- `data/insuranceHistory.json` — `{ years: [...], insurers: [{ id, name, color, values: [...] }] }`,
  `values[i]` zodpovedá `years[i]`. Súčet troch poisťovní za rok = celkový počet.
- `data/ageBreakdown.json`, `data/regionBreakdown.json` — rozpad podľa poisťovne
  × rok × veková skupina/kraj. Tvar `{ years, ageGroups/regions, insurers: { "<insurerId>": { "<rok>": [...] } } }`.
  Toto sú **dve oddelené** 2-rozmerné tabuľky (vek×poisťovňa×rok a kraj×poisťovňa×rok)
  — nemáme reálnu jointovú distribúciu vek×kraj (pozri nižšie, TrendChart).
- `data/diagnosisBreakdown.json` — `{ years, diagnoses: [{ id, code, label, percentByYear, countByYear }] }`,
  8 podkódov F84.x, zoradené podľa podielu v poslednom roku (fixné poradie pre farby).
- `data/regionPopulation.json` — `{ source, populationByRegion: { "<kraj>": počet } }`,
  bez záznamu pre „Zahraničie a iné" (nemá zmysel počítať naň per-capita).
  Zdroj: Štatistický úrad SR, koniec roka 2024 — orientačné.
- Komponenty dáta importujú priamo (`import x from '../data/x.json'`) — žiadny
  fetch, žiadny API layer.

## Taby

`App.jsx` drží `activeTab` stav a renderuje presne jeden tab naraz (žiadny URL
routing — nevhodné pre embed do cudzej stránky). `TabNav.jsx` je jednoduchý
button-row (nie `<nav>` — vyhýbame sa ďalšiemu holému sémantickému tagu, ktorý
by bolo treba overovať proti hostiteľovmu CSS, pozri nižšie).

- **Prehľad** (`OverviewTab.jsx`) — KPI karty (počet, medziročný rast, 10-ročný
  násobok, na 10 000 obyvateľov — všetko dopočítané z `insuranceHistory.json` +
  `regionPopulation.json`) + hlavný graf (`TrendChart.jsx`) + `InsightsList`.
- **Poisťovne** (`InsurersTab.jsx`) — čiarový graf (počty/medziročný rast %
  cez `SegmentedControl`) + tabuľka podľa rokov.
- **Kraje** (`RegionsTab.jsx`) — schematická mriežka krajov (klikacia, farbená
  sekvenčne podľa hodnoty) + rebríček + drill-down graf pre vybraný kraj +
  filter poisťovne/rok/metrika (počet vs. na 10 000 obyvateľov) + `InsightsList`.
  Mriežka je zámerne `grid-template-columns: repeat(3, 1fr)` s `aspect-ratio`
  na dlaždiciach (nie pevné px), aby sa nikdy nezmestila mimo viewport na mobile
  — pôvodná (odstránená) verzia v `public/dashboard/index.html` mala presne
  tento bug (`max-width:420px` s pevnými stĺpcami pretiekol pri 375px a
  spôsobil horizontálny scroll celej stránky).
- **Veková štruktúra** (`AgeStructureChart.jsx`) — 100% skladaný plošný graf +
  filter poisťovne + prepínač percentá/absolútne počty + `InsightsList`. 10
  pôvodných vekových pásiem sa zlučuje do 5 (`0-9/10-19/20-29/30-39/40+`) —
  dataviz pravidlá limitujú ordinal paletu na ~5-7 tried, viac splýva. Farby sú
  jeden modrý ordinal ramp, validovaný cez dataviz skill (`--ordinal`).
- **Diagnózy** (`DiagnosesTab.jsx`) — viacročný čiarový graf 8 F84 podkódov
  (farby = validovaná 8-hue kategorická paleta z dataviz skillu, výška grafu
  440px — pri 8 sériách naraz potrebuje viac miesta než ostatné grafy) +
  tabuľka zmien 2015→2025 + `InsightsList`. Tooltip **nie je** Recharts default
  (ten pri viacerých líniách zdieľaných na jednej X osi ukáže naraz všetky
  série pre daný rok — pri 8 líniách nečitateľné). Namiesto toho každá `<Line>`
  dostane `onMouseEnter`/`onMouseLeave` na `dot`/`activeDot`, ktoré nastavia
  `hoveredId`; vlastný `content={<DiagnosisTooltip hoveredId={...} />}` potom
  z `payload` vyberie len ten jeden riadok zodpovedajúci `hoveredId` — správanie
  blízke Chart.js `intersect:true` (tooltip len pre bod pod kurzorom), nie
  "všetko pri danom X". Ak pridáš ďalší viacsériový line chart, zváž rovnaký
  vzor namiesto defaultného zdieľaného tooltipu.

### Insighty sa počítajú, nie sú hardcoded

`InsightsList.jsx` je len prezentačná obálka (farebná bodka + text). Samotné
vety v `RegionsTab`/`AgeStructureChart`/`DiagnosesTab` **dynamicky nájdu**
najrýchlejšie rastúci/klesajúci kraj či diagnózu (napr. `mostIncreased`/
`mostDecreased` cez `reduce` na deltách rokov 2015→2025) namiesto toho, aby
natvrdo tvrdili „Žilinský kraj rastie najviac" — ak sa dáta v budúcnosti
aktualizujú a poradie sa zmení, text sa prepočíta správne sám. Toto bol presne
rozdiel oproti pôvodnému `public/dashboard/index.html`, ktorý mal tieto vety
napevno zapísané pre konkrétne kraje/diagnózy.

### TrendChart — kombinované filtrovanie poisťovňa/vek/kraj

`TrendChart.jsx` (na Prehľad tabe) renderuje tri nezávislé multi-select filtre
(`FilterGroup.jsx`): poisťovne (vždy rozbalené, 3 položky), veková štruktúra a
kraje (zbalené — „všetky", rozbaľujú sa tapnutím). V každej skupine musí ostať
vybraná aspoň jedna položka.

Keďže vek a kraj sú dve oddelené tabuľky (nie joint distribúcia), výpočet:
- obmedzený len vek ALEBO len kraj → presný súčet z príslušnej tabuľky,
- obmedzené oba naraz → súčin (predpoklad štatistickej nezávislosti) +
  `.dashboard__note` upozorňujúca na orientačný odhad.

### Recharts legend/tooltip a biely `stroke`

`AgeStructureChart` používa `<Area stroke="#fff" .../>` (2px medzera medzi
segmentmi stacku). Recharts z toho defaultne odvodí farbu textu aj ikony
legendy AJ tooltipu → biely text na bielom pozadí (neviditeľné). Rieši sa
explicitným `payload` (farba z `fill`) + `formatter` pre legendu, a vlastným
`content={<AgeStructureTooltip />}` pre tooltip (vypíše % aj počet na
vekovú skupinu). Ak pridáš ďalší stacked graf s bielym stroke, over legendu
a tooltip rovnako.

## Ako pridať/rozšíriť obsah

- **Nový graf v existujúcom tabe**: priprav dáta v `/data`, priamy import v
  komponente, žiadny hardcoded JS v JSX.
- **Nový tab**: pridaj položku do `TABS` v `App.jsx` (id, label, Component) a
  nový súbor v `src/components/`, ktorý renderuje vlastné `<section className="dashboard__section">`.
  Zdieľaj `SegmentedControl`, `InsightsList`, `KpiCards` kde to dáva zmysel.
- Štýly vždy do `src/dashboard.css` pod `#dashboard ...` (pozri nižšie prečo).

## CSS scoping — dôležité

Táto appka sa embeduje do cudzej stránky, takže:

- Žiadne globálne resety (`*`, `body`, `html`, ...) mimo `#dashboard`.
- Každé pravidlo v `dashboard.css` musí začínať `#dashboard ...`, aby nič neuniklo
  a nerozbilo hosťujúcu stránku.
- `App.jsx` nevykresľuje vlastný `<div id="dashboard">` — ten je už v `index.html`
  (resp. v hostiteľskej stránke pri embede) a React sa doň iba mountuje cez `main.jsx`.
- Platí to aj opačným smerom: hosťujúca stránka môže mať vlastné neskopované
  pravidlá na holé tagy (napr. kompasio.sk má v `style.css` `section { float: left;
  padding: 100px 0; ... }` pre svoje vlastné sekcie), ktoré nám bez varovania
  rozbijú layout zvnútra. Preto `dashboard.css` obsahuje defenzívny reset
  (`#dashboard section, #dashboard header { float: none; position: static; ... }`),
  ktorý vďaka ID selektoru prebije hostiteľove pravidlá na holé tagy bez ohľadu
  na poradie štýlov v `<head>`. Ak pridáš komponent s ďalším sémantickým tagom
  (napr. `<article>`, `<aside>`, `<nav>`), over si na cieľovej stránke, či ho
  hostiteľ tiež neštyluje (skript v histórii tejto konverzácie: prejdi
  `document.styleSheets`, nájdi pravidlá na holý tag mimo `assets/app.css`), a
  pridaj mu rovnaký reset. `table`/`thead`/`tbody`/`tr`/`th`/`td`/`select`/
  `option`/`label`/`ul`/`strong` sú overené (kompasio.sk ich resetuje len na
  neškodné `border/margin/padding:0`, žiadny `float`/`position` prekvapenie).

## Build

- `base: '/data-o-autizme/'` vo `vite.config.js` — zodpovedá GitHub Pages ceste repa.
- `build.rollupOptions.output` má natvrdo zafixované názvy výstupov bez hashov:
  `assets/app.js` a `assets/app.css`. Vďaka tomu sa dá appka embedovať cez stabilnú
  URL, ktorá sa pri každom novom builde nemení.
  - Pozor: ak by v budúcnosti pribudol `import()` dynamický import a vznikol by
    ďalší JS chunk, kolidoval by s `assets/app.js` a build zlyhá — v takom prípade
    buď dynamický import odstráň, alebo uprav `chunkFileNames`.
- `public/` (ak niekedy pribudne) sa kopíruje do `dist/` bezo zmeny (Vite
  default) — priečinok momentálne v repe nie je, keďže `public/dashboard/index.html`
  bol zlúčený do hlavnej appky a zmazaný.

Príkazy:

```
npm install   # inštalácia
npm run dev   # lokálny dev server
npm run build # produkčný build do dist/
```

## Deploy

`.github/workflows/deploy.yml` pri každom pushi do `main`:

1. `npm install` + `npm run build`
2. build z `dist/` sa nahrá cez `actions/upload-pages-artifact`
3. `actions/deploy-pages` nasadí na GitHub Pages

V repe treba mať v **Settings → Pages** nastavený zdroj `GitHub Actions`.

`dist/index.html` (výstup buildu) obsahuje kompletnú HTML stránku s `<div id="dashboard">`
a scriptom, takže výsledok sa dá otvoriť priamo na GitHub Pages URL repa aj bez embedu —
slúži to na rýchle vizuálne otestovanie pred embedovaním do cieľovej stránky.
