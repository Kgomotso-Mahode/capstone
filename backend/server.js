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

process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason?.message || reason);
  if (reason?.stack) console.error('  Stack:', reason.stack);
});

// ─── Environment ────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = express();

// ─── Production Diagnostics ─────────────────────────────────────────────────
console.log('');
console.log('========================================');
console.log('  Airbnb Clone – Server Starting');
console.log('========================================');
console.log('  Node version:   ', process.version);
console.log('  NODE_ENV:       ', process.env.NODE_ENV || 'development');
console.log('  PORT:           ', process.env.PORT || '5000 (default)');
console.log('  MONGODB_URI:    ', process.env.MONGODB_URI ? '✓ set' : '✗ MISSING');
console.log('  JWT_SECRET:     ', process.env.JWT_SECRET ? '✓ set' : '✗ MISSING');
console.log('  CLIENT_ORIGIN:  ', process.env.CLIENT_ORIGIN || '(not set – CORS allows all)');
console.log('========================================');
console.log('');

// ─── Required Environment Variables ─────────────────────────────────────────
const HALT = false;
const REQUIRED_ENV_VARS = ['MONGODB_URI', 'JWT_SECRET'];
const missing = REQUIRED_ENV_VARS.filter(v => !process.env[v]);
if (missing.length > 0) {
  console.error('');
  console.error('FATAL: MISSING REQUIRED ENVIRONMENT VARIABLES:', missing.join(', '));
  console.error('Set them with:  heroku config:set VAR_NAME=value');
  console.error('');
  process.exit(1);
}

const { MONGODB_URI, NODE_ENV } = process.env;
const PORT = process.env.PORT || 5000;

// ─── Client/Admin Build Validation ──────────────────────────────────────────
const clientBuild = path.join(__dirname, '..', 'client', 'build');
const adminBuild = path.join(__dirname, '..', 'admin', 'build');

if (NODE_ENV === 'production') {
  const clientOk = fs.existsSync(path.join(clientBuild, 'index.html'));
  const adminOk = fs.existsSync(path.join(adminBuild, 'index.html'));
  console.log('  Client build:', clientOk ? '✓ found' : '✗ MISSING');
  console.log('  Admin build: ', adminOk ? '✓ found' : '✗ MISSING');
  if (!clientOk) {
    console.error('  → Run "npm run build:client" or deploy will not serve the frontend');
  }
  if (!adminOk) {
    console.error('  → Run "npm run build:admin" or the admin panel will not be served');
  }
}

// ─── Normalize MongoDB URI ──────────────────────────────────────────────────
let mongoUri = MONGODB_URI;
if (mongoUri.includes('ssl=true') && !mongoUri.includes('tls=true')) {
  mongoUri = mongoUri.replace('ssl=true', 'tls=true');
  console.log('  Normalized MONGODB_URI: replaced ssl=true with tls=true');
}

if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
  console.error('FATAL: MONGODB_URI must start with mongodb:// or mongodb+srv://');
  process.exit(1);
}

// ─── CORS Middleware ─────────────────────────────────────────────────────────
const corsOrigins = NODE_ENV === 'production'
  ? process.env.CLIENT_ORIGIN
    ? process.env.CLIENT_ORIGIN.split(',').map(s => s.trim())
    : true
  : ['http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
  origin: corsOrigins,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// ─── Uploads Directory ─────────────────────────────────────────────────────
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));
if (NODE_ENV === 'production') {
  console.log('  Note: Uploads are stored on the ephemeral Heroku filesystem');
  console.log('  and will be lost on dyno restart. For production, use cloud');
  console.log('  storage (S3/Cloudinary) instead.');
}

