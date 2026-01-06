/**
 * ============================================================
 * 🛡️ SECURE CONTACT FORM - Cliente
 * ============================================================
 * Formulário de contacto com múltiplas camadas de defesa
 * Comunica com Cloudflare Worker (ID do Formspree escondido)
 * 
 * Autor: Samuel Oliveira
 * Data: Janeiro 2026
 * ============================================================
 */

import { validateName, validateEmail, validateMessageContent } from './validation.js';
import { on } from './dom-utils.js';

// ===================== CONFIGURAÇÃO =====================
const CONFIG = {
  // URL do Cloudflare Worker
  WORKER_URL: 'https://contact-shield.sam-oliveira-dev.workers.dev',
  
  // Cloudflare Turnstile Site Key (pública)
  TURNSTILE_SITE_KEY: '0x4AAAAAACKws8WKGgdv8CqP',
  
  // Tempo mínimo antes de permitir submit (ms)
  MIN_SUBMIT_TIME: 3500,
  
  // Mensagens
  MESSAGES: {
    SENDING: '<i class="fas fa-spinner fa-spin"></i> Enviando...',
    SUCCESS: '<i class="fas fa-check"></i> Enviado!',
    ERROR: '<i class="fas fa-times"></i> Erro ao enviar',
    TOO_FAST: '<i class="fas fa-hourglass-half"></i> Aguarde...',
    ORIGINAL: '<i class="fas fa-paper-plane"></i> Enviar Mensagem',
  },
};

// ===================== GERAÇÃO DE TOKEN =====================

/**
 * Gera token de segurança baseado no timestamp
 * Este token é validado pelo Worker
 */
function generateSecurityToken(timestamp) {
  const hash = (timestamp * 7 % 9999).toString();
  const tokenData = `${timestamp}-${hash}`;
  return btoa(tokenData);
}

/**
 * Gera fingerprint básico do browser (anti-bot)
 */
function generateBrowserFingerprint() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillText('test', 2, 2);
  
  const data = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    !!window.sessionStorage,
    !!window.localStorage,
    canvas.toDataURL().slice(-50),
  ];
  
  return btoa(data.join('|')).slice(0, 32);
}

// ===================== VALIDAÇÃO VISUAL =====================

/**
 * Atualiza estado visual do campo
 */
function updateFieldState(field, isValid, customMessage = '') {
  if (isValid) {
    field.classList.remove('error');
    field.classList.add('success');
    field.setCustomValidity('');
  } else {
    field.classList.remove('success');
    field.classList.add('error');
    if (customMessage) {
      field.setCustomValidity(customMessage);
      field.reportValidity();
      setTimeout(() => field.setCustomValidity(''), 2000);
    }
  }
}

/**
 * Limpa estado visual do campo
 */
function clearFieldState(field) {
  field.classList.remove('error', 'success');
  field.setCustomValidity('');
}

// ===================== NOTIFICAÇÕES =====================

/**
 * Mostra notificação toast
 */
