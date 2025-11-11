// Mobile menu logic (behavior preserved)
import { qs, qsa, on } from './dom-utils.js';

export function initMobileMenu(){
  const mobileMenuBtn = qs('.mobile-menu-btn');
  const navMenu = qs('.nav-menu');
  if(!mobileMenuBtn || !navMenu) return;
  function openMobileMenu() {
    navMenu.style.display = 'flex';
    navMenu.offsetHeight; // force reflow
    navMenu.classList.add('show');
    navMenu.classList.remove('hide');
    mobileMenuBtn.setAttribute('aria-expanded','true');
    const icon = mobileMenuBtn.querySelector('i');
    icon.classList.remove('fa-bars'); icon.classList.add('fa-times');
  }
  function closeMobileMenu() {
    navMenu.classList.add('hide');
    navMenu.classList.remove('show');
    mobileMenuBtn.setAttribute('aria-expanded','false');
    const icon = mobileMenuBtn.querySelector('i');
    icon.classList.remove('fa-times'); icon.classList.add('fa-bars');
    setTimeout(()=>{ if (navMenu.classList.contains('hide')) { navMenu.style.display='none'; navMenu.classList.remove('hide'); } }, 400);
  }
  on(mobileMenuBtn,'click', ()=> navMenu.classList.contains('show') ? closeMobileMenu() : openMobileMenu());
  qsa('.nav-link').forEach(link => on(link,'click', closeMobileMenu));
  document.addEventListener('click', (e)=>{ if(!navMenu.contains(e.target) && !mobileMenuBtn.contains(e.target) && navMenu.classList.contains('show')) closeMobileMenu(); });
  on(window,'resize', ()=>{ if(window.innerWidth > 768 && navMenu.classList.contains('show')) { navMenu.classList.remove('show'); navMenu.style.display='none'; const icon = mobileMenuBtn.querySelector('i'); icon.classList.remove('fa-times'); icon.classList.add('fa-bars'); } });
}
