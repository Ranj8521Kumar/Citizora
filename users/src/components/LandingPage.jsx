import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  MapPin,
  TrendingUp,
  FileText,
  Construction,
  CheckCircle,
  Users,
  Clock,
  ArrowRight,
  Zap,
  Shield,
  Star,
  Activity,
  ChevronRight,
  LayoutDashboard,
} from 'lucide-react';
import apiService from '../services/api';


/* ── Tiny helpers ─────────────────────────────── */
const statusClass = (s) => {
  switch (s) {
    case 'resolved':    return 'status-resolved';
    case 'in_progress':
    case 'in-progress': return 'status-progress';
    default:            return 'status-submitted';
  }
};
const priorityClass = (p) => {
  switch (p) {
    case 'urgent': return 'priority-urgent';
    case 'high':   return 'priority-high';
    case 'medium': return 'priority-medium';
    default:       return 'priority-low';
  }
};
const fmtDate = (d) => {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }
  catch { return '—'; }
};

/* ── Animated counter ─────────────────────────── */
function Counter({ to, suffix = '' }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!to) return;
    let start = 0;
    const step = Math.ceil(to / 40);
    const t = setInterval(() => {
      start += step;
      if (start >= to) { setVal(to); clearInterval(t); }
      else setVal(start);
    }, 30);
    return () => clearInterval(t);
  }, [to]);
  return <>{val}{suffix}</>;
}

/* ══════════════════════════════════════════════════
   LANDING PAGE
   ══════════════════════════════════════════════════ */
