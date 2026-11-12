import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";

const CHAIN_ID = 11155111; // Sepolia
const addressesFile = `ignition/deployments/chain-${CHAIN_ID}/deployed_addresses.json`;
const artifactFile = "artifacts/contracts/Diplome.sol/Diplomes.json";
const outDir = "frontend/src/contract";

if (!existsSync(addressesFile)) {
  throw new Error(`Fichier introuvable : ${addressesFile}. Déployez d'abord sur Sepolia (tâche 8.2).`);
}
if (!existsSync(artifactFile)) {
  throw new Error(`Fichier introuvable : ${artifactFile}. Lancez d'abord : npx hardhat build`);
}

const addresses = JSON.parse(readFileSync(addressesFile, "utf8"));
const address = addresses["DiplomesModule#Diplomes"];
if (!address) {
  throw new Error("Adresse de DiplomesModule#Diplomes introuvable dans deployed_addresses.json");
}

const artifact = JSON.parse(readFileSync(artifactFile, "utf8"));

mkdirSync(outDir, { recursive: true });
writeFileSync(
  `${outDir}/diplomes.json`,
  JSON.stringify({ address, chainId: CHAIN_ID, abi: artifact.abi }, null, 2)
);

console.log("OK : adresse et ABI écrits dans", `${outDir}/diplomes.json`);
console.log("Adresse du contrat :", address);
console.log("Etherscan : https://sepolia.etherscan.io/address/" + address);
