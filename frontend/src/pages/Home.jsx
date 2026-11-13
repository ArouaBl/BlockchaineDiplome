
import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <div className="home-page">

      {/* NAVIGATION */}
      <header className="navbar">
        <Link to="/" className="logo">
          <img
            src="frontend\src\assets\diplome-logo.png"
            alt="DiplomaChain"
            className="logo-image"
          />
          <span>DiplomaChain</span>
        </Link>

        <nav className="nav-links">
          <a href="#accueil">Accueil</a>
          <a href="#fonctionnement">Fonctionnement</a>
          <a href="#avantages">Avantages</a>
        </nav>

        <Link to="/login" className="login-button">
          Espace administrateur
        </Link>
      </header>

      <main>
        {/* SECTION PRINCIPALE */}
        <section className="hero" id="accueil">
          <div className="hero-content">
            <span className="hero-label">
              CERTIFICATION NUMÉRIQUE SÉCURISÉE
            </span>

            <h1>
              Vos diplômes,
              <span> protégés par la blockchain.</span>
            </h1>

            <p>
              DiplomaChain permet aux établissements de certifier
              les diplômes et à chacun de vérifier leur authenticité
              grâce à la technologie blockchain.
            </p>

            <div className="hero-buttons">
              <Link to="/verify" className="primary-button">
                🔍 Vérifier un diplôme
              </Link>

              <Link to="/login" className="secondary-button">
                🏛️ Espace administrateur
              </Link>
            </div>

            <div className="hero-info">
              <span>✓ Vérification publique</span>
              <span>✓ Enregistrement sécurisé</span>
              <span>✓ Technologie blockchain</span>
            </div>
          </div>

          {/* APERÇU D'UN DIPLÔME */}
          <div className="hero-card">
            <div className="document-icon">🎓</div>

            <h3>Diplôme certifié</h3>
            <p>Licence en informatique</p>

            <div className="certificate-line"></div>

            <div className="certificate-details">
              <span>Statut</span>
              <strong>✓ Vérifié</strong>
            </div>

            <div className="certificate-details">
              <span>Authenticité</span>
              <strong>Confirmée</strong>
            </div>

            <div className="certificate-footer">
              Blockchain Technology
            </div>
          </div>
        </section>

        {/* AVANTAGES */}
        <section className="advantages section" id="avantages">
          <div className="section-heading">
            <span>POURQUOI DIPLOMCHAIN ?</span>
            <h2>Une nouvelle façon de certifier les diplômes</h2>
            <p>
              Une solution moderne pour lutter contre la falsification
              des diplômes.
            </p>
          </div>

          <div className="advantages-grid">
            <article className="advantage-card">
              <div className="card-icon">🔒</div>
              <h3>Sécurité</h3>
              <p>
                Les informations certifiées sont protégées grâce
                à la technologie blockchain.
              </p>
            </article>

            <article className="advantage-card">
              <div className="card-icon">✓</div>
              <h3>Authenticité</h3>
              <p>
                Chaque diplôme peut être vérifié afin de confirmer
                son authenticité.
              </p>
            </article>

            <article className="advantage-card">
              <div className="card-icon">⚡</div>
              <h3>Rapidité</h3>
              <p>
                La vérification des diplômes est simple et rapide,
                sans procédures compliquées.
              </p>
            </article>
          </div>
        </section>

        {/* FONCTIONNEMENT */}
        <section className="how-section section" id="fonctionnement">
          <div className="section-heading">
            <span>COMMENT ÇA MARCHE ?</span>
            <h2>Trois étapes simples</h2>
            <p>
              DiplomaChain facilite la certification et la vérification
              des diplômes.
            </p>
          </div>

          <div className="steps-grid">
            <article className="step-card">
              <div className="step-number">01</div>
              <h3>Enregistrement</h3>
              <p>
                L'administrateur autorisé saisit les informations
                du diplôme dans la plateforme.
              </p>
            </article>

            <article className="step-card">
              <div className="step-number">02</div>
              <h3>Certification</h3>
              <p>
                Le diplôme est certifié et son empreinte numérique
                est enregistrée sur la blockchain.
              </p>
            </article>

            <article className="step-card">
              <div className="step-number">03</div>
              <h3>Vérification</h3>
              <p>
                Un utilisateur ou un recruteur vérifie l'authenticité
                du diplôme.
              </p>
            </article>
          </div>

          {/* DEUX ACCÈS */}
          <div className="access-section">
            <h2>Que souhaitez-vous faire ?</h2>
            <p>Choisissez l'espace correspondant à votre besoin.</p>

            <div className="access-grid">
              <article className="access-card">
                <div className="access-icon">🔍</div>
                <h3>Vérifier un diplôme</h3>
                <p>
                  Vous souhaitez contrôler l'authenticité d'un diplôme ?
                  Accédez à l'espace de vérification publique.
                </p>
                <Link to="/verify" className="access-button">
                  Vérifier un diplôme →
                </Link>
              </article>

              <article className="access-card">
                <div className="access-icon">🏛️</div>
                <h3>Espace administrateur</h3>
                <p>
                  Vous êtes un administrateur autorisé ?
                  Connectez-vous pour enregistrer et certifier
                  les diplômes.
                </p>
                <Link to="/login" className="access-button">
                  Se connecter →
                </Link>
              </article>
            </div>
          </div>
        </section>

        {/* PIED DE PAGE */}
        <footer className="footer">
          <div className="footer-logo">DiplomaChain</div>

          <p>
            Une solution de certification des diplômes basée sur la blockchain.
          </p>

          <span>© 2026 DiplomaChain - Projet universitaire</span>
        </footer>
      </main>
    </div>
  );
}

export default Home;
