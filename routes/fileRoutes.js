const express = require('express');
const router = express.Router();
const { uploadFile, downloadFile } = require('../controllers/fileController');


// Middleware de simulation pour injecter userId depuis un token
const optionalAuth = require("../middleware/optionalAuth");

//Permet d'envoyer un fichier
router.put('/upload', optionalAuth, uploadFile);

//Permet de récupérer un fichier
router.put('/download',  downloadFile);

module.exports = router;
