'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { xpProgress } from '@/lib/utils';
import {
  Swords,
  Trophy,
  Settings,
  LogOut,
  Coins,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, mounted, router]);

  useEffect(() => {
    if (user) {
      // Fetch user stats
      // For now, we'll use mock data
      setStats({
        totalGamesPlayed: 20,
        totalWins: 12,
        totalLosses: 7,
        totalDraws: 1,
        winStreak: 3,
      });
    }
  }, [user]);

  if (!mounted || !isAuthenticated || !user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const progressPercent = xpProgress(user.xp, user.level);

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-8 flex justify-between items-center">
        <h1 className="text-4xl font-bold text-gradient">Quiz Battle</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
            <div className="text-center mb-6">
              <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full flex items-center justify-center text-4xl font-bold">
                {user.username[0].toUpperCase()}
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">
                {user.username}
              </h2>
              <p className="text-gray-400">Level {user.level}</p>
            </div>

            {/* XP Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>XP Progress</span>
                <span>{user.xp} XP</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-2 text-yellow-400 mb-1">
                  <Coins className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-white">{user.coins}</p>
                <p className="text-xs text-gray-400">Coins</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-2 text-primary-400 mb-1">
                  <Star className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-white">{stats?.winStreak || 0}</p>
                <p className="text-xs text-gray-400">Win Streak</p>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Your Stats</h3>
            <div className="space-y-3">
              <StatRow label="Games Played" value={stats?.totalGamesPlayed || 0} />
              <StatRow label="Wins" value={stats?.totalWins || 0} className="text-green-400" />
              <StatRow label="Losses" value={stats?.totalLosses || 0} className="text-red-400" />
              <StatRow label="Draws" value={stats?.totalDraws || 0} className="text-yellow-400" />
              <div className="pt-3 border-t border-white/10">
                <StatRow 
                  label="Win Rate" 
                  value={`${stats?.totalGamesPlayed ? ((stats.totalWins / stats.totalGamesPlayed) * 100).toFixed(1) : 0}%`}
                  className="text-primary-400 font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ActionCard
              title="1v1 Battle"
              description="Challenge others in real-time"
              icon={<Swords className="w-8 h-8" />}
              gradient="from-primary-500 to-primary-600"
              href="/battle"
            />
            <ActionCard
              title="Leaderboard"
              description="See top players"
              icon={<Trophy className="w-8 h-8" />}
              gradient="from-accent-500 to-accent-600"
              href="/leaderboard"
            />
            <ActionCard
              title="Shop"
              description="Buy cosmetics & items"
              icon={<Coins className="w-8 h-8" />}
              gradient="from-yellow-500 to-yellow-600"
              href="/shop"
            />
            <ActionCard
              title="Profile"
              description="Manage your account"
              icon={<Settings className="w-8 h-8" />}
              gradient="from-gray-500 to-gray-600"
              href="/profile"
            />
          </div>

          {/* Recent Activity */}
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="text-gray-400 text-center py-8">
                No recent battles. Start playing to see your activity!
              </div>
            </div>
          </div>

          {/* Topics Preview */}
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Available Topics</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <TopicTag name="Programming" />
              <TopicTag name="Science" />
              <TopicTag name="History" />
              <TopicTag name="Geography" />
              <TopicTag name="Mathematics" />
              <TopicTag name="General Knowledge" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatRow({ 
  label, 
  value, 
  className = "text-white" 
}: { 
  label: string; 
  value: string | number; 
  className?: string;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-400">{label}</span>
      <span className={`font-semibold ${className}`}>{value}</span>
    </div>
  );
}

function ActionCard({
  title,
  description,
  icon,
  gradient,
  href,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={`group relative bg-gradient-to-br ${gradient} rounded-2xl p-6 overflow-hidden hover:scale-105 transition-all duration-300 cursor-pointer`}
    >
      <div className="relative z-10">
        <div className="text-white/80 mb-3 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
        <p className="text-white/70 text-sm">{description}</p>
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
}

function TopicTag({ name }: { name: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-center hover:bg-white/10 hover:border-primary-500/50 transition-all cursor-default">
      <span className="text-sm text-gray-300">{name}</span>
    </div>
  );
}
