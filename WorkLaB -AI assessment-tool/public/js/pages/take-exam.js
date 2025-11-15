// Take Exam Page
async function renderTakeExamPage(container) {
  const sidebar = window.createSidebar();
  const mainContent = document.createElement('main');
  mainContent.className = 'main-content';
  
  mainContent.innerHTML = `
    <div class="mb-8">
      <h1 class="text-4xl font-bold gradient-text mb-2">Take Exam</h1>
      <p class="text-muted-foreground">Join a hosted exam using an access code</p>
    </div>
    
    <div class="card" style="max-width: 500px;">
      <h2 class="text-2xl font-bold mb-4">Enter Access Code</h2>
      <form id="access-code-form">
        <div class="form-group">
          <label class="label" for="access-code">Access Code</label>
          <input type="text" id="access-code" class="input" placeholder="Enter exam access code" required />
        </div>
        
        <div class="form-group">
          <label class="label" for="student-name">Your Name</label>
          <input type="text" id="student-name" class="input" placeholder="Enter your full name" required />
        </div>
        
        <div class="form-group">
          <label class="label" for="student-email">Email (Optional)</label>
          <input type="email" id="student-email" class="input" placeholder="your.email@example.com" />
        </div>
        
        <button type="submit" class="btn btn-gradient w-full btn-lg">
          Join Exam 🚀
        </button>
      </form>
    </div>
  `;
  
  const form = mainContent.querySelector('#access-code-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<div class="spinner"></div> Joining...';
    
    try {
      const accessCode = form.querySelector('#access-code').value;
      const studentName = form.querySelector('#student-name').value;
      const studentEmail = form.querySelector('#student-email').value;
      
      // Find exam by access code
      const { data: exam, error: examError } = await window.supabase
        .from('hosted_exams')
        .select('*')
        .eq('access_code', accessCode)
        .single();
      
      if (examError || !exam) {
        throw new Error('Invalid access code');
      }
      
      // Check if exam is active
      if (exam.status !== 'active') {
        throw new Error('This exam is not currently active');
      }
      
      const user = window.auth.getCurrentUser();
      
      // Create session
      const { data: session, error: sessionError } = await window.supabase
        .from('student_exam_sessions')
        .insert({
          hosted_exam_id: exam.id,
          student_user_id: user?.id || null,
          student_name: studentName,
          student_email: studentEmail,
          status: 'in_progress',
          started_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (sessionError) throw sessionError;
      
      window.toast.success('Successfully joined exam!');
      
      // Show exam interface
      showExamInterface(mainContent, exam, session);
      
    } catch (error) {
      window.toast.error(error.message || 'Failed to join exam');
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Join Exam 🚀';
    }
  });
  
  function showExamInterface(parent, exam, session) {
    parent.querySelector('.card').innerHTML = `
      <div class="mb-6">
        <h2 class="text-3xl font-bold gradient-text mb-2">${exam.title}</h2>
        <p class="text-muted-foreground">${exam.description || ''}</p>
        <div class="mt-4">
          <span class="badge">Duration: ${exam.duration_minutes} minutes</span>
        </div>
      </div>
      
      <div class="mb-6">
        <p class="text-sm text-muted-foreground mb-4">Answer all questions below:</p>
        <div id="questions-container"></div>
      </div>
      
      <button id="submit-exam-btn" class="btn btn-gradient w-full btn-lg">
        Submit Exam
      </button>
    `;
    
    // Parse and display questions
    const questionsContainer = parent.querySelector('#questions-container');
    const assessmentData = exam.assessment_data;
    
    // Simple question parsing (you can enhance this)
    const questionText = assessmentData.paper || assessmentData.questions || 'No questions available';
    questionsContainer.innerHTML = `
      <div class="form-group">
        <label class="label">Questions:</label>
        <pre style="background: hsl(var(--muted)); padding: 1rem; border-radius: var(--radius); white-space: pre-wrap;">${questionText}</pre>
      </div>
      <div class="form-group">
        <label class="label" for="answers">Your Answers</label>
        <textarea id="answers" class="input textarea" style="min-height: 300px;" placeholder="Write your answers here..."></textarea>
      </div>
    `;
    
    // Submit handler
    parent.querySelector('#submit-exam-btn').addEventListener('click', async () => {
      const answers = parent.querySelector('#answers').value;
      
      if (!answers.trim()) {
        window.toast.error('Please provide your answers');
        return;
      }
      
      const submitBtn = parent.querySelector('#submit-exam-btn');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<div class="spinner"></div> Submitting...';
      
      try {
        const { error } = await window.supabase
          .from('student_exam_sessions')
          .update({
            answers: { text: answers },
            status: 'completed',
            submitted_at: new Date().toISOString()
          })
          .eq('id', session.id);
        
        if (error) throw error;
        
        window.toast.success('Exam submitted successfully!');
        window.router.navigate('/');
        
      } catch (error) {
        window.toast.error('Failed to submit exam');
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Submit Exam';
      }
    });
  }
  
  container.appendChild(sidebar);
  container.appendChild(mainContent);
}

window.router.register('/take-exam', renderTakeExamPage);
