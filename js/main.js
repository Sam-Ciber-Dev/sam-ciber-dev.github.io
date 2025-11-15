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
import { initContactForm } from './form.js';
import { initKeyboardNavigator } from './keyboard-nav.js';
import { qs, on } from './dom-utils.js';
import { initDataHandlers } from './data-handlers.js';

// Typing animation (kept local)
const subtitle = qs('.hero-subtitle');
const text = 'Estudante em Cibersegurança';
let _typeIndex = 0;
function typeWriter(){ if(_typeIndex < text.length) { subtitle.textContent = text.slice(0, _typeIndex + 1); _typeIndex++; setTimeout(typeWriter, 100); } }
on(window,'load', () => { document.body.classList.add('loaded'); setTimeout(typeWriter, 2000); });

// Init sequence
initProjects();
initAnchors();
initNavigation();
initFadeInObserver();
initMobileMenu();
initCopyFeatures();
initDataHandlers();
initCvModal();
initContactForm();
initKeyboardNavigator();

// Public namespace (unchanged surface)
window.App = Object.freeze({
  pagination: { nextPage, prevPage },
  validation: { validateEmail, validateName, validateMessageContent },
  notifications: { showCopyNotification },
});
