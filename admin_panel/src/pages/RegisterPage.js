// admin_panel/src/pages/RegisterPage.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  "https://artiva-repository.onrender.com/api";

function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const [role, setRole] = useState("admin"); // Si tu veux envoyer le rôle depuis le front-end
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
      const payload = { email, password /*, name, role si applicable */ };
      console.log("Appel API - URL:", url);
      console.log("Appel API - Payload:", payload);
      const response = await axios.post(url, payload);
      console.log("Réponse API:", response.data);

      // Le backend pour registerAdmin renvoie response.data.admin
      setSuccessMessage(
        response.data.message + " Vous pouvez maintenant vous connecter."
      );
      console.log("Inscription Admin réussie:", response.data.admin); // Ceci devrait maintenant fonctionner

      setEmail("");
      setPassword("");
      // setRole("admin");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
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

  // ... le reste du JSX reste identique
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
      <h2>Inscription Administrateur Artiva</h2>
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
            minLength="6"
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>
        {/*
        Si tu actives le champ de rôle ici, assure-toi que ton backend
        dans `registerAdmin` utilise bien le `role` fourni dans `req.body`
        (actuellement, il le fait avec `const adminRole = role || "admin";`)
        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="role">Rôle:</label>
          <select
            id="role"
            value={role} // tu devrais utiliser const [role, setRole] = useState("admin");
            onChange={(e) => setRole(e.target.value)}
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          >
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>
        */}

        {error && <p style={{ color: "red" }}>{error}</p>}
        {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}

        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: "10px",
            backgroundColor: "dodgerblue",
            color: "white",
            border: "none",
            cursor: "pointer",
            marginTop: "10px",
          }}
        >
          {isLoading ? "Inscription..." : "S'inscrire"}
        </button>
      </form>
      <p style={{ marginTop: "20px" }}>
        Déjà un compte ? <Link to="/login">Connectez-vous ici</Link>
      </p>
    </div>
  );
}

export default RegisterPage;
