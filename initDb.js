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
        paypal_email VARCHAR(255),
        stripe_account_id VARCHAR(255),
        profile_link TEXT
      );
    `);

    // MISSIONS
    await pool.query(`
      CREATE TABLE IF NOT EXISTS missions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        distance_km DECIMAL,
        location VARCHAR(255),
        deadline TIMESTAMP,
        price DECIMAL,
        premium BOOLEAN DEFAULT false,
        status VARCHAR(50) DEFAULT 'open',
        jockey_id INTEGER REFERENCES users(id),
        proof_type VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW(),
        accepted_at timestamp,
        validated_at timestamp
      );
    `);


    // REVIEWS
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        reviewer_id INTEGER REFERENCES users(id),
        reviewed_id INTEGER REFERENCES users(id),
        rating INTEGER CHECK (rating BETWEEN 0 AND 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // MESSAGES
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER REFERENCES users(id),
        receiver_id INTEGER REFERENCES users(id),
        content TEXT,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // PAYMENTS
    await pool.query(`
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
        user_id INTEGER REFERENCES users(id),
        location VARCHAR(255),
        radius_km DECIMAL
      );
    `);

    console.log("✅ Toutes les tables ont été créées ou vérifiées.");
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation de la base de données :", error);
  }
}

module.exports = initializeDatabase;
