import { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";

const API_BASE = "http://localhost:3000";
const LOCALSTACK_BASE = "http://localhost:4566";
const S3_BUCKET = "lostfound-images";
const FALLBACK_IMG = "/default-cover.jpg";

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
    <div className="page">
      <div className="page-top">
        <Link to="/" className="back-home">← Retour à l’accueil</Link>
        <button className="btn btn-primary" onClick={fetchAnnonces}>Rafraîchir</button>
      </div>

      <h2>Liste des annonces</h2>

      <div className="filters">
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

      <p className="meta">
        Total : <strong>{filteredAnnonces.length}</strong>
      </p>

      {filteredAnnonces.length === 0 ? (
        <p>Aucune annonce correspondante.</p>
      ) : (
        <ul className="annonce-list">
          {filteredAnnonces.map((a) => {
            const imageUrl = a.imageKey
              ? `${LOCALSTACK_BASE}/${S3_BUCKET}/${a.imageKey}`
              : null;

            const status = (a.status || "OPEN").toString().toUpperCase();
            const statusLabel = status === "OPEN" ? "OUVERTE" : "CLÔTURÉE";

            return (
              <li key={a.pk} className="annonce-item modern">
                <div className="annonce-header">
                  <div className="annonce-title">
                    <strong className="title-text">{a.title || "-"}</strong>

                    <div className="title-actions">
                      <span className={`status-badge ${status === "OPEN" ? "open" : "closed"}`}>
                        {statusLabel}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="annonce-content">
                  <div className="annonce-image-wrapper">
                    <img
                      src={imageUrl || FALLBACK_IMG}
                      alt="Image de l'annonce"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = FALLBACK_IMG;
                      }}
                    />
                  </div>

                  <div className="annonce-info">
                    <div className="info-row">
                      <span className="info-label">Type</span>
                      <span className={`type-badge ${a.type === "PERDU" ? "lost" : "found"}`}>
                        {a.type || "-"}
                      </span>
                    </div>

                    <div className="info-row">
                      <span className="info-label">Lieu</span>
                      <span>{a.location || "-"}</span>
                    </div>

                    <div className="info-row">
                      <span className="info-label">Date</span>
                      <span>
                        {a.eventDate
                          ? new Date(a.eventDate).toLocaleDateString("fr-FR")
                          : "-"}
                      </span>
                    </div>
                    {(a.mail || a.tel) && (
                      <div className="info-contact">
                        <span className="info-label">Contact :</span>

                        <div className="info-row">
                          <span>Email</span>
                          <span className="info-value align-right">{a.mail || "-"}</span>
                        </div>

                        <div className="info-row">
                          <span>Téléphone</span>
                          <span className="info-value align-right">{a.tel || "-"}</span>
                        </div>
                      </div>
                    )}
                    <div className="info-description">
                      <span className="info-label">Description</span>
                      <p>{a.description || "-"}</p>
                    </div>

                    {status === "OPEN" && (
                      <div className="action-buttons">
                        <button
                          className="btn btn-primary small compact"
                          onClick={() => resolveAnnonce(a.pk)}
                        >
                          Clôturer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default ListePage;