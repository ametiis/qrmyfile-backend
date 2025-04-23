// controllers/messageController.js
const pool = require('../db');

// Envoyer un message
const sendMessage = async (req, res) => {
  const senderId = req.user.id;
  const { receiverId, content } = req.body;

  if (!receiverId || !content) {
    return res.status(400).json({ error: 'unknown' });
  }

  if (parseInt(receiverId) === senderId) {
    return res.status(400).json({ error: "unknown" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO messages (sender_id, receiver_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [senderId, receiverId, content]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "unknown" });
  }
};




const getMessages = async (req, res) => {
  const userId = req.user.id;
  const otherUserId = parseInt(req.params.otherUserId);
  const limit = parseInt(req.query.limit) || 100;
  const offset = parseInt(req.query.offset) || 0;

  try {
    const result = await pool.query(
      `
      SELECT *
      FROM messages
      WHERE (sender_id = $1 AND receiver_id = $2)
         OR (sender_id = $2 AND receiver_id = $1)
      ORDER BY created_at DESC
      LIMIT $3 OFFSET $4
      `,
      [userId, otherUserId, limit, offset]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Erreur récupération messages :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};


// Marquer tous les messages de l’autre utilisateur comme lus
const markAsRead = async (req, res) => {
  const receiverId = req.user.id;
  const { senderId } = req.body;

  if (!senderId) return res.status(400).json({ error: "unknown" });

  try {
    await pool.query(
      `
      UPDATE messages
      SET is_read = TRUE
      WHERE sender_id = $1 AND receiver_id = $2 AND is_read = FALSE
      `,
      [senderId, receiverId]
    );

    res.json({ message: "Messages marqués comme lus" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "unknown" });
  }
};

// Récupérer toutes les conversations de l'utilisateur connecté
const getMyConversations = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `
      SELECT DISTINCT ON (LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id))
        m.*,
        u.username,
        u.avatar_url
      FROM messages m
      JOIN users u ON u.id = CASE
        WHEN m.sender_id = $1 THEN m.receiver_id
        ELSE m.sender_id
      END
      WHERE m.sender_id = $1 OR m.receiver_id = $1
      ORDER BY LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id), created_at DESC
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Erreur récupération conversations :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};


// Récupérer nombre de messages non lus pour un utilisateur
const getUnreadCount = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT COUNT(*) FROM messages
       WHERE receiver_id = $1 AND is_read = FALSE`,
      [userId]
    );

    const count = parseInt(result.rows[0].count, 10);
    res.json({ unread: count });
  } catch (err) {
    console.error("Erreur lors du comptage des messages non lus", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  markAsRead,
  getMyConversations,
  getUnreadCount
};
