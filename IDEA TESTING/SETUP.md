# Quiz Battle Platform - Setup Guide

## 🚀 Quick Start Guide

Follow these steps to get your Quiz Battle Platform up and running!

### Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** database
- **npm** or **yarn** package manager

---

## 📦 Step 1: Install Dependencies

```bash
npm install
```

This will install all necessary packages including:
- Next.js 14 (Frontend & Backend)
- Prisma (Database ORM)
- Socket.io (Real-time communication)
- Zustand (State management)
- Tailwind CSS (Styling)

---

## 🗄️ Step 2: Set Up Database

### 2.1 Create PostgreSQL Database

Create a new PostgreSQL database called `quiz_battle`:

```sql
CREATE DATABASE quiz_battle;
```

### 2.2 Configure Environment Variables

The `.env` file has been created with default values. **Update it with your PostgreSQL credentials:**

```env
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/quiz_battle?schema=public"
```

**Important:** Change the `JWT_SECRET` to a strong random string in production!

### 2.3 Initialize Database Schema

Run these commands to set up your database:

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (creates tables)
npm run db:push

# Seed database with sample data (users, questions, cosmetics)
npm run db:seed
```

---

## 🎮 Step 3: Run the Application

You need to run **TWO servers** in separate terminals:

### Terminal 1: Next.js Development Server

```bash
npm run dev
```

This starts the web app at [http://localhost:3000](http://localhost:3000)

### Terminal 2: Socket.io Server (for real-time battles)

```bash
npm run socket
```

This starts the WebSocket server on port 3001

---

## 🎯 Step 4: Test the Application

1. **Open your browser** to [http://localhost:3000](http://localhost:3000)

2. **Create an account** or use test accounts:
   - Email: `player1@example.com` | Password: `password123`
   - Email: `player2@example.com` | Password: `password123`

3. **Test these features:**
   - ✅ Create a 1v1 battle room
   - ✅ Share room code and join from another browser/incognito window
   - ✅ Play a quiz battle
   - ✅ Check leaderboard
   - ✅ Visit the shop
   - ✅ View your profile stats

---

## 📊 Database Management

### View Database in Prisma Studio

```bash
npm run db:studio
```

Opens a visual database editor at [http://localhost:5555](http://localhost:5555)

### Reset Database (WARNING: Deletes all data!)

```bash
npx prisma db push --force-reset
npm run db:seed
```

---

## 🏗️ Project Structure

```
quiz-battle-platform/
├── app/                      # Next.js pages & API routes
│   ├── api/                  # Backend API endpoints
│   │   ├── auth/            # Authentication (login, register)
│   │   ├── cosmetics/       # Shop & purchases
│   │   ├── leaderboard/     # Leaderboard API
│   │   └── questions/       # Question topics
│   ├── auth/                # Auth pages (login, register)
│   ├── battle/              # Battle pages (menu, lobby, play, results)
│   ├── dashboard/           # Main dashboard
│   ├── leaderboard/         # Leaderboard page
│   ├── shop/                # Cosmetics shop
│   └── profile/             # User profile
│
├── components/              # Reusable React components (add your own!)
├── lib/                     # Utility functions
│   ├── auth.ts             # JWT authentication
│   ├── prisma.ts           # Prisma client
│   └── utils.ts            # Helper functions
│
├── server/                  # Socket.io server
│   ├── socket-server.ts    # Main server file
│   └── managers/
│       └── battleManager.ts # Battle room logic
│
├── store/                   # Zustand state management
│   ├── authStore.ts        # User authentication state
│   └── battleStore.ts      # Battle game state
│
├── prisma/                  # Database
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Seed data script
│
├── types/                   # TypeScript definitions
└── styles/                  # Global styles
```

---

## 🤖 AI Integration (Future Feature)

To enable AI-powered question generation:

### Option 1: OpenAI

1. Get an API key from [OpenAI Platform](https://platform.openai.com)
2. Add to `.env`:
   ```env
   OPENAI_API_KEY="sk-..."
   ```

### Option 2: Anthropic Claude

1. Get an API key from [Anthropic Console](https://console.anthropic.com)
2. Add to `.env`:
   ```env
   ANTHROPIC_API_KEY="sk-ant-..."
   ```

### Implementation Steps

1. **Create API endpoint** at `app/api/questions/generate/route.ts`
2. **Add prompt templates** for different topics/difficulties
3. **Implement validation** to ensure quality
4. **Add moderation** to filter inappropriate content
5. **Store generated questions** in the database

### Sample AI Prompt Structure

```typescript
const prompt = `
Generate a ${difficulty} difficulty multiple choice question about ${topic}.

Requirements:
- Question must be clear and unambiguous
- 4 answer options (A, B, C, D)
- Only one correct answer
- Include a brief explanation
- Appropriate for educational content

Format as JSON:
{
  "question": "...",
  "options": ["A", "B", "C", "D"],
  "correctAnswer": 0,  // Index of correct option
  "explanation": "..."
}
`;
```

---

## 🔒 Security Notes

### Before Deploying to Production:

1. **Change JWT_SECRET** to a strong random string
2. **Use environment variables** for all sensitive data
3. **Enable HTTPS** for secure connections
4. **Set up CORS** properly for Socket.io
5. **Implement rate limiting** on API endpoints
6. **Add input validation** with Zod schemas
7. **Sanitize user inputs** to prevent XSS attacks

---

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
pg_isready

# Test connection
psql -U your_user -d quiz_battle
```

### Port Already in Use

```bash
# Kill process on port 3000
npx kill-port 3000

# Kill process on port 3001
npx kill-port 3001
```

### Prisma Issues

```bash
# Regenerate Prisma Client
npx prisma generate

# Reset Prisma Client cache
rm -rf node_modules/.prisma
npm run db:generate
```

### Socket.io Not Connecting

1. Check Socket.io server is running in separate terminal
2. Verify `NEXT_PUBLIC_SOCKET_URL` in `.env` is correct
3. Check browser console for WebSocket errors
4. Ensure no firewall blocking port 3001

---

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js development server |
| `npm run socket` | Start Socket.io server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:studio` | Open Prisma Studio |

---

## 🎨 Customization Ideas

### Add New Topics

1. Edit `app/battle/page.tsx` - add topic to dropdown
2. Add questions for that topic in database or seed file

### Modify Rewards

1. Edit `server/managers/battleManager.ts`
2. Update `winnerXP`, `winnerCoins`, `loserXP`, `loserCoins`

### Change Difficulty Levels

1. Edit `prisma/schema.prisma` - modify `Difficulty` enum
2. Run `npm run db:push`
3. Update UI components

### Add New Cosmetics

1. Add to `prisma/seed.ts` in `cosmetics` array
2. Run `npm run db:seed`
3. Add cosmetic images to `public/cosmetics/`

---

## 📚 Tech Stack Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Socket.io Documentation](https://socket.io/docs/v4/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Zustand Documentation](https://docs.pmnd.rs/zustand)

---

## 🆘 Need Help?

If you encounter any issues:

1. Check the troubleshooting section above
2. Review error messages in browser console and terminal
3. Verify all environment variables are set correctly
4. Check that both servers (Next.js and Socket.io) are running

---

## 🎉 You're All Set!

Your Quiz Battle Platform is now ready! Start by creating an account and testing the 1v1 battle feature. Have fun building and customizing your quiz platform! 🚀
