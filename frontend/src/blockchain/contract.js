import { Contract, JsonRpcProvider } from "ethers";

// Adresse du Smart Contract sur Sepolia
export const CONTRACT_ADDRESS = "0x963542734CcDB6F53e120775d6f1333cd62CF331";

// Chain ID de Sepolia
export const CHAIN_ID = 11155111;

// Numéro du bloc où le contrat a été déployé (voir Etherscan, transaction de création).
// Laissez 0 si vous ne le connaissez pas : l'historique lira alors les 50 000 derniers blocs.
export const DEPLOY_BLOCK = 12129216;

// RPC public utilisé pour lire l'historique (sans MetaMask)
const PUBLIC_RPC = "https://ethereum-sepolia-rpc.publicnode.com";

// ABI du Smart Contract
export const CONTRACT_ABI = [
  "function owner() view returns (address)",

  "function emettreDiplome(bytes32 hash, string nom, string cid)",

  "function verifierDiplome(bytes32 hash) view returns (bool existe, bool valide, string nom, string cid, uint256 date)",

  "function revoquerDiplome(bytes32 hash)",

  "event DiplomeEmis(bytes32 indexed hash, string nom, uint256 date)",

  "event DiplomeRevoque(bytes32 indexed hash)",
];

// Créer une instance du Smart Contract
export function obtenirContrat(providerOrSigner) {
  return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, providerOrSigner);
}

// Tester l'existence du Smart Contract
export async function testerContrat(provider) {
  const contrat = obtenirContrat(provider);

  const code = await provider.getCode(CONTRACT_ADDRESS);

  if (code === "0x") {
    throw new Error("Aucun Smart Contract trouvé à cette adresse.");
  }

  return contrat;
}

// Historique : lit les événements DiplomeEmis, puis le statut actuel de chaque diplôme.
// Lecture par tranches de blocs, du plus récent au plus ancien : les RPC publics limitent la
// plage de blocs et "élaguent" (pruned) l'historique ancien, donc on s'arrête dès qu'une
// tranche ancienne n'est plus disponible.
export async function listerDiplomes() {
  const provider = new JsonRpcProvider(PUBLIC_RPC);
  const contrat = obtenirContrat(provider);

  const dernierBloc = await provider.getBlockNumber();
  const debut = DEPLOY_BLOCK || Math.max(0, dernierBloc - 50000);
  const TAILLE = 5000;

  const evenements = [];
  for (let to = dernierBloc; to >= debut; to -= TAILLE) {
    const from = Math.max(debut, to - TAILLE + 1);
    try {
      const lot = await contrat.queryFilter(
        contrat.filters.DiplomeEmis(),
        from,
        to,
      );
      evenements.push(...lot);
    } catch (err) {
      // Même la tranche la plus récente échoue : vraie erreur
      if (to === dernierBloc) throw err;

      console.warn(
        "Historique ancien indisponible (RPC élagué) :",
        err.shortMessage || err.message,
      );
      break;
    }
  }

  const diplomes = await Promise.all(
    evenements.map(async (e) => {
      const r = await contrat.verifierDiplome(e.args.hash);
      return {
        hash: e.args.hash,
        existe: r[0],
        valide: r[1],
        nom: r[2],
        cid: r[3],
        date: Number(r[4]),
      };
    }),
  );

  return diplomes.sort((a, b) => b.date - a.date);
}
