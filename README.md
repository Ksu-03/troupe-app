# Troupe - Focus Together

A social accountability app where friends form private groups (Troupes) to focus together in real-time.

## Features

- 👥 Private Troupes - Focus with people you trust
- 🎯 The Focus Pot - Real stakes, playful consequences
- 📱 Active Verification - Motion sensors detect phone movement
- 🏆 Achievements - Earn badges and rewards
- 💰 Gem Economy - Earn and spend virtual currency
- 🔔 Push Notifications - Stay connected with your Troupe

## Tech Stack

- **Frontend:** React Native (Expo)
- **Backend:** Node.js + Express
- **Database:** PostgreSQL + Prisma
- **Payments:** NOWPayments

## Setup Instructions

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in values
3. Run `npm install` in both `/backend` and `/frontend`
4. Set up PostgreSQL database
5. Run migrations: `npx prisma migrate dev`
6. Start backend: `npm run dev` in `/backend`
7. Start frontend: `npm start` in `/frontend`

## Environment Variables

See `.env.example` for required variables.

## License

MIT
