# Quiz Battle Platform 🎮

A real-time multiplayer quiz platform with 1v1 battles, custom rooms, rewards system, and account progression.

## Features

- 🎯 Individual Quiz Mode
- ⚔️ 1v1 Real-time Battles with Custom Rooms
- 📚 Multiple Topics & Difficulty Levels
- 🏆 Leaderboards & Rankings
- 💰 Coins & Cosmetics Reward System
- 📊 Account Level System (XP-based)
- 🎨 Gaming-style Interactive UI
- 🤖 AI-assisted Question Generation (Coming Soon)

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Real-time**: Socket.io
- **Database**: PostgreSQL with Prisma ORM
- **State Management**: Zustand
- **Animations**: Framer Motion

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your database credentials and secrets.

3. **Set up the database**:
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

4. **Run the development server**:
   ```bash
   # Terminal 1 - Next.js app
   npm run dev

   # Terminal 2 - Socket.io server
   npm run socket
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/                    # Next.js app directory
├── components/             # React components
├── lib/                    # Utilities and helpers
├── server/                 # Socket.io server
├── prisma/                 # Database schema and migrations
├── types/                  # TypeScript type definitions
├── store/                  # Zustand state management
└── styles/                 # Global styles
```

## AI Integration (Future)

For AI-powered question generation, you'll need:

1. **API Keys**: OpenAI or Anthropic Claude API key
2. **Setup**: 
   - Add API key to `.env`
   - Implement question generation prompts
   - Add validation layer for generated questions
   - Create moderation system

3. **Required Features**:
   - Topic-specific prompts
   - Difficulty level control
   - Answer validation
   - Question quality scoring
   - Duplicate detection

## License

MIT
