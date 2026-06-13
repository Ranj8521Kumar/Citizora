import { useState, useEffect } from 'react';
import api from '../services/api';

const BADGE_META = [
  { id: 0, name: 'First Report',        icon: '📋', desc: 'Submit your first civic report',           color: 'from-blue-500 to-blue-700' },
  { id: 1, name: 'Dedicated Reporter',  icon: '📝', desc: '10 reports submitted',                    color: 'from-green-500 to-green-700' },
  { id: 2, name: 'Community Champion',  icon: '🏆', desc: '50 reports submitted',                    color: 'from-yellow-500 to-orange-600' },
  { id: 3, name: 'Issue Closer',        icon: '🔧', desc: 'Field worker who resolved 25 reports',    color: 'from-purple-500 to-purple-700' },
  { id: 4, name: 'Verified Citizen',    icon: '✅', desc: 'Identity verified',                       color: 'from-teal-500 to-teal-700' },
  { id: 5, name: 'Top Voter',           icon: '👍', desc: '100 community votes cast',                color: 'from-pink-500 to-pink-700' },
  { id: 6, name: 'Feedback Provider',   icon: '💬', desc: '10 feedback submissions',                 color: 'from-indigo-500 to-indigo-700' },
];

const REWARD_ACTIONS = [
  { action: 'Submit a report',               tokens: 10 },
  { action: 'Your report gets resolved',     tokens: 25 },
  { action: 'Resolve a report (field worker)', tokens: 20 },
  { action: 'Community upvote',              tokens: 1 },
  { action: 'Provide feedback',              tokens: 5 },
  { action: 'Refer a new citizen',           tokens: 15 },
];

export default function RewardsPanel({ user }) {
  const [rewards, setRewards] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    if (user) load();
  }, [user]);

  async function load() {
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

  if (!user) return null;

  const earnedBadges = (rewards?.badges || []).filter((b) => b.owned).length;
  const lockedBadges = BADGE_META.length - earnedBadges;

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <h2 className="text-white font-bold text-xl flex items-center gap-2">
          <span>🎖️</span> My Rewards
        </h2>
        <p className="text-white/50 text-sm mt-1">Earn CIVI tokens and badges by participating in your community</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {['overview', 'badges', 'how-to-earn'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-sm font-medium capitalize transition-colors ${
              tab === t
                ? 'text-white border-b-2 border-purple-500'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            {t.replace(/-/g, ' ')}
          </button>
        ))}
      </div>

      <div className="p-6">
        {loading ? (
          <div className="text-white/40 text-sm animate-pulse text-center py-8">Loading rewards…</div>
        ) : (
          <>
            {/* Overview Tab */}
            {tab === 'overview' && (
              <div>
                {!rewards?.walletConnected ? (
                  <div className="text-center py-6">
                    <div className="text-4xl mb-3">🔗</div>
                    <p className="text-white/70 mb-2">Connect a wallet to claim on-chain CIVI tokens</p>
                    <p className="text-white/40 text-sm">
                      You've earned <span className="text-yellow-400 font-semibold">{rewards?.civiTokensEarned || 0} CIVI</span> — connect MetaMask to receive them on Polygon.
                    </p>
                  </div>
                ) : (
                  <div>
                    {/* Token balance card */}
                    <div className="bg-gradient-to-br from-purple-600/30 to-blue-600/30 border border-purple-500/30 rounded-2xl p-5 mb-5 text-center">
                      <div className="text-4xl font-bold text-yellow-400 mb-1">
                        {parseFloat(rewards.balance || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </div>
                      <div className="text-white/60 text-sm">CIVI Token Balance (on-chain)</div>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-3 mb-5">
                      <StatCard label="Total Earned" value={`${rewards.civiTokensEarned || 0}`} unit="CIVI" />
                      <StatCard label="Badges" value={earnedBadges} unit={`/ ${BADGE_META.length}`} />
                      <StatCard label="Locked" value={lockedBadges} unit="badges" dim />
                    </div>

                    {/* Earned badges preview */}
                    {earnedBadges > 0 && (
                      <div>
                        <p className="text-white/50 text-xs uppercase tracking-wider mb-2">Recent Badges</p>
                        <div className="flex gap-2 flex-wrap">
                          {BADGE_META.filter((b) => {
                            const match = rewards.badges?.find((rb) => rb.id === b.id);
                            return match?.owned;
                          }).map((b) => (
                            <BadgeChip key={b.id} badge={b} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Badges Tab */}
            {tab === 'badges' && (
              <div className="grid grid-cols-1 gap-3">
                {BADGE_META.map((b) => {
                  const owned = rewards?.badges?.find((rb) => rb.id === b.id)?.owned ?? false;
                  return (
                    <div
                      key={b.id}
                      className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${
                        owned
                          ? 'border-white/20 bg-white/8'
                          : 'border-white/5 bg-white/2 opacity-50 grayscale'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${b.color} flex items-center justify-center text-2xl shadow-lg flex-shrink-0`}>
                        {b.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium text-sm">{b.name}</div>
                        <div className="text-white/50 text-xs">{b.desc}</div>
                      </div>
                      {owned && (
                        <span className="text-xs text-green-400 border border-green-500/30 bg-green-500/10 px-2 py-0.5 rounded-full flex-shrink-0">
                          Earned
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* How to Earn Tab */}
            {tab === 'how-to-earn' && (
              <div>
                <p className="text-white/50 text-sm mb-4">Complete these actions to earn CIVI tokens. Connect your MetaMask wallet to receive them on the Polygon network.</p>
                <div className="space-y-2">
                  {REWARD_ACTIONS.map(({ action, tokens }) => (
                    <div key={action} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3">
                      <span className="text-white/80 text-sm">{action}</span>
                      <span className="text-yellow-400 font-bold text-sm">+{tokens} CIVI</span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 text-sm text-white/60">
                  <strong className="text-white/80">On-chain verification:</strong> Every action is recorded on the Polygon blockchain.
                  Anyone can independently verify your civic contributions at{' '}
                  <span className="text-purple-400">mumbai.polygonscan.com</span>.
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, unit, dim }) {
  return (
    <div className="bg-white/5 rounded-xl p-3 text-center">
      <div className={`text-xl font-bold ${dim ? 'text-white/40' : 'text-white'}`}>{value}</div>
      <div className="text-white/40 text-xs">{unit}</div>
      <div className="text-white/30 text-xs mt-0.5">{label}</div>
    </div>
  );
}

function BadgeChip({ badge }) {
  return (
    <div className={`bg-gradient-to-br ${badge.color} rounded-lg px-3 py-1.5 flex items-center gap-1.5 text-white text-xs font-medium shadow`}>
      <span>{badge.icon}</span>
      <span>{badge.name}</span>
    </div>
  );
}
