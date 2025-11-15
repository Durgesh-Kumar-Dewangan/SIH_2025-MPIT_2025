// Simple Client-Side Router
class Router {
  constructor() {
    this.routes = {};
    this.currentRoute = null;
    
    // Handle browser back/forward
    window.addEventListener('popstate', () => {
      this.loadRoute(window.location.pathname);
    });
  }

  register(path, handler) {
    this.routes[path] = handler;
  }

  navigate(path, replaceState = false) {
    if (replaceState) {
      window.history.replaceState({}, '', path);
    } else {
      window.history.pushState({}, '', path);
    }
    this.loadRoute(path);
  }

  async loadRoute(path) {
    // Check authentication for protected routes
    if (path !== '/auth' && !window.auth.isAuthenticated()) {
      this.navigate('/auth', true);
      return;
    }
    
    // Redirect to dashboard if authenticated and on auth page
    if (path === '/auth' && window.auth.isAuthenticated()) {
      this.navigate('/', true);
      return;
    }

    this.currentRoute = path;
    
    // Find matching route
    const handler = this.routes[path] || this.routes['/404'];
    
    if (handler) {
      const appContainer = document.getElementById('app');
      appContainer.innerHTML = '';
      await handler(appContainer);
    }
  }

  start() {
    // Load initial route
    const path = window.location.pathname;
    this.loadRoute(path || '/');
  }
}

// Create global router instance
window.router = new Router();
