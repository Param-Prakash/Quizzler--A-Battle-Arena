'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Trophy, TrendingUp, Coins, Star, Home } from 'lucide-react';
import Link from 'next/link';

export default function BattleResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, updateUser } = useAuthStore();
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    const data = searchParams.get('data');
    if (data) {
      setResults(JSON.parse(data));
    }
  }, [searchParams]);

  useEffect(() => {
    if (results && user) {
      // Update user data
      const playerResult = results.players.find((p: any) => p.userId === user.id);
      if (playerResult) {
        updateUser({
          xp: user.xp + playerResult.xpGained,
          coins: user.coins + playerResult.coinsGained,
        });
      }
    }
  }, [results, user]);

  if (!results) {
    return null;
  }

  const isWinner = results.winner?.userId === user?.id;
  const playerResult = results.players.find((p: any) => p.userId === user?.id);
  const opponentResult = results.players.find((p: any) => p.userId !== user?.id);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto">
        {/* Result Header */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-6">
            <Trophy className={`w-24 h-24 ${isWinner ? 'text-yellow-400' : 'text-gray-400'}`} />
            {isWinner && (
              <div className="absolute inset-0 blur-2xl bg-yellow-400/50 animate-pulse" />
            )}
          </div>
          <h1 className={`text-5xl font-bold mb-4 ${isWinner ? 'text-gradient' : 'text-gray-400'}`}>
            {results.isDraw ? 'Draw!' : isWinner ? 'Victory!' : 'Defeat'}
          </h1>
          <p className="text-gray-400 text-lg">
            {results.isDraw
              ? 'Great match! You both scored the same.'
              : isWinner
              ? 'Congratulations! You won the battle!'
              : 'Better luck next time!'}
          </p>
        </div>

        {/* Players Comparison */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <PlayerResultCard
            player={playerResult}
            isWinner={isWinner && !results.isDraw}
            isCurrentUser={true}
          />
          <PlayerResultCard
            player={opponentResult}
            isWinner={!isWinner && !results.isDraw}
            isCurrentUser={false}
          />
        </div>

        {/* Rewards */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Your Rewards</h2>
          <div className="grid grid-cols-2 gap-6">
            <RewardCard
              icon={<TrendingUp className="w-8 h-8" />}
              label="XP Gained"
              value={`+${playerResult?.xpGained || 0}`}
              color="text-primary-400"
            />
            <RewardCard
              icon={<Coins className="w-8 h-8" />}
              label="Coins Earned"
              value={`+${playerResult?.coinsGained || 0}`}
              color="text-yellow-400"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Link
            href="/battle"
            className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl py-3 font-semibold text-center hover:from-primary-600 hover:to-primary-700 transition-all duration-300 hover:scale-105"
          >
            Play Again
          </Link>
          <Link
            href="/dashboard"
            className="flex-1 bg-white/10 backdrop-blur-sm text-white rounded-xl py-3 font-semibold text-center border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

function PlayerResultCard({
  player,
  isWinner,
  isCurrentUser,
}: {
  player: any;
  isWinner: boolean;
  isCurrentUser: boolean;
}) {
  return (
    <div
      className={`relative bg-white/5 backdrop-blur-lg border ${
        isWinner ? 'border-yellow-500/50 ring-2 ring-yellow-500/30' : 'border-white/10'
      } rounded-2xl p-6`}
    >
      {isWinner && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-black px-4 py-1 rounded-full text-sm font-bold">
          Winner
        </div>
      )}
      <div className="text-center mb-4">
        <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full flex items-center justify-center text-2xl font-bold">
          {player?.username?.[0]?.toUpperCase()}
        </div>
        <p className="text-white font-semibold mb-1">{player?.username}</p>
        {isCurrentUser && <p className="text-primary-400 text-sm">(You)</p>}
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-400">Score</span>
          <span className="text-white font-bold text-xl">{player?.score}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Correct</span>
          <span className="text-green-400 font-semibold">{player?.correctAnswers}</span>
        </div>
      </div>
    </div>
  );
}

function RewardCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="text-center">
      <div className={`${color} mb-2 flex justify-center`}>{icon}</div>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-gray-400 text-sm">{label}</p>
    </div>
  );
}
