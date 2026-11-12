
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { calculerHash } from "../utils/hashUtils";
import "./Admin.css";

function Admin() {
  const [diplomas, setDiplomas] = useState(() => {
    return JSON.parse(localStorage.getItem("diplomas") || "[]");
  });

  const [formData, setFormData] = useState({
    studentName: "",
    diplomaNumber: "",
    specialty: "",
    institution: "",
    issueDate: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [activeSection, setActiveSection] = useState("dashboard");

  const [pdfFile, setPdfFile] = useState(null);
  const [pdfHash, setPdfHash] = useState("");
  const [loadingHash, setLoadingHash] = useState(false);

  // Afficher un message avec son type
  function afficherMessage(texte, type = "info") {
    setMessage(texte);
    setMessageType(type);
  }

  // Sauvegarder automatiquement les diplômes
  useEffect(() => {
    localStorage.setItem("diplomas", JSON.stringify(diplomas));
  }, [diplomas]);

  // Modifier les champs du formulaire
  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  // Sélectionner un PDF et calculer son hash
  async function handleFileChange(e) {
    const file = e.target.files[0];

    if (!file) return;

    if (file.type !== "application/pdf") {
      afficherMessage("Veuillez sélectionner un fichier PDF.", "error");
      setPdfFile(null);
      setPdfHash("");
      return;
    }

    try {
      setLoadingHash(true);
      afficherMessage("Calcul du hash SHA-256 en cours...", "info");

      const hash = await calculerHash(file);

      setPdfFile(file);
      setPdfHash(hash);

      afficherMessage(
        "PDF sélectionné et hash calculé avec succès.",
        "success"
      );
    } catch (error) {
      console.error(error);

      afficherMessage(
        "Erreur lors du calcul du hash du PDF.",
        "error"
      );

      setPdfFile(null);
      setPdfHash("");
    } finally {
      setLoadingHash(false);
    }
  }

  // Réinitialiser le formulaire
  function resetForm() {
    setFormData({
      studentName: "",
      diplomaNumber: "",
      specialty: "",
      institution: "",
      issueDate: "",
    });

    setEditingId(null);
    setPdfFile(null);
    setPdfHash("");
    setMessage("");
    setMessageType("info");
  }

  // Ajouter ou modifier un diplôme
  async function handleSubmit(e) {
    e.preventDefault();

    if (loadingHash) {
      afficherMessage(
        "Veuillez attendre la fin du calcul du hash.",
        "warning"
      );
      return;
    }

    const duplicate = diplomas.some(
      (d) =>
        d.diplomaNumber?.toLowerCase() ===
          formData.diplomaNumber.trim().toLowerCase() &&
        d.id !== editingId
    );

    if (duplicate) {
      afficherMessage(
        "Ce numéro de diplôme existe déjà.",
        "error"
      );
      return;
    }

    // PDF obligatoire pour un nouvel ajout
    if (editingId === null && !pdfFile) {
      afficherMessage(
        "Veuillez sélectionner le fichier PDF du diplôme.",
        "error"
      );
      return;
    }

    try {
      const oldDiploma = diplomas.find(
        (d) => d.id === editingId
      );

      const cleanedData = {
        ...formData,
        studentName: formData.studentName.trim(),
        diplomaNumber: formData.diplomaNumber.trim(),
        specialty: formData.specialty.trim(),
        institution: formData.institution.trim(),

        pdfHash: pdfFile
          ? pdfHash
          : oldDiploma?.pdfHash || "",

        pdfName: pdfFile
          ? pdfFile.name
          : oldDiploma?.pdfName || "",
      };

      if (editingId !== null) {
        setDiplomas((previous) =>
          previous.map((d) =>
            d.id === editingId
              ? { ...d, ...cleanedData }
              : d
          )
        );

        afficherMessage(
          "Diplôme modifié avec succès.",
          "success"
        );
      } else {
        setDiplomas((previous) => [
          ...previous,
          {
            id: Date.now(),
            ...cleanedData,
            revoked: false,
          },
        ]);

        afficherMessage(
          "Diplôme ajouté avec succès.",
          "success"
        );
      }

      setFormData({
        studentName: "",
        diplomaNumber: "",
        specialty: "",
        institution: "",
        issueDate: "",
      });

      setEditingId(null);
      setPdfFile(null);
      setPdfHash("");
    } catch (error) {
      console.error(error);

      afficherMessage(
        "Une erreur est survenue lors de l'enregistrement du diplôme.",
        "error"
      );
    }
  }

  // Modifier un diplôme
  function handleEdit(diploma) {
    if (diploma.revoked) {
      afficherMessage(
        "Un diplôme révoqué ne peut pas être modifié.",
        "error"
      );
      return;
    }

    setFormData({
      studentName: diploma.studentName || "",
      diplomaNumber: diploma.diplomaNumber || "",
      specialty: diploma.specialty || "",
      institution: diploma.institution || "",
      issueDate: diploma.issueDate || "",
    });

    setEditingId(diploma.id);
    setPdfFile(null);
    setPdfHash(diploma.pdfHash || "");
    setActiveSection("add");

    setMessage("");
    setMessageType("info");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // Supprimer un diplôme
  function handleDelete(id) {
    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer ce diplôme ?"
    );

    if (!confirmed) {
      afficherMessage("Suppression annulée.", "warning");
      return;
    }

    setDiplomas((previous) =>
      previous.filter((d) => d.id !== id)
    );

    if (editingId === id) {
      resetForm();
    }

    afficherMessage(
      "Diplôme supprimé avec succès.",
      "success"
    );
  }

  // Révoquer un diplôme
  function handleRevoke(id) {
    const diploma = diplomas.find((d) => d.id === id);

    if (!diploma || diploma.revoked) {
      return;
    }

    const confirmed = window.confirm(
      "Voulez-vous vraiment révoquer ce diplôme ?"
    );

    if (!confirmed) {
      afficherMessage("Révocation annulée.", "warning");
      return;
    }

    setDiplomas((previous) =>
      previous.map((d) =>
        d.id === id
          ? { ...d, revoked: true }
          : d
      )
    );

    afficherMessage(
      "Diplôme révoqué avec succès.",
      "success"
    );
  }

  const validDiplomas = diplomas.filter(
    (d) => !d.revoked
  ).length;

  const revokedDiplomas = diplomas.filter(
    (d) => d.revoked
  ).length;

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <Link to="/" className="sidebar-brand">
          <img
            src="/diplomachain-logo.png"
            alt="DiplomaChain"
          />
          <span>DiplomaChain</span>
        </Link>

        <div className="sidebar-profile">
          <div className="profile-avatar">A</div>
          <div>
            <strong>Administrateur</strong>
            <span>Espace de gestion</span>
          </div>
        </div>

        <p className="sidebar-label">MENU PRINCIPAL</p>

        <button
          className={`sidebar-link ${
            activeSection === "dashboard" ? "active" : ""
          }`}
          onClick={() => setActiveSection("dashboard")}
        >
          <span>▦</span> Tableau de bord
        </button>

        <button
          className={`sidebar-link ${
            activeSection === "add" ? "active" : ""
          }`}
          onClick={() => {
            resetForm();
            setActiveSection("add");
          }}
        >
          <span>＋</span> Ajouter un diplôme
        </button>

        <button
          className={`sidebar-link ${
            activeSection === "list" ? "active" : ""
          }`}
          onClick={() => setActiveSection("list")}
        >
          <span>▤</span> Liste des diplômes
        </button>

        <div className="sidebar-bottom">
          <Link to="/" className="sidebar-link">
            <span>⌂</span> Retour à l'accueil
          </Link>

          <Link to="/login" className="sidebar-link logout-link">
            <span>↪</span> Déconnexion
          </Link>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <p className="topbar-subtitle">ADMINISTRATION</p>
            <h1>
              {activeSection === "dashboard"
                ? "Tableau de bord"
                : activeSection === "add"
                  ? editingId !== null
                    ? "Modifier un diplôme"
                    : "Ajouter un diplôme"
                  : "Liste des diplômes"}
            </h1>
          </div>

          <Link to="/verify" className="verify-link">
            Vérifier un diplôme ↗
          </Link>
        </header>

        {/* TABLEAU DE BORD */}
        {activeSection === "dashboard" && (
          <>
            <section className="welcome-banner">
              <div>
                <span>ESPACE ADMINISTRATEUR</span>
                <h2>Bienvenue sur DiplomaChain</h2>
                <p>
                  Gérez les diplômes et consultez les
                  enregistrements de votre établissement.
                </p>
              </div>

              <div className="welcome-icon">🎓</div>
            </section>

            <section className="stats-grid">
              <div className="dashboard-stat">
                <div className="stat-icon purple-icon">▤</div>
                <div>
                  <span>Total des diplômes</span>
                  <strong>{diplomas.length}</strong>
                  <small>Diplômes enregistrés</small>
                </div>
              </div>

              <div className="dashboard-stat">
                <div className="stat-icon green-icon">✓</div>
                <div>
                  <span>Diplômes valides</span>
                  <strong>{validDiplomas}</strong>
                  <small>Non révoqués</small>
                </div>
              </div>

              <div className="dashboard-stat">
                <div className="stat-icon orange-icon">⚠</div>
                <div>
                  <span>Diplômes révoqués</span>
                  <strong>{revokedDiplomas}</strong>
                  <small>Révoqués par l'établissement</small>
                </div>
              </div>
            </section>

            <section className="dashboard-panel">
              <div className="panel-heading">
                <div>
                  <h2>Diplômes récents</h2>
                  <p>Les derniers diplômes enregistrés</p>
                </div>

                <button
                  className="text-action"
                  onClick={() => setActiveSection("list")}
                >
                  Voir tout →
                </button>
              </div>

              {diplomas.length === 0 ? (
                <div className="empty-state">
                  <div>📄</div>
                  <h3>Aucun diplôme pour le moment</h3>
                  <p>
                    Commencez par ajouter votre premier diplôme.
                  </p>

                  <button
                    className="primary-button"
                    onClick={() => setActiveSection("add")}
                  >
                    + Ajouter un diplôme
                  </button>
                </div>
              ) : (
                <DiplomaTable
                  diplomas={[...diplomas].reverse().slice(0, 5)}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onRevoke={handleRevoke}
                />
              )}
            </section>
          </>
        )}

        {/* FORMULAIRE */}
        {activeSection === "add" && (
          <section className="dashboard-panel form-panel">
            <div className="panel-heading">
              <div>
                <h2>
                  {editingId !== null
                    ? "Modifier les informations"
                    : "Informations du diplôme"}
                </h2>
                <p>Remplissez tous les champs obligatoires.</p>
              </div>

              <span className="form-icon">🎓</span>
            </div>

            <form onSubmit={handleSubmit} className="diploma-form">
              <div className="form-group">
                <label>Nom complet de l'étudiant *</label>
                <input
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleChange}
                  placeholder="Ex : Ahmed Ben Ali"
                  required
                />
              </div>

              <div className="form-group">
                <label>Numéro du diplôme *</label>
                <input
                  name="diplomaNumber"
                  value={formData.diplomaNumber}
                  onChange={handleChange}
                  placeholder="Ex : DIP-2026-001"
                  required
                />
              </div>

              <div className="form-group">
                <label>Spécialité *</label>
                <input
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleChange}
                  placeholder="Ex : Informatique"
                  required
                />
              </div>

              <div className="form-group">
                <label>Établissement *</label>
                <input
                  name="institution"
                  value={formData.institution}
                  onChange={handleChange}
                  placeholder="Nom de l'université"
                  required
                />
              </div>

              <div className="form-group full-width">
                <label>Date de délivrance *</label>
                <input
                  type="date"
                  name="issueDate"
                  value={formData.issueDate}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* PDF */}
              <div className="form-group full-width">
                <label>Fichier PDF du diplôme *</label>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                />

                {pdfFile && (
                  <p>📄 Fichier sélectionné : {pdfFile.name}</p>
                )}

                {editingId !== null && !pdfFile && (
                  <p>
                    Aucun nouveau fichier sélectionné.
                    L'ancien hash sera conservé.
                  </p>
                )}
              </div>

              {loadingHash && (
                <div className="form-group full-width">
                  <p>Calcul du hash SHA-256 en cours...</p>
                </div>
              )}

              {pdfHash && !loadingHash && (
                <div className="form-group full-width">
                  <label>Hash SHA-256 du diplôme</label>
                  <textarea value={pdfHash} readOnly rows={3} />
                  <small>
                    Empreinte numérique calculée à partir du contenu du PDF.
                  </small>
                </div>
              )}

              <div className="form-actions full-width">
                <button
                  type="submit"
                  className="primary-button"
                  disabled={loadingHash}
                >
                  {editingId !== null
                    ? "Enregistrer les modifications"
                    : "+ Ajouter le diplôme"}
                </button>

                {editingId !== null && (
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={resetForm}
                  >
                    Annuler
                  </button>
                )}
              </div>
            </form>

            {message && (
              <p className={`admin-message ${messageType}`}>
                {message}
              </p>
            )}
          </section>
        )}

        {/* LISTE DES DIPLÔMES */}
        {activeSection === "list" && (
          <section className="dashboard-panel">
            <div className="panel-heading">
              <div>
                <h2>Tous les diplômes</h2>
                <p>{diplomas.length} diplôme(s) enregistré(s)</p>
              </div>

              <button
                className="primary-button"
                onClick={() => {
                  resetForm();
                  setActiveSection("add");
                }}
              >
                + Ajouter
              </button>
            </div>

            {diplomas.length === 0 ? (
              <div className="empty-state">
                <div>📄</div>
                <h3>Aucun diplôme enregistré</h3>
                <p>Les diplômes ajoutés apparaîtront ici.</p>
              </div>
            ) : (
              <DiplomaTable
                diplomas={diplomas}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onRevoke={handleRevoke}
              />
            )}
          </section>
        )}

        {message && activeSection !== "add" && (
          <p className={`admin-message ${messageType}`}>
            {message}
          </p>
        )}
      </main>
    </div>
  );
}