function showNotification(message, type = 'info') {
  // Remover notificações existentes
  const existing = document.querySelector('.contact-notification');
  if (existing) existing.remove();
  
  const notification = document.createElement('div');
  notification.className = `contact-notification contact-notification-${type}`;
  notification.innerHTML = `
    <span class="notification-icon">
      ${type === 'success' ? '<i class="fas fa-check-circle"></i>' : 
        type === 'error' ? '<i class="fas fa-exclamation-circle"></i>' : 
        '<i class="fas fa-info-circle"></i>'}
    </span>
    <span class="notification-message">${message}</span>
  `;
  
  // Estilos inline (fallback)
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 8px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    color: white;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  // Remover após 5 segundos
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

// ===================== SUBMISSÃO SEGURA =====================

/**
 * Submete o formulário de forma segura através do Worker
 */
async function submitFormSecurely(form, formData, submitBtn) {
  const originalText = submitBtn.innerHTML;
  
  try {
    submitBtn.innerHTML = CONFIG.MESSAGES.SENDING;
    submitBtn.disabled = true;
    
    // Preparar dados
    const pageLoadTime = window.__pageLoadTs || Date.now();
    const securityToken = generateSecurityToken(pageLoadTime);
    
    const payload = {
      name: formData.get('name'),
      email: formData.get('email'),
      subject: formData.get('subject'),
      message: formData.get('message'),
      ts: pageLoadTime.toString(),
      _token: securityToken,
      _fingerprint: generateBrowserFingerprint(),
      // Cloudflare Turnstile token
      'cf-turnstile-response': formData.get('cf-turnstile-response') || '',
      // Honeypots (devem estar vazios)
      _gotcha: formData.get('_gotcha') || '',
      website: formData.get('website') || '',
    };
    
    // Enviar para o Worker
    const response = await fetch(CONFIG.WORKER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-Contact-Token': securityToken,
        'X-Page-Load-Time': pageLoadTime.toString(),
      },
      body: JSON.stringify(payload),
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      // Sucesso!
      submitBtn.innerHTML = CONFIG.MESSAGES.SUCCESS;
      showNotification('Mensagem enviada com sucesso! Obrigado pelo contacto.', 'success');
      
      setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        form.reset();
        
        // Limpar estados visuais
        form.querySelectorAll('.form-input').forEach(clearFieldState);
        
        // Reset do Turnstile para próximo envio
        if (window.turnstile) {
          const turnstileWidget = form.querySelector('.cf-turnstile');
          if (turnstileWidget) {
            window.turnstile.reset(turnstileWidget);
          }
        }
        
        // Regenerar timestamp para próximo envio
        window.__pageLoadTs = Date.now();
        const tsField = document.getElementById('ts');
        if (tsField) tsField.value = window.__pageLoadTs.toString();
      }, 2500);
      
    } else {
      // Erro do servidor
      throw new Error(result.error || 'Erro ao enviar mensagem');
    }
    
  } catch (error) {
    console.error('Erro no envio:', error);
    
    submitBtn.innerHTML = CONFIG.MESSAGES.ERROR;
    showNotification(
      error.message || 'Erro ao enviar mensagem. Por favor, tente novamente.',
      'error'
    );
    
    setTimeout(() => {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }, 2500);
  }
}

// ===================== INICIALIZAÇÃO =====================

/**
 * Inicializa o widget Cloudflare Turnstile
 * O widget já está no HTML, apenas verificamos se existe
 */
function initTurnstile(form) {
  const turnstileContainer = form.querySelector('.cf-turnstile');
  if (!turnstileContainer) {
    console.warn('Widget Turnstile não encontrado no HTML');
  } else {
    console.log('🛡️ Turnstile widget encontrado');
  }
}

/**
 * Inicializa o formulário de contacto seguro
 */
