import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:3000";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const onRegister = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return alert(data?.error || "Erreur création compte.");

      alert("Compte créé. Vous pouvez vous connecter.");
      nav("/login", { replace: true });
    } catch (e) {
      console.error(e);
      alert("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card-inner">
          <div>
            <h2 className="auth-title">Créer un compte</h2>
            <p className="auth-subtitle">
              Créez un compte puis connectez-vous pour accéder aux fonctionnalités.
            </p>
          </div>

          <form className="auth-form" onSubmit={onRegister}>
            <div className="auth-row">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                type="password"
                placeholder="Mot de passe (min 6)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="auth-actions">
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? "Création..." : "Créer"}
              </button>

              <Link className="btn btn-ghost" to="/login">
                Retour connexion
              </Link>
            </div>

            <p className="auth-hint">Mot de passe minimum : 6 caractères.</p>
          </form>
        </div>
      </div>
    </div>
  );
}