// admin_panel/src/pages/RegisterPage.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  "https://artiva-repository.onrender.com/api";

// Styles (similaires à LoginPage pour la cohérence)
const styles = {
  pageContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#f0f2f5",
    fontFamily: "Arial, sans-serif",
  },
  registerBox: {
    padding: "40px",
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    width: "100%",
    maxWidth: "400px",
    textAlign: "center",
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
    textAlign: "left",
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
    padding: "12px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    boxSizing: "border-box",
    fontSize: "16px",
  },
  button: {
    padding: "12px 15px",
    backgroundColor: "#28a745", // Vert pour l'inscription (différent du login)
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    transition: "background-color 0.2s ease-in-out",
  },
  buttonDisabled: {
    backgroundColor: "#6c757d",
    cursor: "not-allowed",
  },
  message: { // Style générique pour les messages (erreur ou succès)
    marginBottom: "15px",
    fontSize: "14px",
    textAlign: "center",
    padding: "10px",
    borderRadius: "4px",
  },
  errorMessage: {
    color: "#721c24", // Texte rouge foncé
    backgroundColor: "#f8d7da", // Fond rose clair
    borderColor: "#f5c6cb", // Bordure rose
  },
  successMessage: {
    color: "#155724", // Texte vert foncé
    backgroundColor: "#d4edda", // Fond vert clair
    borderColor: "#c3e6cb", // Bordure verte
  },
  loginLink: {
    marginTop: "25px",
    fontSize: "14px",
    color: "#555",
  },
  link: {
    color: "#007bff", // Bleu pour les liens
    textDecoration: "none",
    fontWeight: "bold",
  }
};

function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const [role, setRole] = useState("admin"); // Décommentez si vous ajoutez un sélecteur de rôle
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    if (!email || !password) {
      setError("Veuillez remplir tous les champs obligatoires.");
      setIsLoading(false);
      return;
    }

    try {
      const url = `${API_BASE_URL}/auth/admin/register`;
      // Puisque nous n'ajoutons pas de champ 'name' au formulaire pour l'instant
      const payload = { email, password };
      // Si vous activez le sélecteur de rôle plus tard :
      // const payload = { email, password, role };

      console.log("Appel API - URL:", url);
      console.log("Appel API - Payload:", payload);
      const response = await axios.post(url, payload);
      console.log("Réponse API:", response.data);

      setSuccessMessage(
        response.data.message + " Redirection vers la connexion..."
      );
      console.log("Inscription Admin réussie:", response.data.admin);

      setEmail("");
      setPassword("");
      // setRole("admin"); // Si vous utilisez le sélecteur de rôle

      setTimeout(() => {
        navigate("/login");
      }, 2000); // Délai un peu plus long pour lire le message de succès
    } catch (err) {
      console.error("Erreur d'inscription admin:", err);
      setError(
        err.response?.data?.message ||
          "Erreur lors de l'inscription. Vérifiez les informations ou problème serveur."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.registerBox}>
        <h2 style={styles.title}>Inscription Administrateur</h2>
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
              minLength="6" // Bon de garder une validation minimale
              style={styles.input}
              placeholder="Minimum 6 caractères"
            />
          </div>

          {/* Champ de sélection de rôle (commenté par défaut) */}
          {/*
          <div style={styles.inputGroup}>
            <label htmlFor="role" style={styles.label}>Rôle (Optionnel)</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={styles.input} // Utilise le même style que les inputs
            >
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          */}

          {error && (
            <p style={{ ...styles.message, ...styles.errorMessage }}>{error}</p>
          )}
          {successMessage && (
            <p style={{ ...styles.message, ...styles.successMessage }}>
              {successMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              ...styles.button,
              ...(isLoading ? styles.buttonDisabled : {}),
            }}
          >
            {isLoading ? "Inscription..." : "S'inscrire"}
          </button>
        </form>
        <p style={styles.loginLink}>
          Vous avez déjà un compte ?{" "}
          <Link to="/login" style={styles.link}>
            Connectez-vous ici
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;