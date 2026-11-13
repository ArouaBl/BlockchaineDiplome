
import { useState } from "react";
import {
  connecterWallet,
  verifierReseauSepolia,
} from "../blockchain/wallet";

function ConnexionWallet() {
  const [adresse, setAdresse] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleConnexion() {
    try {
      setLoading(true);
      setMessage("");

      const wallet = await connecterWallet();

      await verifierReseauSepolia(wallet.provider);

      setAdresse(wallet.adresse);
      setMessage("Portefeuille connecté au réseau Sepolia !");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button onClick={handleConnexion} disabled={loading}>
        {loading ? "Connexion..." : "Connecter MetaMask"}
      </button>

      {adresse && (
        <p>Adresse du portefeuille : {adresse}</p>
      )}

      {message && <p>{message}</p>}
    </div>
  );
}

export default ConnexionWallet;
