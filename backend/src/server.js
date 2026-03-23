const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

// Load environment variables FIRST
dotenv.config();

// Initialize express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Make io available to routes
app.set('io', io);

// ============ HEALTH ENDPOINTS ============
app.get('/', (req, res) => {
  res.json({ message: 'Troupe API is running!', version: '2.0.0' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============ AUTH ENDPOINTS ============
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, avatarEmoji, avatarColor } = req.body;
    
    console.log('Register attempt:', { username, email });
    
    // Simple validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    // In a real app, you'd check database and hash password
    // For now, return success with mock user
    const mockUser = {
      id: 'user_' + Date.now(),
      username,
      email,
      avatarEmoji: avatarEmoji || '😊',
      avatarColor: avatarColor || '#6366F1',
      focusGems: 100,
      isPremium: false,
      currentStreakDays: 0,
      totalFocusMinutes: 0
    };
    
    const mockToken = 'mock_jwt_token_' + Date.now();
    
    res.status(201).json({ user: mockUser, token: mockToken });
    
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt:', { email });
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    // In a real app, you'd check database
    // For now, accept any email/password for testing
    const mockUser = {
      id: 'user_' + Date.now(),
      username: email.split('@')[0],
      email: email,
      avatarEmoji: '😊',
      avatarColor: '#6366F1',
      focusGems: 100,
      isPremium: false,
      currentStreakDays: 0,
      totalFocusMinutes: 0
    };
    
    const mockToken = 'mock_jwt_token_' + Date.now();
    
    res.json({ user: mockUser, token: mockToken });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ============ USER ENDPOINTS ============
app.get('/api/users/profile', (req, res) => {
  const authHeader = req.headers.authorization;
  console.log('Profile request, auth:', authHeader ? 'present' : 'missing');
  
  res.json({
    user: {
      id: 'demo-user',
      username: 'demo_user',
      email: 'demo@troupe.com',
      avatarEmoji: '🧘',
      avatarColor: '#6366F1',
      focusGems: 500,
      isPremium: true,
      currentStreakDays: 7,
      totalFocusMinutes: 1260
    }
  });
});

app.get('/api/users/stats', (req, res) => {
  res.json({
    totalFocusMinutes: 1260,
    currentStreakDays: 7,
    longestStreakDays: 14,
    distractionCount: 3,
    focusGems: 500,
    totalSessions: 42,
    completedSessions: 38,
    isPremium: true
  });
});

app.get('/api/users/achievements', (req, res) => {
  res.json({
    achievements: [
      { id: 'first_focus', name: 'First Steps', description: 'Complete your first session', icon: '🌟', earned: true },
      { id: 'streak_master', name: 'Streak Master', description: '30-day streak', icon: '🔥', earned: false },
      { id: 'troupe_player', name: 'Troupe Player', description: '10 sessions', icon: '🎭', earned: true }
    ]
  });
});

// ============ TROUPE ENDPOINTS ============
app.get('/api/troupes', (req, res) => {
  res.json({
    troupes: [
      {
        id: 'troupe-1',
        name: 'Focus Friends',
        crestEmoji: '🎯',
        crestColor: '#6366F1',
        level: 3,
        totalFocusMinutes: 450
      },
      {
        id: 'troupe-2',
        name: 'Study Squad',
        crestEmoji: '📚',
        crestColor: '#10B981',
        level: 2,
        totalFocusMinutes: 180
      }
    ]
  });
});

app.post('/api/troupes', (req, res) => {
  const { name, description, crestEmoji, crestColor } = req.body;
  res.status(201).json({
    troupe: {
      id: 'troupe-' + Date.now(),
      name: name || 'My Troupe',
      description: description || '',
      crestEmoji: crestEmoji || '🎯',
      crestColor: crestColor || '#6366F1',
      inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      level: 1,
      totalFocusMinutes: 0
    }
  });
});

app.get('/api/troupes/:id', (req, res) => {
  res.json({
    troupe: {
      id: req.params.id,
      name: 'Focus Friends',
      crestEmoji: '🎯',
      crestColor: '#6366F1',
      level: 3,
      inviteCode: 'FOCUS123'
    },
    recentSessions: []
  });
});

app.get('/api/troupes/:id/members', (req, res) => {
  res.json({
    members: [
      { id: 'user1', username: 'alex', avatarEmoji: '😊', avatarColor: '#6366F1', role: 'admin', totalFocusMinutes: 320, sessionsCompleted: 15 },
      { id: 'user2', username: 'jamie', avatarEmoji: '🧘', avatarColor: '#10B981', role: 'member', totalFocusMinutes: 180, sessionsCompleted: 8 }
    ]
  });
});

app.post('/api/troupes/join', (req, res) => {
  const { inviteCode } = req.body;
  res.json({
    troupe: {
      id: 'joined-troupe',
      name: 'Joined Troupe',
      crestEmoji: '🎯',
      crestColor: '#6366F1'
    }
  });
});

// ============ SESSION ENDPOINTS ============
app.post('/api/sessions', (req, res) => {
  const { troupeId, durationMinutes } = req.body;
  res.status(201).json({
    session: {
      id: 'session-' + Date.now(),
      troupeId: troupeId,
      durationMinutes: durationMinutes || 25,
      status: 'scheduled'
    }
  });
});

app.get('/api/sessions/active', (req, res) => {
  res.json({ sessions: [] });
});

app.get('/api/sessions/:id', (req, res) => {
  res.json({
    session: {
      id: req.params.id,
      status: 'active',
      totalPotSize: 40,
      participants: [
        { id: 'p1', userId: 'user1', user: { username: 'alex', avatarEmoji: '😊', avatarColor: '#6366F1' }, focusStatus: 'focusing' }
      ]
    }
  });
});

app.post('/api/sessions/:id/join', (req, res) => {
  res.json({ participant: { id: 'p-new', focusStatus: 'focusing' } });
});

app.post('/api/sessions/:id/start', (req, res) => {
  res.json({ session: { status: 'active' } });
});

app.post('/api/sessions/:id/end', (req, res) => {
  res.json({ results: { totalPot: 40, rewardPerFocused: 20 } });
});

app.post('/api/sessions/:id/report-distraction', (req, res) => {
  res.json({ participant: { focusStatus: 'distracted' } });
});

app.post('/api/sessions/:id/heartbeat', (req, res) => {
  res.json({ status: 'focusing' });
});

// ============ PAYMENT ENDPOINTS ============
app.get('/api/payments/products', (req, res) => {
  res.json({
    products: [
      { id: 'premium_monthly', name: 'Premium Monthly', price: 3.99, currency: 'USD', type: 'subscription' },
      { id: 'premium_yearly', name: 'Premium Yearly', price: 29.99, currency: 'USD', type: 'subscription' },
      { id: 'gems_100', name: '100 Focus Gems', price: 0.99, currency: 'USD', type: 'gems', gems: 100 },
      { id: 'gems_500', name: '500 Focus Gems', price: 3.99, currency: 'USD', type: 'gems', gems: 550 }
    ]
  });
});

app.post('/api/payments/create', (req, res) => {
  const { productId } = req.body;
  res.json({
    success: true,
    paymentId: 'pay-' + Date.now(),
    checkoutUrl: 'https://nowpayments.io/payment/demo'
  });
});

app.get('/api/payments/status/:paymentId', (req, res) => {
  res.json({ status: 'pending' });
});

// ============ GEM ENDPOINTS ============
app.get('/api/gems/balance', (req, res) => {
  res.json({ balance: 500 });
});

// ============ WEBHOOK ============
app.post('/webhooks/nowpayments', (req, res) => {
  console.log('Webhook received:', req.body);
  res.sendStatus(200);
});

// ============ SOCKET.IO ============
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('join-session', (sessionId) => {
    socket.join(`session:${sessionId}`);
  });
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// ============ START SERVER ============
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log('========================================');
  console.log('🚀 Troupe Server Running!');
  console.log('========================================');
  console.log(`📍 URL: https://troupe-app-production.up.railway.app`);
  console.log(`📍 Port: ${PORT}`);
  console.log('========================================');
  console.log('📋 Available Endpoints:');
  console.log('   GET  /health                     - Health Check');
  console.log('   POST /api/auth/register          - Register User');
  console.log('   POST /api/auth/login             - Login User');
  console.log('   GET  /api/troupes                - List Troupes');
  console.log('   GET  /api/payments/products      - Products');
  console.log('========================================');
});
