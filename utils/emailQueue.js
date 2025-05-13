// utils/emailQueue.js
const queue = [];
let isSending = false;
const DELAY_MS = 3000; // 3 secondes entre chaque email

async function processQueue() {
  if (isSending || queue.length === 0) return;
  isSending = true;

  const { to, subject, html, sendFunction } = queue.shift();

  try {
    await sendFunction(to, subject, html);
    console.log(`✅ Email envoyé à ${to}`);
  } catch (err) {
    console.error(`❌ Erreur en envoyant à ${to}:`, err.message);
  }

  setTimeout(() => {
    isSending = false;
    processQueue(); // Envoie le mail suivant
  }, DELAY_MS);
}

function enqueueEmail({ to, subject, html, sendFunction }) {
  queue.push({ to, subject, html, sendFunction });
  processQueue();
}

module.exports = { enqueueEmail };
