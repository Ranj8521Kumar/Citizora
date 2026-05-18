import React, { useState, useEffect } from 'react';
import {
  Home,
  LayoutDashboard,
  Plus,
  Users,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Bell,
  Shield,
  Map,
} from 'lucide-react';

export function Header({ user, currentPage, onNavigate, onLogin, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /* Shrink / solidify header on scroll */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: 'Home',            page: 'landing',   icon: Home   },
    { name: 'Community',       page: 'community', icon: Map    },
    { name: 'Active Citizens', page: 'citizens',  icon: Users  },
  ];

  const userNavigation = user
    ? [
        { name: 'Dashboard',    page: 'dashboard', icon: LayoutDashboard },
        { name: 'Report Issue', page: 'report',    icon: Plus             },
      ]
    : [];

  const allNav = [...navigation, ...userNavigation];

  const avatarLetter = user
    ? (user.firstName?.[0] || user.name?.[0] || user.username?.[0] || 'C').toUpperCase()
    : 'C';

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled
            ? 'rgba(5, 13, 26, 0.88)'
            : 'rgba(5, 13, 26, 0.55)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderBottom: scrolled
            ? '1px solid rgba(79,142,247,0.18)'
            : '1px solid rgba(79,142,247,0.08)',
          boxShadow: scrolled ? '0 4px 32px rgba(0,0,0,0.45)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-[68px]">

            {/* ── Logo ── */}
            <button
              onClick={() => onNavigate('landing')}
              className="flex items-center gap-3 group"
            >
              {/* Shield icon with glow */}
              <div
                className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                style={{
                  background: 'linear-gradient(135deg, #4f8ef7, #0aadde)',
                  boxShadow: '0 0 20px rgba(79,142,247,0.50)',
                }}
              >
                <Shield className="w-5 h-5 text-white" />
              </div>

              {/* Brand text */}
              <div className="flex flex-col leading-none">
                <span
                  className="text-[1.05rem] font-bold tracking-tight"
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    background: 'linear-gradient(135deg, #ffffff 0%, #a5c4fd 100%)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Citizora
                </span>
                <span className="text-[0.6rem] tracking-widest uppercase text-blue-400/70 font-medium">
                  Civic Portal
                </span>
              </div>
            </button>

            {/* ── Desktop Navigation ── */}
            <nav className="hidden md:flex items-center gap-1">
              {allNav.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.page;
                return (
                  <button
                    key={item.name}
                    onClick={() => onNavigate(item.page)}
                    className={`nav-pill${isActive ? ' active' : ''}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {item.name}
                  </button>
                );
              })}
            </nav>

            {/* ── Right side ── */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  {/* Notification bell */}
                  <button
                    className="relative w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-white/8"
                    style={{ color: 'hsl(215 20% 65%)' }}
                    title="Notifications"
                  >
                    <Bell className="w-4.5 h-4.5" />
                    <span
                      className="absolute top-1 right-1 w-2 h-2 rounded-full border-2"
                      style={{
                        background: '#4f8ef7',
                        borderColor: 'hsl(224 71% 4%)',
                      }}
                    />
                  </button>

                  {/* Avatar + name */}
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                      style={{
                        background: 'linear-gradient(135deg, #4f8ef7, #0aadde)',
                        boxShadow: '0 0 14px rgba(79,142,247,0.45)',
                      }}
                    >
                      {avatarLetter}
                    </div>
                    <span className="text-sm font-medium" style={{ color: 'hsl(213 31% 82%)' }}>
                      {user.firstName || user.name || 'Citizen'}
                    </span>
                  </div>

                  {/* Logout */}
                  <button
                    onClick={onLogout}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-red-500/10"
                    style={{ color: 'hsl(215 20% 55%)' }}
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={onLogin}
                  className="btn-glow-blue px-5 py-2 rounded-lg text-sm font-semibold text-white"
                >
                  Sign In
                </button>
              )}
            </div>

            {/* ── Mobile hamburger ── */}
            <button
              className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200"
              style={{
                background: mobileMenuOpen
                  ? 'rgba(79,142,247,0.15)'
                  : 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(79,142,247,0.2)',
                color: 'hsl(213 31% 82%)',
              }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer ── */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0" style={{ background: 'rgba(5,13,26,0.7)' }} />

          {/* Drawer panel */}
          <div
            className="absolute top-16 left-0 right-0 animate-slide-down"
            style={{
              background: 'rgba(9, 18, 36, 0.97)',
              backdropFilter: 'blur(24px)',
              borderBottom: '1px solid rgba(79,142,247,0.18)',
              boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-5 space-y-1">
              {allNav.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.page;
                return (
                  <button
                    key={item.name}
                    onClick={() => { onNavigate(item.page); setMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                    style={{
                      background: isActive ? 'rgba(79,142,247,0.14)' : 'transparent',
                      color: isActive ? '#7eb3ff' : 'hsl(215 20% 65%)',
                      borderLeft: isActive ? '2px solid #4f8ef7' : '2px solid transparent',
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </button>
                );
              })}

              {/* Auth section */}
              <div className="pt-4 mt-4" style={{ borderTop: '1px solid rgba(79,142,247,0.12)' }}>
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 px-4 py-2">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                        style={{ background: 'linear-gradient(135deg, #4f8ef7, #0aadde)' }}
                      >
                        {avatarLetter}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">
                          {user.firstName || user.name || 'Citizen'}
                        </div>
                        <div className="text-xs" style={{ color: 'hsl(215 20% 55%)' }}>
                          {user.email || 'Citizen Account'}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors hover:bg-red-500/10"
                      style={{ color: '#f87171' }}
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { onLogin(); setMobileMenuOpen(false); }}
                    className="btn-glow-blue w-full py-3 rounded-xl text-sm font-semibold text-white"
                  >
                    Sign In to Citizora
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spacer so content starts below sticky header */}
      <div className="h-16 lg:h-[68px]" />
    </>
  );
}