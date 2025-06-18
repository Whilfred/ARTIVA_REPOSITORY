// ARTIVA/back_end/controllers/adminController.js
const db = require("../config/db"); // Notre module pour interagir avec la BDD
const bcrypt = require("bcryptjs"); // Pour hacher les mots de passe
const jwt = require("jsonwebtoken"); // On l'utilisera pour le login plus tard


// NOUVELLE FONCTION : Enregistrer un nouvel administrateur
exports.registerAdmin = async (req, res) => {
  const { email, password, role } = req.body; // Supprime name d'ici

  // Validation basique
  if (!email || !password) { // Supprime la vérification de name
    return res
      .status(400)
      .json({
        message:
          "Veuillez fournir l'email et le mot de passe pour l'admin.",
      });
  }

  const adminRole = role || "admin";
  if (adminRole !== "admin" && adminRole !== "super_admin") {
    return res.status(400).json({ message: "Rôle administrateur invalide." });
  }

  try {
    const adminExistsQuery = "SELECT * FROM admin WHERE email = $1";
    const existingAdmin = await db.query(adminExistsQuery, [email]);

    if (existingAdmin.rows.length > 0) {
      return res
        .status(409)
        .json({ message: "Un administrateur avec cet email existe déjà." });
    }

    const saltRounds = parseInt(process.env.PASSWORD_SALT_ROUNDS || "10");
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Modifie la requête d'insertion
    const insertAdminQuery = `
      INSERT INTO admin (email, password_hash, role)
      VALUES ($1, $2, $3)
      RETURNING id, email, role, created_at; // Supprime name d'ici aussi
    `;
    const newAdmin = await db.query(insertAdminQuery, [
      email, // Supprime name d'ici
      hashedPassword,
      adminRole,
    ]);

    res.status(201).json({
      message: "Administrateur créé avec succès !",
      admin: newAdmin.rows[0],
    });
  } catch (error) {
    console.error(
      "Erreur lors de l'enregistrement de l'administrateur:", // VÉRIFIE LES LOGS RENDER POUR CETTE ERREUR
      error
    );
    res
      .status(500)
      .json({
        message: "Erreur serveur lors de la création de l'administrateur.",
      });
  }
};


// Fonction pour connecter un utilisateur (client ou admin)
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  // 1. Validation basique
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Veuillez fournir l'email et le mot de passe." });
  }

  try {
    let userRecord;
    let userTable = ""; // Pour savoir de quelle table vient l'utilisateur
     let userIsActive = true; // Supposer actif par défaut

    // 2. Essayer de trouver l'utilisateur dans la table 'admin' d'abord
    const adminQuery =
      "SELECT id, email, password_hash, role FROM admin WHERE email = $1";
    const adminResult = await db.query(adminQuery, [email]);

    if (adminResult.rows.length > 0) {
      userRecord = adminResult.rows[0];
      userTable = "admin";
    } else {
      // 3. Si non trouvé dans 'admin', chercher dans la table 'users'
      const userQuery =
        "SELECT id, email, password_hash, role, name, address, phone, is_active FROM users WHERE email = $1";
      const userResult = await db.query(userQuery, [email]);

      if (userResult.rows.length > 0) {
        userRecord = userResult.rows[0];
        userTable = "users";
        userIsActive = userRecord.is_active; // Récupérer le statut is_active de l'utilisateur
        // VÉRIFICATION SI LE COMPTE CLIENT EST ACTIF
        if (userRecord.is_active === false) {
          // Vérifie explicitement false
          return res
            .status(403)
            .json({ message: "Veuillez vérifier vos informations de connexion." });
        }
      }
    }

    // 4. Si aucun utilisateur trouvé avec cet email
    if (!userRecord) {
      return res
        .status(401)
        .json({ message: "Email ou mot de passe incorrect." }); // 401 Unauthorized
    }

    // *** NOUVELLE VÉRIFICATION ***
    if (!userIsActive) { // Vérifier si le compte est actif
      console.log(`Tentative de connexion pour le compte désactivé: ${email}`);
      return res.status(403).json({ message: 'Ce compte n\'existe pas. Veuillez contacter le support ou en créer un nouveau.' }); // 403 Forbidden
    }

    // 5. Vérifier le mot de passe
    const isPasswordMatch = await bcrypt.compare(
      password,
      userRecord.password_hash
    );
    if (!isPasswordMatch) {
      return res
        .status(401)
        .json({ message: "Email ou mot de passe incorrect." });
    }

    // 6. Si l'authentification réussit, créer un token JWT
    const payload = {
      userId: userRecord.id,
      email: userRecord.email,
      role: userRecord.role,
      // Tu peux ajouter d'autres informations non sensibles au payload si nécessaire
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1d" } // Le token expirera dans 1 jour (tu peux ajuster)
    );

    // 7. Renvoyer le token et les informations utilisateur (sans le hash du mot de passe)
    const { password_hash, is_active, ...userDataWithoutPassword } = userRecord; // Exclure le hash du mot de passe

    if (userRecord && userRecord.is_active === false) {
      // Ou !userRecord.is_active si la colonne existe
      return res
        .status(403)
        .json({
          message:
            "Ce compte n'existe pas. Veuillez contacter le support ou en créer un nouveau.",
        });
    }

    res.status(200).json({
      message: `Connexion réussie en tant que ${
        userTable === "admin" ? "administrateur" : "client"
      } !`,
      token,
      user: userDataWithoutPassword, // Contient id, email, role, name, etc.
    });
  } catch (error) {
    console.error("Erreur lors de la connexion de l'utilisateur:", error);
    res.status(500).json({ message: "Erreur serveur lors de la connexion." });
  }
};