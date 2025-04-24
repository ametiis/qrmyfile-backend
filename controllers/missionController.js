const pool = require('../db');
const { createNotification } = require('./notificationController');

const MISSION_STATUS = {
    OPEN: 'open',
    CLAIMED: 'claimed',
    ACCEPTED: 'accepted',
    COMPLETED: 'completed',
    CONFIRMED:"confirmed",
    EXPIRED:"expired",
    
  };

// Créer une mission
const createMission = async (req, res) => {
  const userId = req.user.id;
  const {
    title,
    description,
    price,
    longitude,
    latitude,
    distance_km,
    type,
    deadline,
    pace, // format attendu : "4:30"
    currency
  } = req.body;

  // Vérification de la présence et des types
  if (
    typeof title !== "string" || title.trim() === "" ||
    typeof description !== "string" || description.trim() === "" ||
    typeof type !== "string" || type.trim() === "" ||
    typeof price !== "number" || isNaN(price) || price < 0 ||
    typeof distance_km !== "number" || isNaN(distance_km) || distance_km <= 0 ||
    typeof longitude !== "number" || typeof latitude !== "number" ||
    !deadline || isNaN(Date.parse(deadline))
  ) {
    return res.status(400).json({ error: "errorCreatingMission" });
  }

  // Gestion de la vitesse (facultatif)
  let paceInSeconds = null;
  if (pace && typeof pace === "string" && /^\d+:\d{2}$/.test(pace)) {
    const [min, sec] = pace.split(":").map(Number);
    paceInSeconds = min * 60 + sec;
  }

  try {
    const result = await pool.query(
      `INSERT INTO missions 
        (user_id, title, description, price, longitude, latitude, distance_km, type, deadline, pace_seconds_per_km, currency)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,$11)
       RETURNING *`,
      [
        userId,
        title.trim(),
        description.trim(),
        price,
        longitude,
        latitude,
        distance_km,
        type.trim(),
        deadline,
        paceInSeconds,
        currency
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "unknown" });
  }
};



// Lister les missions pour la carte (seulement les missions OPEN)
const listMissions = async (req, res) => {
  const { type, minPrice, maxPace, minDist, maxDist, currency } = req.body;

  let query = `SELECT id, latitude, longitude FROM missions WHERE status = 'open' AND 1=1`;
  const params = [];

  if (type) {
    params.push(type);
    query += ` AND type = $${params.length}`;
  }

  if (minPrice) {
    params.push(minPrice);
    query += ` AND price >= $${params.length}`;
  }

  if (currency) {
    params.push(currency);
    query += ` AND currency = $${params.length}`;
  }

  if (maxPace) {
    params.push(maxPace);
    query += ` AND pace_seconds_per_km >= $${params.length}`;
  }

  if (minDist) {
    params.push(minDist);
    query += ` AND distance_km >= $${params.length}`;
  }

  if (maxDist) {
    params.push(maxDist);
    query += ` AND distance_km <= $${params.length}`;
  }

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "unknown" });
  }
};



