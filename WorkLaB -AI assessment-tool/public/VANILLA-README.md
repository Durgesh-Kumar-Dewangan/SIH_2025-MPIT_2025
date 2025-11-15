# ExamMaster - Vanilla JavaScript Version

This is the vanilla HTML/CSS/JavaScript version of ExamMaster that runs without React, TypeScript, or any build tools.

## 🚀 Quick Start

### Option 1: VS Code Live Server (Recommended)

1. **Install Live Server Extension**
   - Open VS Code
   - Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
   - Search for "Live Server" by Ritwick Dey
   - Click Install

2. **Run the App**
   - Open the `public` folder in VS Code
   - Right-click on `index-vanilla.html`
   - Select "Open with Live Server"
   - Your browser will open at `http://localhost:5500` (or similar)

### Option 2: Python Simple HTTP Server

```bash
# Navigate to the public folder
cd public

# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Then open: http://localhost:8000/index-vanilla.html
```

### Option 3: Node.js HTTP Server

```bash
# Install http-server globally (once)
npm install -g http-server

# Navigate to public folder
cd public

# Start server
http-server

# Then open: http://localhost:8080/index-vanilla.html
```

### Option 4: PHP Built-in Server

```bash
# Navigate to public folder
cd public

# Start PHP server
php -S localhost:8000

# Then open: http://localhost:8000/index-vanilla.html
```

## 📁 Project Structure

```
public/
├── index-vanilla.html          # Main HTML entry point
├── css/
│   └── vanilla-styles.css      # All styles (design system)
├── js/
│   ├── app.js                  # Application initialization
│   ├── components/             # Reusable UI components
│   │   ├── button.js
│   │   ├── card.js
│   │   ├── dialog.js
│   │   ├── input.js
│   │   ├── sidebar.js
│   │   └── textarea.js
│   ├── pages/                  # Page components
│   │   ├── auth.js             # Login/Signup page
│   │   ├── dashboard.js        # Main dashboard
│   │   ├── lab-work.js         # Lab work management
│   │   ├── profile.js          # User profile
│   │   ├── take-exam.js        # Exam taking interface
│   │   └── not-found.js        # 404 page
│   └── utils/                  # Utilities
│       ├── router.js           # Client-side routing
│       ├── supabase-client.js  # Database connection
│       └── toast.js            # Notifications
└── VANILLA-README.md           # This file
```

## ✨ Features

- **No Build Required**: Pure vanilla JavaScript - just open in browser
- **Modern Design**: Responsive UI with design system
- **Authentication**: Email/password login and signup
- **Question Paper Generation**: AI-powered exam creation
- **Lab Work**: Code sharing and execution
- **Exam Taking**: Join exams with access codes
- **Profile Management**: View performance and achievements
- **Client-Side Routing**: SPA experience without frameworks
- **Toast Notifications**: User feedback system
- **Modal Dialogs**: Dynamic popups and forms

## 🔧 Configuration

The app connects to Supabase Cloud backend. Credentials are configured in:
- `public/js/utils/supabase-client.js`

Current configuration:
- Supabase URL: `https://mumrslkcdzlilzzpjulg.supabase.co`
- Uses Lovable Cloud backend integration

## 🎨 Customization

### Changing Colors

Edit `public/css/vanilla-styles.css` and modify the CSS variables:

```css
:root {
  --primary: 263 70% 50%;        /* Purple gradient color */
  --background: 0 0% 100%;       /* White background */
  --foreground: 240 10% 3.9%;    /* Dark text */
  /* ... more variables */
}
```

### Adding New Pages

1. Create a new file in `public/js/pages/your-page.js`
2. Define the render function:
   ```javascript
   async function renderYourPage(container) {
     container.innerHTML = `...`;
   }
   window.router.register('/your-route', renderYourPage);
   ```
3. Add the script to `index-vanilla.html`:
   ```html
   <script src="/js/pages/your-page.js"></script>
   ```

## 🔍 Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Internet Explorer: ❌ Not supported (uses modern JavaScript)

## 🐛 Troubleshooting

### CORS Errors
If you see CORS errors, make sure you're running a local server (not just opening the HTML file directly).

### Supabase Connection Issues
Check the browser console for errors. Ensure the Supabase credentials in `supabase-client.js` are correct.

### Blank Page
1. Check browser console for JavaScript errors
2. Ensure all script files are loading (check Network tab)
3. Verify server is running on correct port

### Authentication Not Working
1. Check Supabase authentication is enabled
2. Verify email confirmation settings in Supabase
3. Check browser console for auth errors

## 📝 Key Differences from React Version

| Feature | Vanilla JS | React Version |
|---------|------------|---------------|
| Build Process | None | Vite build |
| File Size | Smaller | Larger (includes React) |
| Performance | Very fast | Fast |
| Learning Curve | Simple | Requires React knowledge |
| Hot Reload | Manual | Automatic |
| Type Safety | None | TypeScript |
| State Management | Manual | React hooks |

## 🚀 Deployment

To deploy the vanilla version:

1. **Copy public folder contents** to your web server
2. Configure server to serve `index-vanilla.html` as the main file
3. Ensure all routes point to `index-vanilla.html` (for SPA routing)

Example Nginx configuration:
```nginx
location / {
    try_files $uri $uri/ /index-vanilla.html;
}
```

Example Apache .htaccess:
```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index-vanilla\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index-vanilla.html [L]
```

## 📚 Resources

- [Lovable Documentation](https://docs.lovable.dev/)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [MDN Web Docs](https://developer.mozilla.org/)

## 💡 Tips

- Use browser DevTools for debugging
- Check Network tab for API calls
- Use Console tab for JavaScript errors
- Inspect Elements tab for styling issues
- Use VS Code Live Server for auto-refresh during development

## 🤝 Contributing

To modify the vanilla JS version:
1. Edit files in the `public/` folder
2. Refresh your browser to see changes
3. No build step needed!

---

**Note**: This vanilla JS version maintains the same functionality as the React version but with simpler architecture and no build tools required.
