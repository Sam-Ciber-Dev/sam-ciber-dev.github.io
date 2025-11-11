// Extracted from inline <script> in index.html

// Smooth scrolling + seam fix for hero -> about
function getHeaderHeight() {
    const root = document.documentElement;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const varName = isMobile ? '--header-height-mobile' : '--header-height-desktop';
    const fromVar = parseInt(getComputedStyle(root).getPropertyValue(varName), 10);
    const headerEl = document.querySelector('.header');
    const fallback = headerEl ? headerEl.offsetHeight : 72;
    return Number.isFinite(fromVar) ? fromVar : fallback;
}

function fixHeroSeamIfNeeded(target) {
    try {
        if (!target || target.id !== 'about') return;
        const hero = document.querySelector('.hero');
        if (!hero) return;
        const headerH = getHeaderHeight();
        const heroBottomDoc = hero.getBoundingClientRect().bottom + window.scrollY;
        const targetTopDoc = target.getBoundingClientRect().top + window.scrollY;
        const desiredTop = Math.max(
            Math.max(0, Math.ceil(targetTopDoc - headerH + 2)),
            Math.ceil(heroBottomDoc - headerH + 2)
        );
        if (Math.abs(window.scrollY - desiredTop) > 1) {
            window.scrollTo({ top: desiredTop, behavior: 'auto' });
        } else {
            window.scrollBy({ top: 2, left: 0, behavior: 'auto' });
        }
    } catch (e) { /* no-op */ }
}

function scheduleSeamFix(target) {
    // Try a few times while smooth scroll settles
    const delays = [120, 260, 420];
    delays.forEach(d => setTimeout(() => {
        requestAnimationFrame(() => fixHeroSeamIfNeeded(target));
    }, d));
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const href = this.getAttribute('href');
        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Apply seam fix only when going to #about
            if (target.id === 'about') scheduleSeamFix(target);
            // Update URL hash without jump
            if (history.pushState && href.startsWith('#')) {
                history.pushState(null, '', href);
            }
        }
    });
});

// Active navigation (uses dynamic header height)
function updateActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const headerH = getHeaderHeight();
    
    let currentSection = '';
    let bestMatch = null;
    let bestMatchDistance = Infinity;
    
    if (window.pageYOffset < headerH + 20) {
        currentSection = 'home';
    } else {
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
        
        if (bestMatch) {
            currentSection = bestMatch;
        } else {
            const allSections = document.querySelectorAll('section');
            
            allSections.forEach(section => {
                const sectionTop = section.offsetTop - (headerH + 20);
                const sectionHeight = section.offsetHeight;
                const sectionBottom = sectionTop + sectionHeight;
                const scrollPos = window.pageYOffset;
                
                if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
                    const sectionTitle = section.querySelector('.section-title');
                    if (sectionTitle) {
                        const titleText = sectionTitle.textContent.trim();
                        if (titleText === 'Experiência Profissional' || 
                            titleText === 'Formação Acadêmica' || 
                            titleText === 'Projetos Académicos') {
                            const distance = Math.abs(scrollPos - sectionTop);
                            if (distance < bestMatchDistance) {
                                bestMatchDistance = distance;
                                currentSection = 'experience';
                            }
                        }
                        if (titleText === 'Certificações e Qualificações') {
                            const distance = Math.abs(scrollPos - sectionTop);
                            if (distance < bestMatchDistance) {
                                bestMatchDistance = distance;
                                currentSection = 'skills';
                            }
                        }
                    }
                }
            });
        }
        
        const contactSection = document.getElementById('contact');
        if (contactSection) {
            const contactTop = contactSection.offsetTop - (headerH + 120);
            const pageHeight = document.documentElement.scrollHeight;
            const windowHeight = window.innerHeight;
            const scrollPos = window.pageYOffset;
            
            if (scrollPos >= contactTop || (scrollPos + windowHeight >= pageHeight - 50)) {
                currentSection = 'contact';
            }
        }
    }
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

window.addEventListener('scroll', updateActiveNavigation);
window.addEventListener('load', updateActiveNavigation);

