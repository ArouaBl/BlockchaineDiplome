
function ResultatVerification({ statut, diplome }) {
  if (!statut) return null;

  if (statut === "valide") {
    return (
      <div className="verify-result success">
        <h3>✓ Diplôme valide</h3>
        <p>
          Ce diplôme est authentique et enregistré sur la blockchain.
        </p>

        {diplome && (
          <>
            <p>
              <strong>Étudiant :</strong> {diplome.studentName}
            </p>

            {diplome.diplomaNumber && (
              <p>
                <strong>Numéro :</strong> {diplome.diplomaNumber}
              </p>
            )}

            <p>
              <strong>Date d'émission :</strong> {diplome.issueDate}
            </p>

            {diplome.cid && (
              <p>
                <strong>CID :</strong> {diplome.cid}
              </p>
            )}
          </>
        )}
      </div>
    );
  }

  if (statut === "revoque") {
    return (
      <div className="verify-result error">
        <h3>⚠ Diplôme révoqué</h3>
        <p>
          Ce diplôme existe sur la blockchain, mais il a été révoqué.
        </p>

        {diplome && (
          <>
            <p>
              <strong>Étudiant :</strong> {diplome.studentName}
            </p>

            <p>
              <strong>Date d'émission :</strong> {diplome.issueDate}
            </p>
          </>
        )}
      </div>
    );
  }

  if (statut === "introuvable") {
    return (
      <div className="verify-result error">
        <h3>✕ Diplôme introuvable</h3>
        <p>
          Aucun diplôme correspondant n'a été trouvé sur la blockchain.
        </p>
      </div>
    );
  }

  return null;
}

export default ResultatVerification;
