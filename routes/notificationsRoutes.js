const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAllAsRead
} = require('../controllers/notificationController');
const authenticate = require('../middleware/authenticate');

// 🔐 Toutes les routes de notification sont protégées
router.get('/', authenticate, getNotifications);          // 📬 Récupérer les notifications
router.post('/mark-as-read', authenticate, markAllAsRead); // ✅ Marquer toutes comme lues

module.exports = router;
