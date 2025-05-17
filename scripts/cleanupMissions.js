const pool = require('../db');

const cleanupMissions = async () => {
  try {
    const result = await pool.query(`
      UPDATE missions
      SET status = 'expired'
      WHERE deadline < NOW()
      AND status NOT IN ('expired', 'terminated')
      RETURNING id, title
    `);

    console.log(`♻️ Missions expirées mises à jour : ${result.rowCount}`);
    result.rows.forEach(row => {
      console.log(`- [${row.id}] ${row.title}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur lors du nettoyage :', err);
    process.exit(1);
  }
};

cleanupMissions();
