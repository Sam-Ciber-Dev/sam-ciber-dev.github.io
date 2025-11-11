// Copy to clipboard + clickable contact icons + copy elements
import { qs, qsa, on } from './dom-utils.js';
import { showCopyNotification } from './notifications.js';

function fallbackCopyTextToClipboard(text, message) {
  const textArea = document.createElement('textarea');
  textArea.value = text; textArea.style.position = 'fixed'; textArea.style.opacity = '0';
  document.body.appendChild(textArea); textArea.focus(); textArea.select();
  try { document.execCommand('copy'); showCopyNotification(message); } catch { showCopyNotification('Erro ao copiar!'); }
  document.body.removeChild(textArea);
}
function copyToClipboard(text, message) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(()=> showCopyNotification(message)).catch(()=> fallbackCopyTextToClipboard(text,message));
  } else fallbackCopyTextToClipboard(text,message);
}

function initClickableContactIcons(){
  const items = qsa('#contact .contact-item'); if(!items.length) return;
  const openNew = (url)=> window.open(url,'_blank','noopener');
  const activate = (el, handler, label) => {
    if(!el) return; el.style.cursor='pointer'; el.setAttribute('role','link'); if(label) el.setAttribute('aria-label',label); el.setAttribute('tabindex','0');
    on(el,'click', handler); on(el,'keydown', ev=>{ const k=ev.key||ev.code; if(k==='Enter'||k===' '||k==='Spacebar'){ ev.preventDefault(); handler(); } });
  };
  items.forEach(item=>{
    const iconBox = item.querySelector('.contact-icon'); if(!iconBox) return; const has = sel=> !!iconBox.querySelector(sel);
    if (has('.fa-envelope')) { const email='sam.oliveira.dev@gmail.com'; activate(iconBox, ()=>{ window.location.href=`mailto:${email}`; }, 'Enviar email para Samuel'); }
    else if (has('.fa-phone')) { activate(iconBox, ()=>{ showCopyNotification('Para mais informações, entre em contacto por email / Linkdin'); }, 'Informação telefónica sob pedido'); }
    else if (has('.fa-linkedin')) { const link=item.querySelector('a[href*="linkedin.com"]'); const href=link?link.href:'https://www.linkedin.com/in/jose-samuel-oliveira/'; activate(iconBox, ()=> openNew(href), 'Abrir LinkedIn em nova aba'); }
    else if (has('.fa-github')) { const link=item.querySelector('a[href*="github.com"]'); const href=link?link.href:'https://github.com/Sam-Ciber-Dev'; activate(iconBox, ()=> openNew(href), 'Abrir GitHub em nova aba'); }
  });
}

function initCopyElements(){
  const copyElements = qsa('.copy-text'); if(!copyElements.length) return;
  copyElements.forEach(el=>{
    const activate = (ev)=>{
      ev.preventDefault();
      const textToCopy = el.getAttribute('data-copy');
      if (el.classList.contains('social-link')) { window.location.href = 'mailto:sam.oliveira.dev@gmail.com'; return; }
      if (textToCopy === 'phone-info') { showCopyNotification('Para mais informações, entre em contacto por email / Linkdin'); return; }
      const message = textToCopy === 'sam.oliveira.dev@gmail.com' ? 'Email copiado!' : 'Copiado!';
      copyToClipboard(textToCopy, message);
    };
    on(el,'click', activate);
    on(el,'keydown', e=>{ const k=e.key||e.code; if(k==='Enter'||k===' '||k==='Spacebar'){ activate(e); } });
  });
}

export function initCopyFeatures(){
  initClickableContactIcons();
  initCopyElements();
}
