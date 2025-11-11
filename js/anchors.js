// Internal anchors smooth scroll + URL hash (extracted from main.js)
import { qs, qsa, on } from './dom-utils.js';
import { scheduleSeamFix } from './layout.js';

export function initAnchors() {
  qsa('a[href^="#"]').forEach(anchor => {
    on(anchor, 'click', e => {
      e.preventDefault();
      const href = anchor.getAttribute('href');
      const target = qs(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (target.id === 'about') scheduleSeamFix(target);
        if (history.pushState && href.startsWith('#')) history.pushState(null, '', href);
      }
    });
  });
}
