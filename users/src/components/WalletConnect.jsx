import { useState, useEffect } from 'react';
import api from '../services/api';

const BADGE_ICONS = ['📋', '📝', '🏆', '🔧', '✅', '👍', '💬'];
const BADGE_COLORS = [
  'from-blue-500 to-blue-700',
  'from-green-500 to-green-700',
  'from-yellow-500 to-orange-600',
  'from-purple-500 to-purple-700',
  'from-teal-500 to-teal-700',
  'from-pink-500 to-pink-700',
  'from-indigo-500 to-indigo-700',
];

export default function WalletConnect({ user }) {
  const [rewards, setRewards] = useState(null);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) fetchRewards();
  }, [user]);

  async function fetchRewards() {
    try {
      setLoading(true);
      const data = await api.getMyRewards();
      setRewards(data.data || data);
    } catch (e) {
      console.error('Failed to load rewards:', e);
    } finally {
      setLoading(false);
    }
  }

  async function handleConnect() {
    if (!window.ethereum) {
      setError('MetaMask is not installed. Please install it from metamask.io');
      return;
    }
    try {
      setConnecting(true);
      setError('');

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const walletAddress = accounts[0];

      // Sign a challenge so the server can verify ownership
      const userId = user?._id || user?.id;
      const message = `Citizora wallet link: ${userId}`;
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, walletAddress],
      });

      await api.connectWallet(walletAddress, signature);
      await fetchRewards();
    } catch (e) {
      setError(e.message || 'Failed to connect wallet');
    } finally {
      setConnecting(false);
    }
  }

  async function handleDisconnect() {
    try {
      setConnecting(true);
      await api.disconnectWallet();
      setRewards((prev) => ({ ...prev, walletConnected: false, walletAddress: null }));
    } catch (e) {
      setError(e.message || 'Failed to disconnect');
    } finally {
      setConnecting(false);
    }
  }

  if (!user) return null;

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-lg flex items-center gap-2">
          <span>🔗</span> Blockchain Wallet
        </h3>
        {rewards?.walletConnected && (
          <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-1 rounded-full">
            Connected
          </span>
        )}
      </div>

      {error && (
        <div className="mb-3 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-white/50 text-sm animate-pulse">Loading rewards…</div>
      ) : rewards?.walletConnected ? (
        <div>
          <div className="text-white/60 text-xs font-mono truncate mb-3">
            {rewards.walletAddress}
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 bg-white/5 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {parseFloat(rewards.balance || 0).toFixed(2)}
              </div>
              <div className="text-white/50 text-xs">CIVI Tokens</div>
            </div>
            <div className="flex-1 bg-white/5 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-purple-400">
                {(rewards.badges || []).filter((b) => b.owned).length}
              </div>
              <div className="text-white/50 text-xs">Badges</div>
            </div>
          </div>
          <button
            onClick={handleDisconnect}
            disabled={connecting}
            className="w-full text-xs text-white/40 hover:text-white/70 transition-colors py-1"
          >
            Disconnect wallet
          </button>
        </div>
      ) : (
        <div>
          <p className="text-white/60 text-sm mb-4">
            Connect your MetaMask wallet to earn CIVI tokens and collect civic achievement badges.
          </p>
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium py-2.5 px-4 rounded-xl transition-all duration-200 disabled:opacity-50"
          >
            {connecting ? 'Connecting…' : '🦊 Connect MetaMask'}
          </button>
        </div>
      )}
    </div>
  );
}
