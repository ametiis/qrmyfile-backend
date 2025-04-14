const pool = require('../db');

const MISSION_STATUS = {
    OPEN: 'open',
    ACCEPTED: 'accepted',
    WAITING_VALIDATION: 'waiting_validation',
    VALIDATED: 'validated',
    PAID: 'paid'
  };

// Créer une mission
const createMission = async (req, res) => {
  const userId = req.user.id;
  const { title, description, price, location, distance_km, proof_type,premium } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO missions 
        (user_id, title, description, price, location, distance_km, proof_type, premium)
       VALUES ($1, $2, $3, $4, $5, $6, $7,$8)
       RETURNING *`,
      [userId,title, description, price, location, distance_km, proof_type, premium]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la création de la mission' });
  }
};

// Lister les missions
const listMissions = async (req, res) => {
  const { location, status, premium } = req.query;

  let query = `SELECT * FROM missions WHERE 1=1`;
  const params = [];

  console.log(location);
  if (status && !Object.values(MISSION_STATUS).includes(status)) {
    return res.status(400).json({ error: 'Statut invalide' });
  }

  if (location) {
    params.push(location);
    query += ` AND location = $${params.length}`;
  }

  if (status) {
    params.push(status);
    query += ` AND status = $${params.length}`;
  }

  if (premium) {
    params.push(premium === 'true');
    query += ` AND premium = $${params.length}`;
  }

  query += ` ORDER BY created_at DESC`;

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération des missions' });
  }
};

// Voir les détails d’une mission
const getMission = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`SELECT * FROM missions WHERE id = $1`, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Mission non trouvée' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération de la mission' });
  }
};

// Supprimer une mission
const deleteMission = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const result = await pool.query(`DELETE FROM missions WHERE id = $1 AND user_id = $2 RETURNING *`, [id, userId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Mission non trouvée ou non autorisée' });
    }

    res.json({ message: 'Mission supprimée' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la suppression de la mission' });
  }
};


// Accepter une mission (par le jockey)
const acceptMission = async (req, res) => {
  const jockeyId = req.user.id;
  const { id } = req.params;

  try {
    const mission = await pool.query(`SELECT * FROM missions WHERE id = $1`, [id]);

    if (mission.rows.length === 0 || mission.rows[0].status !== 'open') {
      return res.status(400).json({ error: 'Mission non disponible' });
    }

    if (jockeyId == mission.rows[0].user_id) {
        return res.status(400).json({ error: 'Vous ne pouvez pas accepter votre propre mission' });
      }

    await pool.query(
      `UPDATE missions SET status = $1, jockey_id = $2, accepted_at = NOW() WHERE id = $3`,
      [MISSION_STATUS.ACCEPTED, jockeyId, id]
    );
     


    res.json({ message: 'Mission acceptée' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de l’acceptation' });
  }
};

// Valider une course (par le jockey)
const submitProof = async (req, res) => {
  const jockeyId = req.user.id;
  const { id } = req.params;

  try {
   const result= await pool.query(
      `UPDATE missions SET status = $1 WHERE id = $2 AND jockey_id = $3`,
      [ MISSION_STATUS.WAITING_VALIDATION, id, jockeyId]
    );

    if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Mission non trouvée ou non autorisée' });
      }

    res.json({ message: 'Validation demandée' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la demande de validation' });
  }
};

// Valider une mission (par le créateur)
const validateMission = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
   const result =  await pool.query(
      `UPDATE missions SET status = $1, validated_at = NOW() WHERE id = $2 AND user_id = $3`,
      [MISSION_STATUS.VALIDATED, id, userId]
    );
    if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Mission non trouvée ou non autorisée' });
      }

    res.json({ message: 'Mission validée' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la validation' });
  }
};

// Marquer une mission comme payée
const markAsPaid = async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
  
    try {
     const result = await pool.query(
        `UPDATE missions SET status = $1 WHERE id = $2 AND user_id = $3`,
        [MISSION_STATUS.PAID,id, userId]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Mission non trouvée ou non autorisée' });
      }
  
      res.json({ message: 'Mission payée' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur lors du paiement' });
    }
  };

// Mettre une mission en avant (option premium)
const promoteMission = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    await pool.query(
      `UPDATE missions SET premium = true WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    res.json({ message: 'Mission mise en avant' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la mise en avant' });
  }
};

module.exports = {
  createMission,
  listMissions,
  getMission,
  deleteMission,
  acceptMission,
  submitProof,
  validateMission,
  markAsPaid,
  promoteMission,
};
