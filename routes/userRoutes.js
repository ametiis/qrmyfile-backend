const express = require('express');
const router = express.Router();
const { getUserProfile, updatePassword, updateProfile, becomePremium } = require('../controllers/userController');


// Middleware de simulation pour injecter userId depuis un token
const authenticate = require('../middleware/authenticate');

router.get('/:id', getUserProfile);
router.put('/password', authenticate, updatePassword);
router.put('/profile', authenticate, updateProfile);
router.put('/premium', authenticate, becomePremium);

module.exports = router;