// Optional: nudge if About intersects with a tiny hero remainder
try {
    const aboutSec = document.getElementById('about');
    if (aboutSec && 'IntersectionObserver' in window) {
        const nudgeObserver = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                if (!entry.isIntersecting) continue;
                // If top of About is within header band, do a tiny nudge
                const headerH = getHeaderHeight();
                const rect = aboutSec.getBoundingClientRect();
                if (rect.top <= headerH + 1 && rect.top >= headerH - 3) {
                    window.scrollBy({ top: 2, behavior: 'auto' });
                }
            }
        }, { root: null, threshold: [0, 0.02], rootMargin: `-${getHeaderHeight()}px 0px 0px 0px` });
        nudgeObserver.observe(aboutSec);
    }
} catch (e) { /* noop */ }

// Scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
});

// Scroll to top button
const scrollTopBtn = document.querySelector('.scroll-top');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollTopBtn.classList.add('visible');
    } else {
        scrollTopBtn.classList.remove('visible');
    }
});

// Header background on scroll
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 100) {
        header.style.background = 'rgba(15, 23, 42, 0.98)';
    } else {
        header.style.background = 'rgba(15, 23, 42, 0.95)';
    }
});

// Form validation functions
function validateName(name) {
    name = name.trim();
    const nameRegex = /^[a-zA-ZÀ-ÿ\s]+$/;
    return name.length >= 2 && nameRegex.test(name);
}

function validateEmail(email) {
    email = email.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(email)) return false;
    const parts = email.split('@');
    if (parts.length !== 2) return false;
    const [localPart, domain] = parts;
    if (localPart.length === 0 || localPart.length > 64) return false;
    if (localPart.startsWith('.') || localPart.endsWith('.')) return false;
    if (localPart.includes('..')) return false;
    if (domain.length === 0 || domain.length > 253) return false;
    if (!domain.includes('.')) return false;
    if (domain.startsWith('-') || domain.endsWith('-') || domain.startsWith('.') || domain.endsWith('.')) return false;
    const domainParts = domain.split('.');
    for (let part of domainParts) {
        if (part.length === 0 || part.length > 63) return false;
        if (part.startsWith('-') || part.endsWith('-')) return false;
        if (!/^[a-zA-Z0-9-]+$/.test(part)) return false;
    }
    const tld = domainParts[domainParts.length - 1];
    if (tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) return false;
    const suspiciousDomains = [
        '10minutemail', 'tempmail', 'guerrillamail', 'mailinator', 'throwaway',
        'sharklasers', 'guerrillamailblock', 'grr', 'jourrapide', 'jourrapidemail',
        'temporarymail', 'tempemailaddress', 'tempmailaddress', 'temp-mail',
        'temporary-email', 'disposableemailaddresses', 'emailondeck', 'deadaddress',
        'spamgourmet', 'incognitomail', 'anonymbox', 'trashmail', 'yopmail',
        'maildrop', 'mailnesia', 'dispostable', 'fakemailgenerator', 'guerrillamail',
        'example', 'test', 'localhost', 'invalid', 'fake', 'dummy', 'sample'
    ];
    for (let suspicious of suspiciousDomains) {
        if (domain.includes(suspicious)) return false;
    }
    const validTlds = [
        'com', 'org', 'net', 'edu', 'gov', 'mil', 'int', 'info', 'biz', 'name', 'pro',
        'eu', 'uk', 'de', 'fr', 'es', 'it', 'pt', 'nl', 'be', 'at', 'ch', 'se', 'no', 'dk', 'fi',
        'br', 'ca', 'au', 'jp', 'cn', 'ru', 'in', 'mx', 'ar', 'cl', 'co', 'pe', 'us',
        'aero', 'coop', 'museum', 'travel', 'jobs', 'mobi', 'tel', 'asia', 'cat', 'post',
        'academy', 'agency', 'business', 'center', 'city', 'company', 'email', 'global', 
        'group', 'international', 'management', 'network', 'online', 'site', 'tech', 
        'website', 'world', 'app', 'cloud', 'dev', 'digital', 'host', 'live', 'store',
        'ac', 'school', 'university'
    ];
    if (!validTlds.includes(tld)) return false;
    if (/\d{11,}/.test(localPart)) return false;
    if (/[._-]{4,}/.test(localPart)) return false;
    const spamPatterns = [
        /^(noreply|no-reply)$/i,
        /^.*(spam|trash|junk|delete).*$/i,
        /^.*\d{15,}.*$/,
        /^[._-]+$/,
        /^.{1,2}$/
    ];
    for (let pattern of spamPatterns) {
        if (pattern.test(localPart)) return false;
    }
    return true;
}

function showFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    field.classList.remove('success');
    field.classList.add('error');
}

function showFieldSuccess(fieldId) {
    const field = document.getElementById(fieldId);
    field.classList.remove('error');
    field.classList.add('success');
}

function clearFieldStatus(fieldId) {
    const field = document.getElementById(fieldId);
    field.classList.remove('error', 'success');
}

// Real-time validation
document.getElementById('name').addEventListener('input', function() {
    if (this.value.length > 0) {
        if (validateName(this.value)) {
            showFieldSuccess('name');
            this.setCustomValidity('');
        } else {
            showFieldError('name');
            this.setCustomValidity('Preencha o seu nome corretamente');
        }
    } else {
        clearFieldStatus('name');
        this.setCustomValidity('');
    }
});

document.getElementById('email').addEventListener('input', function() {
    if (this.value.length > 0) {
        if (validateEmail(this.value)) {
            showFieldSuccess('email');
        } else {
            showFieldError('email');
        }
    } else {
        clearFieldStatus('email');
    }
});

// Form submission
const form = document.querySelector('.contact-form');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    // Honeypot: se preenchido, não envia (provável bot)
    const hpField = document.getElementById('hp');
    if (hpField && hpField.value && hpField.value.trim() !== '') {
        // Opcionalmente podemos simular sucesso silencioso para não dar feedback a bots
        return;
    }
    // Decoy extra: "website"
    const websiteField = document.getElementById('website');
    if (websiteField && websiteField.value && websiteField.value.trim() !== '') {
        return;
    }
    // Armadilha de tempo: requer pelo menos ~3.5s desde o carregamento
    const tsField = document.getElementById('ts');
    const now = Date.now();
    const pageTs = parseInt(tsField && tsField.value ? tsField.value : (window.__pageLoadTs || 0), 10) || 0;
    const elapsed = now - pageTs;
    const MIN_ELAPSED_MS = 3500; // 3.5 segundos
    if (pageTs > 0 && elapsed < MIN_ELAPSED_MS) {
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-hourglass-half"></i> Aguarde alguns segundos...';
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
            }, 1500);
        }
        return;
    }
    const nameField = document.getElementById('name');
    const emailField = document.getElementById('email');
    const subjectField = document.getElementById('subject');
    const messageField = document.getElementById('message');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    const isNameValid = validateName(nameField.value);
    const isEmailValid = validateEmail(emailField.value);
    const isSubjectValid = subjectField.value.length > 0;
    const isMessageValid = messageField.value.trim().length > 0;
    // Heurísticas de conteúdo (anti-spam)
    const contentCheck = validateMessageContent(messageField.value);
    if (isNameValid) { showFieldSuccess('name'); } else { showFieldError('name'); }
    if (isEmailValid) { showFieldSuccess('email'); } else { showFieldError('email'); }
    if (!isMessageValid || !contentCheck.valid) {
        showFieldError('message');
        // Fornece feedback ao utilizador
        messageField.setCustomValidity(contentCheck.reason || 'Mensagem inválida.');
        messageField.reportValidity();
        setTimeout(() => messageField.setCustomValidity(''), 2000);
    } else {
        showFieldSuccess('message');
    }
    if (!isNameValid || !isEmailValid || !isSubjectValid || !isMessageValid || !contentCheck.valid) {
        return;
    }
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    submitBtn.disabled = true;
    const formData = new FormData(form);
    fetch(form.action, {
        method: 'POST',
        body: formData
    })
    .then(response => {
        setTimeout(() => {
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Enviado!';
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                form.reset();
                clearFieldStatus('name');
                clearFieldStatus('email');
            }, 2000);
        }, 1000);
    })
    .catch(error => {
        setTimeout(() => {
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Enviado!';
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                form.reset();
                clearFieldStatus('name');
                clearFieldStatus('email');
            }, 2000);
        }, 1000);
    });
});

