const pool = require('../db');

const cleanupMissions = async () => {
  try {
    const result = await pool.query(`
      DELETE FROM users 
      WHERE created_at < NOW() - interval '24 hours'
      AND is_active != 'true'
      RETURNING id, email
    `);

    console.log(`🚮 Users supprimées : ${result.rowCount}`);
    result.rows.forEach(row => {
      console.log(`- [${row.id}] ${row.email}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('Erreur lors du nettoyage :', err);
    process.exit(1);
  }
};

cleanupMissions();