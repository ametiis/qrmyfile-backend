const pool = require("./db");

async function initializeDatabase() {
  try {
    // USERS
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        premium_until TIMESTAMP,
        is_active BOOLEAN DEFAULT false,
        avatar_url TEXT,
        profile_link TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // MISSIONS
    await pool.query(`
      CREATE TABLE IF NOT EXISTS missions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE ,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        distance_km DECIMAL,
        type TEXT,
        latitude DOUBLE PRECISION,
        longitude DOUBLE PRECISION,
        deadline TIMESTAMP,
        price DECIMAL,
        pace_seconds_per_km INTEGER,
        premium BOOLEAN DEFAULT false,
        status VARCHAR(50) DEFAULT 'open',
        jockey_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        claimed_at timestamp,
        accepted_at timestamp,
        completed_at timestamp,
        confirmed_at timestamp,
        currency VARCHAR(10) DEFAULT 'EUR',
        gpx_file TEXT
      );
    `);


    // REVIEWS
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        reviewer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        reviewed_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        rating INTEGER CHECK (rating BETWEEN 0 AND 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type TEXT NOT NULL CHECK (type IN (
          'claim', 'accepted', 'rejected','rejected-gpx', 'completed', 'confirmed', 'expired', 'review'
        )),
        mission_id INTEGER REFERENCES missions(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        read BOOLEAN DEFAULT false
      );
    `)

    // MESSAGES
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER REFERENCES users(id) ,
        receiver_id INTEGER REFERENCES users(id),
        content TEXT,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // PAYMENTS
    /*await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        mission_id INTEGER REFERENCES missions(id),
        payer_id INTEGER REFERENCES users(id),
        payee_id INTEGER REFERENCES users(id),
        amount DECIMAL,
        method VARCHAR(50),
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // ALERTS
    await pool.query(`
      CREATE TABLE IF NOT EXISTS alerts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE cascade,
        location VARCHAR(255),
        radius_km DECIMAL
      );
    `);*/

    console.log("✅ Toutes les tables ont été créées ou vérifiées.");
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation de la base de données :", error);
  }
}

module.exports = initializeDatabase;
