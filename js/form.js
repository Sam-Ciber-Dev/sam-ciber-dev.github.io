// Contact form validation + submission + anti-bot
import { validateName, validateEmail, validateMessageContent } from './validation.js';
import { on } from './dom-utils.js';

export function initContactForm(){
  const form = document.querySelector('.contact-form');
  if (!form) return;
  const nameField = document.getElementById('name');
  const emailField = document.getElementById('email');
  const subjectField = document.getElementById('subject');
  const messageField = document.getElementById('message');
  const tsField = document.getElementById('ts');
  window.__pageLoadTs = Date.now(); if (tsField) tsField.value = String(window.__pageLoadTs - Math.floor(Math.random()*200));
  on(nameField,'input', function(){ if (this.value.length>0) { if (validateName(this.value)) { this.classList.remove('error'); this.classList.add('success'); this.setCustomValidity(''); } else { this.classList.remove('success'); this.classList.add('error'); this.setCustomValidity('Preencha o seu nome corretamente'); } } else { this.classList.remove('error','success'); this.setCustomValidity(''); } });
  on(emailField,'input', function(){ if (this.value.length>0) { if (validateEmail(this.value)) { this.classList.remove('error'); this.classList.add('success'); } else { this.classList.remove('success'); this.classList.add('error'); } } else { this.classList.remove('error','success'); } });
  on(form,'submit', (e)=>{
    e.preventDefault();
    const hpField = document.getElementById('hp'); if (hpField && hpField.value && hpField.value.trim() !== '') return;
    const websiteField = document.getElementById('website'); if (websiteField && websiteField.value && websiteField.value.trim() !== '') return;
    const now = Date.now(); const pageTs = parseInt(tsField && tsField.value ? tsField.value : (window.__pageLoadTs || 0), 10) || 0; const elapsed = now - pageTs; const MIN_ELAPSED_MS = 3500; if (pageTs > 0 && elapsed < MIN_ELAPSED_MS) { const submitBtn = document.getElementById('submitBtn'); if (submitBtn) { const originalText = submitBtn.innerHTML; submitBtn.innerHTML = '<i class="fas fa-hourglass-half"></i> Aguarde alguns segundos...'; setTimeout(()=>{ submitBtn.innerHTML = originalText; }, 1500); } return; }
    const isNameValid = validateName(nameField.value);
    const isEmailValid = validateEmail(emailField.value);
    const isSubjectValid = subjectField.value.length > 0;
    const isMessageValid = messageField.value.trim().length > 0;
    const contentCheck = validateMessageContent(messageField.value);
    if (!isNameValid || !isEmailValid || !isSubjectValid || !isMessageValid || !contentCheck.valid) {
      if (!isNameValid) { nameField.classList.add('error'); nameField.setCustomValidity('Preencha o seu nome corretamente'); nameField.reportValidity(); setTimeout(()=> nameField.setCustomValidity(''), 1500); }
      if (!isEmailValid) { emailField.classList.add('error'); emailField.setCustomValidity('Email inválido'); emailField.reportValidity(); setTimeout(()=> emailField.setCustomValidity(''), 1500); }
      if (!isMessageValid || !contentCheck.valid) { messageField.classList.add('error'); messageField.setCustomValidity(contentCheck.reason || 'Mensagem inválida.'); messageField.reportValidity(); setTimeout(()=> messageField.setCustomValidity(''), 1500); }
      return;
    }
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.innerHTML; submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...'; submitBtn.disabled = true;
    const formData = new FormData(form);
    fetch(form.action, { method: 'POST', body: formData })
      .then(() => { setTimeout(() => { submitBtn.innerHTML = '<i class="fas fa-check"></i> Enviado!'; setTimeout(() => { submitBtn.innerHTML = originalText; submitBtn.disabled = false; form.reset(); emailField.classList.remove('error','success'); nameField.classList.remove('error','success'); }, 2000); }, 1000); })
      .catch(() => { setTimeout(() => { submitBtn.innerHTML = '<i class="fas fa-check"></i> Enviado!'; setTimeout(() => { submitBtn.innerHTML = originalText; submitBtn.disabled = false; form.reset(); emailField.classList.remove('error','success'); nameField.classList.remove('error','success'); }, 2000); }, 1000); });
  });
}
