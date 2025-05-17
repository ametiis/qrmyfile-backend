const bcrypt = require('bcryptjs');
const pool = require('../db');
const { sendContactEmail } = require("./mailer");

// 1. Voir un profil public
const getUserProfile = async (req, res) => {
  const { id } = req.params;

  const viewerId = req.user?.id ? parseInt(req.user.id, 10) : null;
  const parsedId = parseInt(id, 10);
  const isOwner = viewerId === parsedId;
  const limit = parseInt(req.query.limit) || 10;
  const offsetJockey = parseInt(req.query.jockeyOffset) || 0;
  const offsetCreated = parseInt(req.query.missionsOffset) || 0;
  try {
    const userResult = await pool.query(
      "SELECT id, username, premium_until FROM users WHERE id = $1",
      [parsedId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "unknown" });
    }

    // 🔹 Missions créées (on ne filtre que si ce n’est pas le propriétaire)
    const missionsCreatedQuery = `
      SELECT id, title, status, price, currency, distance_km, is_secret
      FROM missions
      WHERE user_id = $1
      AND status != 'expired'
      ${isOwner ? '' : 'AND is_secret = false'}
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const missionsCreated = await pool.query(missionsCreatedQuery, [parsedId, limit, offsetCreated]);

    // 🔹 Missions en tant que jockey
    const missionsJockeyQuery = `
      SELECT id, title, status, price, currency, distance_km, is_secret
      FROM missions
      WHERE jockey_id = $1 
      AND status != 'claimed'
      AND status != 'expired'
      ${viewerId === parsedId ? '' : 'AND is_secret = false'}
      ORDER BY claimed_at DESC
      LIMIT $2 OFFSET $3
    `;
    const missionsAsJockey = await pool.query(missionsJockeyQuery, [parsedId, limit, offsetJockey]);

    // 🔢 Total missions créées (filtrage pareil)
    const totalCreatedQuery = `
      SELECT COUNT(*) FROM missions 
      WHERE user_id = $1 
      AND status != 'expired'
      ${isOwner ? '' : 'AND is_secret = false'}
    `;
    const totalCreated = await pool.query(totalCreatedQuery, [parsedId]);

    // 🔢 Total missions comme jockey (filtrage pareil)
    const totalJockeyQuery = `
      SELECT COUNT(*) FROM missions 
      WHERE jockey_id = $1 
      AND status != 'claimed'
      AND status != 'expired'
      ${viewerId === parsedId ? '' : 'AND is_secret = false'}
    `;
    const totalJockey = await pool.query(totalJockeyQuery, [parsedId]);

    res.json({
      ...userResult.rows[0],
      missions: missionsCreated.rows,
      missions_as_jockey: missionsAsJockey.rows,
      hasMoreMissions: offsetCreated + limit < parseInt(totalCreated.rows[0].count, 10),
      hasMoreJockey: offsetJockey + limit < parseInt(totalJockey.rows[0].count, 10),
    });
  } catch (err) {
    console.error("Erreur lors de la récupération du profil", err);
    res.status(500).json({ error: "unknown" });
  }
};




// 2. Modifier mot de passe
const updatePassword = async (req, res) => {
  const userId = req.user.id;
  const { oldPassword, newPassword } = req.body;
  try {
    const userResult = await pool.query('SELECT password FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) return res.status(401).json({ message: 'Mot de passe actuel incorrect' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, userId]);

    res.json({ message: 'Mot de passe mis à jour' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// 3. Modifier le profil
const updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { profile_link } = req.body;
  try {
    await pool.query(
      'UPDATE users SET profile_link = $1 WHERE id = $2',
      [profile_link, userId]
    );
    res.json({ message: 'Profil mis à jour' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// 4. Activer le premium
const becomePremium = async (req, res) =>  {
  const userId  = req.user.id;

  try {
    const result = await pool.query('SELECT premium_until FROM users WHERE id = $1', [userId]);
    const user = result.rows[0];

    const now = new Date();
    const current = user.premium_until && new Date(user.premium_until) > now
      ? new Date(user.premium_until)
      : now;

    const newPremiumUntil = new Date(current.getTime() + 30 * 24 * 60 * 60 * 1000);

    await pool.query(
      'UPDATE users SET premium_until = $1 WHERE id = $2',
      [newPremiumUntil, userId]
    );

    res.json({ message: 'Utilisateur premium jusqu\'au ' + newPremiumUntil.toISOString() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// 5. Supprimer le profil le profil
const deleteAccount = async (req, res) => {
  const userId = req.user.id;
  try {
    const { rows: missionsAsCreator } = await pool.query(
      'SELECT id FROM missions WHERE user_id = $1 AND (status != $2 AND status != $3)',
      [userId, 'confirmed', 'open']
    );

    const { rows: missionsAsJockey } = await pool.query(
      'SELECT id FROM missions WHERE jockey_id = $1 AND status != $2 ',
      [userId, 'confirmed']
    );

    if (missionsAsCreator.length > 0 || missionsAsJockey.length > 0) {
      return res.status(403).json({
        message: "Impossible de supprimer le compte : missions non terminées en cours."
      });
    }

    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    res.clearCookie('token');
    res.status(200).json({ message: 'Compte supprimé avec succès.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la suppression du compte." });
  }
};



//6. Envoi d'un mail via le formulaire de contact
const sendContactMessage = async (req, res) => {
  const { name, email, message } = req.body;

  if (!email || !message || message.length < 10 || message.length > 1000) {
    return res.status(400).json({ message: "Message invalide ou trop court." });
  }

  try {
    await sendContactEmail({ name, email, message });
    res.status(200).json({ message: "Message envoyé avec succès." });
  } catch (err) {
    console.error("Erreur envoi mail contact:", err);
    res.status(500).json({ message: "Erreur lors de l'envoi du message." });
  }
};

//7. récupérer localisation
const getUserLocation = async (req, res) => {
  
  const userId = req.user.id;

  // Vérifie que l'ID est bien un entier
  if (!userId || isNaN(userId)) {
    return res.status(400).json({ error: "invalidUserId" });
  }

  try {
    const result = await pool.query(
      "SELECT latitude, longitude, km_notification FROM users WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "notFound" });
    }

   
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching user location:", err);
    res.status(500).json({ error: "unknown" });
  }
};


//8. Updater localisation
const updateUserLocation = async (req, res) => {
  const userId = req.user.id;
  const { latitude, longitude, km_notification } = req.body;

  // Validation simple
  if (
    typeof latitude !== "number" || isNaN(latitude) ||
    typeof longitude !== "number" || isNaN(longitude) ||
    typeof km_notification !== "number" || isNaN(km_notification) ||
    km_notification < 0 || km_notification > 150
  ) {
    return res.status(400).json({ error: "invalidData" });
  }

  try {
    const result = await pool.query(
      "UPDATE users SET latitude = $1, longitude = $2, km_notification = $3 WHERE id = $4 RETURNING latitude, longitude, km_notification",
      [latitude, longitude, km_notification, userId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating location:", err);
    res.status(500).json({ error: "unknown" });
  }
};






module.exports = { getUserProfile, updatePassword, updateProfile, becomePremium, deleteAccount, sendContactMessage, getUserLocation,updateUserLocation };
