'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useBattleStore } from '@/store/battleStore';
import { io, Socket } from 'socket.io-client';
import { 
  ArrowLeft, 
  Swords, 
  Plus, 
  Users,
  Loader2,
  Copy,
  Check,
} from 'lucide-react';
import Link from 'next/link';

let socket: Socket | null = null;

export default function BattlePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { resetBattle } = useBattleStore();
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<'menu' | 'create' | 'join' | 'lobby' | 'battle'>('menu');
  const [roomCode, setRoomCode] = useState('');
  const [createForm, setCreateForm] = useState({
    topic: 'Programming',
    difficulty: 'MEDIUM',
    questionCount: 5,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [battle, setBattle] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, mounted, router]);

  useEffect(() => {
    if (user && !socket) {
      socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001');

      socket.on('connect', () => {
        console.log('Connected to socket server');
        socket?.emit('authenticate', {
          userId: user.id,
          username: user.username,
        });
      });

      socket.on('room-created', (data) => {
        console.log('Room created:', data);
        setBattle(data.battle);
        setView('lobby');
        setLoading(false);
      });

      socket.on('player-joined', (data) => {
        console.log('Player joined:', data);
        setBattle(data);
      });

      socket.on('battle-started', (data) => {
        console.log('Battle started:', data);
        router.push(`/battle/${battle?.roomCode}/play`);
      });

      socket.on('error', (data) => {
        console.error('Socket error:', data);
        setError(data.message);
        setLoading(false);
      });
    }
  }, [user, router, battle]);

  if (!mounted || !isAuthenticated || !user) {
    return null;
  }

  const handleCreateRoom = () => {
    setError('');
    setLoading(true);
    socket?.emit('create-room', createForm);
  };

  const handleJoinRoom = () => {
    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }
    setError('');
    setLoading(true);
    socket?.emit('join-room', { roomCode: roomCode.toUpperCase() });
  };

  const handleCopyRoomCode = () => {
    if (battle?.roomCode) {
      navigator.clipboard.writeText(battle.roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleBack = () => {
    if (view === 'lobby' && battle) {
      socket?.emit('leave-room', { roomCode: battle.roomCode });
      setBattle(null);
    }
    resetBattle();
    setView('menu');
    setError('');
  };

  // Menu View
  if (view === 'menu') {
    return (
      <div className="min-h-screen p-6">
        <header className="max-w-4xl mx-auto mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gradient">Battle Arena</h1>
        </header>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <BattleOptionCard
            title="Create Room"
            description="Start a new battle and invite others"
            icon={<Plus className="w-12 h-12" />}
            onClick={() => setView('create')}
            gradient="from-primary-500 to-primary-600"
          />
          <BattleOptionCard
            title="Join Room"
            description="Enter a room code to join a battle"
            icon={<Users className="w-12 h-12" />}
            onClick={() => setView('join')}
            gradient="from-accent-500 to-accent-600"
          />
        </div>
      </div>
    );
  }

  // Create Room View
  if (view === 'create') {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-white mb-6">Create Battle Room</h2>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Topic
                </label>
                <select
                  value={createForm.topic}
                  onChange={(e) => setCreateForm({ ...createForm, topic: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                >
                  <option value="Programming">Programming</option>
                  <option value="Science">Science</option>
                  <option value="History">History</option>
                  <option value="Geography">Geography</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="General Knowledge">General Knowledge</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Difficulty
                </label>
                <select
                  value={createForm.difficulty}
                  onChange={(e) => setCreateForm({ ...createForm, difficulty: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                  <option value="EXPERT">Expert</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Number of Questions
                </label>
                <select
                  value={createForm.questionCount}
                  onChange={(e) => setCreateForm({ ...createForm, questionCount: parseInt(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                >
                  <option value="5">5 Questions</option>
                  <option value="10">10 Questions</option>
                  <option value="15">15 Questions</option>
                </select>
              </div>

              <button
                onClick={handleCreateRoom}
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg py-3 font-semibold hover:from-primary-600 hover:to-primary-700 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Room...
                  </>
                ) : (
                  <>
                    <Swords className="w-5 h-5" />
                    Create Room
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Join Room View
  if (view === 'join') {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-white mb-6">Join Battle Room</h2>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Room Code
                </label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  placeholder="Enter 6-digit code"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-center text-2xl tracking-widest font-bold placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <button
                onClick={handleJoinRoom}
                disabled={loading || roomCode.length !== 6}
                className="w-full bg-gradient-to-r from-accent-500 to-accent-600 text-white rounded-lg py-3 font-semibold hover:from-accent-600 hover:to-accent-700 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    <Users className="w-5 h-5" />
                    Join Room
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Lobby View
  if (view === 'lobby' && battle) {
    const isCreator = battle.participants?.[0]?.user?.id === user.id;
    const isFull = battle.participants?.length === 2;

    return (
      <div className="min-h-screen p-6">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Leave Room
          </button>

          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Battle Lobby</h2>
              <div className="inline-flex items-center gap-2 bg-white/10 px-6 py-3 rounded-lg">
                <span className="text-gray-400">Room Code:</span>
                <span className="text-2xl font-bold text-primary-400 tracking-wider">
                  {battle.roomCode}
                </span>
                <button
                  onClick={handleCopyRoomCode}
                  className="ml-2 p-2 hover:bg-white/10 rounded transition-colors"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-400" />
                  ) : (
                    <Copy className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Battle Settings */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <p className="text-gray-400 text-sm mb-1">Topic</p>
                <p className="text-white font-semibold">{battle.topic}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <p className="text-gray-400 text-sm mb-1">Difficulty</p>
                <p className="text-white font-semibold">{battle.difficulty}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <p className="text-gray-400 text-sm mb-1">Questions</p>
                <p className="text-white font-semibold">{battle.questionCount}</p>
              </div>
            </div>

            {/* Players */}
            <div className="space-y-4 mb-8">
              <h3 className="text-xl font-bold text-white">Players ({battle.participants?.length}/2)</h3>
              {battle.participants?.map((participant: any, index: number) => (
                <div
                  key={participant.id}
                  className="bg-white/5 rounded-lg p-4 flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full flex items-center justify-center text-xl font-bold">
                    {participant.user.username[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold">{participant.user.username}</p>
                    <p className="text-gray-400 text-sm">Level {participant.user.level}</p>
                  </div>
                  {index === 0 && (
                    <span className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm">
                      Host
                    </span>
                  )}
                </div>
              ))}

              {!isFull && (
                <div className="bg-white/5 rounded-lg p-4 border-2 border-dashed border-white/20">
                  <p className="text-gray-400 text-center">Waiting for opponent...</p>
                </div>
              )}
            </div>

            {isFull ? (
              <div className="text-center">
                <p className="text-green-400 text-lg font-semibold mb-2">
                  Battle starting in 3 seconds...
                </p>
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-400" />
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-400">Share the room code with your friend</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function BattleOptionCard({
  title,
  description,
  icon,
  onClick,
  gradient,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  gradient: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative bg-gradient-to-br ${gradient} rounded-2xl p-8 overflow-hidden hover:scale-105 transition-all duration-300 text-left`}
    >
      <div className="relative z-10">
        <div className="text-white/80 mb-4 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        <p className="text-white/70">{description}</p>
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}
