
import { BrowserProvider } from "ethers";

// Connecter MetaMask
export async function connecterWallet() {
  if (!window.ethereum) {
    throw new Error("MetaMask n'est pas installé.");
  }

  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  return {
    adresse: accounts[0],
    signer,
    provider,
  };
}

// Vérifier si le réseau est Sepolia
export async function verifierReseauSepolia(provider) {
  const network = await provider.getNetwork();

  if (network.chainId !== 11155111n) {
    throw new Error("Veuillez sélectionner le réseau Sepolia dans MetaMask.");
  }

  return true;
}
