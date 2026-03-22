const { verifyToken } = require('../lib/jwt');
const prisma = require('../lib/prisma');

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId }
  });
  
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }
  
  req.user = user;
  req.userId = user.id;
  next();
}

async function requirePremium(req, res, next) {
  if (!req.user.isPremium) {
    return res.status(403).json({ error: 'Premium subscription required' });
  }
  
  if (req.user.premiumExpiresAt && new Date(req.user.premiumExpiresAt) < new Date()) {
    return res.status(403).json({ error: 'Premium subscription expired' });
  }
  
  next();
}

module.exports = { authenticate, requirePremium };
