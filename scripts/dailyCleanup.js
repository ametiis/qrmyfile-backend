const cleanupFiles = require('./cleanupFiles');
const cleanupUsers = require('./cleanupUsers');

const MAX_DURATION_MS = 60000;
const timeout = setTimeout(() => {
  console.error("⏱️ Temps d'exécution dépassé. Fin du script.");
  process.exit(1);
}, MAX_DURATION_MS);

const runAll = async () => {
  try {
    await cleanupFiles();
  } catch (err) {
    console.error("❌ Erreur dans cleanupUsers :", err.message || err);
  }

  try {
    await cleanupUsers();
  } catch (err) {
    console.error("❌ Erreur dans cleanupMissions :", err.message || err);
  }

  clearTimeout(timeout);
  console.log("🧼 Nettoyage quotidien terminé.");
  process.exit(0);
};

runAll();
