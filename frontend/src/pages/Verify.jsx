import { useState } from "react";
import { Link } from "react-router-dom";
import FileDropZone from "../components/FileDropZone";
import { verifierDiplome } from "../utils/contract";
import ResultatVerification from "../components/ResultatVerification";
import "./Verify.css";

function Verify() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(hash, file) {
    setResult(null);
    setError("");
    setLoading(true);

    try {
      const resultat = await verifierDiplome(file);
      setResult(resultat);
    } catch (err) {
      console.error("Erreur de vérification :", err);
      setError(err.message || "Impossible de lire la blockchain. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  const statut = !result
    ? null
    : !result.existe
    ? "introuvable"
    : result.valide
    ? "valide"
    : "revoque";

  const diplome =
    result && result.existe
      ? {
          studentName: result.nom,
          issueDate: result.date
            ? new Date(result.date * 1000).toLocaleDateString("fr-FR")
            : "Date indisponible",
          cid: result.cid,
        }
      : null;

  return (
    <div className="verify-page">
      <header className="verify-header">
        <Link to="/" className="verify-logo">
          <img src="/diplomachain-logo.png" alt="DiplomaChain" />
          <span>DiplomaChain</span>
        </Link>

        <Link to="/" className="verify-home-link">
          ← Accueil
        </Link>
      </header>

      <main className="verify-container">
        <div className="verify-card">
          <div className="verify-icon">🎓</div>

          <p className="verify-label">VÉRIFICATION OFFICIELLE</p>

          <h1>Vérifier un diplôme</h1>

          <p className="verify-description">
            Déposez le PDF du diplôme : son empreinte est comparée à celle
            enregistrée sur la blockchain.
          </p>

          <FileDropZone onHash={handleFile} />

          {loading && <p>Vérification sur la blockchain…</p>}

          {error && (
            <div className="verify-result error">
              <p>{error}</p>
            </div>
          )}

          <ResultatVerification statut={statut} diplome={diplome} />
        </div>
      </main>

      <footer className="verify-footer">
        © 2026 DiplomaChain - Projet universitaire
      </footer>
    </div>
  );
}

export default Verify;
