import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./Home";
import CreatePage from "./CreatePage";
import ListePage from "./ListePage";
import MesAnnoncesPage from "./MesAnnoncesPage";

import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import ProtectedRoute from "./ProtectedRoute";

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
            {/* Auth */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Optionnel : rediriger toute route inconnue */}
            <Route path="*" element={<Navigate to="/" replace />} />

            {/* Protected */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create"
              element={
                <ProtectedRoute>
                  <CreatePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/annonces"
              element={
                <ProtectedRoute>
                  <ListePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mes-annonces"
              element={
                <ProtectedRoute>
                  <MesAnnoncesPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </main>
    </Router>
  );
}

export default App;