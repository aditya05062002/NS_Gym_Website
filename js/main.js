// ── THEME TOGGLE ──────────────────────────────────────────────
const themeToggle = document.getElementById('themeToggle');

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('theme', theme);
  if (themeToggle) {
    themeToggle.textContent = theme === 'dark' ? 'Light' : 'Dark';
    themeToggle.setAttribute('aria-label', 'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' theme');
  }
}
setTheme(document.documentElement.dataset.theme || 'dark');
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  });
}

// ── ACCORDION ──────────────────────────────────────────────────
function toggleAcc(head) {
  const item = head.closest('.acc-item');
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.acc-item').forEach(i => i.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}

// ── ANIMATED STATS COUNTER ─────────────────────────────────────
function animateCount(el) {
  const target = parseInt(el.dataset.target);
  const suffix = el.textContent.includes('+') ? '+' : '';
  let start = 0;
  const duration = 1800;
  const step = duration / target;
  const timer = setInterval(() => {
    start = Math.min(start + Math.ceil(target / 60), target);
    el.textContent = start + suffix;
    if (start >= target) clearInterval(timer);
  }, step < 16 ? 16 : step);
}

// ── INTERSECTION OBSERVER: STATS + FADE-UP ────────────────────
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('[data-target]').forEach(animateCount);
      statsObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });
statsObserver.observe(document.querySelector('.stats-bar'));

const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-up').forEach(el => fadeObserver.observe(el));

// ── ABOUT VIDEO: AUTOPLAY IN VIEWPORT ─────────────────────────
const aboutVideo = document.querySelector('.about-video');
if (aboutVideo) {
  aboutVideo.muted = true;
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        aboutVideo.play().catch(() => {});
      } else {
        aboutVideo.pause();
      }
    });
  }, { threshold: 0.35 });
  videoObserver.observe(aboutVideo);
}

// ── SMOOTH NAV HIGHLIGHT ON SCROLL ────────────────────────────
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  let cur = '';
  sections.forEach(s => { if (window.scrollY >= s.offsetTop - 120) cur = s.id; });
  navLinks.forEach(a => {
    a.style.color = a.getAttribute('href') === '#' + cur ? 'var(--text)' : '';
  });
});

// ── CONTACT FORM ──────────────────────────────────────────────
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz6ZzConlDLXqAQTtVeYtw1WyxP4T1POG5EHjRMqj_RGa2MZcpcxN_FH9iJyHG7uBVu/exec';

function showToast(type, msg) {
  const t = document.getElementById('formToast');
  t.className = 'form-toast ' + type;
  t.innerHTML = (type === 'success' ? '✅ ' : '⚠️ ') + msg;
  t.style.display = 'flex';
  setTimeout(() => { t.style.display = 'none'; }, 6000);
}

async function submitContactForm() {
  const btn = document.getElementById('formSubmitBtn');

  const name     = document.getElementById('cf-name').value.trim();
  const phone    = document.getElementById('cf-phone').value.trim();
  const email    = document.getElementById('cf-email').value.trim();
  const interest = document.getElementById('cf-interest').value;
  const plan     = document.getElementById('cf-plan').value;
  const message  = document.getElementById('cf-message').value.trim();

  // Validate required fields
  if (!name) {
    showToast('error', 'Please enter your full name.');
    document.getElementById('cf-name').focus(); return;
  }
  if (!phone || phone.replace(/\D/g,'').length < 10) {
    showToast('error', 'Please enter a valid 10-digit phone number.');
    document.getElementById('cf-phone').focus(); return;
  }

  // Loading state
  btn.classList.add('loading');
  btn.disabled = true;

  const payload = { name, phone, email, interest, plan, message };

  try {
    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    showToast('success', "Message sent! We'll contact you within 24 hours. 💪");

    // Reset form
    ['cf-name','cf-phone','cf-email','cf-message'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('cf-interest').value = '';
    document.getElementById('cf-plan').value = '';

  } catch (err) {
    showToast('error', 'Something went wrong. Please call us directly at 9156787806.');
    console.error('Form error:', err);
  } finally {
    btn.classList.remove('loading');
    btn.disabled = false;
  }
}
