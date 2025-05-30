const { supabase } = require("../utils/supabaseClient");
const { v4: uuidv4 } = require("uuid");
const CryptoJS = require("crypto-js");

// ⬆️ Upload d'un fichier
const uploadFile = async (req, res) => {
  try {
    const { encryptedFile, filename, passwordHash, expiresInHours } = req.body;

    if (!encryptedFile || !filename) {
      return res.status(400).json({ message: "fileRequired" });
    }

    const userId = req.user?.id || null;
    const sizeLimit = !userId ? 50 * 1024 * 1024 : req.user.is_premium ? 1024 * 1024 * 1024 * 50 : 50 * 1024 * 1024;

    const buffer = Buffer.from(encryptedFile, "base64");

    if (buffer.length > sizeLimit) {
      return res.status(413).json({ message: "fileTooHeavy" });
    }

    const uuid = uuidv4();
    const filePath = `${uuid}.enc`;

    const { error: uploadError } = await supabase.storage
      .from("qrmyfile")
      .upload(filePath, buffer, {
        contentType: "text/plain",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + (expiresInHours || 24));

    const { error: dbError } = await supabase
      .from("files")
      .insert({
        id: uuid,
        encrypted_file_url: filePath,
        encrypted_password: passwordHash || null,
        expires_at: expiresAt.toISOString(),
        file_size: buffer.length,
        owner_id: userId,
          original_filename: filename,
      });

    if (dbError) throw dbError;

    return res.status(200).json({ id: uuid });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ message: "Erreur interne lors de l'upload." });
  }
};

// ⬇️ Récupération du fichier
const downloadFile = async (req, res) => {
  try {
    const { id, passwordHash } = req.body;
    if (!id) return res.status(400).send("UUID requis.");

    const { data: fileData, error } = await supabase
      .from("files")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !fileData) return res.status(404).send("unknownFile");

    if (new Date() > new Date(fileData.expires_at)) {
      return res.status(410).send("errors.unknownFile");
    }

    if (fileData.encrypted_password && passwordHash !== fileData.encrypted_password) {
      return res.status(403).send("errors.unknownFile");
    }

    const { data: fileBlob, error: fileErr } = await supabase.storage
      .from("qrmyfile")
      .download(fileData.encrypted_file_url);

    if (fileErr || !fileBlob) {
      console.error("Supabase download error:", fileErr);
      return res.status(500).send("Erreur de téléchargement");
    }

    // Convertir le Blob en Buffer
    const arrayBuffer = await fileBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const originalName = fileData.original_filename || `${fileData.id}.bin`;

    // Nettoyage pour la partie filename=... (ASCII seulement)
    const asciiFilename = originalName.replace(/[^\x20-\x7E]/g, "_").replace(/["\\]/g, "");

    // Encodage pour filename*= (compatible accents et caractères spéciaux)
    const utf8Filename = encodeURIComponent(originalName);

    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${asciiFilename}"; filename*=UTF-8''${utf8Filename}`
    );

    return res.status(200).send(buffer);
  } catch (err) {
    console.error("Download error:", err);
    return res.status(500).send("unknown");
  }
};





module.exports = { uploadFile, downloadFile };
