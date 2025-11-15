# Welcome to your Lovable project# Project README

## Introduction
This project allows users to upload a syllabus, automatically analyze its structure, and generate custom questions and answers based on the topics extracted. The system also includes a feature for users to type or upload their responses, which the AI then evaluates and compiles into a full progress report with a downloadable PDF. The interface is designed to be clean, intuitive, and accessible.

## Features
- Upload your syllabus (PDF, DOCX, or text format).
- Automatic extraction and categorization of topics.
- AI-generated questions for each unit or topic.
- Detailed answers generated according to the syllabus content.
- Response submission in two ways:
  - Type your answer directly.
  - Upload an answer file.
- AI evaluation of submitted answers.
- A full progress report generated as a downloadable PDF.
- User-friendly UI/UX with a clear workflow and interactive components.

## UI Preview
Below is a placeholder image of the UI. Replace `ui-screenshot.png` with your actual image.

![UI Preview](./ui-screenshot.png)

## Installation
Follow these steps to set up the project locally:

### 1. Clone the repository
```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

### 2. Install dependencies
If using **Vercel + Next.js**:
```bash
npm install
```

### 3. Environment variables
Create a file named `.env.local` and include the following:
```env
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_APP_URL=your_frontend_url
```
Add any additional API keys or configuration as needed.

### 4. Run the development server
```bash
npm run dev
```
Your app will be available at:
```
http://localhost:3000
```

## Deployment (Vercel)
1. Push your project to GitHub.
2. Go to https://vercel.com and import your repository.
3. Add the environment variables under **Project Settings > Environment Variables**.
4. Deploy the project.

## Project Structure Overview
```
├── components/         # UI components
├── pages/              # Next.js page routes
├── utils/              # Parsing and AI utilities
├── public/             # Public assets (UI image goes here)
├── styles/             # Global or module CSS
├── README.md           # Documentation
└── package.json
```

## Technology Stack
- **Next.js (React Framework)**
- **Tailwind CSS** for styling
- **OpenAI API** for syllabus analysis, question generation, and evaluation
- **Vercel** for deployment

## How It Works
The app processes the uploaded syllabus using a combination of text extraction and topic modeling. These topics guide AI-generated questions and answers. Users can submit their responses, and the AI evaluates them based on accuracy, clarity, and completeness. A final compiled PDF report summarizes the user's progress.

## License
This project is licensed under the MIT License. Feel free to modify and use it as needed.

## Contribution
Contributions are encouraged. To contribute:
- Fork the repository
- Create a new branch
- Commit your changes
- Submit a pull request

Further enhancements often emerge once real syllabi and diverse use cases enter the mix.




































## Project info

**URL**: https://lovable.dev/projects/8907065b-8dc5-414a-a0c1-47675a51dda7

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/8907065b-8dc5-414a-a0c1-47675a51dda7) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/8907065b-8dc5-414a-a0c1-47675a51dda7) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
