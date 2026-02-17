export interface User {
  id: string;
  username: string;
  email: string;
  level: number;
  xp: number;
  coins: number;
  avatar: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserStats {
  id: string;
  userId: string;
  totalGamesPlayed: number;
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
  winStreak: number;
  bestWinStreak: number;
  totalCorrectAnswers: number;
  totalQuestionsAnswered: number;
  averageResponseTime: number;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  topic: string;
  difficulty: Difficulty;
  explanation?: string;
}

export interface Battle {
  id: string;
  roomCode: string;
  topic: string;
  difficulty: Difficulty;
  status: BattleStatus;
  questionCount: number;
  startedAt?: Date;
  endedAt?: Date;
  participants: BattleParticipant[];
  questions?: BattleQuestion[];
}

export interface BattleParticipant {
  id: string;
  battleId: string;
  userId: string;
  user: {
    id: string;
    username: string;
    level: number;
    avatar: string;
  };
  score: number;
  correctAnswers: number;
  position?: number;
  xpGained: number;
  coinsGained: number;
}

export interface BattleQuestion {
  id: string;
  battleId: string;
  questionId: string;
  question: Question;
  orderIndex: number;
}

export interface Cosmetic {
  id: string;
  name: string;
  type: CosmeticType;
  rarity: Rarity;
  coinCost: number;
  description?: string;
  imageUrl: string;
}

export interface UserCosmetic {
  id: string;
  userId: string;
  cosmeticId: string;
  cosmetic: Cosmetic;
  isEquipped: boolean;
  purchasedAt: Date;
}

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  EXPERT = 'EXPERT',
}

export enum BattleStatus {
  WAITING = 'WAITING',
  READY = 'READY',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum CosmeticType {
  AVATAR = 'AVATAR',
  FRAME = 'FRAME',
  BADGE = 'BADGE',
  TITLE = 'TITLE',
  EFFECT = 'EFFECT',
}

export enum Rarity {
  COMMON = 'COMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  level: number;
  avatar: string;
  stats: {
    totalWins: number;
    totalGamesPlayed: number;
    winRate: number;
  };
}

export interface BattlePlayerScore {
  userId: string;
  username: string;
  score: number;
  correctAnswers: number;
}

export interface BattleResults {
  winner: BattlePlayerScore | null;
  players: Array<BattlePlayerScore & {
    xpGained: number;
    coinsGained: number;
  }>;
  isDraw: boolean;
}
