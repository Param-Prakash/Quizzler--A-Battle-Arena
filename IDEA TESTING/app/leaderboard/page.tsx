'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Trophy, Medal, Award, ArrowLeft, Crown } from 'lucide-react';
import Link from 'next/link';

export default function LeaderboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, mounted, router]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/leaderboard?limit=50');
        const data = await response.json();
        setLeaderboard(data.leaderboard);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchLeaderboard();
    }
  }, [isAuthenticated]);

  if (!mounted || !isAuthenticated) {
    return null;
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 3:
        return <Award className="w-6 h-6 text-orange-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </Link>

        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <Trophy className="w-10 h-10 text-yellow-400" />
            <h1 className="text-4xl font-bold text-gradient">Leaderboard</h1>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-400">Loading leaderboard...</p>
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry, index) => {
                const isCurrentUser = entry.userId === user?.id;
                const topThree = index < 3;

                return (
                  <div
                    key={entry.userId}
                    className={`relative flex items-center gap-4 p-4 rounded-xl transition-all ${
                      isCurrentUser
                        ? 'bg-primary-500/20 border-2 border-primary-500 ring-2 ring-primary-500/30'
                        : topThree
                        ? 'bg-white/10 border border-white/20'
                        : 'bg-white/5 border border-white/10'
                    } hover:bg-white/10`}
                  >
                    {/* Rank */}
                    <div className="flex-shrink-0 w-12 text-center">
                      {getRankIcon(entry.rank) || (
                        <span
                          className={`text-xl font-bold ${
                            isCurrentUser ? 'text-primary-400' : 'text-gray-400'
                          }`}
                        >
                          #{entry.rank}
                        </span>
                      )}
                    </div>

                    {/* Avatar */}
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full flex items-center justify-center text-xl font-bold">
                      {entry.username[0].toUpperCase()}
                    </div>

                    {/* User Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-semibold">{entry.username}</p>
                        {isCurrentUser && (
                          <span className="px-2 py-0.5 bg-primary-500 text-white text-xs rounded-full">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm">Level {entry.level}</p>
                    </div>

                    {/* Stats */}
                    <div className="hidden md:flex gap-8 text-center">
                      <div>
                        <p className="text-white font-bold">{entry.stats.totalWins}</p>
                        <p className="text-gray-400 text-xs">Wins</p>
                      </div>
                      <div>
                        <p className="text-white font-bold">{entry.stats.totalGamesPlayed}</p>
                        <p className="text-gray-400 text-xs">Played</p>
                      </div>
                      <div>
                        <p className="text-green-400 font-bold">{entry.stats.winRate}%</p>
                        <p className="text-gray-400 text-xs">Win Rate</p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {leaderboard.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-400">No players yet. Be the first!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
