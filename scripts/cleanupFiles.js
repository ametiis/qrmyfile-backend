const pool = require('../db');
const { supabase } = require('../utils/supabaseClient');

const cleanupFiles = async () => {
  try {
    await pool.query(`SET statement_timeout TO 5000`);

    // Récupérer les fichiers expirés
    const { rows } = await pool.query(`
      SELECT id, encrypted_file_url
      FROM files
      WHERE expires_at < NOW()
    `);

    if (rows.length === 0) {
      console.log("Aucun fichier expiré à supprimer.");
      return;
    }

    // Supprimer les fichiers du storage
    const filePaths = rows.map(row => row.encrypted_file_url);
    const { error: storageError } = await supabase
      .storage
      .from("qrmyfile-files")
      .remove(filePaths);

    if (storageError) {
      console.error("❌ Erreur de suppression dans le storage Supabase :", storageError.message);
    } else {
      console.log(`✅ Fichiers supprimés du storage : ${filePaths.length}`);
    }

    // Supprimer les entrées de la BDD
    const ids = rows.map(row => `'${row.id}'`).join(",");
    const result = await pool.query(`
      DELETE FROM files
      WHERE id IN (${ids})
    `);

    console.log(`✅ Fichiers supprimés de la BDD : ${result.rowCount}`);
  } catch (err) {
    console.error("❌ Erreur dans cleanupFiles :", err.message || err);
    throw err;
  }
};

module.exports = cleanupFiles;
