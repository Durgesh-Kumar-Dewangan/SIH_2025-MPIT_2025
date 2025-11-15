// Button Component Helper
function createButton(text, options = {}) {
  const {
    variant = 'primary',
    size = 'default',
    icon = null,
    onClick = null,
    disabled = false,
    className = ''
  } = options;
  
  const button = document.createElement('button');
  button.className = `btn btn-${variant} ${size === 'lg' ? 'btn-lg' : ''} ${className}`;
  button.disabled = disabled;
  
  if (icon) {
    button.innerHTML = `${icon} ${text}`;
  } else {
    button.textContent = text;
  }
  
  if (onClick) {
    button.addEventListener('click', onClick);
  }
  
  return button;
}

window.createButton = createButton;
