// admin_panel/src/pages/RegisterPage.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom"; // Ajout de Link

// URL de base de ton API (la même que pour LoginPage)
const API_BASE_URL = "https://artiva-repository.onrender.com/api";
// Le endpoint pour l'enregistrement des admins. Adapte si c'est différent.
// Basé sur ta route, on peut supposer /auth/register-admin ou /admins/register
// Je vais utiliser /auth/register-admin pour correspondre au style de /auth/login
const API_REGISTER_ENDPOINT = "/auth/register-admin";

function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Optionnel: si tu veux permettre de choisir le rôle depuis le front-end
  // const [role, setRole] = useState("admin"); // 'admin' ou 'super_admin'
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    // Validation simple (le backend fait aussi la sienne)
    if (!name || !email || !password) {
      setError("Veuillez remplir tous les champs obligatoires.");
      setIsLoading(false);
      return;
    }

    try {
      const payload = {
        name,
        email,
        password,
        // role, // Décommente si tu gères le rôle depuis le front-end
      };

      const response = await axios.post(
        `${API_BASE_URL}${API_REGISTER_ENDPOINT}`,
        payload
      );

      setSuccessMessage(response.data.message + " Vous pouvez maintenant vous connecter.");
      console.log("Inscription Admin réussie:", response.data.admin);

      // Optionnel: vider les champs après succès
      setName("");
      setEmail("");
      setPassword("");
      // setRole("admin");

      // Rediriger vers la page de connexion après un court délai pour que l'utilisateur voie le message
      setTimeout(() => {
        navigate("/login"); // Assure-toi que '/login' est ta route de connexion
      }, 3000);

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
          <label htmlFor="name">Nom complet:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>
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
            minLength="6" // Ajoute une validation de base pour la longueur du mot de passe si tu le souhaites
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>
        {/*
        // Décommente si tu veux permettre de choisir le rôle depuis le front-end
        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="role">Rôle:</label>
          <select
            id="role"
            value={role}
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
            backgroundColor: "dodgerblue", // Couleur différente pour le bouton d'inscription
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