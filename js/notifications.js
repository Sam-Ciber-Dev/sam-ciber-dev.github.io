// Accessible notification helpers
export function showCopyNotification(message, { iconClass = 'fas fa-check-circle', live = 'polite' } = {}) {
  const existing = document.querySelectorAll('.copy-notification');
  existing.forEach(n => n.remove());
  const notification = document.createElement('div');
  notification.className = 'copy-notification';
  notification.setAttribute('role', 'status');
  notification.setAttribute('aria-live', live);
  notification.innerHTML = `<i class="${iconClass}" aria-hidden="true"></i> ${message}`;
  document.body.appendChild(notification);
  requestAnimationFrame(() => notification.classList.add('show'));
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

export function handleCertificationClick(e, certificationName) {
  if (e) e.preventDefault();
  const message = certificationName === 'Certificado CTeSP Cibersegurança'
    ? 'O Curso ainda não foi concluído'
    : `Certificado "${certificationName}" selecionado!`;
  // Use the same immediate toast behavior as copy notifications (no artificial delay)
  showCopyNotification(message, { iconClass: 'fas fa-certificate' });
}