// Inicializa timestamp para armadilha de tempo
document.addEventListener('DOMContentLoaded', () => {
    window.__pageLoadTs = Date.now();
    const tsField = document.getElementById('ts');
    if (tsField) {
        // Pequena aleatorização para evitar assinaturas fixas
        tsField.value = String(window.__pageLoadTs - Math.floor(Math.random() * 200));
    }
});

// Heurísticas de conteúdo da mensagem
function validateMessageContent(raw) {
    const msg = String(raw || '');
    const trimmed = msg.trim();
    if (trimmed.length < 15) {
        return { valid: false, reason: 'Mensagem demasiado curta.' };
    }
    // >2 links
    const urlRegex = /(https?:\/\/|www\.)\S+/gi;
    const links = trimmed.match(urlRegex) || [];
    if (links.length > 2) {
        return { valid: false, reason: 'Mensagem contém demasiados links.' };
    }
    // Excesso de maiúsculas + pontuação agressiva
    const letters = trimmed.replace(/[^a-zA-ZÀ-ÿ]/g, '');
    const uppers = letters.replace(/[^A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ]/g, '');
    if (letters.length >= 20) {
        const ratio = uppers.length / letters.length;
        const manyExcl = /!{3,}/.test(trimmed);
        if (ratio > 0.7 && manyExcl) {
            return { valid: false, reason: 'Mensagem parece muito “gritada” (maiúsculas e !!!).' };
        }
    }
    // Frases típicas simples (pt)
    const spamPhrases = [
        'ganhe dinheiro', 'oferta exclusiva', 'clique aqui', 'promoção imperdível',
        'bónus gratuito', 'prêmio garantido', 'garantia total', 'oportunidade única',
        'renda extra', 'lucro diário'
    ];
    const lower = trimmed.toLowerCase();
    if (spamPhrases.some(p => lower.includes(p))) {
        return { valid: false, reason: 'Mensagem contém termos típicos de spam.' };
    }
    // Repetição excessiva de palavras
    const words = lower.split(/\s+/).filter(Boolean);
    if (words.length > 10) {
        const counts = Object.create(null);
        for (const w of words) counts[w] = (counts[w] || 0) + 1;
        const maxRepeat = Math.max(...Object.values(counts));
        if (maxRepeat > Math.ceil(words.length * 0.6)) {
            return { valid: false, reason: 'Mensagem demasiado repetitiva.' };
        }
    }
    return { valid: true };
}

// Mobile menu toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

mobileMenuBtn.addEventListener('click', () => {
    if (navMenu.classList.contains('show')) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
});

function openMobileMenu() {
    navMenu.style.display = 'flex';
    navMenu.offsetHeight;
    navMenu.classList.add('show');
    navMenu.classList.remove('hide');
    if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', 'true');
    const icon = mobileMenuBtn.querySelector('i');
    icon.classList.remove('fa-bars');
    icon.classList.add('fa-times');
}

function closeMobileMenu() {
    navMenu.classList.add('hide');
    navMenu.classList.remove('show');
    if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', 'false');
    const icon = mobileMenuBtn.querySelector('i');
    icon.classList.remove('fa-times');
    icon.classList.add('fa-bars');
    setTimeout(() => {
        if (navMenu.classList.contains('hide')) {
            navMenu.style.display = 'none';
            navMenu.classList.remove('hide');
        }
    }, 400);
}

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        closeMobileMenu();
    });
});

document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
        if (navMenu.classList.contains('show')) {
            closeMobileMenu();
        }
    }
});

window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        if (navMenu.classList.contains('show')) {
            navMenu.classList.remove('show');
            navMenu.style.display = 'none';
            const icon = mobileMenuBtn.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    }
});

