import { useState } from "react";

const API_BASE = "http://localhost:3000";

function CreateAnnonce({ onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("PERDU");
  const [eventDate, setEventDate] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);

    /**
     * FR: ID unique généré côté frontend pour:
     *     - lier l'image S3 et l'annonce DynamoDB
     * CN: 前端生成唯一ID，确保图片和DynamoDB公告同一个ID
     */
    const annonceId = crypto.randomUUID();

    try {
      let imageKey = null;

      // 1) Upload image (optionnel) via URL pré-signée
      if (image) {
        const presignRes = await fetch(`${API_BASE}/annonces/${annonceId}/image/upload-url`);
        const { uploadUrl, key } = await presignRes.json();

        await fetch(uploadUrl, {
          method: "PUT",
          body: image,
          headers: { "Content-Type": image.type || "application/octet-stream" },
        });

        imageKey = key;
      }

      // 2) Create annonce via backend -> lambda -> dynamodb
      const res = await fetch(`${API_BASE}/annonces`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ annonceId, title, description, location, type, eventDate, imageKey }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data?.error || "Erreur lors de la création.");
        return;
      }

      onCreated?.(data);

      // Reset
      setTitle("");
      setDescription("");
      setLocation("");
      setType("PERDU");
      setEventDate("");
      setImage(null);

      alert("Annonce créée avec succès.");
    } catch (err) {
      console.error(err);
      alert("Erreur réseau ou serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="create-form" onSubmit={handleSubmit}>
      <h2>Créer une annonce</h2>

      <input
        type="text"
        placeholder="Titre (obligatoire)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <input
        type="text"
        placeholder="Lieu"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />

      <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />

      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="PERDU">Perdu</option>
        <option value="TROUVE">Trouvé</option>
      </select>

      <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />

      <button type="submit" disabled={loading}>
        {loading ? "Création..." : "Créer l'annonce"}
      </button>
    </form>
  );
}

export default CreateAnnonce;