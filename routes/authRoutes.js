const express = require('express');
const router = express.Router();
const { register, login, logout } = require('../controllers/authController');

// Inscription
router.post('/register', register);

// Connexion
router.post('/login', login);

// Déconnexion (utile si tu veux gérer ça côté serveur un jour, même si avec JWT c’est généralement géré côté client)
router.post('/logout', logout);

module.exports = router;