// Voir les détails d’une mission avec le nom du créateur
const getMission = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`

      SELECT 
  missions.*, 
  creator.username AS creator_username,
  jockey.username AS jockey_username
FROM missions
JOIN users AS creator ON creator.id = missions.user_id
LEFT JOIN users AS jockey ON jockey.id = missions.jockey_id
WHERE missions.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'unknown' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'unknown' });
  }
};


// Supprimer une mission
const deleteMission = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {

    const mission = await pool.query(
      `SELECT * FROM missions WHERE id = $1 AND user_id = $2 AND status = 'open'`,
      [id, userId]
    );

    if (mission.rowCount === 0) {
      return res.status(403).json({
        error: 'missionNotDelete',
      });
    }


    const result = await pool.query(`DELETE FROM missions WHERE id = $1 AND user_id = $2 RETURNING *`, [id, userId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'missionNotDelete' });
    }

    res.json({ message: 'Mission supprimée' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'unknown' });
  }
};


// Claim une mission (par le jockey)
const claimMission = async (req, res) => {
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

    const result = await pool.query(
      `UPDATE missions SET status = $1, jockey_id = $2, claimed_at = NOW() WHERE id = $3  RETURNING *`,
      [MISSION_STATUS.CLAIMED, jockeyId, id]
    );

    await createNotification(
       mission.rows[0].user_id,
       "claim",
       id
        );

    res.status(201).json(result.rows[0]);
     
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la demande' });
  }
};


// Accepter un Jockey (par l'utilisateur)
const acceptMission = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const mission = await pool.query(`SELECT * FROM missions WHERE  id = $1 and user_id = $2`, [id,userId]);

    if (mission.rows.length === 0 || mission.rows[0].status !== 'claimed') {
      return res.status(400).json({ error: 'Mission non disponible' });
    }

    await createNotification(
       mission.rows[0].jockey_id,
       "accepted",
       id
        );

    const result = await pool.query(
      `UPDATE missions SET status = $1, accepted_at = NOW() WHERE id = $2  RETURNING *`,
      [MISSION_STATUS.ACCEPTED, id]
    );
     
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de l’acceptation' });
  }
};

// Rejeter un Jockey (par l'utilisateur)
const rejectMission = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const mission = await pool.query(`SELECT * FROM missions WHERE  id = $1 and user_id = $2`, [id,userId]);

    if (mission.rows.length === 0 || mission.rows[0].status !== 'claimed') {
      return res.status(400).json({ error: 'Mission non disponible' });
    }
    await createNotification(
       mission.rows[0].jockey_id,
       "rejected",
       id
        );

    const result = await pool.query(
      `UPDATE missions SET status = $1, claimed_at = null, jockey_id = null WHERE id = $2  RETURNING *`,
      [MISSION_STATUS.OPEN, id]
    );
     
  

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de l’acceptation' });
  }
};

// Complete une mission (par le jockey)

const completeMissionUpload = async (req, res) => {
  const jockeyId = req.user.id;
  const { id } = req.params;

  try {
    const missionRes = await pool.query(`SELECT * FROM missions WHERE id = $1`, [id]);
    const mission = missionRes.rows[0];

    if (!mission || mission.status !== 'accepted' || mission.jockey_id !== jockeyId) {
      return res.status(400).json({ error: 'Mission non disponible ou accès refusé' });
    }

    let gpxFilename = null;
    if (req.file) {
      const ext = path.extname(req.file.originalname).toLowerCase();

      // Vérifie l'extension
      if (ext !== '.gpx') {
        return res.status(400).json({ error: 'invalidFileType' });
      }

      gpxFilename = req.file.filename;
    } else {
      return res.status(400).json({ error: 'missingFile' });
    }

    const updateRes = await pool.query(
      `UPDATE missions 
       SET status = $1, completed_at = NOW(), gpx_file = $2
       WHERE id = $3 RETURNING *`,
      [MISSION_STATUS.COMPLETED, gpxFilename, id]
    );

    await createNotification(
      updateRes.rows[0].user_id,
      MISSION_STATUS.COMPLETED,
      id
    );

    res.status(201).json(updateRes.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'unknown' });
  }
};


const fs = require('fs');
const path = require('path');

//rejeter un fichier gpx pour l'utilisateur
const rejectGpx = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    // 1. Vérifie que la mission appartient au user et qu’elle est au statut completed
    const result = await pool.query(
      `SELECT * FROM missions WHERE id = $1 AND user_id = $2 AND status = 'completed'`,
      [id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(403).json({ error: "missionNotFoundOrForbidden" });
    }

    const mission = result.rows[0];

    // 2. Supprimer le fichier s'il existe
    if (mission.gpx_file) {
      const filePath = path.join(__dirname, '..', 'uploads', 'gpx', mission.gpx_file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // 3. Remettre le statut à 'accepted' et vider le champ gpx_file
    await pool.query(
      `UPDATE missions SET status = 'accepted',completed_at = null, gpx_file = NULL WHERE id = $1`,
      [id]
    );

    await createNotification(mission.jockey_id, 'rejected-gpx', id);

    res.json({ message: "gpxRejected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "unknown" });
  }
};



// Terminer une mission (par le créateur)
const confirmMission = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE missions 
       SET status = $1, confirmed_at = NOW() 
       WHERE id = $2 AND user_id = $3  
       RETURNING *`,
      [MISSION_STATUS.CONFIRMED, id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Mission non trouvée ou non autorisée' });
    }

    const mission = result.rows[0]; // ✅ Définir ici

    await createNotification(
      mission.jockey_id, // ✅ On peut maintenant l’utiliser
      MISSION_STATUS.CONFIRMED,
      id
    );

    res.status(201).json(mission);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la validation' });
  }
};





module.exports = {
  createMission,
  listMissions,
  getMission,
  deleteMission,
  acceptMission,
  claimMission,
  rejectMission,
  completeMissionUpload,
  confirmMission,
  rejectGpx
};
