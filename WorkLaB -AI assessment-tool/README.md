# Try again with simpler content to avoid any unexpected issues
content = """# Lumen Exam Genius – Setup & Run Guide (Windows + VS Code)

## 1. Open Correct Project Folder
After extracting the ZIP, open the **inner** folder (the one containing package.json) in VS Code.

## 2. Install Dependencies
Run:
npm install

## 3. Environment Variables
Create a .env file and add:
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-key

## 4. Start Development Server
npm run dev

Open http://localhost:5173/

## 5. Build for Production
npm run build
npm run preview
"""

path = "/mnt/data/README.md"
with open(path, "w", encoding="utf-8") as f:
    f.write(content)

path
