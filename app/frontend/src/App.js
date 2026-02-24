import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home";
import CreatePage from "./CreatePage";
import ListePage from "./ListePage";
import MesAnnoncesPage from "./MesAnnoncesPage";

function App() {
  return (
    <Router>
      <div className="header">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="36"
            height="36"
            fill="white"
            viewBox="0 0 24 24"
          >
            <path d="M21.71 20.29l-3.388-3.388A8.938 8.938 0 0 0 18 10a9 9 0 1 0-9 9 8.938 8.938 0 0 0 6.902-3.678l3.388 3.388a1 1 0 0 0 1.414-1.414zM4 10a6 6 0 1 1 6 6 6.007 6.007 0 0 1-6-6z"/>
          </svg>
          <div>
            <h1 style={{ margin: 0 }}>Trob'Objècte</h1>
            <p style={{ margin: 0, fontSize: "14px" }}>Objet perdu / trouvé</p>
          </div>
        </div>
      </div>

      <div className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreatePage />} />
          <Route path="/annonces" element={<ListePage />} />
          <Route path="/mes-annonces" element={<MesAnnoncesPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;