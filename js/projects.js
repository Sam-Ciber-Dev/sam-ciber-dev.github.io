// Projects data and pagination
import { projectsData } from './projects-data.js';

export const paginationState = {
  programming: { currentPage: 0 },
  web: { currentPage: 0 },
  cybersecurity: { currentPage: 0 },
  networking: { currentPage: 0 },
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
    </div>`;
}

function createProjectCard(project) {
  const technologies = project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('');
  const links = project.links.map(link => `<a href="${link.href}" class="project-link"><i class="${link.icon}"></i>${link.text}</a>`).join('');
  return `
    <div class="project-card">
      <div class="project-image"><i class="${project.icon}"></i></div>
      <div class="project-content">
        <h3 class="project-title">${project.title}</h3>
        <p class="project-description">${project.description}</p>
        <div class="project-tech">${technologies}</div>
        <div class="project-links">${links}</div>
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

export function initProjects() {
  renderProjectsPage('cybersecurity');
  renderProjectsPage('networking');
  renderProjectsPage('programming');
  renderProjectsPage('web');
  renderProjectsPage('hardware');
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
}
