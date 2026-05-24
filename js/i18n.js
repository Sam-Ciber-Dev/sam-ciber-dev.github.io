// ============================================================
// Internationalization (i18n) Module
// ============================================================
// Manages PT/EN language toggle for the entire portfolio site.
// Stores preference in localStorage. Applies translations to
// all elements with [data-i18n] attributes and updates dynamic
// project content via a custom event.
// ============================================================

import { qs, qsa, on } from './dom-utils.js';

const STORAGE_KEY = 'portfolio-lang';
const SUPPORTED_LANGS = ['pt', 'en'];
const DEFAULT_LANG = 'en';

// Current language state
let currentLang = DEFAULT_LANG;

// ======================== Translations ========================
// Static translations for UI text. Dynamic content (projects)
// is handled via the JSON data which has { pt, en } fields.
const translations = {
  // Navigation
  'nav.home':        { pt: 'Início',       en: 'Home' },
  'nav.about':       { pt: 'Sobre',        en: 'About' },
  'nav.experience':  { pt: 'Experiência',  en: 'Experience' },
  'nav.skills':      { pt: 'Competências', en: 'Skills' },
  'nav.certifications': { pt: 'Certificações', en: 'Certifications' },
  'nav.projects':    { pt: 'Projetos',     en: 'Projects' },
  'nav.contact':     { pt: 'Contacto',     en: 'Contact' },

  // Hero
  'hero.subtitle':      { pt: 'Estudante em Cibersegurança', en: 'Cybersecurity Student' },
  'hero.description':   {
    pt: 'Estudante dedicado ao estudo de cibersegurança, de sistemas e dados, com foco em CTI, pentesting, análise de vulnerabilidades, segurança digital, proteção de dados e ethical hacking, aplicando práticas de Red e Blue Team.',
    en: 'Dedicated student of cybersecurity, systems and data, focused on CTI, pentesting, vulnerability analysis, digital security, data protection and ethical hacking, applying Red and Blue Team practices.'
  },
  'hero.contact':    { pt: 'Contactar',    en: 'Contact' },
  'hero.cv':         { pt: 'Download CV',  en: 'Download CV' },

  // CV Modal
  'cv.title':        { pt: 'Escolher versão do CV', en: 'Choose CV version' },
  'cv.pt':           { pt: 'Português', en: 'Portuguese' },
  'cv.en':           { pt: 'Inglês', en: 'English' },

  // About
  'about.title':     { pt: 'Sobre Mim',    en: 'About Me' },
  'about.p1': {
    pt: 'Eu sempre tive uma paixão enorme pela informática. Desde muito jovem sempre tive aquela curiosidade de perceber como as coisas funcionavam por trás dos ecrãs, e isso ao longo do tempo levou-me a explorar diversas áreas da informática, programação, gestão, redes, entre outras.',
    en: 'I have always had an enormous passion for technology. From a very young age I was curious to understand how things worked behind the screens, and over time that led me to explore various areas of IT, programming, management, networking, among others.'
  },
  'about.p2': {
    pt: 'Mas foi na área de cibersegurança que eu realmente encontrei o meu lugar. Eu sempre fui uma pessoa que gosta de ajudar as outras pessoas, e isso é o que mais me motiva a continuar a aprender nesta área. Proteger dados, prevenir ataques e garantir que toda a gente está seguro no mundo digital.',
    en: 'But it was in cybersecurity that I truly found my place. I have always been someone who likes to help others, and that is what motivates me most to keep learning in this field. Protecting data, preventing attacks and ensuring everyone is safe in the digital world.'
  },
  'about.p3': {
    pt: 'Atualmente, estudo mais profundamente cibersegurança, com interesse especial em CTI, análise de vulnerabilidades e pentesting. Faço questão de me manter atualizado em todas as áreas e estou comprometido em aprender continuamente. Espero, um dia, trabalhar como profissional de cibersegurança e continuar a crescer, tanto a nível técnico como pessoal.',
    en: 'Currently, I study cybersecurity in more depth, with special interest in CTI, vulnerability analysis and pentesting. I make a point of staying up to date in all areas and am committed to continuous learning. I hope to one day work as a cybersecurity professional and continue to grow, both technically and personally.'
  },

  // Experience
  'exp.title':       { pt: 'Experiência Profissional', en: 'Professional Experience' },
  'exp.0.date':    { pt: 'Mar 2026 - Atividade atual', en: 'Mar 2026 - Present' },
  'exp.0.title':   { pt: 'Estágio em CTI e Pentest', en: 'CTI & Pentest Internship' },
  'exp.0.company': { pt: 'FIN-PRISMA, Papiro, Lda. (Grupo EAD)', en: 'FIN-PRISMA, Papiro, Lda. (EAD Group)' },
  'exp.0.desc': {
    pt: 'Estágio curricular com foco em segurança ofensiva e auditoria de aplicações web na FIN-PRISMA, Lda. Realização de auditorias de segurança em ambientes reais de produção e desenvolvimento, seguindo as metodologias OWASP WSTG e PTES, com identificação e documentação de múltiplas vulnerabilidades classificadas por severidade CVSS e mapeadas para o OWASP Top 10. Desenvolvimento de duas ferramentas independentes: Ph0enix, um framework modular de pentesting automatizado com mais de 30 módulos de teste, e NexusGuard Scanner, uma ferramenta de deteção de pacotes NPM e NuGet potencialmente comprometidos. Todas as atividades foram realizadas com autorização e seguindo princípios de responsible disclosure. O estágio será realizado no âmbito do CTeSP de Cibersegurança no ISTEC Porto.',
    en: 'Curricular internship focused on offensive security and web application auditing at FIN-PRISMA, Lda. (EAD Group). Conducted security audits on real production and development environments following OWASP WSTG and PTES methodologies, identifying and documenting multiple vulnerabilities classified by CVSS severity and mapped to OWASP Top 10. Developed two independent tools: Ph0enix, a modular automated pentesting framework with over 30 test modules, and NexusGuard Scanner, a tool for detecting potentially compromised NPM and NuGet packages. All activities were performed with authorization and following responsible disclosure principles. The internship will be completed as part of the CTeSP in Cybersecurity at ISTEC Porto.'
},
  'exp.1.date':      { pt: '2024 (3 meses)', en: '2024 (3 months)' },
  'exp.1.title':     { pt: 'Estágio em desenvolvimento de software e base de dados', en: 'Software Development & Database Internship' },
  'exp.1.company': { pt: 'Mindforge Tech Solutions, Lda', en: 'Mindforge Tech Solutions, Lda' },
  'exp.1.desc': {
    pt: 'Desenvolvimento de uma plataforma web para gestão hospitalar, focando na criação e estruturação de bases de dados para armazenamento de informação clínica. Esta experiência proporcionou uma compreensão valiosa sobre a sensibilidade dos dados de saúde e a importância da sua proteção, despertando o interesse pelas questões de privacidade e segurança de dados. O contacto com sistemas que lidam com informação crítica reforçou a necessidade de implementar medidas de proteção adequadas, conhecimento fundamental para a área de cibersegurança. Estágio realizado no âmbito da formação na Escola Profissional de Valongo.',
    en: 'Development of a web platform for hospital management, focusing on creating and structuring databases for clinical information storage. This experience provided valuable understanding of health data sensitivity and the importance of its protection, sparking interest in data privacy and security. Working with systems handling critical information reinforced the need to implement adequate protection measures — fundamental knowledge for the cybersecurity field. Internship completed as part of training at Escola Profissional de Valongo.'
  },
  'exp.2.date':      { pt: '2023 (1 mês)', en: '2023 (1 month)' },
  'exp.2.title':     { pt: 'Estágio em desenvolvimento de software', en: 'Software Development Internship' },
  'exp.2.company': { pt: 'Mobnor', en: 'Mobnor' },
  'exp.2.desc': {
    pt: 'Primeiro contacto com o ambiente profissional de desenvolvimento web, responsável pela criação de um website corporativo para a empresa. Durante este estágio, implementei medidas básicas de segurança web, incluindo validação de inputs, proteção CSRF, e otimização SEO (Search Engine Optimization). Esta experiência inicial despertou o meu interesse pela importância da segurança no desenvolvimento web e estabeleceu as bases para o meu percurso na área de cibersegurança. Estágio realizado no âmbito da formação na Escola Profissional de Valongo.',
    en: 'First contact with a professional web development environment, responsible for creating a corporate website. During this internship, I implemented basic web security measures, including input validation, CSRF protection, and SEO optimization. This initial experience sparked my interest in the importance of security in web development and established the foundations for my path in cybersecurity. Internship completed as part of training at Escola Profissional de Valongo.'
  },

  // Education
  'edu.title':       { pt: 'Formação Acadêmica', en: 'Education' },
  'edu.1.date':      { pt: '2024 - 2026', en: '2024 - 2026' },
  'edu.1.title':     { pt: 'CTeSP de Cibersegurança', en: 'CTeSP in Cybersecurity' },
  'edu.1.company':   { pt: 'Instituto Superior de Tecnologias Avançadas do Porto', en: 'Instituto Superior de Tecnologias Avançadas do Porto' },
  'edu.1.desc': {
    pt: 'Curso Técnico Superior Profissional especializado em cibersegurança, abordando os fundamentos teóricos e práticos da proteção de sistemas informáticos. O programa inclui módulos de segurança de redes, análise de vulnerabilidades, gestão de incidentes de segurança, criptografia aplicada e conformidade com regulamentações. Esta formação está a proporcionar competências específicas e atualizadas para enfrentar os desafios modernos da cibersegurança empresarial.',
    en: 'Professional Higher Technical Course specialized in cybersecurity, covering theoretical and practical fundamentals of computer systems protection. The program includes modules on network security, vulnerability analysis, security incident management, applied cryptography and compliance with regulations. This training is providing specific, up-to-date skills to face modern enterprise cybersecurity challenges.'
  },
  'edu.2.date':      { pt: '2021 - 2024', en: '2021 - 2024' },
  'edu.2.title':     { pt: 'Curso Profissional de Técnico de Gestão e Programação de Sistemas Informáticos', en: 'Professional Course in IT Systems Management & Programming' },
  'edu.2.company':   { pt: 'Escola Profissional de Valongo', en: 'Escola Profissional de Valongo' },
  'edu.2.desc': {
    pt: 'Formação técnica profissional focada na programação e gestão de sistemas informáticos. Este curso foi fundamental para estabelecer uma base sólida em desenvolvimento de software, administração de sistemas e gestão de infraestruturas tecnológicas. O conhecimento adquirido sobre arquiteturas de sistemas, redes e programação revelou-se essencial para compreender as vulnerabilidades e vetores de ataque que são explorados em cibersegurança, proporcionando uma perspetiva técnica valiosa sobre como os sistemas podem ser protegidos desde a sua conceção.',
    en: 'Professional technical training focused on programming and IT systems management. This course was fundamental in establishing a solid foundation in software development, systems administration and technological infrastructure management. The knowledge acquired about system architectures, networks and programming proved essential for understanding the vulnerabilities and attack vectors exploited in cybersecurity, providing a valuable technical perspective on how systems can be protected from their conception.'
  },

  // Academic Projects
  'acad.title':      { pt: 'Projetos Académicos', en: 'Academic Projects' },
  'acad.1.date':     { pt: '2025', en: '2025' },
  'acad.1.title':    { pt: 'Participação na Joteca', en: 'Joteca Participation' },
  'acad.1.company':  { pt: 'Instituto Superior de Tecnologias Avançadas do Porto', en: 'Instituto Superior de Tecnologias Avançadas do Porto' },
  'acad.1.desc': {
    pt: 'A Joteca foi uma organização académica do ISTEC no Porto, onde apresentei o projeto EyeWeb para representantes de empresas e outras instituições de ensino superior. Esta experiência desenvolveu competências de comunicação, trabalho em equipa, e exposição técnica em ambiente profissional, além de fortalecer o interesse por acessibilidade digital e segurança na web.',
    en: 'Joteca was an academic organization at ISTEC Porto, where I presented the EyeWeb project to representatives of companies and other higher education institutions. This experience developed communication skills, teamwork, and technical presentation in a professional environment, while strengthening interest in digital accessibility and web security.'
  },

  // Skills section
  'skills.title':    { pt: 'Competências Técnicas', en: 'Technical Skills' },
  'skills.areas':    { pt: 'Áreas de Atuação', en: 'Focus Areas' },
  'skills.langs':    { pt: 'Linguagens de Programação e Scripting', en: 'Programming & Scripting Languages' },
  'skills.db':       { pt: 'Banco de Dados', en: 'Databases' },
  'skills.dataformats': { pt: 'Linguagens e Formatos de Dados', en: 'Data Languages & Formats' },
  'skills.pentest':  { pt: 'Ferramentas de Pentest', en: 'Pentest Tools' },
  'skills.forensics':{ pt: 'Ferramentas Forense', en: 'Forensics Tools' },
  'skills.os':       { pt: 'Sistemas Operativos', en: 'Operating Systems' },
  'skills.env':      { pt: 'Ambientes de Desenvolvimento e Testes', en: 'Development & Testing Environments' },
  'skills.tools':    { pt: 'Ferramentas de Produtividade', en: 'Productivity Tools' },

  // Certifications
  'certs.title':     { pt: 'Certificações e Qualificações', en: 'Certifications & Qualifications' },
  'certs.academic':  { pt: 'Certificações Académicas', en: 'Academic Certifications' },
  'certs.professional': { pt: 'Certificações Profissionais', en: 'Professional Certifications' },
  'certs.participation': { pt: 'Certificações de Participação', en: 'Participation Certifications' },
'certs.prof1.name':   { pt: 'Cyber Threat Intelligence 101', en: 'Cyber Threat Intelligence 101' },
'certs.prof1.status': { pt: 'arcX', en: 'arcX' },
'certs.prof2.name':   { pt: 'OSINT — Fundamentos (Nível 1)', en: 'OSINT — Foundations (Level 1)' },
'certs.prof2.status': { pt: 'F1NDX', en: 'F1NDX' },
'certs.prof3.name':   { pt: 'OSINT — Praticante (Nível 2)', en: 'OSINT — Practitioner (Level 2)' },
'certs.prof3.status': { pt: 'F1NDX', en: 'F1NDX' },
'certs.prof4.name':   { pt: 'OSINT — Especialista (Nível 3)', en: 'OSINT — Specialist (Level 3)' },
'certs.prof4.status': { pt: 'F1NDX', en: 'F1NDX' },
'certs.prof5.name':   { pt: 'Fundamentos de Privacidade Digital', en: 'Digital Privacy Fundamentals' },
'certs.prof5.status': { pt: 'F1NDX', en: 'F1NDX' },
  'certs.acad1.name': { pt: 'CTeSP de Cibersegurança', en: 'CTeSP in Cybersecurity' },
  'certs.acad1.status': { pt: 'Instituto Superior de Tecnologias Avançadas do Porto', en: 'Instituto Superior de Tecnologias Avançadas do Porto' },
  'certs.acad2.name': { pt: 'Curso Profissional de Técnico de Gestão e Programação de Sistemas Informáticos', en: 'Professional Course in IT Systems Management & Programming' },
  'certs.acad2.status': { pt: 'Escola Profissional de Valongo', en: 'Escola Profissional de Valongo' },
  'certs.part1.name': { pt: 'Participação na Joteca', en: 'Joteca Participation' },
  'certs.part1.status': { pt: 'Projeto EyeWeb - ISTEC Porto', en: 'EyeWeb Project - ISTEC Porto' },
  'certs.recognition': { pt: 'Certificações de Mérito', en: 'Merit Certifications' },
  'certs.recog1.name': { pt: 'Reconhecimento por Divulgação Responsável de Vulnerabilidades', en: 'Recognition for Responsible Vulnerability Disclosure' },
  'certs.recog1.status': { pt: 'Instituto Superior de Tecnologias Avançadas do Porto', en: 'Instituto Superior de Tecnologias Avançadas do Porto' },

  // Projects section
  'projects.title':       { pt: 'Projetos', en: 'Projects' },
  'projects.offensive':   { pt: 'Segurança Ofensiva', en: 'Offensive Security' },
  'projects.defensive':   { pt: 'Segurança Defensiva', en: 'Defensive Security' },
  'projects.reports':     { pt: 'Relatórios de Segurança', en: 'Security Reports' },
  'projects.ai':          { pt: 'Inteligência Artificial', en: 'Artificial Intelligence' },
  'projects.networking':  { pt: 'Projetos de Redes', en: 'Networking Projects' },
  'projects.software':    { pt: 'Desenvolvimento de Software', en: 'Software Development' },
  'projects.web':         { pt: 'Desenvolvimento Web', en: 'Web Development' },
  'projects.hardware':    { pt: 'Projetos de Hardware', en: 'Hardware Projects' },
  'projects.empty.title': { pt: 'Sem conteúdo disponível', en: 'No content available' },
  'projects.empty.desc':  { pt: 'Este espaço está reservado para futuros projetos que serão adicionados futuramente, para demonstrar competências e conhecimentos adquiridos.', en: 'This space is reserved for future projects that will be added to showcase acquired skills and knowledge.' },
  'projects.empty.tag':   { pt: 'Em breve', en: 'Coming soon' },
  'projects.empty.wait':  { pt: 'Aguarde', en: 'Stay tuned' },
  'projects.report':      { pt: 'Relatório do Projeto', en: 'Project Report' },

  // Contact
  'contact.title':   { pt: 'Contacto', en: 'Contact' },
  'contact.name':    { pt: 'Nome', en: 'Name' },
  'contact.email':   { pt: 'Seu Email', en: 'Your Email' },
  'contact.subject': { pt: 'Assunto', en: 'Subject' },
  'contact.message': { pt: 'Mensagem', en: 'Message' },
  'contact.send':    { pt: 'Enviar Mensagem', en: 'Send Message' },
  'contact.select':  { pt: 'Selecione um assunto', en: 'Select a subject' },
  'contact.opt1':    { pt: 'Interesse em Colaboração', en: 'Collaboration Interest' },
  'contact.opt2':    { pt: 'Oportunidade de Emprego', en: 'Job Opportunity' },
  'contact.opt3':    { pt: 'Realização de um projeto', en: 'Project Request' },
  'contact.opt4':    { pt: 'Consultoria em Segurança', en: 'Security Consulting' },
  'contact.opt5':    { pt: 'Parceria Empresarial', en: 'Business Partnership' },
  'contact.opt6':    { pt: 'Pergunta Técnica', en: 'Technical Question' },
  'contact.opt7':    { pt: 'Feedback sobre Portfólio', en: 'Portfolio Feedback' },
  'contact.opt8':    { pt: 'Outro Assunto', en: 'Other Subject' },
  'contact.phone':   { pt: 'Número de telemóvel', en: 'Phone number' },
  'contact.phone.title': { pt: 'Telefone', en: 'Phone' },

  // Popup messages
  'popup.phone':     { pt: 'Para mais informações, entre em contacto por email / Linkdin', en: 'For more information, please contact via email / LinkedIn' },
  'popup.ctespcourse': { pt: 'O Curso ainda não foi concluído', en: 'The course has not yet been completed' },

  // Footer
  'footer.rights':   { pt: 'Todos os direitos reservados.', en: 'All rights reserved.' },
};

