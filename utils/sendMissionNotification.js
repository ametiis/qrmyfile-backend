const pool = require("../db");
const mailer = require("../controllers/mailer");

const haversine = (lat1, lon1, lat2, lon2) => {
  const toRad = deg => deg * Math.PI / 180;
  const R = 6371; // rayon de la Terre en km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const sendMissionNotification = async (mission, creatorId) => {
  const { latitude: missionLat, longitude: missionLng, id: missionId } = mission;

  // Trouver les utilisateurs dans le rayon
  const userResult = await pool.query(
    `SELECT email, latitude, longitude, km_notification 
     FROM users
     WHERE id != $1
     AND latitude IS NOT NULL AND longitude IS NOT NULL
     AND km_notification > 0`,
    [creatorId]
  );

  for (const user of userResult.rows) {
    const dist = haversine(missionLat, missionLng, user.latitude, user.longitude);
    if (dist <= user.km_notification) {
      const missionLink = `${process.env.FRONTEND_URL}/missions/${missionId}`;
      await mailer.sendNearbyMissionNotification(user.email, missionLink);
    }
  }
};

module.exports = sendMissionNotification;
