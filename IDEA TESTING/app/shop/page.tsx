'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { ArrowLeft, Coins, Sparkles, ShoppingBag, Check } from 'lucide-react';
import Link from 'next/link';
import { getRarityColor } from '@/lib/utils';

export default function ShopPage() {
  const router = useRouter();
  const { user, isAuthenticated, updateUser, token } = useAuthStore();
  const [cosmetics, setCosmetics] = useState<any[]>([]);
  const [userCosmetics, setUserCosmetics] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, mounted, router]);

  useEffect(() => {
    const fetchShopData = async () => {
      try {
        const response = await fetch('/api/cosmetics');
        const data = await response.json();
        setCosmetics(data.cosmetics);
      } catch (error) {
        console.error('Failed to fetch cosmetics:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchShopData();
    }
  }, [isAuthenticated]);

  if (!mounted || !isAuthenticated || !user) {
    return null;
  }

  const handlePurchase = async (cosmeticId: string, cost: number) => {
    if (user.coins < cost) {
      alert('Not enough coins!');
      return;
    }

    setPurchasing(cosmeticId);

    try {
      const response = await fetch('/api/cosmetics/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cosmeticId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Purchase failed');
      }

      // Update user coins
      updateUser({ coins: data.remainingCoins });
      
      // Add to owned cosmetics
      setUserCosmetics((prev) => new Set([...prev, cosmeticId]));

      alert('Purchase successful!');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setPurchasing(null);
    }
  };

  const filteredCosmetics = filter === 'ALL' 
    ? cosmetics 
    : cosmetics.filter((c) => c.type === filter);

  const types = ['ALL', 'AVATAR', 'FRAME', 'BADGE', 'TITLE'];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>

          {/* Coins Display */}
          <div className="flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/50 px-4 py-2 rounded-lg">
            <Coins className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400 font-bold text-lg">{user.coins}</span>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <ShoppingBag className="w-10 h-10 text-primary-400" />
            <h1 className="text-4xl font-bold text-gradient">Cosmetics Shop</h1>
          </div>

          {/* Filter */}
          <div className="flex gap-2 mb-8 overflow-x-auto">
            {types.map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  filter === type
                    ? 'bg-primary-500 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-400">Loading shop items...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCosmetics.map((cosmetic) => {
                const owned = userCosmetics.has(cosmetic.id);
                const canAfford = user.coins >= cosmetic.coinCost;

                return (
                  <div
                    key={cosmetic.id}
                    className="relative bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 hover:border-primary-500/50 transition-all"
                  >
                    {/* Rarity Badge */}
                    <div
                      className={`absolute top-4 right-4 px-2 py-1 ${getRarityColor(
                        cosmetic.rarity
                      )} bg-white/10 rounded-full text-xs font-bold`}
                    >
                      {cosmetic.rarity}
                    </div>

                    {/* Icon */}
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary-400/20 to-accent-400/20 rounded-full flex items-center justify-center">
                      <Sparkles className={`w-10 h-10 ${getRarityColor(cosmetic.rarity)}`} />
                    </div>

                    {/* Name & Description */}
                    <h3 className="text-white font-bold text-lg text-center mb-2">
                      {cosmetic.name}
                    </h3>
                    <p className="text-gray-400 text-sm text-center mb-4">
                      {cosmetic.description}
                    </p>

                    {/* Type */}
                    <div className="text-center mb-4">
                      <span className="px-3 py-1 bg-white/10 text-gray-300 text-xs rounded-full">
                        {cosmetic.type}
                      </span>
                    </div>

                    {/* Purchase Button */}
                    {owned ? (
                      <button
                        disabled
                        className="w-full bg-green-500/20 border border-green-500 text-green-400 rounded-lg py-2 font-semibold flex items-center justify-center gap-2"
                      >
                        <Check className="w-5 h-5" />
                        Owned
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePurchase(cosmetic.id, cosmetic.coinCost)}
                        disabled={!canAfford || purchasing === cosmetic.id}
                        className={`w-full rounded-lg py-2 font-semibold transition-all flex items-center justify-center gap-2 ${
                          canAfford
                            ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:scale-105'
                            : 'bg-white/5 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {purchasing === cosmetic.id ? (
                          'Purchasing...'
                        ) : (
                          <>
                            <Coins className="w-5 h-5" />
                            {cosmetic.coinCost}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {filteredCosmetics.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-400">No items in this category yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
