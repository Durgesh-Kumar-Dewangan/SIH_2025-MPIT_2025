// Lab Work Page
async function renderLabWorkPage(container) {
  const sidebar = window.createSidebar();
  const mainContent = document.createElement('main');
  mainContent.className = 'main-content';
  
  mainContent.innerHTML = `
    <div class="mb-8">
      <h1 class="text-4xl font-bold gradient-text mb-2">Lab Work</h1>
      <p class="text-muted-foreground">Share your coding projects and experiments</p>
    </div>
    
    <div class="mb-6">
      <button id="create-lab-btn" class="btn btn-gradient">
        + Create New Lab Work
      </button>
    </div>
    
    <div id="lab-works-container" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="text-center py-8">
        <div class="spinner" style="margin: 0 auto"></div>
        <p class="mt-4 text-muted-foreground">Loading lab works...</p>
      </div>
    </div>
  `;
  
  // Load lab works
  async function loadLabWorks() {
    try {
      const { data: labWorks, error } = await window.supabase
        .from('lab_works')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const labContainer = mainContent.querySelector('#lab-works-container');
      
      if (!labWorks || labWorks.length === 0) {
        labContainer.innerHTML = `
          <div class="col-span-full text-center py-12">
            <p class="text-muted-foreground">No lab works yet. Create your first one!</p>
          </div>
        `;
        return;
      }
      
      labContainer.innerHTML = '';
      
      labWorks.forEach(work => {
        const card = document.createElement('div');
        card.className = 'card hover-scale';
        card.innerHTML = `
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-xl font-semibold mb-1">${work.title}</h3>
              <p class="text-sm text-muted-foreground">${work.description || 'No description'}</p>
            </div>
            <span class="badge">${work.language}</span>
          </div>
          
          <div class="mb-4">
            <pre style="background: hsl(var(--muted)); padding: 1rem; border-radius: var(--radius); overflow-x: auto; font-size: 0.75rem; max-height: 200px;"><code>${work.code}</code></pre>
          </div>
          
          ${work.output ? `
            <div class="mb-4" style="background: hsl(var(--muted) / 0.5); padding: 1rem; border-radius: var(--radius);">
              <p style="font-size: 0.75rem; color: hsl(var(--muted-foreground)); margin-bottom: 0.5rem;">Output:</p>
              <pre style="font-size: 0.75rem;"><code>${work.output}</code></pre>
            </div>
          ` : ''}
          
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--gradient-primary);"></div>
              <span class="text-sm">${work.profiles?.full_name || 'Anonymous'}</span>
            </div>
            <div class="text-sm text-muted-foreground">
              ❤️ ${work.likes_count || 0}
            </div>
          </div>
        `;
        labContainer.appendChild(card);
      });
      
    } catch (error) {
      window.toast.error('Failed to load lab works');
      console.error(error);
    }
  }
  
  // Create lab work dialog
  mainContent.querySelector('#create-lab-btn').addEventListener('click', () => {
    const dialog = window.createDialog({
      title: 'Create Lab Work',
      content: `
        <form id="create-lab-form">
          <div class="form-group">
            <label class="label" for="lab-title">Title</label>
            <input type="text" id="lab-title" class="input" placeholder="My Amazing Project" required />
          </div>
          
          <div class="form-group">
            <label class="label" for="lab-desc">Description</label>
            <textarea id="lab-desc" class="input textarea" placeholder="Describe your project..."></textarea>
          </div>
          
          <div class="form-group">
            <label class="label" for="lab-lang">Language</label>
            <select id="lab-lang" class="input" required>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="c">C</option>
              <option value="csharp">C#</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
              <option value="ruby">Ruby</option>
              <option value="php">PHP</option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="label" for="lab-code">Code</label>
            <textarea id="lab-code" class="input textarea" placeholder="// Your code here" required style="min-height: 200px; font-family: monospace;"></textarea>
          </div>
          
          <div class="flex gap-2">
            <button type="button" id="run-code-btn" class="btn btn-secondary flex-1">
              ▶️ Run Code
            </button>
            <button type="submit" class="btn btn-gradient flex-1">
              Create Lab Work
            </button>
          </div>
          
          <div id="code-output" class="hidden form-group">
            <label class="label">Output</label>
            <pre id="output-content" class="input textarea" style="min-height: 150px; font-family: monospace; white-space: pre-wrap;"></pre>
          </div>
        </form>
      `
    });
    
    // Run code button handler
    const runCodeBtn = dialog.element.querySelector('#run-code-btn');
    const codeOutput = dialog.element.querySelector('#code-output');
    const outputContent = dialog.element.querySelector('#output-content');
    
    runCodeBtn.addEventListener('click', async () => {
      const code = form.querySelector('#lab-code').value;
      const language = form.querySelector('#lab-lang').value;
      
      if (!code.trim()) {
        window.toast.error('Please enter some code first');
        return;
      }
      
      runCodeBtn.disabled = true;
      runCodeBtn.innerHTML = '<div class="spinner"></div> Running...';
      codeOutput.classList.remove('hidden');
      outputContent.textContent = 'Executing code...';
      
      try {
        const { data, error } = await window.supabase.functions.invoke('run-code', {
          body: { code, language }
        });
        
        if (error) throw error;
        
        if (data.error) {
          outputContent.textContent = `Error: ${data.error}`;
        } else {
          outputContent.textContent = data.output || 'Code executed successfully';
        }
        
      } catch (error) {
        outputContent.textContent = `Error: ${error.message || 'Failed to execute code'}`;
        window.toast.error('Failed to execute code');
      } finally {
        runCodeBtn.disabled = false;
        runCodeBtn.innerHTML = '▶️ Run Code';
      }
    });
    
    const form = dialog.element.querySelector('#create-lab-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<div class="spinner"></div> Creating...';
      
      try {
        const user = window.auth.getCurrentUser();
        const output = outputContent.textContent || '';
        
        const { error } = await window.supabase.from('lab_works').insert({
          user_id: user.id,
          title: form.querySelector('#lab-title').value,
          description: form.querySelector('#lab-desc').value,
          language: form.querySelector('#lab-lang').value,
          code: form.querySelector('#lab-code').value,
          output: output
        });
        
        if (error) throw error;
        
        window.toast.success('Lab work created successfully!');
        dialog.close();
        loadLabWorks();
        
      } catch (error) {
        window.toast.error(error.message || 'Failed to create lab work');
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Create Lab Work';
      }
    });
  });
  
  container.appendChild(sidebar);
  container.appendChild(mainContent);
  
  // Initial load
  loadLabWorks();
}

window.router.register('/lab-work', renderLabWorkPage);
