// Toast Notification System
const toastContainer = document.getElementById('toast-container');

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = 'toast';
  
  const typeColors = {
    success: 'hsl(var(--primary))',
    error: 'hsl(var(--destructive))',
    info: 'hsl(var(--foreground))'
  };
  
  toast.innerHTML = `
    <div style="display: flex; align-items: center; gap: 0.75rem;">
      <div style="flex: 1;">
        <div style="font-weight: 600; margin-bottom: 0.25rem; color: ${typeColors[type]};">
          ${type.charAt(0).toUpperCase() + type.slice(1)}
        </div>
        <div style="font-size: 0.875rem; color: hsl(var(--muted-foreground));">
          ${message}
        </div>
      </div>
      <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; cursor: pointer; color: hsl(var(--muted-foreground)); font-size: 1.25rem;">
        ×
      </button>
    </div>
  `;
  
  toastContainer.appendChild(toast);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

window.toast = {
  success: (message) => showToast(message, 'success'),
  error: (message) => showToast(message, 'error'),
  info: (message) => showToast(message, 'info')
};
