
import { useState } from "react";
import { calculerHash } from "./hashUtils";

function TestHash() {
  const [hash, setHash] = useState("");

  async function handleFile(e) {
    const file = e.target.files[0];

    if (!file) return;

    const resultat = await calculerHash(file);

    setHash(resultat);
  }

  return (
    <div>
      <h2>Test SHA-256</h2>

      <input
        type="file"
        accept=".pdf"
        onChange={handleFile}
      />

      {hash && (
        <p>
          Hash : {hash}
        </p>
      )}
    </div>
  );
}

export default TestHash;
