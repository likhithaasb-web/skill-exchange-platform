const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const exchangeRoutes = require('./routes/exchangeRoutes');
const studioRoutes = require('./routes/studioRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const projectRoutes = require('./routes/projectRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const safetyRoutes = require('./routes/safetyRoutes');
const messageRoutes = require('./routes/messageRoutes');
const errorHandler = require('./middleware/errorHandler');
const setupStudioSockets = require('./socket/studioSocket');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skillx_db';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Socket.io initialization with CORS
const io = new Server(server, {
  cors: {
    origin: [CLIENT_URL, 'http://localhost:3000', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Attach socket handlers
setupStudioSockets(io);

// Security & Parsing Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false
}));

app.use(cors({
  origin: [CLIENT_URL, 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Rate Limiter for Auth Routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60, // Limit each IP to 60 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts. Please try again after 15 minutes.' }
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/exchanges', exchangeRoutes);
app.use('/api/studios', studioRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/safety', safetyRoutes);
app.use('/api/messages', messageRoutes);

// Static uploads directory (for protected resource downloads, routes are used; thumbnails/previews can be served if needed)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Root Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    product: 'SkillX',
    tagline: 'Exchange Skills. Share Knowledge. Build Together.',
    timestamp: new Date().toISOString()
  });
});

// Centralized Error Handling
app.use(errorHandler);

// Connect to MongoDB & Start Server
async function startServer() {
  try {
    console.log(`Connecting to MongoDB at: ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI);
    console.log('✓ Successfully connected to MongoDB.');

    server.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`  SKILLX BACKEND & SOCKET.IO SERVER RUNNING   `);
      console.log(`  Port: ${PORT}`);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  Client Origin: ${CLIENT_URL}`);
      console.log(`===============================================`);
    });
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

startServer();

module.exports = { app, server };
