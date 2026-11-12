
function ResultatVerification({ statut, diplome }) {
  if (!statut) return null;

  if (statut === "valide") {
    return (
      <div className="verify-result success">
        <h3>✓ Diplôme valide</h3>
        <p>Ce diplôme est authentique et enregistré.</p>
        {diplome && (
          <>
            <p><strong>Étudiant :</strong> {diplome.studentName}</p>
            <p><strong>Numéro :</strong> {diplome.diplomaNumber}</p>
            <p><strong>Spécialité :</strong> {diplome.specialty}</p>
            <p><strong>Établissement :</strong> {diplome.institution}</p>
            <p><strong>Date :</strong> {diplome.issueDate}</p>
          </>
        )}
      </div>
    );
  }

  if (statut === "revoque") {
    return (
      <div className="verify-result error">
        <h3>⚠ Diplôme révoqué</h3>
        <p>Ce diplôme a été révoqué par son établissement.</p>
      </div>
    );
  }

  if (statut === "introuvable") {
    return (
      <div className="verify-result error">
        <h3>✕ Diplôme introuvable</h3>
        <p>Aucun diplôme correspondant n'a été trouvé.</p>
      </div>
    );
  }

  return null;
}

export default ResultatVerification;
