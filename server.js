const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const initializeDatabase = require("./initDb");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const path = require('path');

app.use(cors({
  origin: '*', // ou ton domaine exact en prod
  exposedHeaders: ['Content-Disposition'],
}));
app.use(bodyParser.json({ limit: "50mb" })); // <== AUGMENTE LA LIMITE JSON
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/file', require('./routes/fileRoutes'));


app.get('/', (req, res) => {
  res.send('QRmyfile API is running');
});



app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(PORT, async () => {
  await initializeDatabase();
  console.log(`✅ Server running on http://localhost:${PORT}`);
});