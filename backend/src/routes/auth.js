const express = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');
const { generateToken } = require('../lib/jwt');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, avatarEmoji, avatarColor } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }]
      }
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already taken' });
    }
    
    const passwordHash = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        avatarEmoji: avatarEmoji || '😊',
        avatarColor: avatarColor || '#6366F1'
      }
    });
    
    const token = generateToken(user.id);
    
    const { passwordHash: _, ...userWithoutPassword } = user;
    
    res.status(201).json({ user: userWithoutPassword, token });
    
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = generateToken(user.id);
    
    const { passwordHash: _, ...userWithoutPassword } = user;
    
    res.json({ user: userWithoutPassword, token });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  const { passwordHash: _, ...user } = req.user;
  res.json({ user });
});

module.exports = router;