// Typing animation for hero subtitle
const subtitle = document.querySelector('.hero-subtitle');
const text = 'Estudante em Cibersegurança';
let i = 0;

function typeWriter() {
    if (i < text.length) {
        subtitle.textContent = text.slice(0, i + 1);
        i++;
        setTimeout(typeWriter, 100);
    }
}

window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    setTimeout(() => {
        typeWriter();
    }, 2000);
});

// Copy to clipboard functionality
function copyToClipboard(text, message) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            showCopyNotification(message);
        }).catch(() => {
            fallbackCopyTextToClipboard(text, message);
        });
    } else {
        fallbackCopyTextToClipboard(text, message);
    }
}

function fallbackCopyTextToClipboard(text, message) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        document.execCommand('copy');
        showCopyNotification(message);
    } catch (err) {
        console.error('Erro ao copiar texto: ', err);
        showCopyNotification('Erro ao copiar!');
    }
    document.body.removeChild(textArea);
}

function showCopyNotification(message) {
    const existingNotification = document.querySelector('.copy-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    const notification = document.createElement('div');
    notification.className = 'copy-notification';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        ${message}
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification && notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    const copyElements = document.querySelectorAll('.copy-text');
    copyElements.forEach(element => {
        element.addEventListener('click', (e) => {
            e.preventDefault();
            const textToCopy = element.getAttribute('data-copy');
            let message = '';
            // Caso especial: informação telefónica sob pedido -> só mostra aviso, não copia nada
            if (textToCopy === 'phone-info') {
                showCopyNotification('Para mais informações, entre em contacto por email / Linkdin');
                return;
            }
            if (textToCopy === 'sam.oliveira.dev@gmail.com') {
                message = 'Email copiado!';
            } else {
                message = 'Copiado!';
            }
            copyToClipboard(textToCopy, message);
        });
    });

    // Tornar ícones da secção Contacto clicáveis (sem alterar HTML)
    (function initClickableContactIcons(){
        const items = document.querySelectorAll('#contact .contact-item');
        if(!items.length) return;
        const openNew = (url) => window.open(url, '_blank', 'noopener');
        const activate = (el, handler, label) => {
            if(!el) return;
            el.style.cursor = 'pointer';
            el.setAttribute('role', 'link');
            if(label) el.setAttribute('aria-label', label);
            el.setAttribute('tabindex', '0');
            el.addEventListener('click', handler);
            el.addEventListener('keydown', (ev)=>{
                const k = ev.key || ev.code;
                if(k === 'Enter' || k === ' ' || k === 'Spacebar'){
                    ev.preventDefault();
                    handler();
                }
            });
        };

        items.forEach(item => {
            const iconBox = item.querySelector('.contact-icon');
            if(!iconBox) return;
            const has = (sel) => !!iconBox.querySelector(sel);
            if (has('.fa-envelope')) {
                const email = 'sam.oliveira.dev@gmail.com';
                activate(iconBox, ()=>{ window.location.href = `mailto:${email}`; }, 'Enviar email para Samuel');
            } else if (has('.fa-phone')) {
                activate(iconBox, ()=>{ showCopyNotification('Para mais informações, entre em contacto por email / Linkdin'); }, 'Informação telefónica sob pedido');
            } else if (has('.fa-linkedin')) {
                const link = item.querySelector('a[href*="linkedin.com"]');
                const href = link ? link.href : 'https://www.linkedin.com/in/jose-samuel-oliveira/';
                activate(iconBox, ()=> openNew(href), 'Abrir LinkedIn em nova aba');
            } else if (has('.fa-github')) {
                const link = item.querySelector('a[href*="github.com"]');
                const href = link ? link.href : 'https://github.com/Sam-Ciber-Dev';
                activate(iconBox, ()=> openNew(href), 'Abrir GitHub em nova aba');
            }
        });
    })();

    // CV modal: open/close, focus trap, accessibility
    (function initCvModal(){
        const openBtn = document.getElementById('cv-modal-open');
        const modal = document.getElementById('cv-modal');
        if(!openBtn || !modal) return;
        const dialog = modal.querySelector('.cv-modal__dialog');
        const closeElements = modal.querySelectorAll('[data-cv-close]');
        const focusableSelectors = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
        let lastFocused = null;

        function trapFocus(e) {
            const focusable = Array.from(dialog.querySelectorAll(focusableSelectors));
            if (!focusable.length) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.key === 'Tab') {
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        }

        function openModal(){
            lastFocused = document.activeElement;
            modal.setAttribute('aria-hidden','false');
            openBtn.setAttribute('aria-expanded','true');
            document.body.style.overflow = 'hidden';
            document.addEventListener('keydown', onKeyDown);
            const focusable = dialog.querySelectorAll(focusableSelectors);
            if (focusable.length) focusable[0].focus();
        }

        function closeModal(){
            modal.setAttribute('aria-hidden','true');
            openBtn.setAttribute('aria-expanded','false');
            document.body.style.overflow = '';
            document.removeEventListener('keydown', onKeyDown);
            if (lastFocused) lastFocused.focus();
        }

        function onKeyDown(e){
            if (e.key === 'Escape') { closeModal(); return; }
            trapFocus(e);
        }

        openBtn.addEventListener('click', (e)=>{ e.preventDefault(); openModal(); });
        closeElements.forEach(el => el.addEventListener('click', (e)=>{ e.preventDefault(); closeModal(); }));
        modal.addEventListener('click', (e)=>{ if (e.target === modal.querySelector('.cv-modal__backdrop')) closeModal(); });
    })();
});

