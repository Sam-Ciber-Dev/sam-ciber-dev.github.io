// CV Modal logic
import { qs, on, qsa } from './dom-utils.js';
import { trapFocus } from './dom-utils.js';

export function initCvModal(){
  const openBtn = qs('#cv-modal-open');
  const modal = qs('#cv-modal'); if(!openBtn || !modal) return;
  const dialog = modal.querySelector('.cv-modal__dialog');
  const closeElements = modal.querySelectorAll('[data-cv-close]');
  let lastFocused = null;
  function openModal(){ lastFocused = document.activeElement; modal.setAttribute('aria-hidden','false'); openBtn.setAttribute('aria-expanded','true'); document.body.style.overflow='hidden'; document.addEventListener('keydown', onKeyDown); const focusable = dialog.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'); if (focusable.length) focusable[0].focus(); }
  function closeModal(){ modal.setAttribute('aria-hidden','true'); openBtn.setAttribute('aria-expanded','false'); document.body.style.overflow=''; document.removeEventListener('keydown', onKeyDown); if (lastFocused) lastFocused.focus(); }
  function onKeyDown(e){ if (e.key === 'Escape') { closeModal(); return; } trapFocus(dialog, e); }
  on(openBtn,'click', e=>{ e.preventDefault(); openModal(); });
  closeElements.forEach(el=> on(el,'click', e=>{ e.preventDefault(); closeModal(); }));
  on(modal,'click', e=>{ if (e.target === modal.querySelector('.cv-modal__backdrop')) closeModal(); });
}
