const multer = require("multer");

const storage = multer.memoryStorage(); // <-- la clé !

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB
  fileFilter: (req, file, cb) => {
    if (!file.originalname.endsWith(".gpx")) {
      return cb(new Error("Seuls les fichiers GPX sont autorisés"));
    }
    cb(null, true);
  },
});

module.exports = upload;
