const pool = require('../db');
const { createNotification } = require('./notificationController');
// Lister les reviews d’un utilisateur donné


// Exemple dans getReviewsByUserId
const getUserReviews = async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      `
      SELECT reviews.*, users.username AS reviewer_username
      FROM reviews
      JOIN users ON reviews.reviewer_id = users.id
      WHERE reviews.reviewed_id = $1
      ORDER BY reviews.created_at DESC
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Erreur lors de la récupération des reviews :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};


const getMyReviewsMade = async (req, res) => {
  console.log(req.user);
  const reviewerId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT reviewer_id, rating, comment, created_at
       FROM reviews
       WHERE reviewer_id = $1
       ORDER BY created_at DESC`,
      [reviewerId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération des avis' });
  }
};



// Ajouter une review (une seule fois par utilisateur)
const addReview = async (req, res) => {
  const reviewerId = req.user.id;
  const { reviewed_id, rating, comment } = req.body;

  if (reviewerId === reviewed_id) {
    return res.status(400).json({ error: 'Impossible de se noter soi-même' });
  }

  try {
    const existing = await pool.query(
      `SELECT id FROM reviews WHERE reviewer_id = $1 AND reviewed_id = $2`,
      [reviewerId, reviewed_id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Vous avez déjà laissé un avis à cet utilisateur' });
    }

    await pool.query(
      `INSERT INTO reviews (reviewer_id, reviewed_id, rating, comment)
       VALUES ($1, $2, $3, $4)`,
      [reviewerId, reviewed_id, rating, comment]
    );
    await createNotification(
      reviewed_id,
      "review"
      
       );

    res.status(201).json({ message: 'Avis ajouté' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de l’ajout de l’avis' });
  }
};

// Supprimer une review qu’on a rédigée
const deleteReview = async (req, res) => {
  const reviewerId = req.user.id;
  const { reviewed_id } = req.body;

  try {
    const result = await pool.query(
      `DELETE FROM reviews WHERE reviewer_id = $1 AND reviewed_id = $2 RETURNING *`,
      [reviewerId, reviewed_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Avis non trouvé ou déjà supprimé' });
    }

    res.json({ message: 'Avis supprimé' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'unknown' });
  }
};

module.exports = {
  getUserReviews,
  addReview,
  deleteReview,
  getMyReviewsMade
};
