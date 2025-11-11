// Intersection Observer for fade-in elements
import { qsa } from './dom-utils.js';

export function initFadeInObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  qsa('.fade-in').forEach(el => observer.observe(el));
}
