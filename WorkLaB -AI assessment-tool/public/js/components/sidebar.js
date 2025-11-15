// Sidebar Component
function createSidebar() {
  const sidebar = document.createElement('aside');
  sidebar.className = 'sidebar';
  sidebar.id = 'sidebar';
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/lab-work', label: 'Lab Work', icon: '🔬' },
    { path: '/profile', label: 'Profile', icon: '👤' },
    { path: '/take-exam', label: 'Take Exam', icon: '📝' }
  ];
  
  let navHTML = '<ul class="sidebar-nav">';
  
  navItems.forEach(item => {
    const isActive = window.location.pathname === item.path;
    navHTML += `
      <li class="sidebar-nav-item">
        <a href="${item.path}" class="sidebar-nav-link ${isActive ? 'active' : ''}" data-route="${item.path}">
          <span style="font-size: 1.25rem;">${item.icon}</span>
          <span>${item.label}</span>
        </a>
      </li>
    `;
  });
  
  navHTML += '</ul>';
  
  sidebar.innerHTML = `
    <div class="p-4 mb-4">
      <h1 class="text-2xl font-bold gradient-text">ExamMaster</h1>
    </div>
    ${navHTML}
    <div class="p-4 mt-auto">
      <button id="signout-btn" class="btn btn-outline w-full">
        Sign Out
      </button>
    </div>
  `;
  
  // Add click handlers for navigation
  sidebar.querySelectorAll('[data-route]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const path = link.getAttribute('data-route');
      window.router.navigate(path);
    });
  });
  
  // Sign out handler
  sidebar.querySelector('#signout-btn').addEventListener('click', async () => {
    try {
      await window.auth.signOut();
      window.toast.success('Signed out successfully');
    } catch (error) {
      window.toast.error('Failed to sign out');
    }
  });
  
  return sidebar;
}

window.createSidebar = createSidebar;
