const bcrypt = require('bcryptjs');
const pool = require('../db');

// 1. Voir un profil public
const getUserProfile = async (req, res) => {
  const { id } = req.params;
  try {
    const userResult = await pool.query(
      'SELECT id, username, profile_link, premium_until  FROM users WHERE id = $1',
      [id]
    );

    if (userResult.rows.length === 0) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    const user = userResult.rows[0];

    const reviewsResult = await pool.query(
      'SELECT reviewer_id, rating, comment, created_at FROM reviews WHERE reviewed_id = $1',
      [id]
    );

    const missionsResult = await pool.query(
      'SELECT * FROM missions WHERE user_id = $1',
      [id]
    );

    res.status(200).json({ user, missions:missionsResult.rows, reviews: reviewsResult.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
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
  const { profile_link, paypal_email, stripe_account_id } = req.body;
  try {
    await pool.query(
      'UPDATE users SET profile_link = $1, paypal_email = $2, stripe_account_id = $3 WHERE id = $4',
      [profile_link, paypal_email, stripe_account_id, userId]
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

// 6. Voir mon propre profil 
const getMyProfile = async (req, res) => {
  const userId = req.user.id;
  try {
    const userResult = await pool.query(
      'SELECT id, username, profile_link, premium_until  FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    const user = userResult.rows[0];

    const reviewsResult = await pool.query(
      'SELECT reviewer_id, rating, comment, created_at FROM reviews WHERE reviewed_id = $1',
      [userId]
    );

    const missionsResult = await pool.query(
      'SELECT * FROM missions WHERE user_id = $1',
      [userId]
    );

    res.status(200).json({ user, missions: missionsResult.rows, reviews: reviewsResult.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};


module.exports = { getUserProfile, updatePassword, updateProfile, becomePremium, deleteAccount, getMyProfile };
