
import { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    if (!email || !password) {
      setMessage("Veuillez remplir tous les champs.");
      return;
    }

    setMessage(
      "La connexion sera activée après l'intégration du backend."
    );
  }

  return (
    <div className="login-page">

      <header className="login-header">
        <Link to="/" className="logo">
          <img
            src="/diplomachain-logo.png"
            alt="DiplomaChain"
            className="logo-image"
          />
          <span>DiplomaChain</span>
        </Link>

        <Link to="/" className="back-home">
          ← Retour à l'accueil
        </Link>
      </header>

      <main className="login-container">
        <div className="login-card">

          <div className="login-icon">🏛️</div>

          <h1>Espace administrateur</h1>

          <p className="login-description">
            Connectez-vous pour gérer et certifier les diplômes.
          </p>

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label htmlFor="email">Adresse e-mail</label>

              <input
                id="email"
                type="email"
                placeholder="admin@universite.tn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>

              <input
                id="password"
                type="password"
                placeholder="Entrez votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {message && (
              <p className="login-message">{message}</p>
            )}

            <button type="submit" className="login-submit">
              Se connecter
            </button>

          </form>

          <div className="login-security">
            <span>🔒</span>
            Accès réservé aux administrateurs autorisés
          </div>

        </div>
      </main>

      <footer className="login-footer">
        © 2026 DiplomaChain - Projet universitaire
      </footer>

    </div>
  );
}

export default Login;
