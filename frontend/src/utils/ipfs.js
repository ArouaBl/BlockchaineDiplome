// Clé dans frontend/.env.local (jamais sur GitHub) : VITE_PINATA_JWT=...
const JWT = import.meta.env.VITE_PINATA_JWT;

export async function uploadToIpfs(file) {
  if (!JWT) throw new Error("Clé Pinata manquante (VITE_PINATA_JWT dans frontend/.env.local).");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("network", "public");

  const response = await fetch("https://uploads.pinata.cloud/v3/files", {
    method: "POST",
    headers: { Authorization: `Bearer ${JWT}` },
    body: formData,
  });

  if (!response.ok) throw new Error("Échec de l'envoi vers IPFS (vérifiez la clé Pinata).");

  const json = await response.json();
  return json.data.cid;
}

export function ipfsUrl(cid) {
  return `https://ipfs.io/ipfs/${cid}`;
}