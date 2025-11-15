// Card Component Helper
function createCard(options = {}) {
  const {
    title = '',
    description = '',
    content = '',
    className = '',
    glass = false
  } = options;
  
  const card = document.createElement('div');
  card.className = `card ${glass ? 'glass-card' : ''} ${className}`;
  
  let html = '';
  
  if (title) {
    html += `<h3 class="text-2xl font-semibold mb-2">${title}</h3>`;
  }
  
  if (description) {
    html += `<p class="text-sm text-muted-foreground mb-4">${description}</p>`;
  }
  
  if (content) {
    html += content;
  }
  
  card.innerHTML = html;
  return card;
}

window.createCard = createCard;
