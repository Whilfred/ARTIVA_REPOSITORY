// admin_panel/src/pages/LoginPage.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://artiva-repository.onrender.com/api";

// Styles (tu pourrais les mettre dans un fichier séparé plus tard)
const styles = {
  pageContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#f0f2f5", // Un fond gris clair
    fontFamily: "Arial, sans-serif", // Police plus standard
  },
  loginBox: {
    padding: "40px",
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", // Ombre portée pour l'effet de carte
    width: "100%",
    maxWidth: "400px", // Largeur max pour le formulaire
    textAlign: "center", // Centrer le titre et le lien
  },
  title: {
    marginBottom: "25px",
    color: "#333",
    fontSize: "24px",
    fontWeight: "bold",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  inputGroup: {
    marginBottom: "20px",
    textAlign: "left", // Aligner les labels à gauche
  },
  label: {
    display: "block",
    marginBottom: "8px",
    color: "#555",
    fontSize: "14px",
    fontWeight: "600",
  },
  input: {
    width: "100%",
    padding: "12px", // Plus de padding
    border: "1px solid #ccc",
    borderRadius: "4px",
    boxSizing: "border-box", // Important pour que padding ne change pas la largeur totale
    fontSize: "16px",
  },
  button: {
    padding: "12px 15px",
    backgroundColor: "#007bff", // Bleu primaire (plus pro que tomato)
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    transition: "background-color 0.2s ease-in-out", // Transition douce
  },
  buttonDisabled: {
    backgroundColor: "#6c757d", // Couleur pour bouton désactivé
    cursor: "not-allowed",
  },
  errorMessage: {
    color: "#dc3545", // Rouge standard pour les erreurs
    marginBottom: "15px",
    fontSize: "14px",
    textAlign: "center",
  },
  registerLink: {
    marginTop: "25px",
    fontSize: "14px",
    color: "#555",
  },
  link: {
    color: "#007bff",
    textDecoration: "none",
    fontWeight: "bold",
  }
};

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
      // Pour le panel admin, la route de login est bien /auth/login
      // mais le backend va vérifier si l'utilisateur trouvé est un admin.
      const response = await axios.post(`${API_BASE_URL}/auth/admin/login`, {
        email,
        password,
      });

      const { token, user } = response.data;

      if (user && user.role === "admin") {
        localStorage.setItem("adminToken", token);
        localStorage.setItem("adminUser", JSON.stringify(user));
        console.log("Connexion Admin réussie:", user);
        navigate("/dashboard"); // Assure-toi que cette route existe et est protégée
      } else if (user) {
        setError("Accès refusé. Seuls les administrateurs peuvent se connecter ici.");
      } else {
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
    <div style={styles.pageContainer}>
      <div style={styles.loginBox}>
        <h2 style={styles.title}>Connexion Administrateur</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label htmlFor="email" style={styles.label}>
              Adresse Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
              placeholder="exemple@domaine.com"
            />
          </div>
          <div style={styles.inputGroup}>
            <label htmlFor="password" style={styles.label}>
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
              placeholder="Votre mot de passe"
            />
          </div>

          {error && <p style={styles.errorMessage}>{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              ...styles.button,
              ...(isLoading ? styles.buttonDisabled : {}), // Applique le style désactivé si isLoading est true
            }}
          >
            {isLoading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
        <p style={styles.registerLink}>
          Pas encore de compte administrateur ?{" "}
          <Link to="/register" style={styles.link}>
            Inscrivez-vous ici
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;