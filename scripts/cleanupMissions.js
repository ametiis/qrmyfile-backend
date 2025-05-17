const pool = require('../db');

const cleanupMissions = async () => {
  try {
    // Timeout PostgreSQL : 5 secondes
    await pool.query(`SET statement_timeout TO 5000`);

    const result = await pool.query(`
      UPDATE missions
      SET status = 'expired'
      WHERE deadline IS NOT NULL
      AND deadline < NOW()
      AND status NOT IN ('expired', 'terminated')
      RETURNING id, title
    `);

    console.log(`✅ Missions expirées mises à jour : ${result.rowCount}`);
    if (result.rowCount > 0) {
      result.rows.forEach(row => {
        console.log(`- [${row.id}] ${row.title}`);
      });
    } else {
      console.log("Aucune mission à expirer.");
    }
  } catch (err) {
    console.error('❌ Erreur dans cleanupMissions :', err.message || err);
    throw err;
  }
};

module.exports = cleanupMissions;
