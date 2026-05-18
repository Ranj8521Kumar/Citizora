/**
 * CivicConnect — Main Entry Page
 * Handles portal navigation and micro-interactions
 */

// ── Portal URL configuration
// Update these to your actual deployed URLs when ready
const PORTAL_URLS = {
  admin:     'https://civic-connect-admin.vercel.app',
  employees: 'https://civic-connect-employees.vercel.app',
  users:     'https://civic-connect-users.vercel.app',
};

// ── Wire up portal card navigation
document.addEventListener('DOMContentLoaded', () => {
  const cards = {
    'portal-admin':     PORTAL_URLS.admin,
    'portal-employees': PORTAL_URLS.employees,
    'portal-users':     PORTAL_URLS.users,
  };

  Object.entries(cards).forEach(([id, url]) => {
    const el = document.getElementById(id);
    if (!el) return;

    // Update href
    el.setAttribute('href', url);

    // Ripple effect on click
    el.addEventListener('click', (e) => {
      if (url === '#') {
        e.preventDefault();
        showToast(`${el.querySelector('.card-title').textContent} — coming soon!`);
        return;
      }
      createRipple(el, e);
    });

    // Keyboard: Enter/Space activate
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        el.click();
      }
    });
  });

  // Stagger card entrance
  animateCards();
});

// ── Staggered card entrance animation
function animateCards() {
  const cards = document.querySelectorAll('.portal-card');
  cards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(32px)';
    card.style.transition = 'none';

    setTimeout(() => {
      card.style.transition = `
        opacity 500ms cubic-bezier(0.16,1,0.3,1),
        transform 500ms cubic-bezier(0.16,1,0.3,1),
        box-shadow 350ms ease,
        border-color 350ms ease
      `;
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 300 + i * 120);
  });
}

// ── Ripple click effect
function createRipple(el, event) {
  const ripple = document.createElement('span');
  const rect = el.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 1.4;
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top  - size / 2;

  Object.assign(ripple.style, {
    position: 'absolute',
    width:  `${size}px`,
    height: `${size}px`,
    left:   `${x}px`,
    top:    `${y}px`,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.08)',
    transform: 'scale(0)',
    transition: 'transform 600ms ease, opacity 600ms ease',
    opacity: '1',
    pointerEvents: 'none',
    zIndex: '10',
  });

  el.style.position = 'relative';
  el.style.overflow = 'hidden';
  el.appendChild(ripple);

  requestAnimationFrame(() => {
    ripple.style.transform = 'scale(1)';
    ripple.style.opacity = '0';
  });

  setTimeout(() => ripple.remove(), 700);
}

// ── Toast notification
function showToast(message) {
  const existing = document.getElementById('cc-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'cc-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');

  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '2rem',
    left: '50%',
    transform: 'translateX(-50%) translateY(16px)',
    background: 'hsl(222, 35%, 12%)',
    color: 'hsl(210, 40%, 96%)',
    border: '1px solid hsl(222, 30%, 20%)',
    borderRadius: '0.75rem',
    padding: '0.75rem 1.5rem',
    fontSize: '0.875rem',
    fontFamily: 'Inter, sans-serif',
    fontWeight: '500',
    zIndex: '9999',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    opacity: '0',
    transition: 'opacity 300ms ease, transform 300ms cubic-bezier(0.16,1,0.3,1)',
    whiteSpace: 'nowrap',
  });

  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(8px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
