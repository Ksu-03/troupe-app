const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');
const crypto = require('crypto');

const router = express.Router();

function generateInviteCode() {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

router.post('/', authenticate, async (req, res) => {
  try {
    const { name, description, crestEmoji, crestColor, isPrivate } = req.body;
    
    const inviteCode = generateInviteCode();
    
    const troupe = await prisma.troupe.create({
      data: {
        name,
        description,
        crestEmoji: crestEmoji || '🎯',
        crestColor: crestColor || '#6366F1',
        createdById: req.userId,
        isPrivate: isPrivate !== false,
        inviteCode
      }
    });
    
    await prisma.troupeMembership.create({
      data: {
        userId: req.userId,
        troupeId: troupe.id,
        role: 'admin'
      }
    });
    
    res.status(201).json({ troupe });
    
  } catch (error) {
    console.error('Create troupe error:', error);
    res.status(500).json({ error: 'Failed to create troupe' });
  }
});

router.get('/', authenticate, async (req, res) => {
  try {
    const memberships = await prisma.troupeMembership.findMany({
      where: { userId: req.userId },
      include: { troupe: true }
    });
    
    const troupes = memberships.map(m => m.troupe);
    res.json({ troupes });
    
  } catch (error) {
    console.error('Get troupes error:', error);
    res.status(500).json({ error: 'Failed to get troupes' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const troupe = await prisma.troupe.findUnique({
      where: { id: req.params.id },
      include: {
        members: {
          include: { user: true }
        }
      }
    });
    
    if (!troupe) {
      return res.status(404).json({ error: 'Troupe not found' });
    }
    
    const isMember = troupe.members.some(m => m.userId === req.userId);
    if (!isMember) {
      return res.status(403).json({ error: 'Not a member' });
    }
    
    const recentSessions = await prisma.focusSession.findMany({
      where: { troupeId: troupe.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        participants: true
      }
    });
    
    res.json({ troupe, recentSessions });
    
  } catch (error) {
    console.error('Get troupe error:', error);
    res.status(500).json({ error: 'Failed to get troupe' });
  }
});

router.post('/join', authenticate, async (req, res) => {
  try {
    const { inviteCode } = req.body;
    
    const troupe = await prisma.troupe.findUnique({
      where: { inviteCode: inviteCode.toUpperCase() }
    });
    
    if (!troupe) {
      return res.status(404).json({ error: 'Invalid invite code' });
    }
    
    const existingMembership = await prisma.troupeMembership.findUnique({
      where: {
        userId_troupeId: {
          userId: req.userId,
          troupeId: troupe.id
        }
      }
    });
    
    if (existingMembership) {
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
    
  } catch (error) {
    console.error('Join troupe error:', error);
    res.status(500).json({ error: 'Failed to join troupe' });
  }
});

router.post('/:id/leave', authenticate, async (req, res) => {
  try {
    const troupeId = req.params.id;
    
    const membership = await prisma.troupeMembership.findUnique({
      where: {
        userId_troupeId: {
          userId: req.userId,
          troupeId: troupeId
        }
      }
    });
    
    if (!membership) {
      return res.status(404).json({ error: 'Not a member' });
    }
    
    const admins = await prisma.troupeMembership.findMany({
      where: {
        troupeId: troupeId,
        role: 'admin'
      }
    });
    
    if (membership.role === 'admin' && admins.length === 1) {
      return res.status(400).json({ error: 'Cannot leave. Transfer admin role first.' });
    }
    
    await prisma.troupeMembership.delete({
      where: { id: membership.id }
    });
    
    res.json({ success: true });
    
  } catch (error) {
    console.error('Leave troupe error:', error);
    res.status(500).json({ error: 'Failed to leave troupe' });
  }
});

router.get('/:id/members', authenticate, async (req, res) => {
  try {
    const members = await prisma.troupeMembership.findMany({
      where: { troupeId: req.params.id },
      include: { user: true },
      orderBy: { role: 'desc' }
    });
    
    const membersWithStats = await Promise.all(members.map(async (member) => {
      const sessions = await prisma.sessionParticipant.findMany({
        where: { userId: member.userId }
      });
      
      const totalFocusMinutes = sessions.reduce((sum, s) => sum + s.focusMinutesAchieved, 0);
      const sessionsCompleted = sessions.filter(s => s.focusStatus === 'completed').length;
      
      return {
        ...member.user,
        role: member.role,
        joinedAt: member.joinedAt,
        totalFocusMinutes,
        sessionsCompleted
      };
    }));
    
    res.json({ members: membersWithStats });
    
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ error: 'Failed to get members' });
  }
});

router.post('/:id/invite-code', authenticate, async (req, res) => {
  try {
    const troupeId = req.params.id;
    
    const membership = await prisma.troupeMembership.findUnique({
      where: {
        userId_troupeId: {
          userId: req.userId,
          troupeId: troupeId
        }
      }
    });
    
    if (!membership || membership.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can regenerate invite code' });
    }
    
    const newInviteCode = generateInviteCode();
    
    const troupe = await prisma.troupe.update({
      where: { id: troupeId },
      data: { inviteCode: newInviteCode }
    });
    
    res.json({ inviteCode: troupe.inviteCode });
    
  } catch (error) {
    console.error('Regenerate code error:', error);
    res.status(500).json({ error: 'Failed to regenerate code' });
  }
});

module.exports = router;