// ======================== Core Functions ========================

export function getLang() {
  return currentLang;
}

export function setLang(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) return;
  currentLang = lang;
  localStorage.setItem(STORAGE_KEY, lang);
  document.documentElement.lang = lang === 'pt' ? 'pt-PT' : 'en';
  applyTranslations();
  // Dispatch event so other modules (projects) can react
  window.dispatchEvent(new CustomEvent('lang-change', { detail: { lang } }));
}

export function t(key) {
  const entry = translations[key];
  if (!entry) return key;
  return entry[currentLang] || entry[DEFAULT_LANG] || key;
}

/**
 * Resolve an i18n value from project data.
 * Accepts either { pt: "...", en: "..." } or a plain string.
 */
export function resolveI18n(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value[currentLang] || value[DEFAULT_LANG] || '';
}

function applyTranslations() {
  qsa('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const text = t(key);
    // For inputs/options, set textContent; for others, innerHTML (to support icons)
    if (el.tagName === 'OPTION') {
      el.textContent = text;
    } else if (el.hasAttribute('data-i18n-html')) {
      el.innerHTML = text;
    } else {
      // Preserve child elements (icons) — only update text nodes
      const icon = el.querySelector('i, svg');
      if (icon) {
        // Rebuild: icon + space + text
        el.textContent = '';
        el.appendChild(icon);
        el.appendChild(document.createTextNode(' ' + text));
      } else {
        el.textContent = text;
      }
    }
  });

  // Update placeholder attributes
  qsa('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.placeholder = t(key);
  });
}

