// Layout utilities extracted from main.js (no behavior change)
import { qs, qsa, raf } from './dom-utils.js';

export function getHeaderHeight() {
  const root = document.documentElement;
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const varName = isMobile ? '--header-height-mobile' : '--header-height-desktop';
  const fromVar = parseInt(getComputedStyle(root).getPropertyValue(varName), 10);
  const headerEl = qs('.header');
  const fallback = headerEl ? headerEl.offsetHeight : 72;
  return Number.isFinite(fromVar) ? fromVar : fallback;
}

export function fixHeroSeamIfNeeded(target) {
  try {
    if (!target || target.id !== 'about') return;
    const hero = qs('.hero');
    if (!hero) return;
    const headerH = getHeaderHeight();
    const heroBottomDoc = hero.getBoundingClientRect().bottom + window.scrollY;
    const targetTopDoc = target.getBoundingClientRect().top + window.scrollY;
    const desiredTop = Math.max(
      Math.max(0, Math.ceil(targetTopDoc - headerH + 2)),
      Math.ceil(heroBottomDoc - headerH + 2)
    );
    if (Math.abs(window.scrollY - desiredTop) > 1) {
      window.scrollTo({ top: desiredTop, behavior: 'auto' });
    } else {
      window.scrollBy({ top: 2, left: 0, behavior: 'auto' });
    }
  } catch {/* swallow */}
}

export function scheduleSeamFix(target) {
  [120, 260, 420].forEach(d => setTimeout(() => { raf(() => fixHeroSeamIfNeeded(target)); }, d));
}

export function scrollToSection(el) {
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (el.id === 'about') scheduleSeamFix(el);
}
