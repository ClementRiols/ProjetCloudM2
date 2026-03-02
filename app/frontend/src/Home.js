import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true }); // 比 window.location.href 更干净
  };

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

        {/* Déconnexion */}
        <button className="btn btn-ghost" onClick={handleLogout}>
          Déconnexion
        </button>
      </div>
    </div>
  );
}

export default Home;