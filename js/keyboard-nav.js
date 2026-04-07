// Keyboard section navigation (Shift+S / Shift+A)
import { qsa, on } from './dom-utils.js';
import { getHeaderHeight, scheduleSeamFix } from './layout.js';

export function initKeyboardNavigator(){
  const SECTION_IDS = ['home','about','experience','certifications','skills','projects','contact'];
  const sections = SECTION_IDS.map(id => document.getElementById(id)).filter(Boolean);
  let currentIndex = -1;
  // Navigation lock to prevent repeated Shift+S/Shift+A until arrival
  let navLock = false;
  let unlockScrollHandler = null;
  let unlockTimeoutId = null;
  const ARRIVAL_TOLERANCE_PX = 4;
  const MAX_LOCK_MS = 2000; // fallback in case scrolling settles differently

  function unlockNavigation(){
    if (!navLock) return;
    navLock = false;
    if (unlockScrollHandler) {
      window.removeEventListener('scroll', unlockScrollHandler);
      unlockScrollHandler = null;
    }
    if (unlockTimeoutId) {
      clearTimeout(unlockTimeoutId);
      unlockTimeoutId = null;
    }
  }

  function scrollToSection(el){
    if(!el) return;
    // Engage lock
    navLock = true;
    // Smooth scroll
    el.scrollIntoView({ behavior:'smooth', block:'start' });
    if(el.id==='about') scheduleSeamFix(el);
    // When we reach the target (accounting for header height), release the lock
    let rafScheduled = false;
    const headerH = getHeaderHeight();
    const targetTop = Math.max(0, el.offsetTop - headerH);
    const checkArrived = () => {
      const dist = Math.abs((window.scrollY || window.pageYOffset || 0) - targetTop);
      // Alternatively, compare bounding rect top vs header height to be robust
      const rectTop = el.getBoundingClientRect().top;
      const nearTop = Math.abs(rectTop - headerH) <= ARRIVAL_TOLERANCE_PX;
      if (dist <= ARRIVAL_TOLERANCE_PX || nearTop) {
        unlockNavigation();
      }
    };
    unlockScrollHandler = () => {
      if (rafScheduled) return;
      rafScheduled = true;
      requestAnimationFrame(() => { rafScheduled = false; checkArrived(); });
    };
    window.addEventListener('scroll', unlockScrollHandler, { passive: true });
    // Fallback timeout to ensure we don't keep it locked forever
    unlockTimeoutId = setTimeout(unlockNavigation, MAX_LOCK_MS);
  }
  function getCurrentSectionIndex(){ const headerH = getHeaderHeight(); const pos = window.scrollY + headerH + 2; let bestIdx=0; let bestDist=Infinity; sections.forEach((sec, idx)=>{ const top=sec?sec.offsetTop:0; const d = pos >= top ? (pos - top) : Infinity; if(d<bestDist){ bestDist=d; bestIdx=idx; } }); return bestIdx; }
  // Consider inputs and editable fields as interactive to avoid hijacking typing.
  // Allow Shift+S / Shift+A even when a generic button has focus, except when it's a form button.
  function isInteractive(el){
    if(!el) return false;
    if (el.isContentEditable) return true;
    const tag = el.tagName;
    if (tag==='INPUT' || tag==='TEXTAREA' || tag==='SELECT') return true;
    if (tag==='BUTTON') {
      // Block navigation only if the focused button is part of a form (e.g., submit button)
      return !!el.closest('form');
    }
    return false;
  }
  function goNext(){ if(!sections.length) return; currentIndex=getCurrentSectionIndex(); currentIndex=(currentIndex+1)%sections.length; scrollToSection(sections[currentIndex]); }
  function goPrev(){ if(!sections.length) return; currentIndex=getCurrentSectionIndex(); currentIndex=(currentIndex-1+sections.length)%sections.length; scrollToSection(sections[currentIndex]); }
  on(document,'keydown', (e)=>{
    if(!e.shiftKey) return;
    const active=document.activeElement;
    if(isInteractive(active)) return;
    const key=(e.key||'').toLowerCase();
    if(key==='s' || key==='a'){
      // If we're mid-navigation, ignore until arrival
      if (navLock) { e.preventDefault(); return; }
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('section-navigate'));
      if(key==='s') goNext(); else goPrev();
    }
  });
  qsa('.nav-link').forEach(link=>{ const href=link.getAttribute('href'); if(!href||!href.startsWith('#')) return; const id=href.slice(1); if(!SECTION_IDS.includes(id)) return; on(link,'click', (e)=>{ e.preventDefault(); const target=document.getElementById(id); if(target){ currentIndex=SECTION_IDS.indexOf(id); scrollToSection(target); } }); });
}
