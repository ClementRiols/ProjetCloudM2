import { useEffect, useState, useCallback } from "react";

function ListePage() {
  const [annonces, setAnnonces] = useState([]);
  const [filterTitle, setFilterTitle] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterType, setFilterType] = useState(""); // nouveau filtre

  const parseDynamoItem = (item) => {
    const obj = {};
    for (let key in item) {
      if (item[key].S !== undefined) obj[key] = item[key].S;
      else if (item[key].N !== undefined) obj[key] = item[key].N;
      else obj[key] = item[key];
    }
    return obj;
  };

  const fetchAnnonces = useCallback(() => {
    fetch("http://localhost:3000/annonces")
      .then((res) => res.json())
      .then((data) => {
        const parsed = data.map(parseDynamoItem);
        setAnnonces(parsed);
      })
      .catch((err) => console.error("Erreur fetch annonces:", err));
  }, []);

  useEffect(() => {
    fetchAnnonces();
  }, [fetchAnnonces]);

  const resolveAnnonce = async (pk) => {
    const annonceId = pk.split("#")[1];
    const res = await fetch(`http://localhost:3000/annonces/${annonceId}/resolve`, { method: "PATCH" });
    if (res.ok) fetchAnnonces();
    else alert("Impossible de clôturer l'annonce");
  };

  // Filtrage avec le type
  const filteredAnnonces = annonces.filter((a) => {
    const titleMatch = a.title?.toLowerCase().includes(filterTitle.toLowerCase());
    const locationMatch = (a.location || "").toLowerCase().includes(filterLocation.toLowerCase());
    const dateMatch = !filterDate || (a.eventDate || "").startsWith(filterDate);
    const typeMatch = !filterType || (a.type || "").toLowerCase() === filterType.toLowerCase();
    return titleMatch && locationMatch && dateMatch && typeMatch;
  });

  return (
    <div className="page-container">
      <h2>Liste des annonces</h2>

      {/* FILTRES */}
      <div className="filters" style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Filtrer par titre"
          value={filterTitle}
          onChange={(e) => setFilterTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filtrer par lieu"
          value={filterLocation}
          onChange={(e) => setFilterLocation(e.target.value)}
        />
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="">Tous types</option>
          <option value="PERDU">Perdu</option>
          <option value="TROUVE">Trouvé</option>
        </select>
      </div>

      {filteredAnnonces.length === 0 ? (
        <p>Aucune annonce correspondante</p>
      ) : (
        <ul className="annonce-list" style={{ padding: 0, listStyle: "none" }}>
          {filteredAnnonces.map((a) => (
            <li
              key={a.pk}
              className="annonce-item"
              style={{
                border: "1px solid #ccc",
                marginBottom: "10px",
                padding: "10px",
                borderRadius: "5px",
              }}
            >
              <div
                className="annonce-header"
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <strong>{a.title || "-"}</strong>
                <span>{a.status || "OPEN"}</span>
              </div>

              <p><strong>Type:</strong> {a.type || "-"}</p>
              <p><strong>Description:</strong> {a.description || "-"}</p>
              <p><strong>Lieu:</strong> {a.location || "-"}</p>
              <p><strong>Date:</strong> {a.eventDate ? new Date(a.eventDate).toLocaleDateString() : "-"}</p>

              {a.imageKey && (
                <img
                  src={`http://localhost:4566/${a.imageKey}`}
                  alt="Annonce"
                  className="annonce-image"
                  style={{ maxWidth: "200px", marginTop: "10px" }}
                />
              )}

              {a.status === "OPEN" && (
                <button
                  className="resolve-btn"
                  style={{ marginTop: "10px" }}
                  onClick={() => resolveAnnonce(a.pk)}
                >
                  Clôturer
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ListePage;