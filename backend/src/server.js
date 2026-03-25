const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.use(cors());
app.use(express.json());
app.set('io', io);

const prisma = new PrismaClient();

// ============ JWT ============
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
}

async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// ============ HEALTH ============
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============ AUTH ============
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, avatarEmoji, avatarColor } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] }
    });
    if (existingUser) {
      return res.status(400).json({ error: 'Email or username already taken' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash: hashedPassword,
        avatarEmoji: avatarEmoji || '😊',
        avatarColor: avatarColor || '#6366F1',
        focusGems: 100
      }
    });
    
    const token = generateToken(user.id);
    const { passwordHash, ...userWithoutPassword } = user;
    
    res.status(201).json({ user: userWithoutPassword, token });
    
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = generateToken(user.id);
    const { passwordHash, ...userWithoutPassword } = user;
    
    res.json({ user: userWithoutPassword, token });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/me', verifyToken, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    include: { troupes: true, focusSessions: true }
  });
  const { passwordHash, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword });
});

// ============ USERS ============
app.get('/api/users/profile', verifyToken, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId }
  });
  const { passwordHash, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword });
});

app.put('/api/users/profile', verifyToken, async (req, res) => {
  const { username, avatarEmoji, avatarColor } = req.body;
  const user = await prisma.user.update({
    where: { id: req.userId },
    data: { username, avatarEmoji, avatarColor }
  });
  const { passwordHash, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword });
});

app.get('/api/users/stats', verifyToken, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId }
  });
  
  res.json({
    totalFocusMinutes: user.totalFocusMinutes,
    currentStreakDays: user.currentStreakDays,
    longestStreakDays: user.longestStreakDays,
    distractionCount: user.distractionCount,
    focusGems: user.focusGems,
    isPremium: user.isPremium,
    premiumExpiresAt: user.premiumExpiresAt
  });
});

// ============ TROUPES ============
app.post('/api/troupes', verifyToken, async (req, res) => {
  const { name, description, crestEmoji, crestColor } = req.body;
  const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  const troupe = await prisma.troupe.create({
    data: {
      name,
      description,
      crestEmoji: crestEmoji || '🎯',
      crestColor: crestColor || '#6366F1',
      createdById: req.userId,
      inviteCode,
      members: {
        create: {
          userId: req.userId,
          role: 'admin'
        }
      }
    }
  });
  
  res.status(201).json({ troupe });
});

app.get('/api/troupes', verifyToken, async (req, res) => {
  const memberships = await prisma.troupeMembership.findMany({
    where: { userId: req.userId },
    include: { troupe: true }
  });
  const troupes = memberships.map(m => m.troupe);
  res.json({ troupes });
});

app.get('/api/troupes/:id', verifyToken, async (req, res) => {
  const troupe = await prisma.troupe.findUnique({
    where: { id: req.params.id },
    include: {
      members: {
        include: { user: true }
      }
    }
  });
  res.json({ troupe });
});

app.post('/api/troupes/join', verifyToken, async (req, res) => {
  const { inviteCode } = req.body;
  
  const troupe = await prisma.troupe.findUnique({
    where: { inviteCode: inviteCode.toUpperCase() }
  });
  
  if (!troupe) {
    return res.status(404).json({ error: 'Invalid invite code' });
  }
  
  const existing = await prisma.troupeMembership.findUnique({
    where: {
      userId_troupeId: {
        userId: req.userId,
        troupeId: troupe.id
      }
    }
  });
  
  if (existing) {
    return res.status(400).json({ error: 'Already a member' });
  }
  
  const membership = await prisma.troupeMembership.create({
    data: {
      userId: req.userId,
      troupeId: troupe.id,
      role: 'member'
    }
  });
  
  res.json({ troupe, membership });
});

// ============ SESSIONS ============
app.post('/api/sessions', verifyToken, async (req, res) => {
  const { troupeId, durationMinutes, breakDurationMinutes } = req.body;
  
  const session = await prisma.focusSession.create({
    data: {
      troupeId,
      createdById: req.userId,
      durationMinutes: durationMinutes || 25,
      breakDurationMinutes: breakDurationMinutes || 5
    }
  });
  
  res.status(201).json({ session });
});

app.post('/api/sessions/:id/join', verifyToken, async (req, res) => {
  const sessionId = req.params.id;
  const { contributionGems } = req.body;
  
  const user = await prisma.user.findUnique({
    where: { id: req.userId }
  });
  
  const contribution = contributionGems || 10;
  if (user.focusGems < contribution) {
    return res.status(400).json({ error: 'Not enough gems' });
  }
  
  await prisma.user.update({
    where: { id: req.userId },
    data: { focusGems: { decrement: contribution } }
  });
  
  const participant = await prisma.sessionParticipant.create({
    data: {
      sessionId,
      userId: req.userId,
      contributionGems: contribution
    }
  });
  
  await prisma.focusSession.update({
    where: { id: sessionId },
    data: { totalPotSize: { increment: contribution } }
  });
  
  res.json({ participant });
});

