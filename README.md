# SIH_2025-MPIT_2025
---

# 🧠 AI-Powered Inclusive Assessment Tool for the Skill Ecosystem

An **AI-driven, inclusive assessment platform** designed to provide fair, adaptive, and accessible evaluations across the Indian skill ecosystem. The tool supports **multi-format exams**, integrates **assistive technologies** for Persons with Disabilities (PWD), and delivers **real-time analytics** for candidates and educators.

---

## 🚀 Features

* **Multi-Format Exams**: MCQs, descriptive, practical, and viva voce.
* **AI Personalization**: Adaptive difficulty, performance prediction, fraud detection.
* **Multi-Mode Delivery**: Online, offline, and blended assessments.
* **Analytics & Feedback**: Real-time dashboards, benchmarking, exportable reports.
* **Security**: AES/TLS encryption, OAuth2/JWT authentication, audit logs.
* **Scalability**: Cloud-hosted with offline sync support for low-connectivity regions.
* **Multi-Language Support** for regional inclusivity.

---

## 🏗️ System Architecture

* **Frontend**: ReactJS / React Native, TailwindCSS, PWA, ARIA accessibility.
* **Backend**: Node.js, PostgreSQL/MongoDB.
* **AI/ML**: TensorFlow, PyTorch, scikit-learn, HuggingFace (NLP).
* **Analytics**: Pandas, Recharts, ReportLab, Chart.js.
* **Security**: Role-based access, AES/TLS encryption, audit logs.

---

## 🛠️ Installation & Setup

### Prerequisites

* Node.js >= 16
* Python >= 3.9
* PostgreSQL / MongoDB
* Docker (optional, for deployment)

### Clone the Repository

```bash
git clone https://github.com/your-username/ai-inclusive-assessment-tool.git
cd ai-inclusive-assessment-tool
```

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

### AI Models Setup

* Place trained models in `backend/models/`
* Configure model paths in `config.json`

---

## 📊 Analytics Dashboard

* Candidate performance reports (real-time)
* Educator dashboards (batch-level insights)
* Benchmarking against regional/national standards

---

## 🔒 Security

* **Authentication**: OAuth2 / JWT
* **Encryption**: AES 256-bit, TLS in transit
* **Audit Logs**: Track all assessment activity for transparency

---

## 🌍 Use Cases

* Schools & ITIs
* Vocational training centers
* SSCs & government skilling programs
* Inclusive exams for PWD candidates
* Remote/low-connectivity regions

---

## 📅 Roadmap

* [x] Multi-format assessment engine
* [x] AI-powered adaptivity & fraud detection
* [x] Accessibility features (voice/screen reader support)
* [ ] Multi-language support expansion
* [ ] LMS & government portal integration
* [ ] Mobile app deployment

---

## 🤝 Contributing

We welcome contributions!

1. Fork the repo
2. Create a new branch (`feature/your-feature-name`)
3. Commit your changes
4. Submit a Pull Request
Great question 👍 — you’ll want to clearly document the **contribution workflow** so new collaborators can join in smoothly.
Here’s a **“Contributing Guide” section** you can add to your README (or keep in a separate `CONTRIBUTING.md` file).


### 1. Fork the Repository

Click the **Fork** button at the top-right of this repo to create your own copy under your GitHub account.

### 2. Clone Your Fork

```bash
git clone https://github.com/your-username/ai-inclusive-assessment-tool.git
cd ai-inclusive-assessment-tool
```

### 3. Add the Upstream Remote

This ensures you can pull the latest changes from the main project.

```bash
git remote add upstream https://github.com/original-repo/ai-inclusive-assessment-tool.git
```

---

## 🌱 Setting Up the Project

### Backend (Django/FastAPI)

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend (React)

```bash
cd frontend
npm install
npm start
```

---

## 🔧 Making Changes

1. **Create a new branch** for your feature or fix:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** in code (backend, frontend, AI models, or docs).

3. **Commit your changes** with a clear message:

   ```bash
   git commit -m "Add: accessibility feature with text-to-speech"
   ```

4. **Push to your fork**:

   ```bash
   git push origin feature/your-feature-name
   ```

---

## 📥 Submitting a Pull Request (PR)

1. Go to your forked repo on GitHub.
2. Click **Compare & Pull Request**.
3. Fill in details about what you’ve changed or fixed.
4. Submit the PR.
5. Project maintainers will review and provide feedback.

---

## ✅ Contribution Guidelines

* Follow clean coding practices (PEP8 for Python, ESLint for JS).
* Document new functions/classes.
* Add comments for complex logic.
* Write/update tests for your changes.
* Ensure your code runs without errors (`npm start` for frontend, `python manage.py runserver` for backend).

---

⚡ With these steps, anyone can contribute to the project — from **first-time open-source contributors** to experienced developers.


---

## 📜 License

This project is licensed under the **MIT License** – see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

1. DURGESH KUMAR DEWANGAN - 300012723018
2. HRIDYESH KUMAR - 300012723025
3. PRERNA SAKRE - 300012723044
4. ROUNAK GUPTA - 300012723048
5. MAYANK KAUSHIK - 300012723076
6. P OM KUMAR - 300012724301
---

✨ *Together, we aim to make assessments fair, inclusive, and accessible for all learners.*

---
