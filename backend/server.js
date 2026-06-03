require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./config/database');

// Route imports
const authRoutes = require('./routes/auth');
const teamsRoutes = require('./routes/teams');
const playersRoutes = require('./routes/players');
const matchesRoutes = require('./routes/matches');
const pitchesRoutes = require('./routes/pitches');
const requestsRoutes = require('./routes/requests');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/players', playersRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/pitches', pitchesRoutes);
app.use('/api/requests', requestsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