// Função para lidar com cliques nos certificados
function handleCertificationClick(certificationName) {
    event.preventDefault();
    const existingNotifications = document.querySelectorAll('.copy-notification');
    existingNotifications.forEach(notification => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification && notification.parentNode) {
                notification.remove();
            }
        }, 200);
    });
    setTimeout(() => {
        let message;
        if (certificationName === 'Certificado CTeSP Cibersegurança') {
            message = 'O Curso ainda não foi concluído';
        } else {
            message = `Certificado "${certificationName}" selecionado!`;
        }
        const notification = document.createElement('div');
        notification.className = 'copy-notification';
        notification.innerHTML = `
            <i class="fas fa-certificate"></i>
            ${message}
        `;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification && notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
        
    }, 250);
    console.log(`Certificado clicado: ${certificationName}`);
}

// Sistema de Paginação de Projetos
const projectsData = {
    programming: [],
    web: [
        {
            icon: 'fas fa-eye',
            title: 'EyeWeb',
            description: 'Plataforma web de segurança e acessibilidade que valida links, dados pessoais e a força de palavras‑passe. Integra base de dados MySQL e interface responsiva em Bootstrap, com módulos de análise e geração de relatórios — em fase de desenvolvimento.',
            technologies: ['HTML5', 'CSS3', 'Bootstrap', 'JavaScript', 'PHP', 'MySQL', 'WAMP'],
            links: [
                { icon: 'fab fa-github', text: 'GitHub', href: '#' },
                { icon: 'fas fa-file-pdf', text: 'Relatório do Projeto', href: '#' }
            ]
        }
    ],
    cybersecurity: [],
    networking: [
    ],
    hardware: [
    ]
};

// Estado da paginação
const paginationState = {
    programming: { currentPage: 0 },
    web: { currentPage: 0 },
    cybersecurity: { currentPage: 0 },
    networking: { currentPage: 0 },
    hardware: { currentPage: 0 }
};

const PROJECTS_PER_PAGE = 3;

function getProjectsPerPage() {
    const width = window.innerWidth;
    if (width <= 480) return 1;
    if (width <= 1024) return 2;
    return 3;
}

function createEmptyCard() {
    return `
        <div class="project-card empty">
            <div class="project-image">
                <i class="fas fa-image"></i>
            </div>
            <div class="project-content">
                <h3 class="project-title">Sem conteúdo disponível</h3>
                <p class="project-description">Este espaço está reservado para futuros projetos que serão adicionados futuramente, para demonstrar competências e conhecimentos adquiridos.</p>
                <div class="project-tech">
                    <span class="tech-tag">Em breve</span>
                </div>
                <div class="project-links">
                    <span class="project-link disabled">
                        <i class="fas fa-clock"></i>
                        Aguarde
                    </span>
                </div>
            </div>
        </div>
    `;
}

