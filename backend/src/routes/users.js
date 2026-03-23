const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/profile', authenticate, async (req, res) => {
  const { passwordHash: _, ...user } = req.user;
  res.json({ user });
});

router.put('/profile', authenticate, async (req, res) => {
  try {
    const { username, avatarEmoji, avatarColor, notificationToken } = req.body;
    
    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: {
        username: username || undefined,
        avatarEmoji: avatarEmoji || undefined,
        avatarColor: avatarColor || undefined,
        notificationToken: notificationToken || undefined
      }
    });
    
    const { passwordHash: _, ...user } = updatedUser;
    res.json({ user });
    
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Update failed' });
  }
});

router.get('/stats', authenticate, async (req, res) => {
  try {
    const sessions = await prisma.sessionParticipant.findMany({
      where: { userId: req.userId },
      include: { session: true }
    });
    
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.focusStatus === 'completed').length;
    const distractedSessions = sessions.filter(s => s.distractionCount > 0).length;
    
    const achievements = await prisma.userAchievement.findMany({
      where: { userId: req.userId },
      include: { achievement: true }
    });
    
    res.json({
      totalFocusMinutes: req.user.totalFocusMinutes,
      currentStreakDays: req.user.currentStreakDays,
      longestStreakDays: req.user.longestStreakDays,
      distractionCount: req.user.distractionCount,
      focusGems: req.user.focusGems,
      totalSessions,
      completedSessions,
      distractedSessions,
      achievements: achievements.map(a => a.achievement),
      isPremium: req.user.isPremium,
      premiumExpiresAt: req.user.premiumExpiresAt
    });
    
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

router.get('/achievements', authenticate, async (req, res) => {
  try {
    const allAchievements = await prisma.achievement.findMany();
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId: req.userId }
    });
    
    const earnedIds = new Set(userAchievements.map(ua => ua.achievementId));
    
    const achievements = allAchievements.map(achievement => ({
      ...achievement,
      earned: earnedIds.has(achievement.id)
    }));
    
    res.json({ achievements });
    
  } catch (error) {
    console.error('Achievements error:', error);
    res.status(500).json({ error: 'Failed to get achievements' });
  }
});

module.exports = router;
