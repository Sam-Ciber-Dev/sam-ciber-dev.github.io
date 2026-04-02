// Modular bootstrap (pure reorganization, no functional change)
import { initProjects, nextPage, prevPage } from './projects.js';
import { validateName, validateEmail, validateMessageContent } from './validation.js';
import { showCopyNotification } from './notifications.js';
import { initAnchors } from './anchors.js';
import { initNavigation } from './navigation.js';
import { initFadeInObserver } from './observer.js';
import { initMobileMenu } from './menu.js';
import { initCopyFeatures } from './copy.js';
import { initCvModal } from './modal.js';
import { initContactForm } from './form-secure.js';
import { initKeyboardNavigator } from './keyboard-nav.js';
import { qs, on } from './dom-utils.js';
import { initDataHandlers } from './data-handlers.js';
import { initI18n, getLang, t } from './i18n.js';

// Initialize i18n first (synchronous — reads localStorage / browser lang)
initI18n();

// Typing animation (uses i18n)
const subtitle = qs('.hero-subtitle');
const _toggleBtn = qs('#lang-toggle');
let _isTyping = false;
let _isUnlocking = false;

function _lockButton() {
  if (!_toggleBtn) return;
  _toggleBtn.classList.remove('lang-unlocking');
  _toggleBtn.classList.add('lang-locked');
}

function _unlockButton() {
  if (!_toggleBtn) return;
  _isUnlocking = true;
  _toggleBtn.classList.remove('lang-locked');
  _toggleBtn.classList.add('lang-unlocking');
  const onEnd = () => {
    _toggleBtn.removeEventListener('transitionend', onEnd);
    _toggleBtn.classList.remove('lang-unlocking');
    _isUnlocking = false;
  };
  _toggleBtn.addEventListener('transitionend', onEnd, { once: true });
  // Fallback in case transitionend doesn't fire
  setTimeout(onEnd, 500);
}

function typeWriter() {
  _isTyping = true;
  _lockButton();
  const text = t('hero.subtitle');
  let _typeIndex = 0;
  subtitle.textContent = '';
  function step() {
    if (_typeIndex < text.length) {
      subtitle.textContent = text.slice(0, _typeIndex + 1);
      _typeIndex++;
      setTimeout(step, 100);
    } else {
      _isTyping = false;
      _unlockButton();
    }
  }
  step();
}

/** Check if language switching is currently allowed */
export function isLangLocked() {
  return _isTyping || _isUnlocking;
}
// Expose to i18n module (avoids circular import)
window.__langLock = { isLangLocked };

on(window, 'load', () => { document.body.classList.add('loaded'); setTimeout(typeWriter, 2000); });
// Re-run typing animation when language changes
on(window, 'lang-change', () => { typeWriter(); });

// Init sequence (projects is async — loads JSON)
initProjects().then(() => {
  initDataHandlers();
});
initAnchors();
initNavigation();
initFadeInObserver();
initMobileMenu();
initCopyFeatures();
initCvModal();
initContactForm();
initKeyboardNavigator();

// Public namespace (unchanged surface)
window.App = Object.freeze({
  pagination: { nextPage, prevPage },
  validation: { validateEmail, validateName, validateMessageContent },
  notifications: { showCopyNotification },
});
