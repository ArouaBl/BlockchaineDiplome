export async function calculerHash(file) {
  const buffer = await file.arrayBuffer();

  const digest = await crypto.subtle.digest("SHA-256", buffer);

  const hashArray = Array.from(new Uint8Array(digest));

  const hex = hashArray
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return "0x" + hex;
}