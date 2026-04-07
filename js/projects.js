// Projects data, pagination, and rendering with i18n + image support + detail modal
import { projectsData, loadProjectsData } from './projects-data.js';
import { resolveI18n, getLang, t } from './i18n.js';
import { qs, on, qsa } from './dom-utils.js';
import { trapFocus } from './dom-utils.js';

export const paginationState = {
  offensive: { currentPage: 0 },
  defensive: { currentPage: 0 },
  reports: { currentPage: 0 },
  ai: { currentPage: 0 },
  networking: { currentPage: 0 },
  software: { currentPage: 0 },
  web: { currentPage: 0 },
  hardware: { currentPage: 0 }
};

export const PROJECTS_PER_PAGE = 3;

export function getProjectsPerPage() {
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
        <h3 class="project-title">${t('projects.empty.title')}</h3>
        <p class="project-description">${t('projects.empty.desc')}</p>
        <div class="project-tech">
          <span class="tech-tag">${t('projects.empty.tag')}</span>
        </div>
        <div class="project-links">
          <span class="project-link disabled">
            <i class="fas fa-clock"></i>
            ${t('projects.empty.wait')}
          </span>
        </div>
      </div>
    </div>`;
}

function createProjectCard(project) {
  const title = resolveI18n(project.title);
  const description = resolveI18n(project.description);
  const technologies = (project.technologies || []).map(tech => `<span class="tech-tag">${tech}</span>`).join('');
  const lang = getLang();

  // Image: use downloaded social preview, or fall back to icon
  let imageHTML;
  if (project.image) {
    imageHTML = `<div class="project-image project-image--photo"><img src="${project.image}" alt="${title}" loading="lazy"></div>`;
  } else {
    imageHTML = `<div class="project-image"><i class="${project.icon || 'fas fa-folder-open'}"></i></div>`;
  }

  // Links: new JSON format has { github, report: { pt, en } }
  let linksHTML = '';
  if (project.links) {
    if (typeof project.links === 'object' && project.links.github) {
      // New JSON format
      linksHTML += `<a href="${project.links.github}" target="_blank" rel="noopener noreferrer" class="project-link"><i class="fab fa-github"></i> GitHub</a>`;
      const reportUrl = project.links.report?.[lang] || project.links.report?.pt || project.links.report?.en;
      if (reportUrl) {
        linksHTML += `<a href="${reportUrl}" target="_blank" rel="noopener noreferrer" class="project-link"><i class="fas fa-file-pdf"></i> ${t('projects.report')}</a>`;
      }
    } else if (Array.isArray(project.links)) {
      // Legacy array format (backwards compatibility)
      linksHTML = project.links.map(link => `<a href="${link.href}" class="project-link" target="_blank" rel="noopener noreferrer"><i class="${link.icon}"></i> ${link.text}</a>`).join('');
    }
  }

  return `
    <div class="project-card" data-project-json="${encodeURIComponent(JSON.stringify(project))}">
      ${imageHTML}
      <div class="project-content">
        <h3 class="project-title" title="${title}">${title}</h3>
        <p class="project-description">${description}</p>
        <div class="project-tech">${technologies}</div>
        <div class="project-links">${linksHTML}</div>
      </div>
    </div>`;
}

export function renderProjectsPage(category, direction = 'none') {
  const container = document.getElementById(`${category}-projects-container`);
  if (!container) return;
  const projects = projectsData[category];
  const currentPage = paginationState[category].currentPage;
  const projectsPerPage = getProjectsPerPage();
  const startIndex = currentPage * projectsPerPage;
  const endIndex = startIndex + projectsPerPage;

  function applyNewContent() {
    const currentProjects = projects.slice(startIndex, endIndex);
    let cardsHTML = '';
    currentProjects.forEach(project => { cardsHTML += createProjectCard(project); });
    const emptyCardsNeeded = projectsPerPage - currentProjects.length;
    for (let i = 0; i < emptyCardsNeeded; i++) cardsHTML += createEmptyCard();
    container.innerHTML = cardsHTML;
    if (direction === 'next') container.classList.add('slide-in-right');
    else if (direction === 'prev') container.classList.add('slide-in-left');
    const onAnimEnd = () => {
      container.classList.remove('slide-in-left', 'slide-in-right', 'slide-out-left', 'slide-out-right');
      container.removeEventListener('animationend', onAnimEnd);
    };
    container.addEventListener('animationend', onAnimEnd);
    setTimeout(() => container.classList.remove('slide-in-left', 'slide-in-right', 'slide-out-left', 'slide-out-right'), 500);
    // Detect truncated titles after DOM insertion
    requestAnimationFrame(() => detectTruncatedTitles());
  }

  if (direction !== 'none') {
    if (direction === 'next') container.classList.add('slide-out-left');
    else if (direction === 'prev') container.classList.add('slide-out-right');
    setTimeout(() => applyNewContent(), 200);
  } else {
    applyNewContent();
  }

  setTimeout(() => {
    const totalPages = Math.ceil(projects.length / projectsPerPage) || 1;
    const prevButton = document.getElementById(`${category}-prev-btn`);
    const nextButton = document.getElementById(`${category}-next-btn`);
    if (prevButton) prevButton.disabled = (currentPage === 0);
    if (nextButton) nextButton.disabled = (currentPage + 1 >= totalPages);
  }, direction !== 'none' ? 300 : 0);
}

export function nextPage(category) {
  const projects = projectsData[category];
  const projectsPerPage = getProjectsPerPage();
  const totalPages = Math.ceil(projects.length / projectsPerPage);
  const currentPage = paginationState[category].currentPage;
  if (currentPage + 1 < totalPages) {
    const prevButton = document.getElementById(`${category}-prev-btn`);
    const nextButton = document.getElementById(`${category}-next-btn`);
    if (prevButton && nextButton) {
      prevButton.classList.add('loading');
      nextButton.classList.add('loading');
      prevButton.disabled = true;
      nextButton.disabled = true;
    }
    paginationState[category].currentPage++;
    renderProjectsPage(category, 'next');
    setTimeout(() => {
      if (prevButton && nextButton) {
        prevButton.classList.remove('loading');
        nextButton.classList.remove('loading');
        const totalPagesNow = Math.ceil(projects.length / projectsPerPage) || 1;
        const currentPageNow = paginationState[category].currentPage;
        prevButton.disabled = (currentPageNow === 0);
        nextButton.disabled = (currentPageNow + 1 >= totalPagesNow);
      }
    }, 500);
  }
}

export function prevPage(category) {
  const currentPage = paginationState[category].currentPage;
  if (currentPage > 0) {
    const prevButton = document.getElementById(`${category}-prev-btn`);
    const nextButton = document.getElementById(`${category}-next-btn`);
    if (prevButton && nextButton) {
      prevButton.classList.add('loading');
      nextButton.classList.add('loading');
      prevButton.disabled = true;
      nextButton.disabled = true;
    }
    paginationState[category].currentPage--;
    renderProjectsPage(category, 'prev');
    setTimeout(() => {
      if (prevButton && nextButton) {
        prevButton.classList.remove('loading');
        nextButton.classList.remove('loading');
        const projects = projectsData[category];
        const projectsPerPage = getProjectsPerPage();
        const totalPages = Math.ceil(projects.length / projectsPerPage) || 1;
        const currentPageNow = paginationState[category].currentPage;
        prevButton.disabled = (currentPageNow === 0);
        nextButton.disabled = (currentPageNow + 1 >= totalPages);
      }
    }, 500);
  }
}

export async function initProjects() {
  // Load project data from JSON before rendering
  await loadProjectsData();

  renderProjectsPage('offensive');
  renderProjectsPage('defensive');
  renderProjectsPage('reports');
  renderProjectsPage('ai');
  renderProjectsPage('networking');
  renderProjectsPage('software');
  renderProjectsPage('web');
  renderProjectsPage('hardware');

  // Mark truncated titles and bind click-to-modal
  detectTruncatedTitles();
  initProjectModal();

  // Re-render when language changes
  on(window, 'lang-change', () => {
    Object.keys(paginationState).forEach(category => {
      renderProjectsPage(category);
    });
    // Re-detect after re-render
    setTimeout(detectTruncatedTitles, 350);
  });

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      Object.keys(paginationState).forEach(category => {
        paginationState[category].currentPage = 0;
        renderProjectsPage(category);
      });
      setTimeout(detectTruncatedTitles, 350);
    }, 250);
  });
}

// ======================== Truncation Detection ========================

function detectTruncatedTitles() {
  qsa('.project-title').forEach(el => {
    // scrollWidth > clientWidth means text is truncated
    if (el.scrollWidth > el.clientWidth) {
      el.classList.add('truncated');
    } else {
      el.classList.remove('truncated');
    }
  });
}

// ======================== Project Detail Modal ========================

function initProjectModal() {
  const modal = qs('#project-modal');
  if (!modal) return;

  const titleEl = qs('#project-modal-title');
  const descEl = qs('#project-modal-desc');
  const techEl = qs('#project-modal-tech');
  const linksEl = qs('#project-modal-links');
  const imageEl = qs('#project-modal-image');
  const dialog = modal.querySelector('.cv-modal__dialog');
  let lastFocused = null;
  let currentProject = null;

  function updateModalContent(project) {
    const lang = getLang();
    const title = resolveI18n(project.title);
    const description = resolveI18n(project.description);

    // Image
    if (project.image) {
      imageEl.innerHTML = `<img src="${project.image}" alt="${title}" loading="lazy">`;
    } else {
      imageEl.innerHTML = `<i class="${project.icon || 'fas fa-folder-open'}"></i>`;
    }

    titleEl.textContent = title;
    descEl.textContent = description;

    // Technologies
    techEl.innerHTML = (project.technologies || []).map(tech => `<span class="tech-tag">${tech}</span>`).join('');

    // Links
    let html = '';
    if (project.links) {
      if (typeof project.links === 'object' && project.links.github) {
        html += `<a href="${project.links.github}" target="_blank" rel="noopener noreferrer" class="project-link"><i class="fab fa-github"></i> GitHub</a>`;
        const reportUrl = project.links.report?.[lang] || project.links.report?.pt || project.links.report?.en;
        if (reportUrl) {
          html += `<a href="${reportUrl}" target="_blank" rel="noopener noreferrer" class="project-link"><i class="fas fa-file-pdf"></i> ${t('projects.report')}</a>`;
        }
      }
    }
    linksEl.innerHTML = html;
  }

  function openModal(project) {
    currentProject = project;
    updateModalContent(project);

    lastFocused = document.activeElement;
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);
    const focusable = dialog.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
    if (focusable.length) focusable[0].focus();
  }

  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onKeyDown);
    currentProject = null;
    if (lastFocused) lastFocused.focus();
  }

  // Update modal content when language changes while modal is open
  on(window, 'lang-change', () => {
    if (currentProject && modal.getAttribute('aria-hidden') === 'false') {
      updateModalContent(currentProject);
    }
  });

  function onKeyDown(e) {
    if (e.key === 'Escape') { closeModal(); return; }
    trapFocus(dialog, e);
  }

  // Close handlers
  modal.querySelectorAll('[data-project-close]').forEach(el => {
    on(el, 'click', e => { e.preventDefault(); closeModal(); });
  });

  // Close modal when navbar links are clicked
  qsa('.nav-link').forEach(link => {
    on(link, 'click', () => {
      if (modal.getAttribute('aria-hidden') === 'false') closeModal();
    });
  });

  // Delegate click on project titles
  document.addEventListener('click', e => {
    const titleEl2 = e.target.closest('.project-title');
    if (!titleEl2) return;
    const card = titleEl2.closest('.project-card');
    if (!card || card.classList.contains('empty')) return;
    const json = card.getAttribute('data-project-json');
    if (!json) return;
    try {
      const project = JSON.parse(decodeURIComponent(json));
      openModal(project);
    } catch(_) {}
  });
}
