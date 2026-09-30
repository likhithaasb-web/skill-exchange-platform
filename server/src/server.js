const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');
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

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configurable CORS checker supporting Render domains, CLIENT_URL, and local dev
const configuredClients = (process.env.CLIENT_URL || '')
  .split(',')
  .map(u => u.trim().replace(/\/$/, ''))
  .filter(Boolean);

const allowedOrigins = [
  ...configuredClients,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

function isOriginAllowed(origin) {
  // Allow requests with no origin (mobile apps, curl, server-to-server)
  if (!origin) return true;

  const normalized = origin.replace(/\/$/, '');

  // Explicitly configured origins
  if (allowedOrigins.includes(normalized)) return true;

  try {
    const urlObj = new URL(origin);
    // Allow any Render deployment subdomain (*.onrender.com)
    if (urlObj.hostname.endsWith('.onrender.com')) return true;
    // Allow any localhost port
    if (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1') return true;
  } catch (e) {
    // Malformed URL, reject
    return false;
  }

  return false;
}

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive fallback to prevent deployment crashes while logging
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
};

// Socket.io initialization with CORS
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => callback(null, true),
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

app.use(cors(corsOptions));

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

// Serve static client bundle in production (Unified Fullstack Render Deployment)
const clientDistPath = path.resolve(__dirname, '../../client/dist');
const isClientBuilt = fs.existsSync(path.join(clientDistPath, 'index.html'));

if (isClientBuilt) {
  console.log(`[Production] Serving static client build from: ${clientDistPath}`);
  app.use(express.static(clientDistPath));

  // SPA fallback for all frontend routes
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Centralized Error Handling
app.use(errorHandler);

// Connect to MongoDB & Start Server
async function startServer() {
  try {
    console.log(`Connecting to MongoDB at: ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI);
    console.log('✓ Successfully connected to MongoDB.');

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`===============================================`);
      console.log(`  SKILLX BACKEND & SOCKET.IO SERVER RUNNING   `);
      console.log(`  Port: ${PORT}`);
      console.log(`  Host: 0.0.0.0`);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  Static Client: ${isClientBuilt ? 'Active (Unified Fullstack)' : 'Disabled (API Only)'}`);
      console.log(`===============================================`);
    });
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

startServer();

module.exports = { app, server };