export function LandingPage({ onNavigate, onLogin, onRegister, reports, user }) {
  const safeReports = Array.isArray(reports) ? reports : [];
  const [activeCitizens, setActiveCitizens] = useState(0);
  const [loadingCitizens, setLoadingCitizens] = useState(true);

  const stats = {
    total:      safeReports.length,
    resolved:   safeReports.filter(r => r.status === 'resolved').length,
    inProgress: safeReports.filter(r => ['in_progress','in-progress'].includes(r.status)).length,
    citizens:   activeCitizens,
  };

  useEffect(() => {
    apiService.getActiveCitizens()
      .then(r => setActiveCitizens(r.data?.totalCitizens || 0))
      .catch(() => setActiveCitizens(0))
      .finally(() => setLoadingCitizens(false));
  }, []);

  /* ── How-it-works steps ── */
  const steps = [
    {
      icon: FileText,
      title: 'Report Issues',
      desc: 'Snap a photo, pin the location, describe the problem. Done in under a minute.',
      color: '#4f8ef7',
      bg: 'rgba(79,142,247,0.1)',
    },
    {
      icon: Construction,
      title: 'Track Progress',
      desc: 'Follow real-time status updates from submitted → in-progress → resolved.',
      color: '#fb923c',
      bg: 'rgba(251,146,60,0.1)',
    },
    {
      icon: CheckCircle,
      title: 'See Results',
      desc: 'Rate completed work, give feedback, and keep your municipality accountable.',
      color: '#34d399',
      bg: 'rgba(52,211,153,0.1)',
    },
  ];

  /* ── Platform highlights ── */
  const highlights = [
    { icon: Zap,      label: 'Instant Alerts',      sub: 'Real-time push notifications' },
    { icon: Shield,   label: 'Secure & Private',     sub: 'End-to-end data protection' },
    { icon: Activity, label: 'Live Status Board',    sub: 'Track every report live' },
    { icon: Star,     label: 'Community Voting',     sub: 'Upvote priority issues' },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'transparent' }}>

      {/* ══════════ HERO ══════════ */}
      <section className="relative overflow-hidden pt-12 pb-28 lg:pt-20 lg:pb-36">

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">

            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 mb-6 animate-float-up">
              <span
                className="px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase"
                style={{
                  background: 'rgba(79,142,247,0.12)',
                  border: '1px solid rgba(79,142,247,0.28)',
                  color: '#7eb3ff',
                  letterSpacing: '0.12em',
                }}
              >
                ⚡ Digital Civic Engagement
              </span>
            </div>

            {/* Headline */}
            <h1
              className="mb-6 animate-float-up delay-100"
              style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(2.4rem, 5vw, 4rem)', fontWeight: 900, lineHeight: 1.1 }}
            >
              <span style={{ color: '#e8f0fe' }}>Your Voice,</span>{' '}
              <span className="gradient-text-blue">Your Community.</span>
            </h1>

            {/* Subtitle */}
            <p
              className="text-lg lg:text-xl mb-10 max-w-2xl mx-auto animate-float-up delay-200"
              style={{ color: 'hsl(215 20% 62%)', lineHeight: 1.75 }}
            >
              Report civic issues, track their resolution in real time, and join thousands of
              citizens making a measurable difference in their neighbourhood.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-float-up delay-300">
              <button
                onClick={() => user ? onNavigate('report') : onRegister()}
                className="btn-glow-blue flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-base font-semibold text-white"
              >
                <MessageSquare className="w-5 h-5" />
                {user ? 'Report an Issue' : 'Get Started Free'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('community')}
                className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-base font-semibold transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(79,142,247,0.25)',
                  color: '#a5c4fd',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(79,142,247,0.1)';
                  e.currentTarget.style.borderColor = 'rgba(79,142,247,0.45)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.borderColor = 'rgba(79,142,247,0.25)';
                }}
              >
                <MapPin className="w-5 h-5" />
                View Community Map
              </button>
            </div>

            {/* Social proof */}
            <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3 animate-float-up delay-400">
              {[
                { icon: Users,    text: `${loadingCitizens ? '...' : activeCitizens} active citizens` },
                { icon: Shield,   text: 'Secure & encrypted' },
                { icon: Activity, text: 'Live status updates' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2" style={{ color: 'hsl(215 20% 55%)' }}>
                  <Icon className="w-4 h-4" style={{ color: '#4f8ef7' }} />
                  <span className="text-sm">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ STATS ══════════ */}
      <section className="relative -mt-14 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="glass rounded-2xl grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x animate-float-up delay-500"
            style={{ divideColor: 'rgba(79,142,247,0.1)' }}
          >
            {[
              { label: 'Total Reports',    val: stats.total,      suffix: '+', color: '#4f8ef7' },
              { label: 'Issues Resolved',  val: stats.resolved,   suffix: '',  color: '#34d399' },
              { label: 'In Progress',      val: stats.inProgress, suffix: '',  color: '#fbbf24' },
              { label: 'Active Citizens',  val: stats.citizens,   suffix: '+', color: '#a78bfa' },
            ].map(({ label, val, suffix, color }) => (
              <div key={label} className="flex flex-col items-center justify-center py-8 px-4 gap-1">
                <span className="text-3xl lg:text-4xl font-black" style={{ fontFamily: "'Outfit',sans-serif", color }}>
                  <Counter to={val} suffix={suffix} />
                </span>
                <span className="text-xs font-medium tracking-wide" style={{ color: 'hsl(215 20% 52%)' }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-14">
            <div className="section-divider" />
            <p className="text-xs font-semibold tracking-[0.18em] uppercase mb-3" style={{ color: '#4f8ef7' }}>
              Simple Process
            </p>
            <h2 style={{ color: '#e8f0fe' }}>How CivicConnect Works</h2>
            <p className="mt-3 text-base max-w-xl mx-auto" style={{ color: 'hsl(215 20% 57%)' }}>
              From reporting to resolution — civic engagement made effortless.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map(({ icon: Icon, title, desc, color, bg }, i) => (
              <div
                key={title}
                className="glass-card rounded-2xl p-8 text-center animate-float-up"
                style={{ animationDelay: `${i * 0.12}s` }}
              >
                {/* Step number */}
                <div className="text-xs font-bold tracking-widest mb-5" style={{ color: 'hsl(215 20% 40%)' }}>
                  STEP {String(i + 1).padStart(2, '0')}
                </div>

                {/* Icon orb */}
                <div
                  className="feature-orb mx-auto mb-5"
                  style={{ background: bg }}
                >
                  <Icon className="w-8 h-8" style={{ color }} />
                </div>

                <h3 className="mb-3" style={{ color: '#e8f0fe' }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'hsl(215 20% 57%)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ PLATFORM HIGHLIGHTS ══════════ */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {highlights.map(({ icon: Icon, label, sub }, i) => (
              <div
                key={label}
                className="glass-card rounded-xl px-5 py-6 flex flex-col items-center text-center gap-3 animate-float-up"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(79,142,247,0.12)', border: '1px solid rgba(79,142,247,0.2)' }}
                >
                  <Icon className="w-5 h-5" style={{ color: '#4f8ef7' }} />
                </div>
                <div>
                  <div className="text-sm font-semibold mb-0.5" style={{ color: '#e8f0fe' }}>{label}</div>
                  <div className="text-xs" style={{ color: 'hsl(215 20% 52%)' }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ RECENT REPORTS ══════════ */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="section-divider !mx-0 mb-3" />
              <p className="text-xs font-semibold tracking-[0.18em] uppercase mb-2" style={{ color: '#4f8ef7' }}>
                Live Feed
              </p>
              <h2 style={{ color: '#e8f0fe' }}>Community Reports</h2>
              <p className="mt-1 text-sm" style={{ color: 'hsl(215 20% 57%)' }}>
                Real issues. Real progress. See what's happening near you.
              </p>
            </div>
            <button
              onClick={() => onNavigate('community')}
              className="self-start sm:self-auto flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
              style={{
                background: 'rgba(79,142,247,0.1)',
                border: '1px solid rgba(79,142,247,0.25)',
                color: '#7eb3ff',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(79,142,247,0.18)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(79,142,247,0.1)'}
            >
              <TrendingUp className="w-4 h-4" />
              View All Reports
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {safeReports.length === 0 ? (
            /* Empty state */
            <div
              className="glass rounded-2xl py-20 flex flex-col items-center gap-4 text-center"
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2"
                style={{ background: 'rgba(79,142,247,0.1)', border: '1px solid rgba(79,142,247,0.2)' }}
              >
                <FileText className="w-8 h-8" style={{ color: '#4f8ef7' }} />
              </div>
              <h3 style={{ color: '#e8f0fe' }}>No reports yet</h3>
              <p className="max-w-sm text-sm" style={{ color: 'hsl(215 20% 52%)' }}>
                Be the first to report a civic issue in your community.
              </p>
              <button
                onClick={() => user ? onNavigate('report') : onRegister()}
                className="btn-glow-blue mt-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
              >
                Report First Issue
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {safeReports.slice(0, 6).map((report, i) => (
                <div
                  key={report._id || report.id || i}
                  className="glass-card rounded-2xl p-5 flex flex-col gap-3 animate-float-up"
                  style={{ animationDelay: `${i * 0.07}s` }}
                >
                  {/* Status + priority row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`${statusClass(report.status)} text-[0.7rem] font-semibold px-2.5 py-1 rounded-full`}
                    >
                      {(report.status || 'submitted').replace(/_/g, ' ').replace(/-/g, ' ')}
                    </span>
                    <span
                      className={`${priorityClass(report.priority)} text-[0.7rem] font-semibold px-2.5 py-1 rounded-full`}
                    >
                      {report.priority || 'medium'}
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className="font-semibold leading-snug line-clamp-1" style={{ color: '#e8f0fe' }}>
                    {report.title || 'Untitled Report'}
                  </h4>

                  {/* Description */}
                  <p className="text-sm line-clamp-2 flex-1" style={{ color: 'hsl(215 20% 55%)' }}>
                    {report.description || 'No description provided.'}
                  </p>

                  {/* Meta row */}
                  <div
                    className="flex items-center justify-between text-xs pt-3"
                    style={{ borderTop: '1px solid rgba(79,142,247,0.1)', color: 'hsl(215 20% 48%)' }}
                  >
                    <div className="flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 shrink-0" style={{ color: '#4f8ef7' }} />
                      <span className="truncate">
                        {report.location?.address?.description || report.location?.description || 'Location N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {fmtDate(report.createdAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {report.votes || 0}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════ CTA SECTION ══════════ */}
      <section className="py-20 relative overflow-hidden">
        {/* Glow backdrop */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 opacity-30"
            style={{ background: 'linear-gradient(135deg, rgba(79,142,247,0.12) 0%, rgba(10,173,222,0.08) 50%, rgba(167,139,250,0.06) 100%)' }} />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="section-divider mb-4" />

          {user ? (
            <>
              <h2 className="mb-4" style={{ color: '#e8f0fe' }}>
                Welcome back,{' '}
                <span className="gradient-text-blue">{user.firstName || user.name || 'Citizen'}</span>!
              </h2>
              <p className="mb-10 text-base" style={{ color: 'hsl(215 20% 57%)' }}>
                Your contributions are making a real difference. Keep the momentum going.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => onNavigate('report')}
                  className="btn-glow-blue flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl text-base font-semibold text-white"
                >
                  <MessageSquare className="w-5 h-5" />
                  Report New Issue
                </button>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="btn-glow-cyan flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl text-base font-semibold text-white"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  My Dashboard
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="mb-4" style={{ color: '#e8f0fe' }}>
                Ready to Make a{' '}
                <span className="gradient-text-civic">Difference?</span>
              </h2>
              <p className="mb-10 text-base" style={{ color: 'hsl(215 20% 57%)' }}>
                Join your neighbours in building a better community. Your voice matters —
                and it only takes 60 seconds to get started.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={onRegister}
                  className="btn-glow-blue flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl text-base font-semibold text-white"
                >
                  Create Free Account
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={onLogin}
                  className="flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl text-base font-semibold transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(79,142,247,0.25)',
                    color: '#a5c4fd',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(79,142,247,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                >
                  Sign In
                </button>
              </div>
            </>
          )}

          {/* Trust badges */}
          <div className="mt-12 flex flex-wrap justify-center gap-6">
            {[
              '🔒 Bank-grade encryption',
              '🌍 Open civic data',
              '⚡ Real-time updates',
            ].map(t => (
              <span key={t} className="text-xs font-medium" style={{ color: 'hsl(215 20% 45%)' }}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer
        className="py-8 text-center"
        style={{ borderTop: '1px solid rgba(79,142,247,0.1)', color: 'hsl(215 20% 40%)' }}
      >
        <p className="text-sm">
          © 2025 <span style={{ color: '#4f8ef7' }}>Citizora</span> · Built for digital governance &amp; civic engagement
        </p>
        <div className="flex justify-center gap-2 mt-3">
          {['#4f8ef7','#34d399','#fb923c'].map(c => (
            <span key={c} className="w-2 h-2 rounded-full inline-block" style={{ background: c }} />
          ))}
        </div>
      </footer>
    </div>
  );
}