app.post('/api/sessions/:id/end', verifyToken, async (req, res) => {
  const sessionId = req.params.id;
  
  const session = await prisma.focusSession.findUnique({
    where: { id: sessionId },
    include: { participants: true }
  });
  
  const focusedParticipants = session.participants.filter(p => p.focusStatus === 'focusing');
  const totalPot = session.totalPotSize;
  const rewardPerFocused = focusedParticipants.length > 0 ? totalPot / focusedParticipants.length : 0;
  
  for (const participant of focusedParticipants) {
    const gemsEarned = Math.floor(rewardPerFocused);
    await prisma.user.update({
      where: { id: participant.userId },
      data: { focusGems: { increment: gemsEarned } }
    });
    
    await prisma.sessionParticipant.update({
      where: { id: participant.id },
      data: { gemsEarned, focusStatus: 'completed' }
    });
  }
  
  await prisma.focusSession.update({
    where: { id: sessionId },
    data: {
      status: 'completed',
      endedAt: new Date()
    }
  });
  
  res.json({
    results: {
      totalPot,
      focusedCount: focusedParticipants.length,
      rewardPerFocused
    }
  });
});

// ============ PAYMENTS ============
// ============ REAL PAYMENTS WITH NOWPAYMENTS ============

// Get products
app.get('/api/payments/products', (req, res) => {
  res.json({
    products: [
      { id: 'gems_100', name: '100 Gems', price: 0.99, type: 'gems', gems: 100 },
      { id: 'gems_550', name: '550 Gems', price: 3.99, type: 'gems', gems: 550 },
      { id: 'gems_1400', name: '1400 Gems', price: 7.99, type: 'gems', gems: 1400 },
      { id: 'gems_3750', name: '3750 Gems', price: 14.99, type: 'gems', gems: 3750 },
      { id: 'premium_monthly', name: 'Premium Monthly', price: 3.99, type: 'subscription' },
      { id: 'premium_yearly', name: 'Premium Yearly', price: 29.99, type: 'subscription' }
    ]
  });
});

// Create payment - REAL NOWPAYMENTS API
app.post('/api/payments/create', async (req, res) => {
  try {
    const { userId, productId, productName, amount, type } = req.body;
    
    const response = await axios.post('https://api.nowpayments.io/v1/payment', {
      price_amount: amount,
      price_currency: 'usd',
      pay_currency: 'usd',
      order_id: `${userId}_${productId}_${Date.now()}`,
      order_description: `Troupe - ${productName}`,
      ipn_callback_url: `${process.env.APP_URL}/webhooks/nowpayments`,
      success_url: `${process.env.FRONTEND_URL}/payment-success`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`
    }, {
      headers: {
        'x-api-key': process.env.NOWPAYMENTS_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    // Save pending payment
    await prisma.pendingPayment.create({
      data: {
        userId,
        productId,
        productType: type,
        amount,
        nowpaymentsId: response.data.payment_id,
        status: 'pending'
      }
    });
    
    res.json({
      success: true,
      checkoutUrl: response.data.invoice_url,
      paymentId: response.data.payment_id
    });
    
  } catch (error) {
    console.error('Payment creation error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

// Check payment status
app.get('/api/payments/status/:paymentId', async (req, res) => {
  try {
    const response = await axios.get(`https://api.nowpayments.io/v1/payment/${req.params.paymentId}`, {
      headers: { 'x-api-key': process.env.NOWPAYMENTS_API_KEY }
    });
    res.json({ status: response.data.payment_status });
  } catch (error) {
    res.json({ status: 'pending' });
  }
});

// Webhook for payment confirmation
app.post('/webhooks/nowpayments', async (req, res) => {
  try {
    const event = req.body;
    console.log('Webhook received:', event);
    
    if (event.payment_status === 'finished') {
      const payment = await prisma.pendingPayment.findUnique({
        where: { nowpaymentsId: event.payment_id }
      });
      
      if (payment && payment.status !== 'completed') {
        if (payment.productType === 'gems') {
          await prisma.user.update({
            where: { id: payment.userId },
            data: { focusGems: { increment: payment.gems || 0 } }
          });
        } else {
          await prisma.user.update({
            where: { id: payment.userId },
            data: { isPremium: true, premiumPlan: payment.productId }
          });
        }
        
        await prisma.pendingPayment.update({
          where: { id: payment.id },
          data: { status: 'completed', completedAt: new Date() }
        });
        
        console.log(`✅ Payment ${event.payment_id} completed!`);
      }
    }
    
    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook error:', error);
    res.sendStatus(500);
  }
});

// ============ SOCKET.IO ============
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('join-session', (sessionId) => {
    socket.join(`session:${sessionId}`);
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

// ============ START ============
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 URL: https://troupe-app-production.up.railway.app`);
});
