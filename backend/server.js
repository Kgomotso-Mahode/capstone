const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const accommodationRoutes = require('./routes/accommodationRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// ─── Required Environment Variables ──────────────────────────────────────────
const REQUIRED_ENV_VARS = ['MONGODB_URI', 'JWT_SECRET', 'PORT'];
const missing = REQUIRED_ENV_VARS.filter(v => !process.env[v]);
if (missing.length > 0) {
  console.error('MISSING REQUIRED ENVIRONMENT VARIABLES:', missing.join(', '));
  process.exit(1);
}

const { MONGODB_URI, PORT, NODE_ENV } = process.env;

// Validate MONGODB_URI format
if (!MONGODB_URI.startsWith('mongodb://') && !MONGODB_URI.startsWith('mongodb+srv://')) {
  console.error('MONGODB_URI must start with mongodb:// or mongodb+srv://');
  process.exit(1);
}

if (NODE_ENV === 'production' && !process.env.CLIENT_ORIGIN) {
  console.warn('Warning: CLIENT_ORIGIN not set; CORS will allow all origins');
}

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: NODE_ENV === 'production'
    ? process.env.CLIENT_ORIGIN || true
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));
app.use(express.json());

// uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// ─── API Routes ──────────────────────────────────────────────────────────────
app.use('/api/accommodations', accommodationRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/users', userRoutes);

// ─── Health Endpoint ─────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  const mongoState = mongoose.connection.readyState;
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.json({
    status: 'ok',
    mongoose: states[mongoState] || 'unknown',
    nodeEnv: NODE_ENV || 'not set',
  });
});

// ─── Production Static Serving ───────────────────────────────────────────────
const clientBuild = path.join(__dirname, '..', 'client', 'build');
const adminBuild = path.join(__dirname, '..', 'admin', 'build');

if (NODE_ENV === 'production') {
  const clientIndex = path.join(clientBuild, 'index.html');
  const adminIndex = path.join(adminBuild, 'index.html');

  if (fs.existsSync(clientIndex)) {
    app.use(express.static(clientBuild));
    app.get('/', (_req, res) => res.sendFile(clientIndex));
    app.get(/^\/(?!api\/|admin\/|uploads\/|health).*/, (_req, res) => res.sendFile(clientIndex));
    console.log('Client build served from:', clientBuild);
  } else {
    console.error('CLIENT BUILD NOT FOUND:', clientIndex);
  }

  if (fs.existsSync(adminIndex)) {
    app.use('/admin', express.static(adminBuild));
    app.get('/admin/*', (_req, res) => res.sendFile(adminIndex));
    console.log('Admin build served from:', adminBuild);
  } else {
    console.error('ADMIN BUILD NOT FOUND:', adminIndex);
  }
}

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('UNHANDLED ERROR:', err.message || err);
  console.error('STACK:', err.stack || '(no stack trace)');
  console.error('REQUEST:', req.method, req.originalUrl);
  if (err.message === 'Only image files are allowed') {
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({ message: 'Server error' });
});

// ─── MongoDB Connection & Server Start ───────────────────────────────────────
mongoose.connection.on('connected', () => console.log('MongoDB connected'));
mongoose.connection.on('error', err => console.error('MongoDB runtime error:', err.message));
mongoose.connection.on('disconnected', () => console.log('MongoDB disconnected'));

console.log('');
console.log('Server starting...');
console.log('NODE_ENV:', NODE_ENV || 'development');
console.log('PORT:', PORT);
console.log('MongoDB connection attempt...');
console.log('');

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
})
  .then(() => {
    app.listen(PORT, () => {
      console.log('');
      console.log('========================================');
      console.log('Express server started on port', PORT);
      console.log('Node version:', process.version);
      console.log('Environment:', NODE_ENV || 'development');
      console.log('========================================');
      console.log('');
    });
  })
  .catch((err) => {
    console.error('');
    console.error('=== MONGODB CONNECTION ERROR ===');
    console.error('  Name:', err.name);
    console.error('  Message:', err.message);
    console.error('  Code:', err.code);
    if (err.reason) {
      console.error('  Reason:', JSON.stringify(err.reason));
    }
    console.error('  Full error:', err);
    console.error('=== EXITING ===');
    console.error('');
    process.exit(1);
  });
