// Input Component Helper
function createInput(options = {}) {
  const {
    type = 'text',
    placeholder = '',
    value = '',
    label = '',
    id = '',
    required = false,
    className = ''
  } = options;
  
  const container = document.createElement('div');
  container.className = 'form-group';
  
  let html = '';
  
  if (label) {
    html += `<label class="label" for="${id}">${label}${required ? ' *' : ''}</label>`;
  }
  
  if (type === 'textarea') {
    html += `<textarea 
      id="${id}" 
      class="input textarea ${className}" 
      placeholder="${placeholder}"
      ${required ? 'required' : ''}
    >${value}</textarea>`;
  } else {
    html += `<input 
      type="${type}" 
      id="${id}" 
      class="input ${className}" 
      placeholder="${placeholder}" 
      value="${value}"
      ${required ? 'required' : ''}
    />`;
  }
  
  container.innerHTML = html;
  return container;
}

window.createInput = createInput;
