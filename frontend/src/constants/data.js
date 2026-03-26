// Free avatars (available to all users)
export const FREE_AVATARS = [
  { emoji: '😊', name: 'Smile', free: true },
  { emoji: '🧘', name: 'Meditate', free: true },
  { emoji: '🎯', name: 'Target', free: true },
  { emoji: '💪', name: 'Strong', free: true },
];

// Premium avatars (only for premium users)
export const PREMIUM_AVATARS = [
  { emoji: '🌟', name: 'Star', free: false, premium: true },
  { emoji: '🔥', name: 'Fire', free: false, premium: true },
  { emoji: '🎭', name: 'Theatre', free: false, premium: true },
  { emoji: '💎', name: 'Gem', free: false, premium: true },
];

// All avatars combined
export const ALL_AVATARS = [...FREE_AVATARS, ...PREMIUM_AVATARS];

// Color options for avatars and troupes
export const COLOR_OPTIONS = [
  '#6366F1', // Indigo
  '#10B981', // Emerald
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
];

// Troupe icon options
export const TROUPE_ICONS = [
  '🎯', '🚀', '💪', '🌟', '🔥', '🎭', '📚', '🧘', '⚡', '🏆',
  '🎨', '🎵', '💻', '📱', '🎮', '🏀', '⚽', '🎾', '🏃', '🧠',
];

// Gem packages for purchase
export const GEM_PACKAGES = [
  { id: 'gems_100', gems: 100, price: 0.99, bonus: 0 },
  { id: 'gems_550', gems: 550, price: 3.99, bonus: 50 },
  { id: 'gems_1400', gems: 1400, price: 7.99, bonus: 200 },
  { id: 'gems_3750', gems: 3750, price: 14.99, bonus: 750 },
];

// Premium features list
export const PREMIUM_FEATURES = [
  { icon: '🎯', title: 'Unlimited Troupes', description: 'Create as many Troupes as you want' },
  { icon: '📊', title: 'Advanced Statistics', description: 'Detailed insights and charts' },
  { icon: '🎨', title: 'Exclusive Avatars', description: 'Premium emojis and custom looks' },
  { icon: '🎵', title: 'Focus Music Library', description: 'Lo-fi, nature sounds, and more' },
  { icon: '👑', title: 'Exclusive Badge', description: 'Show off your premium status' },
  { icon: '⚡', title: 'Priority Support', description: 'Fast responses to your questions' },
  { icon: '🎁', title: 'Weekly Bonus Gems', description: 'Get free gems every week' },
];

// How to earn gems
export const GEM_EARNING_METHODS = [
  { icon: '🎯', title: 'Complete focus sessions', amount: '+10', color: '#10B981' },
  { icon: '🔥', title: 'Maintain streak', amount: '+5/day', color: '#F59E0B' },
  { icon: '🏆', title: 'Achievements', amount: '+50-500', color: '#6366F1' },
  { icon: '💰', title: 'Win Focus Pot', amount: 'Variable', color: '#8B5CF6' },
];