// ======================== Init ========================

export function initI18n() {
  // Load saved preference or detect browser language
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && SUPPORTED_LANGS.includes(saved)) {
    currentLang = saved;
  } else {
    const browserLang = (navigator.language || '').slice(0, 2).toLowerCase();
    currentLang = browserLang === 'pt' ? 'pt' : 'en';
  }

  // Set initial lang attribute
  document.documentElement.lang = currentLang === 'pt' ? 'pt-PT' : 'en';

  // Bind language toggle button
  const toggleBtn = qs('#lang-toggle');
  if (toggleBtn) {
    // Show the OTHER language as the toggle label
    updateToggleButton(toggleBtn);
    on(toggleBtn, 'click', () => {
      // Block language switch during typing animation + cooldown
      try {
        const { isLangLocked } = window.__langLock || {};
        if (isLangLocked && isLangLocked()) return;
      } catch(_) {}
      setLang(currentLang === 'pt' ? 'en' : 'pt');
      updateToggleButton(toggleBtn);
    });
  }

  // Apply initial translations
  applyTranslations();
}

function updateToggleButton(btn) {
  // Show the label of the language you can switch TO
  const targetLang = currentLang === 'pt' ? 'en' : 'pt';
  const label = targetLang === 'en' ? 'EN' : 'PT';
  btn.textContent = label;
  btn.setAttribute('aria-label', targetLang === 'en' ? 'Switch to English' : 'Mudar para Português');
}
