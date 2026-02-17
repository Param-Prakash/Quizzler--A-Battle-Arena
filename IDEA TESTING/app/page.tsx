'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { 
  Swords, 
  Trophy, 
  Sparkles, 
  TrendingUp,
  Users,
  Zap 
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, mounted, router]);

  if (!mounted) {
    return null;
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl animate-pulse-slow" 
             style={{ animationDelay: '1s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl">
        <div className="mb-8 inline-block">
          <div className="relative">
            <Zap className="w-20 h-20 text-primary-400 animate-bounce-slow" />
            <div className="absolute inset-0 blur-xl bg-primary-400/50 animate-pulse" />
          </div>
        </div>

        <h1 className="text-6xl md:text-8xl font-bold mb-6 text-gradient glow">
          Quiz Battle
        </h1>

        <p className="text-xl md:text-2xl text-gray-300 mb-12">
          Challenge your knowledge in real-time 1v1 battles
        </p>

        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12 max-w-2xl mx-auto">
          <FeatureCard
            icon={<Swords className="w-8 h-8" />}
            title="1v1 Battles"
            description="Real-time quiz duels"
          />
          <FeatureCard
            icon={<Trophy className="w-8 h-8" />}
            title="Leaderboards"
            description="Compete globally"
          />
          <FeatureCard
            icon={<Sparkles className="w-8 h-8" />}
            title="Rewards"
            description="Earn coins & cosmetics"
          />
          <FeatureCard
            icon={<TrendingUp className="w-8 h-8" />}
            title="Level Up"
            description="Gain XP & progress"
          />
          <FeatureCard
            icon={<Users className="w-8 h-8" />}
            title="Custom Rooms"
            description="Play with friends"
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8" />}
            title="Fast-Paced"
            description="Quick matches"
          />
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/register"
            className="group relative px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary-500/50"
          >
            <span className="relative z-10">Get Started</span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </Link>

          <Link
            href="/auth/login"
            className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold text-lg border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105"
          >
            Sign In
          </Link>
        </div>

        <p className="mt-8 text-gray-400 text-sm">
          Join thousands of players worldwide
        </p>
      </div>
    </div>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-primary-500/50 transition-all duration-300 cursor-default hover:scale-105">
      <div className="text-primary-400 mb-2 group-hover:scale-110 transition-transform duration-300 flex justify-center">
        {icon}
      </div>
      <h3 className="font-semibold text-white mb-1">{title}</h3>
      <p className="text-xs text-gray-400">{description}</p>
    </div>
  );
}
