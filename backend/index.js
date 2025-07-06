// index.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');         // ✅ Auth module
const claimsRoutes = require('./routes/claims');           // ✅ Claims module (for drivers)
const agentRoutes = require('./routes/agentRoutes');       // ✅ Insurance Agent module
const messageRoutes = require('./routes/messages');        // ✅ Chat/messages
const analyticsRoutes = require('./routes/analytics');     // ✅ Admin analytics
const notificationRoutes = require('./routes/notifications'); // ✅ Notifications

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middleware setup
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// ✅ Health check routes
app.get('/', (req, res) => {
  res.send('API is running');
});

app.get('/api/ping', (req, res) => {
  console.log("🔔 Ping route hit");
  res.json({ message: 'Backend connected successfully!' });
});

// ✅ API Routes
app.use('/api/auth', authRoutes);             // /api/auth/signup, login, profile
app.use('/api/claims', claimsRoutes);         // /api/claims/report, /mine
app.use('/api/agents', agentRoutes);          // /api/agents/list, etc.
app.use('/api/messages', messageRoutes);      // /api/messages/:id, etc.
app.use('/api/analytics', analyticsRoutes);   // Admin analytics
app.use('/api/notifications', notificationRoutes); // /api/notifications/

// ✅ DB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected');
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
})
.catch(err => console.error('❌ MongoDB connection failed:', err));
