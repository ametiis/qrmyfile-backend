const express = require('express');
const router = express.Router();
const { getUserProfile, updatePassword, updateProfile, becomePremium,deleteAccount,getMyProfile } = require('../controllers/userController');


// Middleware de simulation pour injecter userId depuis un token
const authenticate = require('../middleware/authenticate');

//Récupère les informations de son propre profil
router.get('/me', authenticate, getMyProfile);

//Récupère les information d'un user
router.get('/:id', getUserProfile);

//Permet de maj le password de l'utilisateur
router.put('/password', authenticate, updatePassword);

//Permet de maj un utilisateur
router.put('/profile', authenticate, updateProfile);

//Permet à un utilisateur de passer premium
router.put('/premium', authenticate, becomePremium);

// Supprime son compte utilisateur
router.delete('/delete', authenticate, deleteAccount);



module.exports = router;
