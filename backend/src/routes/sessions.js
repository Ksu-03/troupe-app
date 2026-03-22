const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Create a focus session
router.post('/', authenticate, async (req, res) => {
  try {
    const { troupeId, title, scheduledFor, durationMinutes, breakDurationMinutes, contributionGems } = req.body;
    
    // Check if user is in troupe
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
    
    // Create session
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

// Get active sessions for user
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

// Get session by ID
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

// Join session
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
      return res.status(400).json({ error: 'Session not available for joining' });
    }
    
    // Check if already joined
    const existingParticipant = session.participants.find(p => p.userId === req.userId);
    if (existingParticipant) {
      return res.status(400).json({ error: 'Already joined this session' });
    }
    
    // Check gem balance
    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    });
    
    const contribution = contributionGems || 10;
    if (user.focusGems < contribution) {
      return res.status(400).json({ error: 'Not enough gems' });
    }
    
    // Deduct gems
    await prisma.user.update({
      where: { id: req.userId },
      data: { focusGems: { decrement: contribution } }
    });
    
    // Add participant
    const participant = await prisma.sessionParticipant.create({
      data: {
        sessionId,
        userId: req.userId,
        contributionGems: contribution
      }
    });
    
    // Update pot size
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

// Start session (creator only)
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
      return res.status(403).json({ error: 'Only session creator can start' });
    }
    
    if (session.status !== 'scheduled') {
      return res.status(400).json({ error: 'Session already started or ended' });
    }
    
    const updatedSession = await prisma.focusSession.update({
      where: { id: sessionId },
      data: {
        status: 'active',
        startedAt: new Date()
      }
    });
    
    // Notify via socket (if needed)
    const io = req.app.get('io');
    io.to(`session:${sessionId}`).emit('session-started', { sessionId });
    
    res.json({ session: updatedSession });
    
  } catch (error) {
    console.error('Start session error:', error);
    res.status(500).json({ error: 'Failed to start session' });
  }
});

// End session
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
      return res.status(403).json({ error: 'Only session creator can end' });
    }
    
    if (session.status !== 'active') {
      return res.status(400).json({ error: 'Session not active' });
    }
    
    // Calculate earnings
    const focusedParticipants = session.participants.filter(p => p.focusStatus === 'focusing');
    const distractedParticipants = session.participants.filter(p => p.focusStatus === 'distracted');
    
    const totalPot = session.totalPotSize;
    const rewardPerFocused = focusedParticipants.length > 0 ? totalPot / focusedParticipants.length : 0;
    
    // Distribute gems
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
    
    // Update session
    const updatedSession = await prisma.focusSession.update({
      where: { id: sessionId },
      data: {
        status: 'completed',
        endedAt: new Date()
      }
    });
    
    // Notify via socket
    const io = req.app.get('io');
    io.to(`session:${sessionId}`).emit('session-ended', { 
      sessionId,
      results: {
        totalPot,
        focusedCount: focusedParticipants.length,
        distractedCount: distractedParticipants.length,
        rewardPerFocused
      }
    });
    
    res.json({ 
      session: updatedSession,
      results: {
        totalPot,
        focusedCount: focusedParticipants.length,
        distractedCount: distractedParticipants.length,
        rewardPerFocused
      }
    });
    
  } catch (error) {
    console.error('End session error:', error);
    res.status(500).json({ error: 'Failed to end session' });
  }
});

// Report distraction
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
      return res.status(400).json({ error: 'Already distracted or completed' });
    }
    
    // Update participant
    const updatedParticipant = await prisma.sessionParticipant.update({
      where: { id: participant.id },
      data: {
        focusStatus: 'distracted',
        distractionCount: participant.distractionCount + 1
      }
    });
    
    // Create distraction event
    await prisma.distractionEvent.create({
      data: {
        sessionId,
        userId: req.userId,
        distractionType: distractionType || 'self_report'
      }
    });
    
    // Notify via socket
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

// Send heartbeat (focus verification)
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
    
    // Check for distraction (simple motion detection)
    // In production, you'd have more sophisticated logic
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
