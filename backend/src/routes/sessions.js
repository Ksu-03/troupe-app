const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticate, async (req, res) => {
  try {
    const { troupeId, title, scheduledFor, durationMinutes, breakDurationMinutes } = req.body;
    
    const membership = await prisma.troupeMembership.findUnique({
      where: {
        userId_troupeId: {
          userId: req.userId,
          troupeId: troupeId
        }
      }
    });
    
    if (!membership) {
      return res.status(403).json({ error: 'Not a member of this troupe' });
    }
    
    const session = await prisma.focusSession.create({
      data: {
        troupeId,
        createdById: req.userId,
        title,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        durationMinutes: durationMinutes || 25,
        breakDurationMinutes: breakDurationMinutes || 5
      }
    });
    
    res.status(201).json({ session });
    
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

router.get('/active', authenticate, async (req, res) => {
  try {
    const activeSessions = await prisma.focusSession.findMany({
      where: {
        status: 'active',
        participants: {
          some: { userId: req.userId }
        }
      },
      include: {
        troupe: true,
        participants: {
          include: { user: true }
        }
      }
    });
    
    res.json({ sessions: activeSessions });
    
  } catch (error) {
    console.error('Get active sessions error:', error);
    res.status(500).json({ error: 'Failed to get active sessions' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const session = await prisma.focusSession.findUnique({
      where: { id: req.params.id },
      include: {
        troupe: true,
        participants: {
          include: { user: true }
        },
        distractionEvents: {
          where: { userId: req.userId }
        }
      }
    });
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    res.json({ session });
    
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Failed to get session' });
  }
});

router.post('/:id/join', authenticate, async (req, res) => {
  try {
    const sessionId = req.params.id;
    const { contributionGems } = req.body;
    
    const session = await prisma.focusSession.findUnique({
      where: { id: sessionId },
      include: { participants: true }
    });
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    if (session.status !== 'scheduled' && session.status !== 'active') {
      return res.status(400).json({ error: 'Session not available' });
    }
    
    const existingParticipant = session.participants.find(p => p.userId === req.userId);
    if (existingParticipant) {
      return res.status(400).json({ error: 'Already joined' });
    }
    
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
    
  } catch (error) {
    console.error('Join session error:', error);
    res.status(500).json({ error: 'Failed to join session' });
  }
});

router.post('/:id/start', authenticate, async (req, res) => {
  try {
    const sessionId = req.params.id;
    
    const session = await prisma.focusSession.findUnique({
      where: { id: sessionId }
    });
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    if (session.createdById !== req.userId) {
      return res.status(403).json({ error: 'Only creator can start' });
    }
    
    if (session.status !== 'scheduled') {
      return res.status(400).json({ error: 'Session already started' });
    }
    
    const updatedSession = await prisma.focusSession.update({
      where: { id: sessionId },
      data: {
        status: 'active',
        startedAt: new Date()
      }
    });
    
    const io = req.app.get('io');
    io.to(`session:${sessionId}`).emit('session-started', { sessionId });
    
    res.json({ session: updatedSession });
    
  } catch (error) {
    console.error('Start session error:', error);
    res.status(500).json({ error: 'Failed to start session' });
  }
});

router.post('/:id/end', authenticate, async (req, res) => {
  try {
    const sessionId = req.params.id;
    
    const session = await prisma.focusSession.findUnique({
      where: { id: sessionId },
      include: { participants: true }
    });
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    if (session.createdById !== req.userId) {
      return res.status(403).json({ error: 'Only creator can end' });
    }
    
    if (session.status !== 'active') {
      return res.status(400).json({ error: 'Session not active' });
    }
    
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
    
    const updatedSession = await prisma.focusSession.update({
      where: { id: sessionId },
      data: {
        status: 'completed',
        endedAt: new Date()
      }
    });
    
    const io = req.app.get('io');
    io.to(`session:${sessionId}`).emit('session-ended', {
      sessionId,
      results: {
        totalPot,
        focusedCount: focusedParticipants.length,
        distractedCount: session.participants.length - focusedParticipants.length,
        rewardPerFocused
      }
    });
    
    res.json({
      session: updatedSession,
      results: {
        totalPot,
        focusedCount: focusedParticipants.length,
        distractedCount: session.participants.length - focusedParticipants.length,
        rewardPerFocused
      }
    });
    
  } catch (error) {
    console.error('End session error:', error);
    res.status(500).json({ error: 'Failed to end session' });
  }
});

router.post('/:id/report-distraction', authenticate, async (req, res) => {
  try {
    const sessionId = req.params.id;
    const { distractionType } = req.body;
    
    const participant = await prisma.sessionParticipant.findUnique({
      where: {
        sessionId_userId: {
          sessionId,
          userId: req.userId
        }
      }
    });
    
    if (!participant) {
      return res.status(404).json({ error: 'Not a participant' });
    }
    
    if (participant.focusStatus !== 'focusing') {
      return res.status(400).json({ error: 'Already distracted' });
    }
    
    const updatedParticipant = await prisma.sessionParticipant.update({
      where: { id: participant.id },
      data: {
        focusStatus: 'distracted',
        distractionCount: participant.distractionCount + 1
      }
    });
    
    await prisma.distractionEvent.create({
      data: {
        sessionId,
        userId: req.userId,
        distractionType: distractionType || 'self_report'
      }
    });
    
    const io = req.app.get('io');
    io.to(`session:${sessionId}`).emit('participant-distracted', {
      userId: req.userId,
      distractionType
    });
    
    res.json({ participant: updatedParticipant });
    
  } catch (error) {
    console.error('Report distraction error:', error);
    res.status(500).json({ error: 'Failed to report distraction' });
  }
});

router.post('/:id/heartbeat', authenticate, async (req, res) => {
  try {
    const sessionId = req.params.id;
    const { motionData, foregroundApp } = req.body;
    
    const participant = await prisma.sessionParticipant.findUnique({
      where: {
        sessionId_userId: {
          sessionId,
          userId: req.userId
        }
      }
    });
    
    if (!participant) {
      return res.status(404).json({ error: 'Not a participant' });
    }
    
    let isDistracted = false;
    let distractionReason = null;
    
    if (motionData && motionData.isMoving === true) {
      isDistracted = true;
      distractionReason = 'phone_movement';
    }
    
    if (foregroundApp && foregroundApp.isDistracting === true) {
      isDistracted = true;
      distractionReason = 'app_switch';
    }
    
    if (isDistracted && participant.focusStatus === 'focusing') {
      await prisma.sessionParticipant.update({
        where: { id: participant.id },
        data: {
          focusStatus: 'distracted',
          distractionCount: participant.distractionCount + 1
        }
      });
      
      await prisma.distractionEvent.create({
        data: {
          sessionId,
          userId: req.userId,
          distractionType: distractionReason
        }
      });
      
      const io = req.app.get('io');
      io.to(`session:${sessionId}`).emit('participant-distracted', {
        userId: req.userId,
        distractionType: distractionReason
      });
    }
    
    res.json({
      status: participant.focusStatus,
      distractionCount: participant.distractionCount
    });
    
  } catch (error) {
    console.error('Heartbeat error:', error);
    res.status(500).json({ error: 'Failed to send heartbeat' });
  }
});

module.exports = router;