function createProjectCard(project) {
    const technologies = project.technologies.map(tech => 
        `<span class="tech-tag">${tech}</span>`
    ).join('');
    
    const links = project.links.map(link => 
        `<a href="${link.href}" class="project-link">
            <i class="${link.icon}"></i>
            ${link.text}
        </a>`
    ).join('');

    return `
        <div class="project-card">
            <div class="project-image">
                <i class="${project.icon}"></i>
            </div>
            <div class="project-content">
                <h3 class="project-title">${project.title}</h3>
                <p class="project-description">${project.description}</p>
                <div class="project-tech">${technologies}</div>
                <div class="project-links">${links}</div>
            </div>
        </div>
    `;
}

function renderProjectsPage(category, direction = 'none') {
    console.log(`Renderizando projetos para categoria: ${category} com direção: ${direction}`);
    const container = document.getElementById(`${category}-projects-container`);
    if (!container) {
        console.error(`Container não encontrado para categoria: ${category}`);
        return;
    }
    const projects = projectsData[category];
    const currentPage = paginationState[category].currentPage;
    const projectsPerPage = getProjectsPerPage();
    const startIndex = currentPage * projectsPerPage;
    const endIndex = startIndex + projectsPerPage;
    
    function applyNewContent() {
        const currentProjects = projects.slice(startIndex, endIndex);
        let cardsHTML = '';
        currentProjects.forEach(project => {
            cardsHTML += createProjectCard(project);
        });
        const emptyCardsNeeded = projectsPerPage - currentProjects.length;
        for (let i = 0; i < emptyCardsNeeded; i++) {
            cardsHTML += createEmptyCard();
        }
        container.innerHTML = cardsHTML;
        if (direction === 'next') {
            container.classList.add('slide-in-right');
        } else if (direction === 'prev') {
            container.classList.add('slide-in-left');
        }
        setTimeout(() => {
            container.classList.remove('slide-in-left', 'slide-in-right', 'slide-out-left', 'slide-out-right');
        }, 400);
    }
    
    if (direction !== 'none') {
        if (direction === 'next') {
            container.classList.add('slide-out-left');
        } else if (direction === 'prev') {
            container.classList.add('slide-out-right');
        }
        setTimeout(() => {
            applyNewContent();
        }, 200);
    } else {
        applyNewContent();
    }
    
    setTimeout(() => {
        const totalPages = Math.ceil(projects.length / projectsPerPage) || 1;
        const prevButton = document.getElementById(`${category}-prev-btn`);
        const nextButton = document.getElementById(`${category}-next-btn`);
        prevButton.disabled = (currentPage === 0);
        nextButton.disabled = (currentPage + 1 >= totalPages);
    }, direction !== 'none' ? 300 : 0);
}

function nextPage(category) {
    const projects = projectsData[category];
    const projectsPerPage = getProjectsPerPage();
    const totalPages = Math.ceil(projects.length / projectsPerPage);
    const currentPage = paginationState[category].currentPage;
    
    if (currentPage + 1 < totalPages) {
        const prevButton = document.getElementById(`${category}-prev-btn`);
        const nextButton = document.getElementById(`${category}-next-btn`);
        prevButton.classList.add('loading');
        nextButton.classList.add('loading');
        prevButton.disabled = true;
        nextButton.disabled = true;
        
        paginationState[category].currentPage++;
        renderProjectsPage(category, 'next');
        
        setTimeout(() => {
            prevButton.classList.remove('loading');
            nextButton.classList.remove('loading');
            const totalPages = Math.ceil(projects.length / projectsPerPage) || 1;
            const currentPage = paginationState[category].currentPage;
            prevButton.disabled = (currentPage === 0);
            nextButton.disabled = (currentPage + 1 >= totalPages);
        }, 500);
    }
}

