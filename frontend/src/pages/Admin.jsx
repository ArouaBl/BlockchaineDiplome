
import { useState, useEffect } from "react";
import { BrowserProvider } from "ethers";
import { Link } from "react-router-dom";
import { calculerHash } from "../utils/hashUtils";
import { uploadToIpfs } from "../utils/ipfs";
import {
  connecterWallet,
  verifierReseauSepolia,
  estRejetMetaMask,
} from "../blockchain/wallet.js";

import {
  obtenirContrat,
  CONTRACT_ADDRESS,
} from "../blockchain/contract.js";

import "./Admin.css";

function Admin() {
  const [diplomas, setDiplomas] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("diplomas") || "[]");
    } catch {
      return [];
    }
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
  const [loadingTransaction, setLoadingTransaction] = useState(false);

  // États de vérification du propriétaire
  const [isOwner, setIsOwner] = useState(false);
  const [ownerAddress, setOwnerAddress] = useState("");
  const [connectedAddress, setConnectedAddress] = useState("");
  const [checkingOwner, setCheckingOwner] = useState(true);

  function afficherMessage(texte, type = "info") {
    setMessage(texte);
    setMessageType(type);
  }

  // Vérifier automatiquement le propriétaire du contrat
  useEffect(() => {
    let actif = true;

    async function verifierProprietaire() {
      if (!window.ethereum) {
        if (actif) {
          setIsOwner(false);
          setCheckingOwner(false);
          setConnectedAddress("");
          afficherMessage(
            "MetaMask n'est pas installé. Accès administrateur indisponible.",
            "warning"
          );
        }
        return;
      }

      try {
        if (actif) {
          setCheckingOwner(true);
          setIsOwner(false);
        }

        // Lire les comptes déjà connectés sans ouvrir MetaMask
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });

        if (!actif) return;

        if (!accounts || accounts.length === 0) {
          setIsOwner(false);
          setConnectedAddress("");
          setOwnerAddress("");
          afficherMessage(
            "Veuillez connecter MetaMask pour vérifier vos autorisations.",
            "warning"
          );
          return;
        }

        const provider = new BrowserProvider(window.ethereum);

        // Vérifier le réseau
        const network = await provider.getNetwork();

        if (network.chainId !== 11155111n) {
          setIsOwner(false);
          setConnectedAddress(accounts[0]);
          setOwnerAddress("");
          afficherMessage(
            "Veuillez sélectionner le réseau Ethereum Sepolia dans MetaMask.",
            "warning"
          );
          return;
        }

        // Lire le véritable propriétaire depuis la blockchain
        const contrat = obtenirContrat(provider);
        const owner = await contrat.owner();

        if (!actif) return;

        const adresseConnectee = accounts[0];

        setConnectedAddress(adresseConnectee);
        setOwnerAddress(owner);

        // Comparaison des adresses
        const proprietaire =
          adresseConnectee.toLowerCase() === owner.toLowerCase();

        setIsOwner(proprietaire);

        if (proprietaire) {
          afficherMessage(
            "Compte propriétaire vérifié. Toutes les actions administrateur sont autorisées.",
            "success"
          );
        } else {
          afficherMessage(
            "Accès en lecture seule : ce compte MetaMask n'est pas propriétaire du Smart Contract.",
            "warning"
          );
        }
      } catch (error) {
        console.error("Erreur de vérification du propriétaire :", error);

        if (actif) {
          setIsOwner(false);
          afficherMessage(
            "Impossible de vérifier le propriétaire du Smart Contract.",
            "error"
          );
        }
      } finally {
        if (actif) {
          setCheckingOwner(false);
        }
      }
    }

    verifierProprietaire();

    // Vérifier à nouveau si le compte MetaMask change
    function handleAccountsChanged() {
      verifierProprietaire();
    }

    // Vérifier à nouveau si le réseau change
    function handleChainChanged() {
      verifierProprietaire();
    }

    window.ethereum?.on("accountsChanged", handleAccountsChanged);
    window.ethereum?.on("chainChanged", handleChainChanged);

    return () => {
      actif = false;
      window.ethereum?.removeListener(
        "accountsChanged",
        handleAccountsChanged
      );
      window.ethereum?.removeListener(
        "chainChanged",
        handleChainChanged
      );
    };
  }, []);

  // Sauvegarder les diplômes localement
  useEffect(() => {
    localStorage.setItem("diplomas", JSON.stringify(diplomas));
  }, [diplomas]);

  // Modifier les champs
  function handleChange(e) {
    setFormData((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  }

  // Vérification supplémentaire avant chaque transaction
  async function connecterProprietaire() {
    const { signer, provider } = await connecterWallet();

    await verifierReseauSepolia(provider);

    const adresse = await signer.getAddress();
    const contrat = obtenirContrat(signer);
    const owner = await contrat.owner();

    if (adresse.toLowerCase() !== owner.toLowerCase()) {
      setIsOwner(false);

      throw new Error(
        "Accès refusé : le compte MetaMask connecté n'est pas propriétaire du Smart Contract."
      );
    }

    setOwnerAddress(owner);
    setConnectedAddress(adresse);
    setIsOwner(true);

    return { contrat, signer };
  }

  // Sélectionner un PDF et calculer son hash
  async function handleFileChange(e) {
    if (!isOwner) {
      afficherMessage("Accès refusé : compte non propriétaire.", "error");
      return;
    }

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

      afficherMessage("Erreur lors du calcul du hash du PDF.", "error");

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

    if (!isOwner) {
      afficherMessage("Accès refusé : compte non propriétaire.", "error");
      return;
    }

    if (loadingHash || loadingTransaction) {
      afficherMessage(
        "Veuillez attendre la fin de l'opération.",
        "warning"
      );
      return;
    }

    const cleanedData = {
      ...formData,
      studentName: formData.studentName.trim(),
      diplomaNumber: formData.diplomaNumber.trim(),
      specialty: formData.specialty.trim(),
      institution: formData.institution.trim(),
    };

    if (
      !cleanedData.studentName ||
      !cleanedData.diplomaNumber ||
      !cleanedData.specialty ||
      !cleanedData.institution ||
      !cleanedData.issueDate
    ) {
      afficherMessage(
        "Veuillez remplir tous les champs obligatoires.",
        "error"
      );
      return;
    }

    const duplicate = diplomas.some(
      (d) =>
        d.diplomaNumber?.toLowerCase() ===
          cleanedData.diplomaNumber.toLowerCase() &&
        d.id !== editingId
    );

    if (duplicate) {
      afficherMessage("Ce numéro de diplôme existe déjà.", "error");
      return;
    }

    // Modification locale
    if (editingId !== null) {
      const oldDiploma = diplomas.find((d) => d.id === editingId);

      if (!oldDiploma) {
        afficherMessage("Diplôme introuvable.", "error");
        return;
      }

      if (pdfFile) {
        afficherMessage(
          "Le PDF ne peut pas être remplacé après son enregistrement sur la blockchain. Le hash original doit être conservé.",
          "warning"
        );
        return;
      }

      setDiplomas((previous) =>
        previous.map((d) =>
          d.id === editingId ? { ...d, ...cleanedData } : d
        )
      );

      afficherMessage(
        "Informations du diplôme modifiées. Le hash blockchain est conservé.",
        "success"
      );

      resetForm();
      return;
    }

    if (!pdfFile || !pdfHash) {
      afficherMessage(
        "Veuillez sélectionner le fichier PDF du diplôme.",
        "error"
      );
      return;
    }

    try {
      setLoadingTransaction(true);

      afficherMessage(
        "Connexion à MetaMask et vérification du propriétaire...",
        "info"
      );

      const { contrat } = await connecterProprietaire();

      const verification = await contrat.verifierDiplome(pdfHash);

      if (verification.existe) {
        throw new Error(
          "Ce PDF est déjà enregistré sur la blockchain."
        );
      }

      afficherMessage("Envoi du PDF sur IPFS...", "info");

      const cid = await uploadToIpfs(pdfFile);

      afficherMessage(
        "Veuillez confirmer la transaction dans MetaMask...",
        "info"
      );

      const transaction = await contrat.emettreDiplome(
        pdfHash,
        cleanedData.studentName,
        cid
      );

      afficherMessage(
        "Transaction envoyée. Attente de confirmation sur Sepolia...",
        "info"
      );

      const receipt = await transaction.wait();

      if (!receipt || receipt.status !== 1) {
        throw new Error("La transaction blockchain a échoué.");
      }

      const newDiploma = {
        id: Date.now(),
        ...cleanedData,
        pdfHash,
        pdfName: pdfFile.name,
        cid,
        revoked: false,
        blockchainTxHash: transaction.hash,
        blockchainAddress: CONTRACT_ADDRESS,
      };

      setDiplomas((previous) => [...previous, newDiploma]);

      afficherMessage(
        "Diplôme enregistré avec succès sur Ethereum Sepolia !",
        "success"
      );

      resetForm();
      setActiveSection("list");
    } catch (error) {
      console.error("Erreur d'enregistrement :", error);

      if (estRejetMetaMask(error)) {
        afficherMessage(
          "Transaction rejetée dans MetaMask. Aucun diplôme n'a été enregistré.",
          "warning"
        );
      } else {
        afficherMessage(
          error.reason ||
            error.shortMessage ||
            error.message ||
            "Une erreur est survenue pendant l'enregistrement.",
          "error"
        );
      }
    } finally {
      setLoadingTransaction(false);
    }
  }

  // Modifier un diplôme
  function handleEdit(diploma) {
    if (!isOwner) {
      afficherMessage("Accès refusé : compte non propriétaire.", "error");
      return;
    }

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

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Supprimer de la liste locale
  function handleDelete(id) {
    if (!isOwner) {
      afficherMessage("Accès refusé : compte non propriétaire.", "error");
      return;
    }

    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer ce diplôme de la liste locale ? Attention : cette action ne supprime pas son enregistrement sur la blockchain."
    );

    if (!confirmed) {
      afficherMessage("Suppression annulée.", "warning");
      return;
    }

    setDiplomas((previous) => previous.filter((d) => d.id !== id));

    if (editingId === id) {
      resetForm();
    }

    afficherMessage(
      "Diplôme supprimé de la liste locale. Son enregistrement blockchain reste permanent.",
      "success"
    );
  }

  // Révoquer un diplôme sur la blockchain
  async function handleRevoke(id) {
    if (!isOwner) {
      afficherMessage("Accès refusé : compte non propriétaire.", "error");
      return;
    }

    const diploma = diplomas.find((d) => d.id === id);

    if (!diploma || diploma.revoked) return;

    if (!diploma.pdfHash) {
      afficherMessage("Ce diplôme ne possède pas de hash.", "error");
      return;
    }

    const confirmed = window.confirm(
      "Voulez-vous vraiment révoquer ce diplôme sur la blockchain ?"
    );

    if (!confirmed) {
      afficherMessage("Révocation annulée.", "warning");
      return;
    }

    try {
      setLoadingTransaction(true);

      afficherMessage(
        "Vérification du compte propriétaire...",
        "info"
      );

      const { contrat } = await connecterProprietaire();

      const verification = await contrat.verifierDiplome(
        diploma.pdfHash
      );

      if (!verification.existe) {
        throw new Error(
          "Ce diplôme n'existe pas sur la blockchain. Il est peut-être uniquement enregistré dans localStorage."
        );
      }

      if (!verification.valide) {
        throw new Error(
          "Ce diplôme est déjà révoqué sur la blockchain."
        );
      }

      afficherMessage(
        "Veuillez confirmer la révocation dans MetaMask...",
        "info"
      );

      const transaction = await contrat.revoquerDiplome(
        diploma.pdfHash
      );

      afficherMessage(
        "Révocation envoyée. Attente de confirmation...",
        "info"
      );

      const receipt = await transaction.wait();

      if (!receipt || receipt.status !== 1) {
        throw new Error("La transaction de révocation a échoué.");
      }

      setDiplomas((previous) =>
        previous.map((d) =>
          d.id === id
            ? {
                ...d,
                revoked: true,
                revokeTxHash: transaction.hash,
              }
            : d
        )
      );

      afficherMessage(
        "Diplôme révoqué avec succès sur la blockchain !",
        "success"
      );
    } catch (error) {
      console.error("Erreur de révocation :", error);

      if (estRejetMetaMask(error)) {
        afficherMessage(
          "Révocation rejetée dans MetaMask. Le diplôme reste inchangé.",
          "warning"
        );
      } else {
        afficherMessage(
          error.reason ||
            error.shortMessage ||
            error.message ||
            "Erreur pendant la révocation.",
          "error"
        );
      }
    } finally {
      setLoadingTransaction(false);
    }
  }

  const validDiplomas = diplomas.filter((d) => !d.revoked).length;
  const revokedDiplomas = diplomas.filter((d) => d.revoked).length;

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

        {isOwner && (
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
        )}

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

        {/* STATUT DU COMPTE */}
        <section className="dashboard-panel">
          <h3>Vérification du propriétaire du Smart Contract</h3>

          {checkingOwner ? (
            <p>Vérification du compte MetaMask en cours...</p>
          ) : (
            <>
              <p>
                <strong>Compte connecté :</strong>{" "}
                {connectedAddress || "Aucun compte connecté"}
              </p>

              <p>
                <strong>Propriétaire du contrat :</strong>{" "}
                {ownerAddress || "Non disponible"}
              </p>

              <p>
                <strong>Autorisation :</strong>{" "}
                {isOwner ? (
                  <span className="valid-status">Propriétaire vérifié</span>
                ) : (
                  <span className="revoked-status">Accès en lecture seule</span>
                )}
              </p>
            </>
          )}
        </section>

        {/* MESSAGE D'ACCÈS */}
        {!checkingOwner && !isOwner && (
          <div className="admin-message warning">
            Accès en lecture seule : vous n'êtes pas le propriétaire du
            Smart Contract. Les actions administrateur sont désactivées.
          </div>
        )}

        {/* TABLEAU DE BORD */}
        {activeSection === "dashboard" && (
          <>
            <section className="welcome-banner">
              <div>
                <span>ESPACE ADMINISTRATEUR</span>
                <h2>Bienvenue sur DiplomaChain</h2>
                <p>
                  Gérez les diplômes et consultez les enregistrements
                  de votre établissement.
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
                  <p>Commencez par ajouter votre premier diplôme.</p>

                  {isOwner && (
                    <button
                      className="primary-button"
                      onClick={() => setActiveSection("add")}
                    >
                      + Ajouter un diplôme
                    </button>
                  )}
                </div>
              ) : (
                <DiplomaTable
                  diplomas={[...diplomas].reverse().slice(0, 5)}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onRevoke={handleRevoke}
                  disabled={loadingTransaction || !isOwner}
                  isOwner={isOwner}
                />
              )}
            </section>
          </>
        )}

        {/* FORMULAIRE */}
        {activeSection === "add" && isOwner && (
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

              <div className="form-group full-width">
                <label>Fichier PDF du diplôme *</label>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  disabled={editingId !== null || loadingTransaction}
                />

                {pdfFile && <p>📄 Fichier sélectionné : {pdfFile.name}</p>}

                {editingId !== null && (
                  <p>
                    Le PDF et son hash blockchain original sont conservés.
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
                  disabled={loadingHash || loadingTransaction}
                >
                  {loadingTransaction
                    ? "Transaction en cours..."
                    : editingId !== null
                      ? "Enregistrer les modifications"
                      : "+ Ajouter le diplôme sur la blockchain"}
                </button>

                {editingId !== null && (
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={resetForm}
                    disabled={loadingTransaction}
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

        {/* ACCÈS REFUSÉ AU FORMULAIRE */}
        {activeSection === "add" && !isOwner && (
          <section className="dashboard-panel">
            <h2>Accès administrateur refusé</h2>
            <p>
              Seul le propriétaire du Smart Contract peut ajouter ou
              modifier des diplômes.
            </p>
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

              {isOwner && (
                <button
                  className="primary-button"
                  onClick={() => {
                    resetForm();
                    setActiveSection("add");
                  }}
                >
                  + Ajouter
                </button>
              )}
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
                disabled={loadingTransaction || !isOwner}
                isOwner={isOwner}
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
  disabled,
  isOwner,
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
                {diploma.revoked ? (
                  <span className="revoked-status">Révoqué</span>
                ) : (
                  <span className="valid-status">Valide</span>
                )}
              </td>

              <td>
                <div className="table-actions">
                  {isOwner && !diploma.revoked && (
                    <>
                      <button
                        className="edit-button"
                        onClick={() => onEdit(diploma)}
                        title="Modifier"
                        disabled={disabled}
                      >
                        ✎
                      </button>

                      <button
                        className="revoke-button"
                        onClick={() => onRevoke(diploma.id)}
                        title="Révoquer le diplôme"
                        disabled={disabled}
                      >
                        Révoquer
                      </button>
                    </>
                  )}

                  {isOwner && (
                    <button
                      className="delete-button"
                      onClick={() => onDelete(diploma.id)}
                      title="Supprimer de la liste locale"
                      disabled={disabled}
                    >
                      ×
                    </button>
                  )}

                  {!isOwner && (
                    <span>Consultation seule</span>
                  )}
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
