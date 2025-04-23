// controllers/notificationController.js
const pool = require("../db");

// Récupérer les dernières notifications d'un utilisateur
const getNotifications = async (req, res) => {
  const userId = req.user.id;
 
  try {
    const result = await pool.query(
      `SELECT n.*, m.title AS mission_title
       FROM notifications n
       LEFT JOIN missions m ON m.id = n.mission_id
       WHERE n.user_id = $1
       ORDER BY n.created_at DESC
       LIMIT 20`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Erreur getNotifications", err);
    res.status(500).json({ error: "unknown" });
  }
};

// Marquer toutes les notifications comme lues
const markAllAsRead = async (req, res) => {
  const userId = req.user.id;
  try {
    await pool.query(`UPDATE notifications SET read = true WHERE user_id = $1`, [userId]);
    res.json({ success: true });
  } catch (err) {
    console.error("Erreur markAllAsRead", err);
    res.status(500).json({ error: "unknown" });
  }
};

// Créer une notification
const createNotification = async (userId, type, missionId = null) => {
  try {
    await pool.query(
      `INSERT INTO notifications (user_id, type, mission_id) VALUES ($1, $2, $3)`,
      [userId, type, missionId]
    );
  } catch (err) {
    console.error("Erreur createNotification", err);
  }
};

module.exports = {
  getNotifications,
  markAllAsRead,
  createNotification,
};
