import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateLevel(xp: number): number {
  // Level formula: level = floor(sqrt(xp / 100)) + 1
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export function xpForNextLevel(currentLevel: number): number {
  // XP needed for next level: (level)^2 * 100
  return Math.pow(currentLevel, 2) * 100;
}

export function xpProgress(currentXP: number, currentLevel: number): number {
  const xpForCurrent = Math.pow(currentLevel - 1, 2) * 100;
  const xpForNext = xpForNextLevel(currentLevel);
  const progress = ((currentXP - xpForCurrent) / (xpForNext - xpForCurrent)) * 100;
  return Math.min(Math.max(progress, 0), 100);
}

export function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const milliseconds = ms % 1000;
  return `${seconds}.${Math.floor(milliseconds / 100)}s`;
}

export function getRarityColor(rarity: string): string {
  switch (rarity) {
    case 'COMMON':
      return 'text-gray-400';
    case 'RARE':
      return 'text-blue-400';
    case 'EPIC':
      return 'text-purple-400';
    case 'LEGENDARY':
      return 'text-yellow-400';
    default:
      return 'text-gray-400';
  }
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'EASY':
      return 'text-green-400';
    case 'MEDIUM':
      return 'text-yellow-400';
    case 'HARD':
      return 'text-orange-400';
    case 'EXPERT':
      return 'text-red-400';
    default:
      return 'text-gray-400';
  }
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}
