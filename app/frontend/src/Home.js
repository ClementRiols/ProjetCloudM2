import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="page home">
      <h2>Bienvenue sur Retrouvéo</h2>

      <p className="home-subtitle">
        Publiez et consultez des annonces d’objets perdus ou trouvés en toute simplicité.
      </p>

      <div className="home-actions">
        <button className="btn btn-primary" onClick={() => navigate("/create")}>
          Créer une annonce
        </button>

        <button className="btn btn-ghost" onClick={() => navigate("/annonces")}>
          Voir les annonces
        </button>

        <button className="btn btn-ghost" onClick={() => navigate("/mes-annonces")}>
          Mes annonces
        </button>
      </div>
    </div>
  );
}

export default Home;