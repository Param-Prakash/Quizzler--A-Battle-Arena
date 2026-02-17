import { PrismaClient, Difficulty, CosmeticType, Rarity } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create sample users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.upsert({
    where: { email: 'player1@example.com' },
    update: {},
    create: {
      username: 'QuizMaster',
      email: 'player1@example.com',
      password: hashedPassword,
      level: 5,
      xp: 450,
      coins: 500,
      avatar: 'avatar1',
      stats: {
        create: {
          totalGamesPlayed: 20,
          totalWins: 12,
          totalLosses: 7,
          totalDraws: 1,
          winStreak: 3,
          bestWinStreak: 5,
          totalCorrectAnswers: 85,
          totalQuestionsAnswered: 100,
          averageResponseTime: 3500,
        },
      },
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'player2@example.com' },
    update: {},
    create: {
      username: 'BrainWizard',
      email: 'player2@example.com',
      password: hashedPassword,
      level: 3,
      xp: 280,
      coins: 350,
      avatar: 'avatar2',
      stats: {
        create: {
          totalGamesPlayed: 15,
          totalWins: 8,
          totalLosses: 6,
          totalDraws: 1,
          winStreak: 2,
          bestWinStreak: 4,
          totalCorrectAnswers: 62,
          totalQuestionsAnswered: 75,
          averageResponseTime: 4200,
        },
      },
    },
  });

  console.log('✅ Created users');

  // Create sample questions
  const questions = [
    // Programming - Easy
    {
      question: 'What does HTML stand for?',
      options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlinks and Text Markup Language'],
      correctAnswer: 0,
      topic: 'Programming',
      difficulty: Difficulty.EASY,
      explanation: 'HTML stands for Hyper Text Markup Language, the standard markup language for creating web pages.',
    },
    {
      question: 'Which symbol is used for single-line comments in JavaScript?',
      options: ['#', '//', '/* */', '<!--'],
      correctAnswer: 1,
      topic: 'Programming',
      difficulty: Difficulty.EASY,
      explanation: 'In JavaScript, // is used for single-line comments.',
    },
    // Programming - Medium
    {
      question: 'What is the time complexity of binary search?',
      options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
      correctAnswer: 1,
      topic: 'Programming',
      difficulty: Difficulty.MEDIUM,
      explanation: 'Binary search has a time complexity of O(log n) as it divides the search space in half each iteration.',
    },
    {
      question: 'Which HTTP status code indicates a successful request?',
      options: ['404', '500', '200', '301'],
      correctAnswer: 2,
      topic: 'Programming',
      difficulty: Difficulty.MEDIUM,
      explanation: 'HTTP status code 200 indicates a successful request.',
    },
    // Programming - Hard
    {
      question: 'What design pattern ensures a class has only one instance?',
      options: ['Factory', 'Singleton', 'Observer', 'Decorator'],
      correctAnswer: 1,
      topic: 'Programming',
      difficulty: Difficulty.HARD,
      explanation: 'The Singleton pattern ensures a class has only one instance and provides a global point of access to it.',
    },

    // Science - Easy
    {
      question: 'What is the chemical symbol for water?',
      options: ['O2', 'H2O', 'CO2', 'H2'],
      correctAnswer: 1,
      topic: 'Science',
      difficulty: Difficulty.EASY,
      explanation: 'Water is composed of two hydrogen atoms and one oxygen atom, hence H2O.',
    },
    {
      question: 'How many planets are in our solar system?',
      options: ['7', '8', '9', '10'],
      correctAnswer: 1,
      topic: 'Science',
      difficulty: Difficulty.EASY,
      explanation: 'There are 8 planets in our solar system since Pluto was reclassified as a dwarf planet.',
    },
    // Science - Medium
    {
      question: 'What is the powerhouse of the cell?',
      options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Chloroplast'],
      correctAnswer: 1,
      topic: 'Science',
      difficulty: Difficulty.MEDIUM,
      explanation: 'Mitochondria are known as the powerhouse of the cell because they produce ATP energy.',
    },
    {
      question: 'What is the speed of light in vacuum?',
      options: ['300,000 km/s', '150,000 km/s', '450,000 km/s', '200,000 km/s'],
      correctAnswer: 0,
      topic: 'Science',
      difficulty: Difficulty.MEDIUM,
      explanation: 'The speed of light in vacuum is approximately 300,000 kilometers per second.',
    },

    // History - Easy
    {
      question: 'In which year did World War II end?',
      options: ['1943', '1944', '1945', '1946'],
      correctAnswer: 2,
      topic: 'History',
      difficulty: Difficulty.EASY,
      explanation: 'World War II ended in 1945 with the surrender of Japan.',
    },
    {
      question: 'Who was the first President of the United States?',
      options: ['Thomas Jefferson', 'George Washington', 'Abraham Lincoln', 'John Adams'],
      correctAnswer: 1,
      topic: 'History',
      difficulty: Difficulty.EASY,
      explanation: 'George Washington was the first President of the United States, serving from 1789 to 1797.',
    },
    // History - Medium
    {
      question: 'What year did the Berlin Wall fall?',
      options: ['1987', '1988', '1989', '1990'],
      correctAnswer: 2,
      topic: 'History',
      difficulty: Difficulty.MEDIUM,
      explanation: 'The Berlin Wall fell on November 9, 1989, marking a pivotal moment in the end of the Cold War.',
    },

    // Geography - Easy
    {
      question: 'What is the capital of France?',
      options: ['London', 'Berlin', 'Paris', 'Madrid'],
      correctAnswer: 2,
      topic: 'Geography',
      difficulty: Difficulty.EASY,
      explanation: 'Paris is the capital and largest city of France.',
    },
    {
      question: 'Which is the largest ocean on Earth?',
      options: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean'],
      correctAnswer: 3,
      topic: 'Geography',
      difficulty: Difficulty.EASY,
      explanation: 'The Pacific Ocean is the largest and deepest ocean on Earth.',
    },
    // Geography - Medium
    {
      question: 'How many countries are in Africa?',
      options: ['48', '52', '54', '58'],
      correctAnswer: 2,
      topic: 'Geography',
      difficulty: Difficulty.MEDIUM,
      explanation: 'There are 54 recognized countries in Africa.',
    },

    // Mathematics - Easy
    {
      question: 'What is 15% of 200?',
      options: ['25', '30', '35', '40'],
      correctAnswer: 1,
      topic: 'Mathematics',
      difficulty: Difficulty.EASY,
      explanation: '15% of 200 is calculated as (15/100) × 200 = 30.',
    },
    // Mathematics - Medium
    {
      question: 'What is the value of π (pi) approximately?',
      options: ['2.14', '3.14', '4.14', '5.14'],
      correctAnswer: 1,
      topic: 'Mathematics',
      difficulty: Difficulty.MEDIUM,
      explanation: 'Pi (π) is approximately 3.14159, commonly rounded to 3.14.',
    },
    {
      question: 'What is the square root of 144?',
      options: ['10', '11', '12', '13'],
      correctAnswer: 2,
      topic: 'Mathematics',
      difficulty: Difficulty.MEDIUM,
      explanation: 'The square root of 144 is 12, because 12 × 12 = 144.',
    },

    // General Knowledge - Easy
    {
      question: 'Which planet is known as the Red Planet?',
      options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
      correctAnswer: 1,
      topic: 'General Knowledge',
      difficulty: Difficulty.EASY,
      explanation: 'Mars is known as the Red Planet due to its reddish appearance from iron oxide on its surface.',
    },
    {
      question: 'How many days are in a leap year?',
      options: ['364', '365', '366', '367'],
      correctAnswer: 2,
      topic: 'General Knowledge',
      difficulty: Difficulty.EASY,
      explanation: 'A leap year has 366 days, with an extra day added in February.',
    },
  ];

  for (const q of questions) {
    await prisma.question.create({
      data: q,
    });
  }

  console.log('✅ Created questions');

  // Create cosmetics
  const cosmetics = [
    // Avatars
    { name: 'Classic Avatar', type: CosmeticType.AVATAR, rarity: Rarity.COMMON, coinCost: 0, imageUrl: '/cosmetics/avatar-classic.png', description: 'The default avatar' },
    { name: 'Cool Shades Avatar', type: CosmeticType.AVATAR, rarity: Rarity.RARE, coinCost: 500, imageUrl: '/cosmetics/avatar-shades.png', description: 'Looking cool with shades' },
    { name: 'Crown Avatar', type: CosmeticType.AVATAR, rarity: Rarity.EPIC, coinCost: 1000, imageUrl: '/cosmetics/avatar-crown.png', description: 'Royal avatar with a crown' },
    { name: 'Galaxy Avatar', type: CosmeticType.AVATAR, rarity: Rarity.LEGENDARY, coinCost: 2500, imageUrl: '/cosmetics/avatar-galaxy.png', description: 'Out of this world!' },
    
    // Frames
    { name: 'Bronze Frame', type: CosmeticType.FRAME, rarity: Rarity.COMMON, coinCost: 100, imageUrl: '/cosmetics/frame-bronze.png', description: 'Basic bronze border' },
    { name: 'Silver Frame', type: CosmeticType.FRAME, rarity: Rarity.RARE, coinCost: 300, imageUrl: '/cosmetics/frame-silver.png', description: 'Shiny silver border' },
    { name: 'Gold Frame', type: CosmeticType.FRAME, rarity: Rarity.EPIC, coinCost: 800, imageUrl: '/cosmetics/frame-gold.png', description: 'Luxurious gold border' },
    { name: 'Diamond Frame', type: CosmeticType.FRAME, rarity: Rarity.LEGENDARY, coinCost: 2000, imageUrl: '/cosmetics/frame-diamond.png', description: 'Sparkling diamond border' },
    
    // Badges
    { name: 'First Win Badge', type: CosmeticType.BADGE, rarity: Rarity.COMMON, coinCost: 0, imageUrl: '/cosmetics/badge-first-win.png', description: 'Earned on first victory' },
    { name: 'Streak Master Badge', type: CosmeticType.BADGE, rarity: Rarity.RARE, coinCost: 600, imageUrl: '/cosmetics/badge-streak.png', description: 'Win 5 in a row' },
    { name: 'Quiz Legend Badge', type: CosmeticType.BADGE, rarity: Rarity.LEGENDARY, coinCost: 3000, imageUrl: '/cosmetics/badge-legend.png', description: 'Reach level 50' },
    
    // Titles
    { name: 'Newbie', type: CosmeticType.TITLE, rarity: Rarity.COMMON, coinCost: 0, imageUrl: '', description: 'Just getting started' },
    { name: 'Quiz Enthusiast', type: CosmeticType.TITLE, rarity: Rarity.RARE, coinCost: 400, imageUrl: '', description: 'Loves quizzes!' },
    { name: 'Brain Master', type: CosmeticType.TITLE, rarity: Rarity.EPIC, coinCost: 1200, imageUrl: '', description: 'Master of knowledge' },
    { name: 'Trivia God', type: CosmeticType.TITLE, rarity: Rarity.LEGENDARY, coinCost: 5000, imageUrl: '', description: 'Ultimate quiz champion' },
  ];

  for (const cosmetic of cosmetics) {
    await prisma.cosmetic.create({
      data: cosmetic,
    });
  }

  console.log('✅ Created cosmetics');

  console.log('🎉 Database seeded successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error seeding database:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
