const express = require('express');
const cors = require('cors');
app.use(cors());  // This allows all origins
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());
app.set('io', io);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Troupe API is running!', version: '2.0.0' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/troupes', require('./routes/troupes'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/payments', require('./routes/payments'));
app.use('/webhooks', require('./webhooks/nowpayments'));

// Socket.io
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('join-session', (sessionId) => {
    socket.join(`session:${sessionId}`);
    console.log(`Socket ${socket.id} joined session ${sessionId}`);
  });
  
  socket.on('leave-session', (sessionId) => {
    socket.leave(`session:${sessionId}`);
  });
  
  socket.on('focus-status-update', (data) => {
    io.to(`session:${data.sessionId}`).emit('participant-update', data);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log('========================================');
  console.log('🚀 Troupe Server Running!');
  console.log('========================================');
  console.log(`📍 URL: https://troupe-app-production.up.railway.app`);
  console.log(`📍 Port: ${PORT}`);
  console.log('========================================');
  console.log('📋 Available Endpoints:');
  console.log('   GET  /                           - API Info');
  console.log('   GET  /health                     - Health Check');
  console.log('   POST /api/auth/register          - Register User');
  console.log('   POST /api/auth/login             - Login User');
  console.log('   GET  /api/users/profile          - User Profile');
  console.log('   GET  /api/users/stats            - User Stats');
  console.log('   GET  /api/troupes                - List Troupes');
  console.log('   POST /api/troupes                - Create Troupe');
  console.log('   GET  /api/payments/products      - Products');
  console.log('========================================');
});
