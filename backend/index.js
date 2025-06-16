// index.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes'); // ✅ Auth routes
const agentRoutes = require('./routes/agentRoutes');


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const corsOptions = {
  origin: '*', // or specify exact origin like 'http://localhost:8081'
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

app.use(express.json());

// Health check route
app.get('/', (req, res) => {
  res.send('API is running');
});

// Ping test route for frontend
app.get('/api/ping', (req, res) => {
  console.log("🔔 Ping route hit");
  res.json({ message: 'Backend connected successfully!' });
});

// Auth module routes
app.use('/api/auth', authRoutes); // e.g. /api/auth/signup, /api/auth/login
app.use('/api/agents', agentRoutes);

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ MongoDB connected');
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
})
.catch(err => console.error('❌ MongoDB connection failed:', err));
