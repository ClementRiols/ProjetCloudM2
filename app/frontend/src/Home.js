import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="app-container">
      <h2>Fonctionnalités</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <button onClick={() => navigate("/create")}>
          Créer une annonce
        </button>

        <button onClick={() => navigate("/annonces")}>
          Voir les annonces
        </button>

        <button onClick={() => navigate("/mes-annonces")}>
          Mes annonces
        </button>
      </div>
    </div>
  );
}

export default Home;