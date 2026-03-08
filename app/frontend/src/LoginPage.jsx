import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:3000";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const onLogin = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return alert(data?.error || "Erreur de connexion.");

      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("userEmail", data.user.email);
      nav("/", { replace: true });
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
            <h2 className="auth-title">Connexion</h2>
            <p className="auth-subtitle">
              Connectez-vous pour publier et consulter des annonces.
            </p>
          </div>

          <form className="auth-form" onSubmit={onLogin}>
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
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="auth-actions">
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? "Connexion..." : "Se connecter"}
              </button>

              <Link className="btn btn-ghost" to="/register">
                Créer un compte
              </Link>
            </div>

            <p className="auth-hint">Si vous n’avez pas de compte, créez-en un.</p>
          </form>
        </div>
      </div>
    </div>
  );
}