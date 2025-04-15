const pool = require('../db');

const cleanupMissions = async () => {
  try {
    const result = await pool.query(`
      DELETE FROM missions 
      WHERE deadline < NOW() 
      AND status != 'terminated'
      RETURNING id, title
    `);

    console.log(`🚮 Missions supprimées : ${result.rowCount}`);
    result.rows.forEach(row => {
      console.log(`- [${row.id}] ${row.title}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('Erreur lors du nettoyage :', err);
    process.exit(1);
  }
};

cleanupMissions();