const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const validator = require("validator");
const { sendConfirmationEmail,sendResetPasswordMail } = require("./mailer");

const register = async (req, res) => {
  const { username, email, password, confirmPassword, profile_link } = req.body;
  const { locale } = req.body;
  // --- 1. Champs requis ---
  if (!username || !email || !password || !confirmPassword) {
    return res.status(400).json({ error: "missingFields" });
  }

  // --- 2. Vérification du format de l'email ---
  if (!validator.isEmail(email)) {
    console.log(email);
    return res.status(400).json({ error: "invalidEmail" });
  }

  // --- 3. Vérification du username ---
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  if (!usernameRegex.test(username)) {
    return res.status(400).json({ error: "invalidUsername" });
  }

  // --- 4. Vérification du mot de passe ---
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ error: "weakPassword" });
  }

  // --- 5. Confirmation du mot de passe ---
  if (password !== confirmPassword) {
    return res.status(401).json({ error: "passwordNotIdentical" });
  }

  try {
    // --- 6. Vérifie si l'email ou le username existent déjà ---
    const existingUser = await pool.query(
      `SELECT * FROM users WHERE email = $1 OR username = $2`,
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      const existing = existingUser.rows[0];
      if (existing.email === email) {
        return res.status(401).json({ error: "emailAlreadyExists" });
      }
      if (existing.username === username) {
        return res.status(401).json({ error: "usernameAlreadyExists" });
      }
    }

    // --- 7. Hasher le mot de passe ---
    const hashedPassword = await bcrypt.hash(password, 10);

    // --- 8. Vérifier profile_link s’il est renseigné (optionnel) ---
    if (profile_link && !validator.isURL(profile_link, { require_protocol: true })) {
      return res.status(400).json({ error: "invalidProfileLink" });
    }

    // --- 9. Insertion dans la DB ---
    const result = await pool.query(
      `INSERT INTO users (username, email, password, profile_link)
       VALUES ($1, $2, $3, $4) RETURNING id, username, email`,
      [username, email, hashedPassword, profile_link]
    );

    const token = jwt.sign(
      { userId: result.rows[0].id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const confirmationLink = `${process.env.FRONTEND_URL}/${locale || 'fr'}/confirm?token=${token}`;
    await sendConfirmationEmail(email, confirmationLink,locale || 'fr');

     // --- 10. Réponse ---
    res.status(201).json({ message: "registerOkPleaseConfirm" });

   
  } catch (err) {
    console.error("Erreur serveur:", err);
    res.status(500).json({ error: "unknown" });
  }
};

const confirmEmail = async (req, res) => {
  const { token } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    console.log("Enregistrement de l'utilisateur :",userId);
    
    await pool.query(
      `UPDATE users SET is_active = TRUE WHERE id = $1`,
      [userId]
    );

    res.status(201).json({ message: "confirmOkPleaseLogin" });
  } catch (err) {
    console.error(err);
    res.status(400).json({error:"invalidToken"});
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) return res.status(400).json({ error: 'invalid_credentials' });

    if(!user.is_active) return res.status(400).json({ error: 'mailNotVerified' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'invalid_credentials' });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { id: user.id, username: user.username, email: user.email, premium_until:user.premium_until } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'unknown' });
  }
};

const logout = async (req, res) => {
  // Si tu veux gérer les blacklists de tokens plus tard (serveur), tu pourras en faire quelque chose
  res.json({ message: 'Déconnecté (à gérer côté client)' });
};

const sendResetPasswordEmail = async (req, res) => {
  const { email, locale = "fr" } = req.body;

  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: "invalidEmail" });
  }

  try {
    const result = await pool.query(`SELECT id FROM users WHERE email = $1`, [email]);
    const user = result.rows[0];

    // Ne pas indiquer si l’email existe ou pas
    if (!user) return res.status(200).json({ message: "emailSentIfExists" });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    const resetLink = `${process.env.FRONTEND_URL}/${locale || 'fr'}/reset-password?token=${token}`;

    await sendResetPasswordMail(email, resetLink, locale);

    return res.status(200).json({ message: "emailSentIfExists" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "unknown" });
  }
};

const resetPassword = async (req, res) => {

  const { token, password, confirmPassword } = req.body;

  if (password !== confirmPassword) return res.status(400).json({ error: "passwordNotIdentical" });

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ error: "weakPassword" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;


    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(`UPDATE users SET password = $1 WHERE id = $2`, [hashedPassword, userId]);

    return res.status(200).json({ message: "passwordUpdated" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "invalidToken" });
  }
};


module.exports = { register, login, logout,confirmEmail,sendResetPasswordEmail, resetPassword };
