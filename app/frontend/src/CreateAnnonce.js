import { useState } from "react";

function CreateAnnonce({ onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("PERDU");
  const [eventDate, setEventDate] = useState("");
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    let imageKey;
    if (image) {
      const annonceId = crypto.randomUUID();
      imageKey = `annonces/${annonceId}/cover.jpg`;
      await fetch(`http://localhost:3000/annonces/${annonceId}/image/upload-url`, {
        method: "PUT",
        body: image,
      });
    }

    const res = await fetch("http://localhost:3000/annonces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, location, type, eventDate, imageKey }),
    });

    const data = await res.json();
    onCreated(data);

    setTitle(""); setDescription(""); setLocation(""); setType("PERDU"); setEventDate(""); setImage(null);
  };

  return (
    <form className="create-form" onSubmit={handleSubmit}>
      <input type="text" placeholder="Titre" value={title} onChange={e => setTitle(e.target.value)} required />
      <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
      <input type="text" placeholder="Lieu" value={location} onChange={e => setLocation(e.target.value)} />
      <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} />
      <select value={type} onChange={e => setType(e.target.value)}>
        <option value="PERDU">Perdu</option>
        <option value="TROUVE">Trouvé</option>
      </select>
      <input type="file" onChange={e => setImage(e.target.files[0])} />
      <button type="submit">Créer l'annonce</button>
    </form>
  );
}

export default CreateAnnonce;