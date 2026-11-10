
import { useState } from "react";
import { Link } from "react-router-dom";
import "./Verify.css";

function Verify() {
  const [diplomaNumber, setDiplomaNumber] = useState("");
  const [result, setResult] = useState(null);

  function handleVerify(e) {
    e.preventDefault();

    const diplomas = JSON.parse(
      localStorage.getItem("diplomas") || "[]"
    );

    const foundDiploma = diplomas.find(
      (diploma) =>
        diploma.diplomaNumber.toLowerCase() ===
        diplomaNumber.trim().toLowerCase()
    );

    setResult(foundDiploma || false);
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

          <p className="verify-label">VÉRIFICATION OFFICIELLE</p>

          <h1>Vérifier un diplôme</h1>

          <p className="verify-description">
            Entrez le numéro du diplôme pour vérifier s'il est enregistré
            dans notre système.
          </p>

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

          {result && (
            <div className="verify-result success">
              <h3>✓ Diplôme trouvé</h3>
              <p><strong>Étudiant :</strong> {result.studentName}</p>
              <p><strong>Numéro :</strong> {result.diplomaNumber}</p>
              <p><strong>Spécialité :</strong> {result.specialty}</p>
              <p><strong>Établissement :</strong> {result.institution}</p>
              <p><strong>Date de délivrance :</strong> {result.issueDate}</p>
            </div>
          )}

          {result === false && (
            <div className="verify-result error">
              <h3>✕ Diplôme introuvable</h3>
              <p>
                Aucun diplôme correspondant à ce numéro n'a été trouvé.
                Vérifiez le numéro saisi.
              </p>
            </div>
          )}
        </div>
      </main>

      <footer className="verify-footer">
        © 2026 DiplomaChain - Projet universitaire
      </footer>
    </div>
  );
}

export default Verify;
