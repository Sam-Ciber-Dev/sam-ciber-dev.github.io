// Project nav + certification click wiring
import { qsa, on } from './dom-utils.js';
import { nextPage, prevPage } from './projects.js';
import { handleCertificationClick } from './notifications.js';

export function initDataHandlers(){
  qsa('.nav-button').forEach(btn => {
    const dirAttr = btn.getAttribute('data-dir');
    const catAttr = btn.getAttribute('data-category');
    const dir = dirAttr || (btn.id && btn.id.includes('-prev-') ? 'prev' : 'next');
    const category = catAttr || (btn.id ? btn.id.replace(/-(prev|next)-btn$/, '').replace(/-\w+$/, '') : '');
    if(!category) return;
    on(btn,'click', (e)=>{ e.preventDefault(); if (dir === 'next') nextPage(category); else prevPage(category); });
  });
  qsa('a.certification-item[data-cert-name]').forEach(a => on(a,'click', (e)=>{ const name = a.getAttribute('data-cert-name') || 'Certificado'; handleCertificationClick(e, name); }));
}
