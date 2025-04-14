const express = require('express');
const router = express.Router();
const {
  createMission,
  listMissions,
  getMission,
  deleteMission,
  acceptMission,
  submitProof,
  validateMission,
  markAsPaid,
  promoteMission
} = require('../controllers/missionController');
const authenticate = require('../middleware/authenticate');

// 🔓 Routes publiques
router.get('/', listMissions);           // Lister les missions
router.get('/:id', getMission);          // Voir les détails d'une mission

// 🔐 Routes protégées
router.post('/', authenticate, createMission);                        // Créer une mission
router.delete('/:id', authenticate, deleteMission);                  // Supprimer sa propre mission
router.post('/:id/accept', authenticate, acceptMission);            // Accepter une mission
router.post('/:id/proof', authenticate, submitProof);               // Soumettre une preuve
router.post('/:id/validate', authenticate, validateMission);        // Valider la mission
router.post('/:id/paid', authenticate, markAsPaid);                 // Marquer comme payée
router.post('/:id/promote', authenticate, promoteMission);         // Mettre en avant la mission

module.exports = router;
