const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');
  
  // Create achievements
  const achievements = [
    { id: 'first_focus', name: 'First Steps', description: 'Complete your first focus session', icon: '🌟', criteriaType: 'sessions_completed', criteriaValue: 1, rewardGems: 50 },
    { id: 'flawless_week', name: 'Flawless Week', description: 'No distractions for 7 days', icon: '💎', criteriaType: 'perfect_days_streak', criteriaValue: 7, rewardGems: 200 },
    { id: 'troupe_player', name: 'Troupe Player', description: 'Complete 10 sessions with the same Troupe', icon: '🎭', criteriaType: 'troupe_sessions', criteriaValue: 10, rewardGems: 150 },
    { id: 'in_the_zone', name: 'In the Zone', description: 'Complete a 2-hour session with zero distractions', icon: '🧘', criteriaType: 'perfect_long_session', criteriaValue: 120, rewardGems: 300 },
    { id: 'early_bird', name: 'Early Bird', description: 'Complete 5 sessions before 8 AM', icon: '🐦', criteriaType: 'morning_sessions', criteriaValue: 5, rewardGems: 100 },
    { id: 'night_owl', name: 'Night Owl', description: 'Complete 5 sessions after 10 PM', icon: '🦉', criteriaType: 'night_sessions', criteriaValue: 5, rewardGems: 100 },
    { id: 'streak_master', name: 'Streak Master', description: 'Maintain a 30-day focus streak', icon: '🔥', criteriaType: 'streak_days', criteriaValue: 30, rewardGems: 500 },
    { id: 'troupe_founder', name: 'Troupe Founder', description: 'Create a Troupe that reaches level 5', icon: '👑', criteriaType: 'troupe_level', criteriaValue: 5, rewardGems: 250 },
  ];
  
  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { id: achievement.id },
      update: {},
      create: achievement
    });
  }
  console.log(`✅ Created ${achievements.length} achievements`);
  
  // Create demo user (optional)
  const demoPassword = await bcrypt.hash('demo123', 10);
  await prisma.user.upsert({
    where: { email: 'demo@troupe.com' },
    update: {},
    create: {
      username: 'demo_user',
      email: 'demo@troupe.com',
      passwordHash: demoPassword,
      avatarEmoji: '🧘',
      avatarColor: '#6366F1',
      focusGems: 500,
      isPremium: true,
      premiumPlan: 'yearly',
      premiumExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    }
  });
  
  console.log('✅ Created demo user: demo@troupe.com / demo123');
  console.log('🌱 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
