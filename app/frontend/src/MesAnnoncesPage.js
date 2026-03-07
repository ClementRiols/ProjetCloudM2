import React from "react";
import { Link } from "react-router-dom";

function MesAnnoncesPage() {
  return (
    <div className="page">
      <div className="page-top">
        <Link to="/" className="back-home">← Retour à l’accueil</Link>
      </div>

      <h2>Mes annonces</h2>
      <p>À implémenter : modifier / supprimer mes annonces.</p>
    </div>
  );
}

export default MesAnnoncesPage;