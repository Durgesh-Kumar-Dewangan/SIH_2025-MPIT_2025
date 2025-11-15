// Dashboard Page
async function renderDashboardPage(container) {
  const sidebar = window.createSidebar();
  const mainContent = document.createElement('main');
  mainContent.className = 'main-content';
  
  mainContent.innerHTML = `
    <div class="mb-8">
      <h1 class="text-4xl font-bold gradient-text mb-2">Welcome to ExamMaster</h1>
      <p class="text-muted-foreground">AI-powered assessment and learning platform</p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="card hover-scale cursor-pointer" onclick="window.router.navigate('/lab-work')">
        <div class="text-4xl mb-4">🔬</div>
        <h3 class="text-xl font-semibold mb-2">Lab Work</h3>
        <p class="text-sm text-muted-foreground">Create and share your coding projects</p>
      </div>
      
      <div class="card hover-scale cursor-pointer" onclick="window.router.navigate('/take-exam')">
        <div class="text-4xl mb-4">📝</div>
        <h3 class="text-xl font-semibold mb-2">Take Exam</h3>
        <p class="text-sm text-muted-foreground">Join hosted exams with access codes</p>
      </div>
      
      <div class="card hover-scale cursor-pointer" onclick="window.router.navigate('/profile')">
        <div class="text-4xl mb-4">👤</div>
        <h3 class="text-xl font-semibold mb-2">Profile</h3>
        <p class="text-sm text-muted-foreground">View your performance and achievements</p>
      </div>
    </div>
    
    <div class="card glass-card">
      <h2 class="text-2xl font-bold mb-4">Generate Question Paper</h2>
      <form id="generate-paper-form">
        <div class="form-group">
          <label class="label" for="subject">Subject</label>
          <input type="text" id="subject" class="input" placeholder="e.g., Mathematics, Physics" required />
        </div>
        
        <div class="form-group">
          <label class="label" for="difficulty">Difficulty</label>
          <select id="difficulty" class="input" required>
            <option value="">Select difficulty</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        
        <div class="form-group">
          <label class="label" for="num-questions">Number of Questions</label>
          <input type="number" id="num-questions" class="input" min="1" max="50" value="10" required />
        </div>
        
        <button type="submit" class="btn btn-gradient btn-lg">
          Generate Paper ✨
        </button>
      </form>
    </div>
  `;
  
  // Handle form submission
  const form = mainContent.querySelector('#generate-paper-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<div class="spinner"></div> Generating...';
    
    try {
      const subject = form.querySelector('#subject').value;
      const difficulty = form.querySelector('#difficulty').value;
      const numQuestions = form.querySelector('#num-questions').value;
      
      // Call edge function to generate paper
      const { data, error } = await window.supabase.functions.invoke('generate-paper', {
        body: { subject, difficulty, numQuestions: parseInt(numQuestions) }
      });
      
      if (error) throw error;
      
      window.toast.success('Question paper generated successfully!');
      
      // Show generated paper in a dialog
      window.createDialog({
        title: 'Generated Question Paper',
        content: `
          <div style="max-height: 60vh; overflow-y: auto;">
            <pre style="white-space: pre-wrap; font-size: 0.875rem;">${data.paper}</pre>
          </div>
          <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
            <button onclick="this.closest('.dialog-overlay').remove()" class="btn btn-primary flex-1">
              Start Test
            </button>
            <button onclick="this.closest('.dialog-overlay').remove()" class="btn btn-outline flex-1">
              Close
            </button>
          </div>
        `
      });
      
    } catch (error) {
      window.toast.error(error.message || 'Failed to generate paper');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Generate Paper ✨';
    }
  });
  
  container.appendChild(sidebar);
  container.appendChild(mainContent);
}

window.router.register('/', renderDashboardPage);
