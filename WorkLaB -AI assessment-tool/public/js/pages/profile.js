// Profile Page
async function renderProfilePage(container) {
  const sidebar = window.createSidebar();
  const mainContent = document.createElement('main');
  mainContent.className = 'main-content';
  
  mainContent.innerHTML = `
    <div class="mb-8">
      <h1 class="text-4xl font-bold gradient-text mb-2">Profile</h1>
      <p class="text-muted-foreground">Your academic performance and achievements</p>
    </div>
    
    <div id="profile-content">
      <div class="text-center py-8">
        <div class="spinner" style="margin: 0 auto"></div>
        <p class="mt-4 text-muted-foreground">Loading profile...</p>
      </div>
    </div>
  `;
  
  // Load profile data
  async function loadProfile() {
    try {
      const user = window.auth.getCurrentUser();
      
      // Get profile
      const { data: profile, error: profileError } = await window.supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (profileError) throw profileError;
      
      // Get exam sessions
      const { data: examSessions } = await window.supabase
        .from('student_exam_sessions')
        .select('*')
        .eq('student_user_id', user.id);
      
      // Get lab works
      const { data: labWorks } = await window.supabase
        .from('lab_works')
        .select('*')
        .eq('user_id', user.id);
      
      // Calculate stats
      const totalExams = examSessions?.length || 0;
      const completedExams = examSessions?.filter(s => s.status === 'completed').length || 0;
      const avgScore = completedExams > 0 
        ? (examSessions.filter(s => s.score).reduce((acc, s) => acc + parseFloat(s.score), 0) / completedExams).toFixed(1)
        : 0;
      
      const profileContent = mainContent.querySelector('#profile-content');
      profileContent.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="card text-center">
            <div class="text-4xl mb-2">📊</div>
            <div class="text-3xl font-bold gradient-text mb-1">${totalExams}</div>
            <div class="text-sm text-muted-foreground">Total Exams</div>
          </div>
          
          <div class="card text-center">
            <div class="text-4xl mb-2">✅</div>
            <div class="text-3xl font-bold gradient-text mb-1">${completedExams}</div>
            <div class="text-sm text-muted-foreground">Completed</div>
          </div>
          
          <div class="card text-center">
            <div class="text-4xl mb-2">⭐</div>
            <div class="text-3xl font-bold gradient-text mb-1">${avgScore}%</div>
            <div class="text-sm text-muted-foreground">Average Score</div>
          </div>
        </div>
        
        <div class="card mb-6">
          <h2 class="text-2xl font-bold mb-4">Profile Information</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="label">Full Name</label>
              <div class="text-foreground">${profile.full_name || 'Not set'}</div>
            </div>
            <div>
              <label class="label">Email</label>
              <div class="text-foreground">${user.email}</div>
            </div>
            <div>
              <label class="label">Bio</label>
              <div class="text-foreground">${profile.bio || 'No bio added yet'}</div>
            </div>
            <div>
              <label class="label">Location</label>
              <div class="text-foreground">${profile.location || 'Not set'}</div>
            </div>
          </div>
        </div>
        
        <div class="card mb-6">
          <h2 class="text-2xl font-bold mb-4">Recent Exams</h2>
          ${completedExams === 0 ? `
            <p class="text-muted-foreground text-center py-4">No exams taken yet</p>
          ` : `
            <div class="space-y-3">
              ${examSessions.slice(0, 5).map(session => `
                <div class="flex justify-between items-center p-3 rounded" style="background: hsl(var(--muted));">
                  <div>
                    <div class="font-semibold">${session.student_name}</div>
                    <div class="text-sm text-muted-foreground">${new Date(session.created_at).toLocaleDateString()}</div>
                  </div>
                  <div class="text-right">
                    <div class="font-bold">${session.score ? parseFloat(session.score).toFixed(1) + '%' : 'Pending'}</div>
                    <div class="text-sm">
                      <span class="badge badge-${session.status === 'completed' ? 'primary' : 'secondary'}">
                        ${session.status}
                      </span>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
        
        <div class="card">
          <h2 class="text-2xl font-bold mb-4">Lab Works (${labWorks?.length || 0})</h2>
          ${!labWorks || labWorks.length === 0 ? `
            <p class="text-muted-foreground text-center py-4">No lab works created yet</p>
          ` : `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              ${labWorks.slice(0, 4).map(work => `
                <div class="p-4 rounded" style="background: hsl(var(--muted));">
                  <div class="flex justify-between items-start mb-2">
                    <h3 class="font-semibold">${work.title}</h3>
                    <span class="badge badge-secondary">${work.language}</span>
                  </div>
                  <p class="text-sm text-muted-foreground">${work.description || 'No description'}</p>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      `;
      
    } catch (error) {
      window.toast.error('Failed to load profile');
      console.error(error);
    }
  }
  
  container.appendChild(sidebar);
  container.appendChild(mainContent);
  
  loadProfile();
}

window.router.register('/profile', renderProfilePage);
