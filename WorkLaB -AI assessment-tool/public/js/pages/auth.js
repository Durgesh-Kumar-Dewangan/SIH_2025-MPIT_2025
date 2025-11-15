// Authentication Page
async function renderAuthPage(container) {
  container.innerHTML = `
    <div class="flex items-center justify-center min-h-screen" style="background: var(--gradient-secondary);">
      <div class="card" style="max-width: 400px; width: 90%;">
        <h2 class="text-3xl font-bold gradient-text text-center mb-2">Welcome to ExamMaster</h2>
        <p class="text-center text-muted-foreground mb-6">Sign in to your account or create a new one</p>
        
        <div id="auth-tabs" class="flex gap-2 mb-6">
          <button class="flex-1 btn btn-primary" data-tab="signin">Sign In</button>
          <button class="flex-1 btn btn-outline" data-tab="signup">Sign Up</button>
        </div>
        
        <form id="auth-form">
          <div id="signin-fields">
            <div class="form-group">
              <label class="label" for="email">Email</label>
              <input type="email" id="email" class="input" placeholder="Enter your email" required />
            </div>
            <div class="form-group">
              <label class="label" for="password">Password</label>
              <input type="password" id="password" class="input" placeholder="Enter your password" required />
            </div>
          </div>
          
          <div id="signup-fields" class="hidden">
            <div class="form-group">
              <label class="label" for="fullname">Full Name</label>
              <input type="text" id="fullname" class="input" placeholder="Enter your full name" />
            </div>
            <div class="form-group">
              <label class="label" for="signup-email">Email</label>
              <input type="email" id="signup-email" class="input" placeholder="Enter your email" />
            </div>
            <div class="form-group">
              <label class="label" for="signup-password">Password</label>
              <input type="password" id="signup-password" class="input" placeholder="Create a password" />
            </div>
          </div>
          
          <button type="submit" class="btn btn-gradient w-full btn-lg">
            <span id="submit-text">Sign In</span>
          </button>
        </form>
      </div>
    </div>
  `;
  
  // Tab switching
  const tabs = container.querySelectorAll('[data-tab]');
  const signinFields = container.querySelector('#signin-fields');
  const signupFields = container.querySelector('#signup-fields');
  const submitText = container.querySelector('#submit-text');
  let currentTab = 'signin';
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      currentTab = tab.dataset.tab;
      tabs.forEach(t => t.className = 'flex-1 btn btn-outline');
      tab.className = 'flex-1 btn btn-primary';
      
      if (currentTab === 'signin') {
        signinFields.classList.remove('hidden');
        signupFields.classList.add('hidden');
        submitText.textContent = 'Sign In';
      } else {
        signinFields.classList.add('hidden');
        signupFields.classList.remove('hidden');
        submitText.textContent = 'Sign Up';
      }
    });
  });
  
  // Form submission
  const form = container.querySelector('#auth-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<div class="spinner"></div>';
    
    try {
      if (currentTab === 'signin') {
        const email = form.querySelector('#email').value;
        const password = form.querySelector('#password').value;
        await window.auth.signIn(email, password);
        window.toast.success('Signed in successfully!');
      } else {
        const fullName = form.querySelector('#fullname').value;
        const email = form.querySelector('#signup-email').value;
        const password = form.querySelector('#signup-password').value;
        await window.auth.signUp(email, password, fullName);
        window.toast.success('Account created successfully!');
      }
    } catch (error) {
      window.toast.error(error.message || 'Authentication failed');
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span id="submit-text">${currentTab === 'signin' ? 'Sign In' : 'Sign Up'}</span>`;
    }
  });
}

window.router.register('/auth', renderAuthPage);
