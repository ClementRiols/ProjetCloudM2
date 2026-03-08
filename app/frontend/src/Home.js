import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userEmail");
    navigate("/login", { replace: true });
  };

  return (
    <div className="page home">
      <h2>Bienvenue sur Retrouvéo</h2>

      <p className="home-subtitle">
        Publiez et consultez des annonces d’objets perdus ou trouvés en toute simplicité.
      </p>

      <div className="home-actions">
        {/* Accès à la page de création d’annonce */}
        <button className="btn btn-primary" onClick={() => navigate("/create")}>
          Créer une annonce
        </button>

        {/* Accès à la liste des annonces */}
        <button className="btn btn-ghost" onClick={() => navigate("/annonces")}>
          Voir les annonces
        </button>

        {/* Fonctionnalité optionnelle actuellement désactivée */}
        {/* <button className="btn btn-ghost" onClick={() => navigate("/mes-annonces")}>
          Mes annonces
        </button> */}

        {/* Déconnexion de l’utilisateur */}
        <button className="btn btn-ghost" onClick={handleLogout}>
          Déconnexion
        </button>
      </div>
    </div>
  );
}

export default Home;