const pool = require('../db');

const cleanupUsers = async () => {
  try {
    // Timeout PostgreSQL : 5 secondes max
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
      console.log("Aucun utilisateur à supprimer.");
    }
  } catch (err) {
    console.error('❌ Erreur dans cleanupUsers :', err.message || err);
    throw err; // important pour que le script appelant puisse gérer l'erreur
  }
};

module.exports = cleanupUsers;
