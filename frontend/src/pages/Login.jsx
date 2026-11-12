import { Link } from "react-router-dom";
import { useWallet } from "../hooks/useWallet";
import "./Login.css";

const SEPOLIA_CHAIN_ID = 11155111;

function Login() {
  const { address, network, chainId, error, hasMetaMask, connect } = useWallet();
  const wrongNetwork = address && chainId !== SEPOLIA_CHAIN_ID;

  return (
    <div className="login-page">
      <header className="login-header">
        <Link to="/" className="logo">
          <img src="/diplomachain-logo.png" alt="DiplomaChain" className="logo-image" />
          <span>DiplomaChain</span>
        </Link>
        <Link to="/" className="back-home">← Retour à l'accueil</Link>
      </header>

      <main className="login-container">
        <div className="login-card">
          <div className="login-icon">🏛️</div>
          <h1>Espace administrateur</h1>
          <p className="login-description">
            Connectez votre portefeuille MetaMask pour gérer et certifier les diplômes.
          </p>

          {!hasMetaMask && (
            <p className="login-message">
              MetaMask n'est pas installé.{" "}
              <a href="https://metamask.io/download" target="_blank" rel="noopener noreferrer">
                Installer MetaMask
              </a>
            </p>
          )}

          {error && <p className="login-message">{error}</p>}

          {!address && (
            <button type="button" className="login-submit" onClick={connect} disabled={!hasMetaMask}>
              Connecter MetaMask
            </button>
          )}

          {address && (
            <>
              <p><strong>Adresse :</strong> {address}</p>
              <p><strong>Réseau :</strong> {network} (chainId {chainId})</p>
              {wrongNetwork && (
                <p className="login-message">Changez de réseau dans MetaMask : choisissez Sepolia.</p>
              )}
              <Link
                to="/admin"
                className="login-submit"
                style={{ display: "block", textAlign: "center", textDecoration: "none" }}
              >
                Accéder à l'administration
              </Link>
            </>
          )}

          <div className="login-security">
            <span>🔒</span>
            Accès réservé aux administrateurs autorisés
          </div>
        </div>
      </main>

      <footer className="login-footer">© 2026 DiplomaChain - Projet universitaire</footer>
    </div>
  );
}

export default Login;