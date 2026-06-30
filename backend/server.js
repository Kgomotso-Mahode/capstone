const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// ─── Process-Level Error Handlers ──────────────────────────────────────────
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err.message);
  console.error(err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION at:', promise);
  console.error('  Reason:', reason?.message || reason);
  if (reason?.stack) console.error('  Stack:', reason.stack);
});

// ─── Environment ────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const accommodationRoutes = require('./routes/accommodationRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// ─── Production Diagnostics ─────────────────────────────────────────────────
console.log('');
console.log('========================================');
console.log('Server starting...');
console.log('Node version:', process.version);
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('PORT:', process.env.PORT || '(not set)');
console.log('MONGODB_URI set:', !!process.env.MONGODB_URI);
console.log('JWT_SECRET set:', !!process.env.JWT_SECRET);
console.log('CLIENT_ORIGIN set:', !!process.env.CLIENT_ORIGIN);
console.log('========================================');
console.log('');

// ─── Required Environment Variables ─────────────────────────────────────────
const REQUIRED_ENV_VARS = ['MONGODB_URI', 'JWT_SECRET', 'PORT'];
const missing = REQUIRED_ENV_VARS.filter(v => !process.env[v]);
if (missing.length > 0) {
  console.error('');
  console.error('FATAL: MISSING REQUIRED ENVIRONMENT VARIABLES:', missing.join(', '));
  console.error('Set them via: heroku config:set VAR_NAME=value');
  console.error('');
  process.exit(1);
}

const { MONGODB_URI, PORT, NODE_ENV } = process.env;

// ─── Client/Admin Build Validation ──────────────────────────────────────────
const clientBuild = path.join(__dirname, '..', 'client', 'build');
const adminBuild = path.join(__dirname, '..', 'admin', 'build');

if (NODE_ENV === 'production') {
  console.log('Checking build folders...');
  console.log('  Client build exists:', fs.existsSync(path.join(clientBuild, 'index.html')));
  console.log('  Admin build exists:', fs.existsSync(path.join(adminBuild, 'index.html')));
}

// ─── Normalize MongoDB URI ──────────────────────────────────────────────────
let mongoUri = MONGODB_URI;
if (mongoUri.includes('ssl=true') && !mongoUri.includes('tls=true')) {
  mongoUri = mongoUri.replace('ssl=true', 'tls=true');
  console.log('Normalized MONGODB_URI: replaced ssl=true with tls=true');
}

if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
  console.error('FATAL: MONGODB_URI must start with mongodb:// or mongodb+srv://');
  process.exit(1);
}

if (NODE_ENV === 'production' && !process.env.CLIENT_ORIGIN) {
  console.warn('Warning: CLIENT_ORIGIN not set; CORS will allow all origins');
}

// ─── Middleware ──────────────────────────────────────────────────────────────
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

// ─── API Routes ─────────────────────────────────────────────────────────────
console.log('Registering API routes...');
app.use('/api/accommodations', accommodationRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/users', userRoutes);
console.log('API routes registered successfully');

// ─── Health Endpoint ────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  const mongoState = mongoose.connection.readyState;
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.json({
    status: 'ok',
    mongoose: states[mongoState] || 'unknown',
    nodeEnv: NODE_ENV || 'not set',
  });
});

// ─── Production Static Serving ──────────────────────────────────────────────
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

// ─── 404 ────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ─── Global Error Handler ───────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('UNHANDLED ERROR:', err.message || err);
  console.error('STACK:', err.stack || '(no stack trace)');
  console.error('REQUEST:', req.method, req.originalUrl);
  if (err.message === 'Only image files are allowed') {
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({ message: 'Server error' });
});

// ─── MongoDB Connection & Server Start ──────────────────────────────────────
mongoose.connection.on('connected', () => console.log('MongoDB connected'));
mongoose.connection.on('error', err => console.error('MongoDB runtime error:', err.message));
mongoose.connection.on('disconnected', () => console.log('MongoDB disconnected'));

console.log('');
console.log('Attempting MongoDB connection...');

mongoose.connect(mongoUri, {
  serverSelectionTimeoutMS: 15000,
  connectTimeoutMS: 30000,
  heartbeatFrequencyMS: 10000,
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
    console.error('========================================');
    console.error('MONGODB CONNECTION FAILED');
    console.error('========================================');
    console.error('  Name:', err.name);
    console.error('  Message:', err.message);
    console.error('  Code:', err.code);
    console.error('  Stack:', err.stack);
    if (err.reason) {
      console.error('  Reason:');
      try { console.error('    ', JSON.stringify(err.reason, null, 2)); }
      catch (_) { console.error('    ', err.reason); }
    }
    if (err.cause) {
      console.error('  Cause:', err.cause.message || err.cause);
    }
    console.error('');
    console.error('TROUBLESHOOTING:');
    console.error('  1. Verify MONGODB_URI is correct in Heroku Config Vars');
    console.error('  2. Check MongoDB Atlas -> Network Access -> IP Whitelist');
    console.error('     Add 0.0.0.0/0 (allow from anywhere) for Heroku');
    console.error('  3. Verify username and password are correct');
    console.error('  4. Check that the database name exists in the URI');
    console.error('  5. Ensure the cluster is running (not paused)');
    console.error('');
    console.error('Raw MONGODB_URI (credentials hidden):');
    const redacted = mongoUri.replace(/:\/\/[^:]+:[^@]+@/, '://USER:PASSWORD@');
    console.error('  ', redacted);
    console.error('');
    console.error('========================================');
    process.exit(1);
  });
