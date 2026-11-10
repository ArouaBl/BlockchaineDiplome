
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  const [activeSection, setActiveSection] = useState("dashboard");

  useEffect(() => {
    localStorage.setItem("diplomas", JSON.stringify(diplomas));
  }, [diplomas]);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function resetForm() {
    setFormData({
      studentName: "",
      diplomaNumber: "",
      specialty: "",
      institution: "",
      issueDate: "",
    });
    setEditingId(null);
    setMessage("");
  }

  function handleSubmit(e) {
    e.preventDefault();

    const duplicate = diplomas.some(
      (d) =>
        d.diplomaNumber.toLowerCase() ===
          formData.diplomaNumber.trim().toLowerCase() &&
        d.id !== editingId
    );

    if (duplicate) {
      setMessage("Ce numéro de diplôme existe déjà.");
      return;
    }

    const cleanedData = {
      ...formData,
      diplomaNumber: formData.diplomaNumber.trim(),
    };

    if (editingId !== null) {
      setDiplomas((previous) =>
        previous.map((d) =>
          d.id === editingId ? { ...d, ...cleanedData } : d
        )
      );
      setMessage("Diplôme modifié avec succès.");
    } else {
      setDiplomas((previous) => [
        ...previous,
        { id: Date.now(), ...cleanedData },
      ]);
      setMessage("Diplôme ajouté avec succès.");
    }

    setFormData({
      studentName: "",
      diplomaNumber: "",
      specialty: "",
      institution: "",
      issueDate: "",
    });
    setEditingId(null);
  }

  function handleEdit(diploma) {
    setFormData({
      studentName: diploma.studentName,
      diplomaNumber: diploma.diplomaNumber,
      specialty: diploma.specialty,
      institution: diploma.institution,
      issueDate: diploma.issueDate,
    });
    setEditingId(diploma.id);
    setActiveSection("add");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDelete(id) {
    if (!window.confirm("Voulez-vous vraiment supprimer ce diplôme ?")) {
      return;
    }

    setDiplomas((previous) => previous.filter((d) => d.id !== id));

    if (editingId === id) resetForm();

    setMessage("Diplôme supprimé avec succès.");
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <Link to="/" className="sidebar-brand">
          <img src="/diplomachain-logo.png" alt="DiplomaChain" />
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
            setActiveSection("add");
            resetForm();
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

        {activeSection === "dashboard" && (
          <>
            <section className="welcome-banner">
              <div>
                <span>ESPACE ADMINISTRATEUR</span>
                <h2>Bienvenue sur DiplomaChain</h2>
                <p>
                  Gérez les diplômes et consultez les enregistrements de votre
                  établissement.
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
                  <span>Diplômes délivrés</span>
                  <strong>{diplomas.length}</strong>
                  <small>Dans votre espace local</small>
                </div>
              </div>

              <div className="dashboard-stat">
                <div className="stat-icon orange-icon">◷</div>
                <div>
                  <span>Diplômes aujourd'hui</span>
                  <strong>
                    {diplomas.filter((d) => d.issueDate === today).length}
                  </strong>
                  <small>Délivrés aujourd'hui</small>
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
                  <p>Commencez par ajouter votre premier diplôme.</p>
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
                />
              )}
            </section>
          </>
        )}

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

              <div className="form-actions full-width">
                <button type="submit" className="primary-button">
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

            {message && <p className="admin-message">{message}</p>}
          </section>
        )}

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
              />
            )}
          </section>
        )}
      </main>
    </div>
  );
}

function DiplomaTable({ diplomas, onEdit, onDelete }) {
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
            <th>ACTIONS</th>
          </tr>
        </thead>

        <tbody>
          {diplomas.map((diploma) => (
            <tr key={diploma.id}>
              <td className="student-cell">{diploma.studentName}</td>
              <td>
                <span className="diploma-number">
                  {diploma.diplomaNumber}
                </span>
              </td>
              <td>{diploma.specialty}</td>
              <td>{diploma.institution}</td>
              <td>{diploma.issueDate}</td>
              <td>
                <div className="table-actions">
                  <button
                    className="edit-button"
                    onClick={() => onEdit(diploma)}
                    title="Modifier"
                  >
                    ✎
                  </button>
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
