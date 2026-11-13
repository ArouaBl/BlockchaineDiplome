import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listerDiplomes } from "../blockchain/contract.js";
import { ipfsUrl } from "../utils/ipfs.js";
import "./Verify.css";

function Historique() {
  const [lignes, setLignes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    listerDiplomes()
      .then(setLignes)
      .catch((err) => {
        console.error("Erreur historique :", err);
        setErreur("Impossible de lire l'historique sur la blockchain. Réessayez.");
      })
      .finally(() => setChargement(false));
  }, []);

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
        <div className="verify-card" style={{ maxWidth: "900px", width: "100%" }}>
          <p className="verify-label">HISTORIQUE BLOCKCHAIN</p>
          <h1>Diplômes émis</h1>

          {chargement && <p>Lecture de la blockchain…</p>}
          {erreur && <p style={{ color: "#991b1b" }}>{erreur}</p>}

          {!chargement && !erreur && lignes.length === 0 && (
            <p>Aucun diplôme émis pour le moment.</p>
          )}

          {lignes.length > 0 && (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr>
                    <th>Étudiant</th>
                    <th>Date</th>
                    <th>Statut</th>
                    <th>Empreinte</th>
                    <th>PDF</th>
                  </tr>
                </thead>

                <tbody>
                  {lignes.map((d) => (
                    <tr key={d.hash} style={{ borderTop: "1px solid #e5e7eb" }}>
                      <td>{d.nom}</td>
                      <td>{new Date(d.date * 1000).toLocaleDateString("fr-FR")}</td>
                      <td
                        style={{
                          color: d.valide ? "#166534" : "#c2410c",
                          fontWeight: "bold",
                        }}
                      >
                        {d.valide ? "Valide" : "Révoqué"}
                      </td>
                      <td style={{ fontFamily: "monospace" }} title={d.hash}>
                        {d.hash.slice(0, 10)}…{d.hash.slice(-6)}
                      </td>
                      <td>
                        {d.cid ? (
                          <a href={ipfsUrl(d.cid)} target="_blank" rel="noopener noreferrer">
                            Voir
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

export default Historique;