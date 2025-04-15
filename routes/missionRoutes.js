const express = require('express');
const router = express.Router();
const {
  createMission,
  listMissions,
  getMission,
  deleteMission,
  claimMission,
  rejectMission,
  acceptMission,
  completeMission,
  confirmMission,
  promoteMission
} = require('../controllers/missionController');
const authenticate = require('../middleware/authenticate');

// 🔓 Routes publiques
router.get('/', listMissions);           // Lister les missions
router.get('/:id', getMission);          // Voir les détails d'une mission

// 🔐 Routes protégées
router.post('/createMission', authenticate, createMission);                  // Créer une mission
router.delete('/:id', authenticate, deleteMission);                  // Supprimer sa propre mission
router.post('/:id/claim', authenticate, claimMission);              // Se proposer pour une mission
router.post('/:id/reject', authenticate, rejectMission);            // L'utilisateur peut rejeter un jockey
router.post('/:id/accept', authenticate, acceptMission);            // L'utilisateur peut accepter un jockey
router.post('/:id/complete', authenticate, completeMission);               // Soumettre une preuve
router.post('/:id/confirm', authenticate, confirmMission);        // Confirmer la mission
router.post('/:id/promote', authenticate, promoteMission);         // Mettre en avant la mission

module.exports = router;