// TABLEAU DES DIPLÔMES
function DiplomaTable({
  diplomas,
  onEdit,
  onDelete,
  onRevoke,
}) {
  return (
    <div className="table-wrapper">
      <table className="diploma-table">
        <thead>
          <tr>
            <th>ÉTUDIANT</th>
            <th>NUMÉRO</th>
            <th>SPÉCIALITÉ</th>
            <th>ÉTABLISSEMENT</th>
            <th>DATE</th>
            <th>STATUT</th>
            <th>ACTIONS</th>
          </tr>
        </thead>

        <tbody>
          {diplomas.map((diploma) => (
            <tr key={diploma.id}>
              <td className="student-cell">
                {diploma.studentName}
              </td>

              <td>
                <span className="diploma-number">
                  {diploma.diplomaNumber}
                </span>
              </td>

              <td>{diploma.specialty}</td>
              <td>{diploma.institution}</td>
              <td>{diploma.issueDate}</td>

              <td>
                {diploma.revoked ? (
                  <span className="revoked-status">
                    Révoqué
                  </span>
                ) : (
                  <span className="valid-status">
                    Valide
                  </span>
                )}
              </td>

              <td>
                <div className="table-actions">
                  {!diploma.revoked && (
                    <>
                      <button
                        className="edit-button"
                        onClick={() => onEdit(diploma)}
                        title="Modifier"
                      >
                        ✎
                      </button>

                      <button
                        className="revoke-button"
                        onClick={() => onRevoke(diploma.id)}
                        title="Révoquer le diplôme"
                      >
                        Révoquer
                      </button>
                    </>
                  )}

                  <button
                    className="delete-button"
                    onClick={() => onDelete(diploma.id)}
                    title="Supprimer"
                  >
                    ×
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Admin;
