import { useEffect, useMemo, useState, useCallback } from "react";

const API_BASE = "http://localhost:3000";
const LOCALSTACK_BASE = "http://localhost:4566";
const S3_BUCKET = "lostfound-images";

function ListePage() {
  const [annonces, setAnnonces] = useState([]);
  const [filterTitle, setFilterTitle] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterType, setFilterType] = useState("");

  const fetchAnnonces = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/annonces`);
      const data = await res.json();
      setAnnonces(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur fetch annonces:", err);
    }
  }, []);

  useEffect(() => {
    fetchAnnonces();
  }, [fetchAnnonces]);

  const resolveAnnonce = async (pk) => {
    const annonceId = (pk || "").split("#")[1];
    if (!annonceId) return alert("Identifiant d'annonce invalide.");

    const res = await fetch(`${API_BASE}/annonces/${annonceId}/resolve`, { method: "PATCH" });
    const data = await res.json().catch(() => ({}));

    if (res.ok) fetchAnnonces();
    else alert(data?.error || "Impossible de clôturer l'annonce.");
  };

  const filteredAnnonces = useMemo(() => {
    const t = filterTitle.toLowerCase();
    const l = filterLocation.toLowerCase();
    const ty = filterType.toLowerCase();

    return annonces.filter((a) => {
      const title = (a.title || "").toString().toLowerCase();
      const location = (a.location || "").toString().toLowerCase();
      const type = (a.type || "").toString().toLowerCase();
      const date = (a.eventDate || "").toString();

      const titleMatch = title.includes(t);
      const locationMatch = location.includes(l);
      const dateMatch = !filterDate || date.startsWith(filterDate);
      const typeMatch = !filterType || type === ty;

      return titleMatch && locationMatch && dateMatch && typeMatch;
    });
  }, [annonces, filterTitle, filterLocation, filterDate, filterType]);

  return (
    <div className="page-container">
      <h2>Liste des annonces</h2>

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
        <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="">Tous types</option>
          <option value="PERDU">Perdu</option>
          <option value="TROUVE">Trouvé</option>
        </select>

        <button onClick={fetchAnnonces}>Rafraîchir</button>
      </div>

      <p>
        Total: <strong>{filteredAnnonces.length}</strong>
      </p>

      {filteredAnnonces.length === 0 ? (
        <p>Aucune annonce correspondante.</p>
      ) : (
        <ul className="annonce-list" style={{ padding: 0, listStyle: "none" }}>
          {filteredAnnonces.map((a) => {
            const annonceId = (a.pk || "").split("#")[1] || "";
            const imageUrl = a.imageKey
              ? `${LOCALSTACK_BASE}/${S3_BUCKET}/${a.imageKey}`
              : null;

            return (
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
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong>{a.title || "-"}</strong>
                  <span>{a.status || "OPEN"}</span>
                </div>

                <p><strong>Type :</strong> {a.type || "-"}</p>
                <p><strong>Description :</strong> {a.description || "-"}</p>
                <p><strong>Lieu :</strong> {a.location || "-"}</p>
                <p>
                  <strong>Date :</strong>{" "}
                  {a.eventDate ? new Date(a.eventDate).toLocaleDateString("fr-FR") : "-"}
                </p>

                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt="Image de l'annonce"
                    style={{ maxWidth: "240px", marginTop: "10px", display: "block" }}
                  />
                )}

                {a.status === "OPEN" && (
                  <button style={{ marginTop: "10px" }} onClick={() => resolveAnnonce(a.pk)}>
                    Clôturer
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default ListePage;