export function initSecureContactForm() {
  const form = document.querySelector('.contact-form');
  if (!form) return;
  
  // Elementos do formulário
  const nameField = document.getElementById('name');
  const emailField = document.getElementById('email');
  const subjectField = document.getElementById('subject');
  const messageField = document.getElementById('message');
  const tsField = document.getElementById('ts');
  const submitBtn = document.getElementById('submitBtn');
  
  // Guardar timestamp de carregamento
  window.__pageLoadTs = Date.now();
  if (tsField) {
    tsField.value = window.__pageLoadTs.toString();
  }
  
  // Adicionar campo de token oculto se não existir
  if (!form.querySelector('input[name="_token"]')) {
    const tokenInput = document.createElement('input');
    tokenInput.type = 'hidden';
    tokenInput.name = '_token';
    tokenInput.id = '_token';
    form.appendChild(tokenInput);
  }
  
  // ==================== Inicializar Turnstile ====================
  initTurnstile(form);
  
  // ==================== Validação em tempo real ====================
  
  // Nome
  on(nameField, 'input', function() {
    if (this.value.length > 0) {
      const isValid = validateName(this.value);
      updateFieldState(this, isValid, isValid ? '' : 'Preencha o seu nome corretamente');
    } else {
      clearFieldState(this);
    }
  });
  
  // Email
  on(emailField, 'input', function() {
    if (this.value.length > 0) {
      const isValid = validateEmail(this.value);
      updateFieldState(this, isValid, isValid ? '' : 'Email inválido');
    } else {
      clearFieldState(this);
    }
  });
  
  // Mensagem
  on(messageField, 'input', function() {
    if (this.value.length > 0) {
      const contentCheck = validateMessageContent(this.value);
      updateFieldState(this, contentCheck.valid, contentCheck.reason || '');
    } else {
      clearFieldState(this);
    }
  });
  
  // ==================== Submissão ====================
  
  on(form, 'submit', async (e) => {
    e.preventDefault();
    
    // Verificar honeypots (silenciosamente)
    const hpField = document.getElementById('hp');
    const websiteField = document.getElementById('website');
    if ((hpField && hpField.value.trim()) || (websiteField && websiteField.value.trim())) {
      // Bot detectado - fingir sucesso
      submitBtn.innerHTML = CONFIG.MESSAGES.SUCCESS;
      setTimeout(() => {
        submitBtn.innerHTML = CONFIG.MESSAGES.ORIGINAL;
        form.reset();
      }, 2000);
      return;
    }
    
    // Verificar tempo mínimo
    const now = Date.now();
    const pageTs = window.__pageLoadTs || 0;
    const elapsed = now - pageTs;
    
    if (elapsed < CONFIG.MIN_SUBMIT_TIME) {
      submitBtn.innerHTML = CONFIG.MESSAGES.TOO_FAST;
      showNotification('Por favor, aguarde alguns segundos antes de enviar.', 'info');
      setTimeout(() => {
        submitBtn.innerHTML = CONFIG.MESSAGES.ORIGINAL;
      }, 1500);
      return;
    }
    
    // Validar todos os campos
    const isNameValid = validateName(nameField.value);
    const isEmailValid = validateEmail(emailField.value);
    const isSubjectValid = subjectField.value.length > 0;
    const isMessageValid = messageField.value.trim().length > 0;
    const contentCheck = validateMessageContent(messageField.value);
    
    // Mostrar erros de validação
    if (!isNameValid) {
      updateFieldState(nameField, false, 'Preencha o seu nome corretamente');
      return;
    }
    if (!isEmailValid) {
      updateFieldState(emailField, false, 'Email inválido');
      return;
    }
    if (!isSubjectValid) {
      subjectField.focus();
      showNotification('Por favor, selecione um assunto.', 'error');
      return;
    }
    if (!isMessageValid || !contentCheck.valid) {
      updateFieldState(messageField, false, contentCheck.reason || 'Mensagem inválida');
      return;
    }
    
    // Verificar se o Turnstile foi completado
    const turnstileResponse = form.querySelector('input[name="cf-turnstile-response"]');
    if (!turnstileResponse || !turnstileResponse.value) {
      showNotification('Por favor, complete a verificação de segurança.', 'error');
      return;
    }
    
    // Atualizar token antes de enviar
    const tokenField = form.querySelector('input[name="_token"]');
    if (tokenField) {
      tokenField.value = generateSecurityToken(window.__pageLoadTs);
    }
    
    // Enviar formulário
    const formData = new FormData(form);
    await submitFormSecurely(form, formData, submitBtn);
  });
  
  // ==================== Anti-spam: detectar comportamento bot ====================
  
  let interactionCount = 0;
  const trackInteraction = () => { interactionCount++; };
  
  document.addEventListener('mousemove', trackInteraction, { once: true });
  document.addEventListener('keydown', trackInteraction, { once: true });
  document.addEventListener('scroll', trackInteraction, { once: true });
  document.addEventListener('touchstart', trackInteraction, { once: true });
  
  // Anexar contagem de interações ao form
  form.addEventListener('submit', () => {
    if (interactionCount === 0) {
      // Sem interação humana detectada - possível bot
      console.warn('Submissão sem interação humana detectada');
    }
  });
  
  console.log('🛡️ Formulário de contacto seguro inicializado');
}

// ===================== EXPORT PARA COMPATIBILIDADE ====================

// Manter compatibilidade com o import existente
export { initSecureContactForm as initContactForm };
