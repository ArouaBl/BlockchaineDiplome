
import { connecterWallet, verifierReseauSepolia } from "../blockchain/wallet.js";
import { obtenirContrat, testerContrat } from "../blockchain/contract.js";
import { calculerHash } from "./hashUtils.js";

// Vérifier un diplôme à partir de son fichier PDF
export async function verifierDiplome(file) {
  // 1. Calculer le hash du PDF
  const hash = await calculerHash(file);

  // 2. Connecter MetaMask en lecture
  const { provider } = await connecterWallet();

  // 3. Vérifier le réseau Sepolia
  await verifierReseauSepolia(provider);

  // 4. Récupérer le Smart Contract
  const contrat = await testerContrat(provider);

  // 5. Lire les informations du diplôme sur la blockchain
  const reponse = await contrat.verifierDiplome(hash);

  // 6. Retourner les vraies données
  return {
    existe: reponse[0],
    valide: reponse[1],
    nom: reponse[2],
    cid: reponse[3],
    date: Number(reponse[4])
  };
}
