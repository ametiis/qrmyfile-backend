const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const initializeDatabase = require("./initDb");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const path = require('path');

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/missions', require('./routes/missionRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/alerts', require('./routes/alertRoutes'));
app.use('/api/notifications', require('./routes/notificationsRoutes'));

app.get('/', (req, res) => {
  res.send('JogForMe API is running');
});



app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(PORT, async () => {
  await initializeDatabase();
  console.log(`✅ Server running on http://localhost:${PORT}`);
});