// Active navigation, scroll-top visibility, header background
import { qs, qsa, on, raf } from './dom-utils.js';
import { getHeaderHeight } from './layout.js';

// Sections without an id that are highlighted under the "Experiência" nav link
const EXPERIENCE_GROUP_TITLES = ['exp.title', 'edu.title', 'acad.title'];

let scrollTopBtn, header;
let _scrollScheduled = false;

function computeCurrentSection() {
  const sections = qsa('section[id]');
  const headerH = getHeaderHeight();
  let currentSection = '';
  let bestMatch = null;
  let bestMatchDistance = Infinity;
  if (window.pageYOffset < headerH + 20) return 'home';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - (headerH + 20);
    const sectionHeight = section.offsetHeight;
    const sectionBottom = sectionTop + sectionHeight;
    const scrollPos = window.pageYOffset;
    if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
      const distance = Math.abs(scrollPos - sectionTop);
      if (distance < bestMatchDistance) {
        bestMatchDistance = distance;
        bestMatch = section.getAttribute('id');
      }
    }
  });
  if (bestMatch) currentSection = bestMatch; else {
    const allSections = qsa('section');
    allSections.forEach(section => {
      const sectionTop = section.offsetTop - (headerH + 20);
      const sectionHeight = section.offsetHeight;
      const sectionBottom = sectionTop + sectionHeight;
      const scrollPos = window.pageYOffset;
      if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
        const sectionTitle = section.querySelector('.section-title');
        if (sectionTitle) {
          const titleKey = sectionTitle.dataset.i18n; // language-independent (the visible text changes with PT/EN)
            if (EXPERIENCE_GROUP_TITLES.includes(titleKey)) {
              const distance = Math.abs(scrollPos - sectionTop);
              if (distance < bestMatchDistance) { bestMatchDistance = distance; currentSection = 'experience'; }
            }
            if (titleKey === 'certs.title') {
              const distance = Math.abs(scrollPos - sectionTop);
              if (distance < bestMatchDistance) { bestMatchDistance = distance; currentSection = 'skills'; }
            }
        }
      }
    });
  }
  const contactSection = qs('#contact');
  if (contactSection) {
    const contactTop = contactSection.offsetTop - (headerH + 120);
    const pageHeight = document.documentElement.scrollHeight;
    const windowHeight = window.innerHeight;
    const scrollPos = window.pageYOffset;
    if (scrollPos >= contactTop || (scrollPos + windowHeight >= pageHeight - 50)) currentSection = 'contact';
  }
  return currentSection;
}

function applyActiveLink(sectionId) {
  const navLinks = qsa('.nav-link');
  navLinks.forEach(link => {
    const isActive = link.getAttribute('href') === `#${sectionId}`;
    link.classList.toggle('active', isActive);
    if (isActive) link.setAttribute('aria-current','page'); else link.removeAttribute('aria-current');
  });
}

function updateActiveNavigation() {
  applyActiveLink(computeCurrentSection());
}

function onScrollUnified(){
  if (_scrollScheduled) return; _scrollScheduled = true;
  raf(() => {
    const y = window.pageYOffset || window.scrollY || 0;
    updateActiveNavigation();
    if (scrollTopBtn) scrollTopBtn.classList.toggle('visible', y > 300);
    if (header) header.style.background = (y > 100) ? 'rgba(15, 23, 42, 0.98)' : 'rgba(15, 23, 42, 0.95)';
    _scrollScheduled = false;
  });
}

export function initNavigation() {
  scrollTopBtn = qs('.scroll-top');
  header = qs('.header');
  on(window,'load', updateActiveNavigation);
  on(window,'scroll', onScrollUnified, { passive: true });
}
