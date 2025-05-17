const pool = require('../db');

// Timeout global : si le script dure plus de 30s, on le force à quitter
const MAX_DURATION_MS = 30000;
const timeout = setTimeout(() => {
  console.error('⏱️ Le script a dépassé la durée maximale autorisée (30s).');
  process.exit(1);
}, MAX_DURATION_MS);

const cleanupMissions = async () => {
  try {
    // Timeout PostgreSQL : statement timeout à 5 secondes
    await pool.query(`SET statement_timeout TO 5000`);

    const result = await pool.query(`
      DELETE FROM users 
      WHERE created_at < NOW() - interval '24 hours'
      AND is_active != 'true'
      RETURNING id, email
    `);

    console.log(`✅ Utilisateurs supprimés : ${result.rowCount}`);
    if (result.rowCount > 0) {
      result.rows.forEach(row => {
        console.log(`- [${row.id}] ${row.email}`);
      });
    } else {
      console.log("Rien à supprimer.");
    }

    clearTimeout(timeout);
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur lors du nettoyage :', err.message || err);
    clearTimeout(timeout);
    process.exit(1);
  }
};

cleanupMissions();
