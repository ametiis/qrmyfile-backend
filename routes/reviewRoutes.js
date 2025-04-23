const express = require('express');
const router = express.Router();
const {
  getUserReviews,
  addReview,
  deleteReview,
  getMyReviewsMade
} = require('../controllers/reviewController');

const authenticate = require('../middleware/authenticate');

// Lister les reviews d’un utilisateur (public)
router.get('/all',authenticate, getMyReviewsMade);

// Lister les reviews d’un utilisateur (public)
router.get('/:userId', getUserReviews);

// Ajouter une review (authentifié)
router.post('/', authenticate, addReview);

// Supprimer sa propre review sur un utilisateur (authentifié)
router.delete('/', authenticate, deleteReview);

module.exports = router;
