// index.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');         // ✅ Auth module
const claimsRoutes = require('./routes/claims');     // ✅ Claims module (for drivers)
const agentRoutes = require('./routes/agentRoutes'); // Optional, if agents are implemented
const messageRoutes = require('./routes/messages');
const analyticsRoutes = require('./routes/analytics');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));


// Middleware
const corsOptions = {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Health check
app.get('/', (req, res) => {
  res.send('API is running');
});

// Ping test
app.get('/api/ping', (req, res) => {
  console.log("🔔 Ping route hit");
  res.json({ message: 'Backend connected successfully!' });
});

// Route modules
app.use('/api/auth', authRoutes);      // /api/auth/signup, /login, /profile
app.use('/api/claims', claimsRoutes);  // /api/claims/report, /mine
app.use('/api/agents', agentRoutes);   
app.use('/api/messages', messageRoutes);
app.use('/api/analytics', analyticsRoutes);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected');
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
})
.catch(err => console.error('❌ MongoDB connection failed:', err));
