const express = require('express');
const router = express.Router();
const { getUserProfile, updatePassword, updateProfile, becomePremium,deleteAccount, sendContactMessage } = require('../controllers/userController');


// Middleware de simulation pour injecter userId depuis un token
const authenticate = require('../middleware/authenticate');
const optionalAuth = require("../middleware/optionalAuth");

//Récupère les information d'un user
router.get('/:id',optionalAuth, getUserProfile);

//Permet de maj le password de l'utilisateur
router.put('/password', authenticate, updatePassword);

//Permet de maj un utilisateur
router.put('/profile', authenticate, updateProfile);

//Permet à un utilisateur de passer premium
router.put('/premium', authenticate, becomePremium);

// Supprime son compte utilisateur
router.delete('/delete', authenticate, deleteAccount);

//Envoyer mail via formulaire de contact 
router.post('/contact', sendContactMessage);



module.exports = router;
