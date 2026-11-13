// Tâche 8.6 : émet un diplôme de test sur Sepolia à partir d'un vrai PDF.
// PowerShell :
//   $env:PDF_PATH="C:\chemin\vers\diplome.pdf"
//   $env:NOM_ETUDIANT="Ali Test"        (optionnel)
//   $env:CID=""                          (optionnel : CID IPFS)
//   npx hardhat run scripts/emettre-test.ts
import { network } from "hardhat";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const pdfPath = process.env.PDF_PATH;
if (!pdfPath) {
  throw new Error("Définissez PDF_PATH avec le chemin du PDF à enregistrer.");
}
const nom = process.env.NOM_ETUDIANT ?? "Ali Test";
const cid = process.env.CID ?? "";

const hash = "0x" + createHash("sha256").update(readFileSync(pdfPath)).digest("hex");

const deployed = JSON.parse(
  readFileSync("ignition/deployments/chain-11155111/deployed_addresses.json", "utf8")
);
const address: string = deployed["DiplomesModule#Diplomes"];
if (!address) {
  throw new Error("Contrat non déployé sur Sepolia (tâche 8.2).");
}

const { ethers } = await network.create({ network: "sepolia", chainType: "l1" });
const diplomes = await ethers.getContractAt("Diplomes", address);

console.log("Hash du PDF :", hash);
console.log("Envoi de la transaction (attendez la confirmation)...");

const tx = await diplomes.emettreDiplome(hash, nom, cid);
await tx.wait();
console.log("Transaction confirmée :", "https://sepolia.etherscan.io/tx/" + tx.hash);

const [existe, valide, nomLu, , date] = await diplomes.verifierDiplome(hash);
console.log("Lecture du contrat -> existe:", existe, "| valide:", valide, "| nom:", nomLu, "| date:", date.toString());