// ─── API Routes ─────────────────────────────────────────────────────────────
const accommodationRoutes = require('./routes/accommodationRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const userRoutes = require('./routes/userRoutes');

console.log('  Registering API routes...');
app.use('/api/accommodations', accommodationRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/users', userRoutes);
console.log('  API routes registered');
console.log('');

// ─── Health Endpoint ────────────────────────────────────────────────────────
const startTime = Date.now();

app.get('/health', (_req, res) => {
  const mongoState = mongoose.connection.readyState;
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  const envStatus = {};
  REQUIRED_ENV_VARS.forEach(v => { envStatus[v] = !!process.env[v]; });
  envStatus.CLIENT_ORIGIN = !!process.env.CLIENT_ORIGIN;
  envStatus.PORT = !!process.env.PORT;

  res.json({
    status: 'ok',
    uptime: `${Math.floor((Date.now() - startTime) / 1000)}s`,
    mongoose: states[mongoState] || 'unknown',
    env: envStatus,
    nodeVersion: process.version,
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
    console.log('  Client SPA served from:', clientBuild);
  } else {
    console.error('  WARNING: Client build not found at:', clientIndex);
    console.error('  Run: cd client && npm run build');
  }

  if (fs.existsSync(adminIndex)) {
    app.use('/admin', express.static(adminBuild));
    app.get('/admin/*', (_req, res) => res.sendFile(adminIndex));
    console.log('  Admin SPA served from:', adminBuild);
  } else {
    console.error('  WARNING: Admin build not found at:', adminIndex);
    console.error('  Run: cd admin && npm run build');
  }
}

// ─── 404 Handler ────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ─── Global Error Handler ───────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('UNHANDLED ERROR:', err.message || err);
  console.error('  Stack:', err.stack || '(no stack trace)');
  console.error('  Request:', req.method, req.originalUrl);
  if (err.message === 'Only image files are allowed') {
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({ message: 'Server error' });
});

// ─── Server Start (bind port immediately) ────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log('========================================');
  console.log(`  Express server listening on port ${PORT}`);
  console.log(`  Ready to accept connections`);
  console.log('========================================');
  console.log('');
});

// ─── Graceful Shutdown ───────────────────────────────────────────────────────
process.on('SIGTERM', () => {
  console.log('  SIGTERM received – shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close(false).then(() => {
      console.log('  Server and MongoDB connection closed');
      process.exit(0);
    });
  });
});

// ─── Async MongoDB Connection (non-blocking) ────────────────────────────────
mongoose.connection.on('connected', () => console.log('  MongoDB connected'));
mongoose.connection.on('error', err => console.error('  MongoDB runtime error:', err.message));
mongoose.connection.on('disconnected', () => console.log('  MongoDB disconnected'));

console.log('  Connecting to MongoDB...');

mongoose.connect(mongoUri, {
  serverSelectionTimeoutMS: 15000,
  connectTimeoutMS: 30000,
  heartbeatFrequencyMS: 10000,
  bufferCommands: false,
}).catch((err) => {
  console.error('');
  console.error('========================================');
  console.error('MONGODB CONNECTION FAILED');
  console.error('========================================');
  console.error('  Name:    ', err.name);
  console.error('  Message: ', err.message);
  console.error('  Code:    ', err.code);
  if (err.reason) {
    console.error('  Reason:');
    try { console.error('    ', JSON.stringify(err.reason, null, 2)); }
    catch (_) { console.error('    ', err.reason); }
  }
  if (err.cause) {
    console.error('  Cause:   ', err.cause.message || err.cause);
  }
  console.error('');
  console.error('TROUBLESHOOTING:');
  console.error('  1. Verify MONGODB_URI is correct in Heroku Config Vars');
  console.error('  2. Check MongoDB Atlas → Network Access → IP Whitelist');
  console.error('     Add 0.0.0.0/0 (allow from anywhere) for Heroku');
  console.error('  3. Verify username and password are correct');
  console.error('  4. Check that the database name exists in the URI');
  console.error('  5. Ensure the cluster is running (not paused)');
  console.error('');
  console.error('  Raw URI (redacted):');
  const redacted = mongoUri.replace(/:\/\/[^:]+:[^@]+@/, '://USER:PASSWORD@');
  console.error('    ' + redacted);
  console.error('');
  console.error('========================================');
});
