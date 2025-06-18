// admin_panel/src/pages/LoginPage.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom"; // <--- AJOUTEZ Link ICI

// **ATTENTION : REMPLACE PAR L'URL DE TON BACKEND EN LOCAL**
// Le commentaire ci-dessus est un peu déroutant maintenant que l'URL pointe vers onrender.com.
// Il est préférable d'utiliser des variables d'environnement pour cela.
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://artiva-repository.onrender.com/api";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      const { token, user } = response.data;

      // Il est plus sûr de vérifier que 'user' et 'user.role' existent avant d'y accéder
      if (user && user.role === "admin") {
        localStorage.setItem("adminToken", token);
        localStorage.setItem("adminUser", JSON.stringify(user));
        console.log("Connexion Admin réussie:", user);
        navigate("/dashboard");
      } else if (user) { // L'utilisateur existe mais n'est pas admin
        setError("Accès refusé. Vous devez être administrateur.");
      } else { // La réponse ne contenait pas d'utilisateur ou était inattendue
        setError("Réponse inattendue du serveur après la connexion.");
      }
    } catch (err) {
      console.error("Erreur de connexion admin:", err);
      setError(
        err.response?.data?.message ||
          "Email ou mot de passe incorrect, ou problème serveur."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
      }}
    >
      <h2>Connexion Administrateur Artiva</h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", width: "300px" }}
      >
        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="password">Mot de passe:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: "10px",
            backgroundColor: "tomato",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          {isLoading ? "Connexion..." : "Se connecter"}
        </button>
        <p style={{ marginTop: "20px" }}>
          Pas encore de compte ? <Link to="/register">Inscrivez-vous ici</Link>
        </p>
      </form>
    </div>
  );
}

export default LoginPage;