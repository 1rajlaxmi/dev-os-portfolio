import { useEffect, useState } from 'react';
import { Trophy, Flame, BarChart2, Code2, Star, ExternalLink, Zap, ChevronRight } from 'lucide-react';

// ── DSA Stats Data ──────────────────────────────────────────────────────────
const CATEGORIES = [
  { name: 'Arrays & Hashing',    solved: 82,  total: 100, color: '#6366f1' },
  { name: 'Trees & Graphs',      solved: 65,  total: 80,  color: '#8b5cf6' },
  { name: 'Dynamic Programming', solved: 55,  total: 70,  color: '#ec4899' },
  { name: 'Strings',             solved: 48,  total: 60,  color: '#f59e0b' },
  { name: 'Linked Lists',        solved: 38,  total: 45,  color: '#10b981' },
  { name: 'Greedy & Sorting',    solved: 42,  total: 50,  color: '#14b8a6' },
  { name: 'Backtracking',        solved: 28,  total: 35,  color: '#f43f5e' },
  { name: 'Bit Manipulation',    solved: 22,  total: 30,  color: '#3b82f6' },
];

const PLATFORMS = [
  {
    name: 'GeeksForGeeks',
    handle: 'rajlaxmi',
    url: 'https://auth.geeksforgeeks.org/user/rajlaxmi',
    solved: 280,
    rank: 'Institution Rank Under 45',
    badge: '🏅 Institution Rank',
    color: 'from-green-600/30 to-emerald-600/30',
    border: 'border-green-500/30',
    badgeColor: 'text-green-300 bg-green-500/15 border-green-500/30',
    icon: '🌿',
  },
  {
    name: 'LeetCode',
    handle: 'rajlaxmi',
    url: 'https://leetcode.com/u/rajlaxmi/',
    solved: 80,
    rank: 'Contest Participant',
    badge: '⚡ Active Contestant',
    color: 'from-amber-600/30 to-orange-600/30',
    border: 'border-amber-500/30',
    badgeColor: 'text-amber-300 bg-amber-500/15 border-amber-500/30',
    icon: '🟡',
  },
  {
    name: 'HackerRank',
    handle: 'rajlaxmigupta',
    url: 'https://www.hackerrank.com/profile/rajlaxmigupta',
    solved: 40,
    rank: '5★ Problem Solving',
    badge: '⭐ 5-Star Badge',
    color: 'from-cyan-600/30 to-blue-600/30',
    border: 'border-cyan-500/30',
    badgeColor: 'text-cyan-300 bg-cyan-500/15 border-cyan-500/30',
    icon: '🟢',
  },
];

const PROBLEM_OF_DAY = {
  title: 'Longest Common Subsequence',
  difficulty: 'Medium',
  category: 'Dynamic Programming',
  approach: '2D DP table where dp[i][j] = LCS length of s1[0..i-1] and s2[0..j-1]. Fill by comparing characters — if equal, dp[i][j] = dp[i-1][j-1] + 1, else max(dp[i-1][j], dp[i][j-1]).',
  complexity: { time: 'O(m×n)', space: 'O(m×n)' },
  code: `function longestCommonSubsequence(text1, text2) {
  const m = text1.length, n = text2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  return dp[m][n];
}`,
  platform: 'LeetCode #1143',
};

// ── Animated Bar Component ────────────────────────────────────────────────────
const CategoryBar = ({ cat, index, animate }: { cat: typeof CATEGORIES[0]; index: number; animate: boolean }) => {
  const pct = Math.round((cat.solved / cat.total) * 100);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!animate) return;
    const timer = setTimeout(() => setWidth(pct), index * 100 + 200);
    return () => clearTimeout(timer);
  }, [animate, pct, index]);

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-400 w-36 shrink-0 truncate">{cat.name}</span>
      <div className="flex-1 h-2.5 bg-white/8 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${width}%`, background: cat.color, boxShadow: `0 0 8px ${cat.color}55` }}
        />
      </div>
      <span className="text-xs text-gray-400 w-14 text-right tabular-nums shrink-0">
        {cat.solved}<span className="text-gray-600">/{cat.total}</span>
      </span>
    </div>
  );
};

