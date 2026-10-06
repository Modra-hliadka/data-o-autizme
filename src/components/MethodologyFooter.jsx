export default function MethodologyFooter() {
  return (
    <section className="dashboard__section dashboard__methodology">
      <h2 className="dashboard__section-title">Zdroje a metodika</h2>

      <div className="dashboard__methodology-group">
        <p className="dashboard__methodology-heading">
          <strong>Zdroje dát</strong>
        </p>
        <p className="dashboard__methodology-text">
          Súbory od troch zdravotných poisťovní: VšZP, Dôvera a Union.
        </p>
      </div>

      <div className="dashboard__methodology-group">
        <p className="dashboard__methodology-heading">
          <strong>Metodika zberu</strong>
        </p>
        <p className="dashboard__methodology-text">Každá poisťovňa dodala dáta samostatne.</p>
        <ul className="dashboard__methodology-list">
          <li>
            Započítaná je osoba s aspoň raz vykázanou diagnózou F84.0, F84.1, F84.2, F84.3,
            F84.4, F84.5, F84.8 alebo F84.9, prípadne ich kombináciou.
          </li>
          <li>Rátajú sa len aktívni poistenci k 31. 12. daného roka.</li>
          <li>Každé rodné číslo je v rámci poisťovne započítané len raz.</li>
          <li>Bydlisko je podľa trvalého pobytu, vek k 31. 12. daného roka.</li>
        </ul>
      </div>

      <div className="dashboard__methodology-group">
        <p className="dashboard__methodology-heading">
          <strong>Metodika spracovania</strong>
        </p>
        <p className="dashboard__methodology-text">
          Aby sa dáta dali porovnať, zlúčili sme ich do krajov a 10-ročných vekových skupín,
          spojili a vizualizovali. Prepočet na 10 000 obyvateľov vychádza z údajov ŠÚ SR o
          počte obyvateľov ku koncu príslušného roka.
        </p>
      </div>

      <div className="dashboard__methodology-group">
        <p className="dashboard__methodology-heading">
          <strong>Limity</strong>
        </p>
        <ul className="dashboard__methodology-list">
          <li>
            Nemáme prístup k rodným číslam, preto nevieme odfiltrovať ľudí, ktorí prestúpili do
            inej poisťovne.
          </li>
          <li>
            Dáta zachytávajú len ľudí s diagnózou vykázanou v systéme poisťovní, nie všetkých
            ľudí s autizmom.
          </li>
          <li>
            <strong>
              Vek a kraj nemáme k dispozícii spolu. Pri súčasnom výbere oboch filtrov je výsledok
              odhad.
            </strong>
          </li>
        </ul>
      </div>

      <p className="dashboard__methodology-text">
        Podrobná metodika a limity sú verejne dostupné na{' '}
        <a
          href="https://github.com/Modra-hliadka/data-o-autizme"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHube (→ github.com)
        </a>
        .
      </p>
    </section>
  )
}
