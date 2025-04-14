const pool = require('../db');

// Envoyer un message
const sendMessage = async (req, res) => {
  const senderId = req.user.id;
  const { receiverId, content } = req.body;

  if (!receiverId || !content) {
    return res.status(400).json({ error: 'Requête incomplète' });
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
    res.status(500).json({ error: 'Erreur lors de l’envoi du message' });
  }
};

// Récupérer la conversation entre deux utilisateurs
const getConversation = async (req, res) => {
  const userId = req.user.id;
  const { otherUserId } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM messages
       WHERE (sender_id = $1 AND receiver_id = $2)
          OR (sender_id = $2 AND receiver_id = $1)
       ORDER BY created_at ASC`,
      [userId, otherUserId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération des messages' });
  }
};

// Marquer tous les messages reçus comme lus
const markAsRead = async (req, res) => {
  const receiverId = req.user.id;
  const { senderId } = req.body;

  try {
    await pool.query(
      `UPDATE messages
       SET is_read = TRUE
       WHERE sender_id = $1 AND receiver_id = $2 AND is_read = FALSE`,
      [senderId, receiverId]
    );

    res.json({ message: 'Messages marqués comme lus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
};

module.exports = {
  sendMessage,
  getConversation,
  markAsRead,
};
