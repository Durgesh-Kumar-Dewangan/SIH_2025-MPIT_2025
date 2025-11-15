// Dialog/Modal Component
function createDialog(options = {}) {
  const {
    title = '',
    content = '',
    onClose = null
  } = options;
  
  const overlay = document.createElement('div');
  overlay.className = 'dialog-overlay';
  
  overlay.innerHTML = `
    <div class="dialog-content">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">${title}</h2>
        <button class="dialog-close" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: hsl(var(--muted-foreground));">×</button>
      </div>
      <div class="dialog-body">
        ${content}
      </div>
    </div>
  `;
  
  const closeBtn = overlay.querySelector('.dialog-close');
  const closeDialog = () => {
    overlay.style.animation = 'fadeOut 0.2s ease';
    setTimeout(() => {
      overlay.remove();
      if (onClose) onClose();
    }, 200);
  };
  
  closeBtn.addEventListener('click', closeDialog);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeDialog();
  });
  
  document.body.appendChild(overlay);
  
  return {
    element: overlay,
    close: closeDialog
  };
}

window.createDialog = createDialog;
