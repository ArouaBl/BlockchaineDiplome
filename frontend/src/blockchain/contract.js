
import { Contract } from "ethers";

// Adresse du Smart Contract sur Sepolia
export const CONTRACT_ADDRESS =
  "0x963542734CcDB6F53e120775d6f1333cd62CF331";

// Chain ID de Sepolia
export const CHAIN_ID = 11155111;

// ABI du Smart Contract
export const CONTRACT_ABI = [
  "function owner() view returns (address)",

  "function emettreDiplome(bytes32 hash, string nom, string cid)",

  "function verifierDiplome(bytes32 hash) view returns (bool existe, bool valide, string nom, string cid, uint256 date)",

  "function revoquerDiplome(bytes32 hash)"
];

// Créer une instance du Smart Contract
export function obtenirContrat(providerOrSigner) {
  return new Contract(
    CONTRACT_ADDRESS,
    CONTRACT_ABI,
    providerOrSigner
  );
}

// Tester l'existence du Smart Contract
export async function testerContrat(provider) {
  const contrat = obtenirContrat(provider);

  const code = await provider.getCode(CONTRACT_ADDRESS);

  if (code === "0x") {
    throw new Error(
      "Aucun Smart Contract trouvé à cette adresse."
    );
  }

  return contrat;
}
