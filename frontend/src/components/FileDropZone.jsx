import { useState, useRef } from "react";
import { hashFile } from "../utils/hash";
import "./FileDropZone.css";

export default function FileDropZone({ onHash }) {
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [hash, setHash] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  async function handleFile(file) {
    if (!file) return;
    setError("");
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Veuillez déposer un fichier PDF.");
      return;
    }
    try {
      const h = await hashFile(file);
      setFileName(file.name);
      setHash(h);
      if (onHash) onHash(h, file);
    } catch {
      setError("Impossible de calculer l'empreinte du fichier.");
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }

  return (
    <div>
      <div
        className={`dropzone ${dragging ? "dragging" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current.click()}
      >
        <p>Glissez le PDF ici ou cliquez pour choisir un fichier</p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          hidden
          onChange={(e) => handleFile(e.target.files[0])}
        />
      </div>

      {error && <p className="dropzone-error">{error}</p>}

      {hash && (
        <p className="dropzone-hash">
          <strong>{fileName}</strong>
          <br />
          {hash}
        </p>
      )}
    </div>
  );
}