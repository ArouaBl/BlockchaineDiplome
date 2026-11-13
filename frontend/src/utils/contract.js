import { BrowserProvider, JsonRpcProvider, Contract } from "ethers";
import { hashFile } from "./hash";
import data from "../contract/diplomes.json"; // généré par : node scripts/export-to-frontend.mjs

export const CONTRACT_ADDRESS = data.address;
export const CHAIN_ID = data.chainId;

// Lecture : RPC public (marche sans MetaMask, quel que soit le réseau de MetaMask).
// Vous pouvez le remplacer par une autre URL RPC Sepolia.
const PUBLIC_RPC = "https://ethereum-sepolia-rpc.publicnode.com";

function readContract() {
  return new Contract(
    CONTRACT_ADDRESS,
    data.abi,
    new JsonRpcProvider(PUBLIC_RPC),
  );
}

// Écriture : signée par MetaMask.
async function writeContract() {
  if (!window.ethereum) throw new Error("MetaMask n'est pas installé.");
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new Contract(CONTRACT_ADDRESS, data.abi, signer);
}

// Adresse du propriétaire (administrateur) du contrat.
export async function getOwner() {
  return readContract().owner();
}

// Page Verify : PDF -> hash -> lecture du contrat.
export async function verifierDiplome(file) {
  const hash = await hashFile(file);
  const [existe, valide, nom, cid, date] = await readContract().verifierDiplome(
    hash,
  );
  return { hash, existe, valide, nom, cid, date: Number(date) };
}

// Page Admin : le hash (et le CID IPFS) sont calculés avant l'appel.
export async function emettreDiplome(hash, nom, cid = "") {
  const contract = await writeContract();
  const tx = await contract.emettreDiplome(hash, nom, cid);
  await tx.wait();
  return tx.hash;
}

export async function revoquerDiplome(hash) {
  const contract = await writeContract();
  const tx = await contract.revoquerDiplome(hash);
  await tx.wait();
  return tx.hash;
}
