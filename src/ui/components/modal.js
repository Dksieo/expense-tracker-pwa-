export function showModal(contentHtml) {
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.background = 'rgba(0,0,0,0.5)';
  overlay.style.backdropFilter = 'blur(10px)';
  overlay.style.display = 'grid';
  overlay.style.placeItems = 'center';
  overlay.style.zIndex = '100';

  const panel = document.createElement('div');
  panel.className = 'card';
  panel.style.width = 'min(520px, 92vw)';
  panel.style.maxHeight = '86vh';
  panel.style.overflow = 'auto';
  panel.innerHTML = contentHtml;

  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  function close() {
    overlay.remove();
  }

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  return { close, panel, overlay };
}
