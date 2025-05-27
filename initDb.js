const pool = require("./db");

async function initializeDatabase() {
   try {
    // USERS
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        is_premium BOOLEAN DEFAULT false
      );
    `);

    // FILES
    await pool.query(`
      CREATE TABLE IF NOT EXISTS files (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        owner_id UUID REFERENCES users(id),
        encrypted_file_url TEXT NOT NULL,
        encrypted_password TEXT,
        expires_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        file_size INTEGER NOT NULL
      );
    `);

    console.log("✅ Toutes les tables ont été créées ou vérifiées.");
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation de la base de données :", error);
  }
}

module.exports = initializeDatabase;
