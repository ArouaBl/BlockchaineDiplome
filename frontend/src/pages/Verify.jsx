
import { useState } from "react";
import { Link } from "react-router-dom";
import FileDropZone from "../components/FileDropZone";
import ResultatVerification from "../components/ResultatVerification";
import "./Verify.css";

function Verify() {
  const [diplomaNumber, setDiplomaNumber] = useState("");
  const [result, setResult] = useState(null);

  // Vérification par numéro
  function handleVerify(e) {
    e.preventDefault();

    const diplomas = JSON.parse(
      localStorage.getItem("diplomas") || "[]"
    );

    const foundDiploma = diplomas.find(
      (diploma) =>
        diploma.diplomaNumber?.toLowerCase() ===
        diplomaNumber.trim().toLowerCase()
    );

    afficherResultat(foundDiploma);
  }

  // Vérification par hash du PDF
  function handleHash(hash) {
    const diplomas = JSON.parse(
      localStorage.getItem("diplomas") || "[]"
    );

    const foundDiploma = diplomas.find(
      (diploma) =>
        diploma.pdfHash?.toLowerCase() === hash.toLowerCase()
    );

    afficherResultat(foundDiploma);
  }

  // Afficher le résultat
  function afficherResultat(diploma) {
    if (!diploma) {
      setResult({
        statut: "introuvable",
        diplome: null,
      });
    } else if (diploma.revoked) {
      setResult({
        statut: "revoque",
        diplome: diploma,
      });
    } else {
      setResult({
        statut: "valide",
        diplome: diploma,
      });
    }
  }

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

          <p className="verify-label">
            VÉRIFICATION OFFICIELLE
          </p>

          <h1>Vérifier un diplôme</h1>

          <p className="verify-description">
            Vérifiez l'authenticité d'un diplôme par son numéro
            ou en déposant son fichier PDF.
          </p>

          {/* Vérification par numéro */}
          <form onSubmit={handleVerify}>
            <label htmlFor="diplomaNumber">
              Numéro du diplôme
            </label>

            <input
              id="diplomaNumber"
              type="text"
              placeholder="Ex : DIP-2026-001"
              value={diplomaNumber}
              onChange={(e) => {
                setDiplomaNumber(e.target.value);
                setResult(null);
              }}
              required
            />

            <button type="submit">
              Vérifier le diplôme
            </button>
          </form>

          <ResultatVerification
            statut={result?.statut}
            diplome={result?.diplome}
          />

          <h3 style={{ marginTop: "1.5rem" }}>
            Ou vérifiez avec le fichier PDF
          </h3>

          {/* Vérification par PDF */}
          <FileDropZone
            onHash={(hash) => {
              setResult(null);
              handleHash(hash);
            }}
          />
        </div>
      </main>

      <footer className="verify-footer">
        © 2026 DiplomaChain - Projet universitaire
      </footer>
    </div>
  );
}

export default Verify;
