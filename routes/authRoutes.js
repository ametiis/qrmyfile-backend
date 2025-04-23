const express = require('express');
const router = express.Router();
const { register, login, logout, confirmEmail, sendResetPasswordEmail, resetPassword } = require('../controllers/authController');
const rateLimit = require('express-rate-limit');

// Inscription
router.post('/register', register);

// ValidationMail
router.post('/confirm', confirmEmail);

// Connexion
router.post('/login', login);

// Déconnexion (utile si tu veux gérer ça côté serveur un jour, même si avec JWT c’est généralement géré côté client)
router.post('/logout', logout);

//Demande réinitialisation de mot de passe
router.post('/forgot', sendResetPasswordEmail);



const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 5,
  message: { error: "Too many requests, try again later." }
});

//Demande réinitialisation de mot de passe
router.post('/reset',limiter, resetPassword);

module.exports = router;
