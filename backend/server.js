const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const accommodationRoutes = require('./routes/accommodationRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

const REQUIRED_ENV_VARS = ['MONGODB_URI', 'JWT_SECRET'];
const missing = REQUIRED_ENV_VARS.filter((v) => !process.env[v]);
if (missing.length > 0) {
  console.error('MISSING REQUIRED ENVIRONMENT VARIABLES:', missing.join(', '));
}

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CLIENT_ORIGIN || true
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));
app.use(express.json());

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

app.use('/api/accommodations', accommodationRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/users', userRoutes);

app.get('/health', (req, res) => {
  const mongoState = mongoose.connection.readyState;
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.json({
    status: 'ok',
    mongoose: states[mongoState] || 'unknown',
    nodeEnv: process.env.NODE_ENV || 'not set',
    uptime: Math.floor(process.uptime()),
    port: process.env.PORT || 5000,
  });
});

const clientBuild = path.join(__dirname, '..', 'client', 'build');
const adminBuild = path.join(__dirname, '..', 'admin', 'build');

if (process.env.NODE_ENV === 'production') {
  const clientIndex = path.join(clientBuild, 'index.html');
  const adminIndex = path.join(adminBuild, 'index.html');

  if (fs.existsSync(clientIndex)) {
    app.use(express.static(clientBuild));
    app.get('/', (req, res) => {
      res.sendFile(clientIndex);
    });
    app.get(/^\/(?!api\/|admin\/|uploads\/|health).*/, (req, res) => {
      res.sendFile(clientIndex);
    });
    console.log('Client build served from:', clientBuild);
  } else {
    console.error('CLIENT BUILD NOT FOUND:', clientIndex);
  }

  if (fs.existsSync(adminIndex)) {
    app.use('/admin', express.static(adminBuild));
    app.get('/admin/*', (req, res) => {
      res.sendFile(adminIndex);
    });
    console.log('Admin build served from:', adminBuild);
  } else {
    console.error('ADMIN BUILD NOT FOUND:', adminIndex);
  }
}

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('========================================');
  console.error('UNHANDLED ERROR:', err.message || err);
  console.error('STACK:', err.stack || '(no stack trace)');
  console.error('REQUEST:', req.method, req.originalUrl);
  console.error('========================================');
  if (err.message === 'Only image files are allowed') {
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({ message: 'Server error' });
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err.message));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('========================================');
  console.log('Node version:', process.version);
  console.log('Environment:', process.env.NODE_ENV || 'development');
  console.log('Port:', PORT);
  console.log('MongoDB URI:', process.env.MONGODB_URI ? '(set)' : '(MISSING)');
  console.log('JWT_SECRET:', process.env.JWT_SECRET ? '(set)' : '(MISSING)');
  console.log('Client build location:', clientBuild);
  console.log('  Exists:', fs.existsSync(clientBuild));
  console.log('Admin build location:', adminBuild);
  console.log('  Exists:', fs.existsSync(adminBuild));
  console.log('========================================');
});
