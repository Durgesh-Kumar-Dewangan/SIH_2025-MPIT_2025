// Main Application Entry Point
(async function initApp() {
  console.log('🚀 Initializing ExamMaster...');
  
  try {
    // Initialize authentication
    await window.auth.initAuth();
    
    // Start router
    window.router.start();
    
    console.log('✅ ExamMaster initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize app:', error);
    window.toast.error('Failed to initialize application');
  }
})();
