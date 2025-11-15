// 404 Not Found Page
async function renderNotFoundPage(container) {
  container.innerHTML = `
    <div class="flex items-center justify-center min-h-screen flex-col" style="background: var(--gradient-secondary);">
      <div class="text-center">
        <h1 class="text-9xl font-bold gradient-text mb-4">404</h1>
        <h2 class="text-3xl font-bold mb-4">Page Not Found</h2>
        <p class="text-muted-foreground mb-8">The page you're looking for doesn't exist.</p>
        <button onclick="window.router.navigate('/')" class="btn btn-gradient btn-lg">
          Go Home 🏠
        </button>
      </div>
    </div>
  `;
}

window.router.register('/404', renderNotFoundPage);