function prevPage(category) {
    const currentPage = paginationState[category].currentPage;
    
    if (currentPage > 0) {
        const prevButton = document.getElementById(`${category}-prev-btn`);
        const nextButton = document.getElementById(`${category}-next-btn`);
        prevButton.classList.add('loading');
        nextButton.classList.add('loading');
        prevButton.disabled = true;
        nextButton.disabled = true;
        
        paginationState[category].currentPage--;
        renderProjectsPage(category, 'prev');
        
        setTimeout(() => {
            prevButton.classList.remove('loading');
            nextButton.classList.remove('loading');
            const projects = projectsData[category];
            const projectsPerPage = getProjectsPerPage();
            const totalPages = Math.ceil(projects.length / projectsPerPage) || 1;
            const currentPage = paginationState[category].currentPage;
            prevButton.disabled = (currentPage === 0);
            nextButton.disabled = (currentPage + 1 >= totalPages);
        }, 500);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Inicializando projetos...');
    renderProjectsPage('cybersecurity');
    renderProjectsPage('networking');
    renderProjectsPage('programming');
    renderProjectsPage('web');
    renderProjectsPage('hardware');
    console.log('Projetos inicializados!');

    // ======================
    // Shift+S / Shift+A: Navegação principal (Início, Sobre, Experiência, Competências, Projetos, Contacto)
    // ======================
    (function initPrimarySectionNavigator(){
        const SECTION_IDS = ['home','about','experience','skills','projects','contact'];
        const sections = SECTION_IDS.map(id => document.getElementById(id)).filter(Boolean);
        let currentIndex = -1;
        
        function scrollToSection(el){
            if (!el) return;
            el.scrollIntoView({ behavior:'smooth', block:'start' });
            if (el.id === 'about') scheduleSeamFix(el);
        }

        function getCurrentSectionIndex(){
            const headerH = getHeaderHeight();
            const pos = window.scrollY + headerH + 2;
            let bestIdx = 0;
            let bestDist = Infinity;
            sections.forEach((sec, idx) => {
                const top = sec ? sec.offsetTop : 0;
                const d = pos >= top ? (pos - top) : Infinity;
                if (d < bestDist) { bestDist = d; bestIdx = idx; }
            });
            return bestIdx;
        }

        function isInteractive(el){
            if(!el) return false;
            const tag = el.tagName;
            return ['INPUT','TEXTAREA','SELECT','BUTTON'].includes(tag) || el.isContentEditable;
        }

        function goNext(){
            if(!sections.length) return;
            currentIndex = getCurrentSectionIndex();
            currentIndex = (currentIndex + 1) % sections.length;
            const target = sections[currentIndex];
            scrollToSection(target);
        }

        function goPrev(){
            if(!sections.length) return;
            currentIndex = getCurrentSectionIndex();
            currentIndex = (currentIndex - 1 + sections.length) % sections.length;
            const target = sections[currentIndex];
            scrollToSection(target);
        }

        document.addEventListener('keydown', (e)=>{
            // Usa Shift+S para avançar e Shift+A para recuar
            if(!e.shiftKey) return;
            const active = document.activeElement;
            if(isInteractive(active)) return; // não interrompe escrita em inputs
            const key = (e.key || '').toLowerCase();
            if(key === 's') {
                e.preventDefault();
                goNext();
            } else if(key === 'a') {
                e.preventDefault();
                goPrev();
            }
        });

        // Integração opcional com navbar
        document.querySelectorAll('.nav-link').forEach(link => {
            const href = link.getAttribute('href');
            if(!href || !href.startsWith('#')) return;
            const id = href.slice(1);
            if(!SECTION_IDS.includes(id)) return; // ignora se não for principal
            link.addEventListener('click', (e)=>{
                e.preventDefault();
                const target = document.getElementById(id);
                if(target){
                    // Ajusta índice para refletir a section atual; Shift+S vai para a seguinte e Shift+A para a anterior
                    const idx = SECTION_IDS.indexOf(id);
                    currentIndex = idx;
                    scrollToSection(target);
                }
            });
        });
    })();
});

let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        Object.keys(paginationState).forEach(category => {
            paginationState[category].currentPage = 0;
            renderProjectsPage(category);
        });
    }, 250);
});
