import { create } from 'zustand';
import { Battle, Question, BattlePlayerScore } from '@/types';

interface BattleState {
  currentBattle: Battle | null;
  currentQuestion: Question | null;
  questionIndex: number;
  playerScores: BattlePlayerScore[];
  isAnswered: boolean;
  selectedAnswer: number | null;
  startTime: number | null;
  
  setBattle: (battle: Battle) => void;
  setQuestion: (question: Question, index: number) => void;
  setScores: (scores: BattlePlayerScore[]) => void;
  selectAnswer: (answer: number) => void;
  resetAnswer: () => void;
  setStartTime: (time: number) => void;
  resetBattle: () => void;
}

export const useBattleStore = create<BattleState>((set) => ({
  currentBattle: null,
  currentQuestion: null,
  questionIndex: 0,
  playerScores: [],
  isAnswered: false,
  selectedAnswer: null,
  startTime: null,

  setBattle: (battle) => set({ currentBattle: battle }),
  setQuestion: (question, index) =>
    set({ 
      currentQuestion: question, 
      questionIndex: index,
      isAnswered: false,
      selectedAnswer: null,
      startTime: Date.now(),
    }),
  setScores: (scores) => set({ playerScores: scores }),
  selectAnswer: (answer) => set({ selectedAnswer: answer, isAnswered: true }),
  resetAnswer: () => set({ isAnswered: false, selectedAnswer: null }),
  setStartTime: (time) => set({ startTime: time }),
  resetBattle: () =>
    set({
      currentBattle: null,
      currentQuestion: null,
      questionIndex: 0,
      playerScores: [],
      isAnswered: false,
      selectedAnswer: null,
      startTime: null,
    }),
}));
