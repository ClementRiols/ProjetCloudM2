import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home";
import CreatePage from "./CreatePage";
import ListePage from "./ListePage";
import MesAnnoncesPage from "./MesAnnoncesPage";

function App() {
  return (
    <Router>
      <header className="header">
        <div className="header-left">
          <div className="brand-mark" aria-hidden="true">
            <img src="/logo.svg" alt="" />
          </div>

          <div className="header-text">
            <h1>Retrouvéo</h1>
            <p>Objets perdus &amp; trouvés</p>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="app-container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreatePage />} />
            <Route path="/annonces" element={<ListePage />} />
            <Route path="/mes-annonces" element={<MesAnnoncesPage />} />
          </Routes>
        </div>
      </main>
    </Router>
  );
}

export default App;