// ── Main DSA Component ────────────────────────────────────────────────────────
export const DSA = () => {
  const [animate, setAnimate] = useState(false);
  const [trophyBounce, setTrophyBounce] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setAnimate(true), 100);
    const t2 = setTimeout(() => setTrophyBounce(true), 300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const totalSolved = CATEGORIES.reduce((s, c) => s + c.solved, 0);

  return (
    <div className="flex flex-col h-full bg-[#0e0e12] text-gray-200 overflow-y-auto min-h-0">

      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden px-6 pt-5 pb-5 border-b border-white/8 shrink-0"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.08) 50%, transparent 100%)' }}
      >
        {/* Glow blob */}
        <div className="absolute -top-8 -left-8 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)' }} />

        <div className="relative flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Trophy */}
            <div
              className="text-5xl select-none"
              style={{
                filter: 'drop-shadow(0 0 16px rgba(251,191,36,0.7))',
                transform: trophyBounce ? 'scale(1) rotate(-5deg)' : 'scale(0.8)',
                transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              🏆
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">DSA Dashboard</h1>
              <p className="text-indigo-300 font-semibold text-sm mt-0.5">Rajlaxmi · Competitive Programming</p>
              <p className="text-gray-400 text-xs mt-1">Consistent problem solver across GFG, LeetCode & HackerRank</p>
            </div>
          </div>

          {/* AIR 5124 Trophy Badge */}
          <div className="flex flex-col items-center px-4 py-3 rounded-2xl border border-amber-500/40 text-center shrink-0"
            style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.08))' }}
          >
            <Trophy size={20} className="text-amber-400 mb-1" />
            <div className="text-xl font-black text-amber-400">AIR 5124</div>
            <div className="text-[10px] text-amber-300 font-semibold uppercase tracking-wider">CodingNinjas Codekaze</div>
            <div className="text-[9px] text-gray-500 mt-0.5">National Level Contest</div>
          </div>
        </div>

        {/* Total solved pill */}
        <div className="flex items-center gap-3 mt-5">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30">
            <Flame size={16} className="text-orange-400" />
            <span className="text-sm font-bold text-white tabular-nums">400+</span>
            <span className="text-xs text-gray-400">Problems Solved</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
            <Star size={16} className="text-amber-400" />
            <span className="text-xs text-gray-300">College Rank Under 45 · GFG</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
            <Zap size={16} className="text-emerald-400" />
            <span className="text-xs text-gray-300">5★ HackerRank Problem Solving</span>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-6">

        {/* ── Platform Cards ── */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
            <Code2 size={13} className="text-indigo-400" />
            Platform Stats
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {PLATFORMS.map((p) => (
              <a
                key={p.name}
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className={`p-5 rounded-2xl border border-t-white/20 bg-gradient-to-br ${p.color} ${p.border} shadow-lg hover:brightness-110 hover:scale-[1.02] transition-all duration-200 group cursor-pointer block`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{p.icon}</span>
                    <div>
                      <div className="text-sm font-extrabold text-white">{p.name}</div>
                      <div className="text-[10px] text-gray-400 font-mono">@{p.handle}</div>
                    </div>
                  </div>
                  <ExternalLink size={13} className="text-gray-400 group-hover:text-white mt-0.5 shrink-0 transition-colors" />
                </div>
                <div className="text-3xl font-black text-white tabular-nums mb-1">{p.solved}+</div>
                <div className="text-xs text-gray-300">problems solved</div>
                <div className="mt-4">
                  <span className={`text-[10px] px-2.5 py-1 rounded-full border font-semibold shadow-sm ${p.badgeColor}`}>
                    {p.badge}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* ── Category Bar Chart ── */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 border-t-white/20 shadow-xl">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5 flex items-center gap-2">
            <BarChart2 size={14} className="text-purple-400" />
            Problems by Category
          </h2>
          <div className="space-y-4">
            {CATEGORIES.map((cat, i) => (
              <CategoryBar key={cat.name} cat={cat} index={i} animate={animate} />
            ))}
          </div>
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10 text-xs text-gray-400">
            <span>Total tracked: {CATEGORIES.reduce((s, c) => s + c.total, 0)} problems</span>
            <span className="text-indigo-300 font-bold">
              {Math.round((totalSolved / CATEGORIES.reduce((s, c) => s + c.total, 0)) * 100)}% completion
            </span>
          </div>
        </div>

        {/* ── Problem of the Day ── */}
        <div className="p-4 rounded-xl bg-white/4 border border-white/8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
            <Flame size={13} className="text-orange-400" />
            Featured Problem — My Solution
          </h2>

          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-bold text-white">{PROBLEM_OF_DAY.title}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                  {PROBLEM_OF_DAY.difficulty}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                  {PROBLEM_OF_DAY.category}
                </span>
              </div>
              <p className="text-xs text-gray-400">{PROBLEM_OF_DAY.platform}</p>
            </div>
            <div className="flex gap-3 shrink-0">
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-0.5">Time</div>
                <div className="text-xs font-bold text-indigo-300 font-mono">{PROBLEM_OF_DAY.complexity.time}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-0.5">Space</div>
                <div className="text-xs font-bold text-purple-300 font-mono">{PROBLEM_OF_DAY.complexity.space}</div>
              </div>
            </div>
          </div>

          {/* Approach */}
          <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 mb-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <ChevronRight size={12} className="text-indigo-400" />
              <span className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wider">My Approach</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">{PROBLEM_OF_DAY.approach}</p>
          </div>

          {/* Code */}
          <pre className="bg-[#0a0a0d] border border-white/8 rounded-lg p-4 overflow-x-auto text-xs font-mono text-gray-300 leading-relaxed"
            style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}>
            <code className="text-emerald-300">{PROBLEM_OF_DAY.code}</code>
          </pre>
        </div>

      </div>
    </div>
  );
};
