/**
 * server.js
 * Single-file backend that:
 *  - serves static frontend from FRONTEND_BUILD_DIR
 *  - exposes API endpoints for syllabus analysis, question generation, grading and progress tracking
 *
 * Make sure to run: npm install
 * Then initialize DB: npm run init-db
 * Then run: npm start
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');
const { v4: uuidv4 } = require('uuid');
const DB = require('./db');

const PORT = process.env.PORT || 4000;
const OPENAI_KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const FRONTEND_DIR = process.env.FRONTEND_BUILD_DIR || './frontend_build';

if (!OPENAI_KEY) {
  console.warn('WARNING: OPENAI_API_KEY not set. Syllabus generation endpoints will fail until you provide a key in .env');
}

const openai = new OpenAI({ apiKey: OPENAI_KEY });

const app = express();
app.use(cors());
app.use(express.json({ limit: '4mb' }));
app.use(express.urlencoded({ extended: true, limit: '4mb' }));
app.use(fileUpload());

// Serve frontend static
if (fs.existsSync(FRONTEND_DIR)) {
  app.use(express.static(FRONTEND_DIR));
  app.get('*', (req, res, next) => {
    const indexHtml = path.join(FRONTEND_DIR, 'index.html');
    if (fs.existsSync(indexHtml)) return res.sendFile(indexHtml);
    next();
  });
} else {
  console.warn(`[server] frontend build dir "${FRONTEND_DIR}" not found. Only APIs will work.`);
}

// ---- Utility: call OpenAI to generate structured JSON ----
async function callOpenAIForQuestions(systemPrompt, userPrompt, temperature = 0.2, maxTokens = 1500) {
  if (!OPENAI_KEY) throw new Error('OPENAI_API_KEY not configured.');

  // We instruct the model to return JSON strictly following a schema.
  const prompt = `
System instruction:
${systemPrompt}

User instruction:
${userPrompt}

Return ONLY valid JSON. JSON root must be an object with:
{
  "questions": [ { "id","type","prompt","options"(if mcq),"answerKey"(internal), "modelSolution","topic","marks","difficulty" } ],
  "topicWeights": [ { "topic","weight" } ]
}
Ensure difficulties are one of: "easy","medium","hard". Options for mcq must be 4 strings. Use short unique ids for questions.
No extra text.
`;

  // Using Chat Completions (the new openai.chat API)
  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature,
    max_tokens: maxTokens
  });

  const raw = completion.choices?.[0]?.message?.content ?? '';
  // Try parse JSON
  try {
    const parsed = JSON.parse(raw);
    return { raw, parsed };
  } catch (err) {
    // If parsing fails, attempt to extract JSON block
    const m = raw.match(/\{[\s\S]*\}$/);
    if (m) {
      try {
        return { raw, parsed: JSON.parse(m[0]) };
      } catch (err2) {
        throw new Error('OpenAI returned invalid JSON and it could not be parsed.');
      }
    }
    throw new Error('OpenAI returned non-JSON response: ' + raw.slice(0, 500));
  }
}

// ---- Endpoint: Analyze syllabus & produce questions ----
app.post('/api/syllabus/analyze', async (req, res) => {
  /**
   * Accepts JSON body:
   * { syllabusText: string, count: number, difficulty: "easy"|"medium"|"hard"|"mixed", userTopics: [string], userId: string(optional) }
   *
   * Or accepts multipart form-data with file (text/pdf) under "file" and plainText field.
   */
  try {
    let syllabusText = '';
    let count = Number(req.body.count || 10);
    let difficulty = req.body.difficulty || 'medium';
    const userTopics = req.body.userTopics ? JSON.parse(req.body.userTopics) : null;

    if (req.files && req.files.file) {
      // If a file is uploaded, try to read text if it's a .txt. For pdf/others we simply return error for now.
      const file = req.files.file;
      const originalName = file.name || '';
      if (originalName.endsWith('.txt')) {
        syllabusText = file.data.toString('utf8');
      } else {
        // Note: PDF OCR is not implemented in this single-file backend. The frontend can send plainText extracted.
        return res.status(400).json({ error: 'Only .txt file uploads are supported by this backend. For PDFs: extract plain text on client and send as plainText.' });
      }
    } else {
      syllabusText = String(req.body.syllabusText || req.body.plainText || '').trim();
    }

    if (!syllabusText || syllabusText.length < 30) {
      return res.status(400).json({ error: 'Provide syllabusText (plain text) with at least ~30 characters.' });
    }

    // Build prompts and system instruction
    const systemPrompt = `You are an expert question writer and curriculum analyst for college-level courses.
You will produce a JSON object with questions and topicWeights. Each question must have:
- id: stable unique id
- type: "mcq" or "text"
- prompt: the question text
- options: if mcq, exactly array of 4 option strings
- answerKey: for mcq, exact option text that is correct (DO NOT send this to student UI)
- modelSolution: concise model solution for text questions or explanation (1-3 sentences)
- topic: inferred topic/chapter
- marks: integer 1..20
- difficulty: "easy" | "medium" | "hard".
The JSON root must be: { "questions": [...], "topicWeights": [{ "topic", "weight" }] } and nothing else (no preamble).`;

    const userPrompt = `Syllabus (raw):
"""${syllabusText}"""

Generate approximately ${count} questions. Target difficulty: ${difficulty}. If "mixed" distribute evenly across difficulties.
Also infer topics and topic weights. Make sure total topic weights roughly sum to 1.
Return strictly valid JSON as described.`;

    const { parsed } = await callOpenAIForQuestions(systemPrompt, userPrompt, 0.2, 1500);

    // Optionally persist generated questions to questions table (if desired)
    const generatedQuestions = parsed.questions || [];
    // insert into DB as template questions
    for (const q of generatedQuestions) {
      const qid = q.id || uuidv4();
      DB.insertQuestion({
        id: qid,
        topic: q.topic || 'General',
        prompt: q.prompt,
        type: q.type,
        options: q.options ? JSON.stringify(q.options) : null,
        answerKey: q.answerKey || null,
        modelSolution: q.modelSolution || null,
        marks: q.marks || 1,
        difficulty: q.difficulty || 'medium'
      });
    }

    return res.json({ ok: true, generated: parsed });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || String(err) });
  }
});

// ---- Endpoint: generate single/batch questions (wrapper) ----
app.post('/api/questions/generate', async (req, res) => {
  // Body: { topic, count, difficulty }
  try {
    const topic = req.body.topic || 'General';
    const count = Number(req.body.count || 5);
    const difficulty = req.body.difficulty || 'medium';

    const systemPrompt = `You are a question generator. Output JSON only.`;
    const userPrompt = `Generate ${count} questions about "${topic}" with difficulty ${difficulty}. Format as described earlier.`;

    const { parsed } = await callOpenAIForQuestions(systemPrompt, userPrompt, 0.2, 800);

    // Insert into DB
    for (const q of parsed.questions || []) {
      const qid = q.id || uuidv4();
      DB.insertQuestion({
        id: qid,
        topic: q.topic || topic,
        prompt: q.prompt,
        type: q.type,
        options: q.options ? JSON.stringify(q.options) : null,
        answerKey: q.answerKey || null,
        modelSolution: q.modelSolution || null,
        marks: q.marks || 1,
        difficulty: q.difficulty || 'medium'
      });
    }

    return res.json({ ok: true, generated: parsed });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

// ---- Endpoint: Grade an answer (very basic) ----
app.post('/api/assess/grade', async (req, res) => {
  /**
   * Body: { questionId, userId, answerText, timeSpentSeconds }
   * For MCQ we compare answerText to stored answerKey. For text we use a short openai-based similarity grader.
   */
  try {
    const { questionId, userId, answerText, timeSpentSeconds } = req.body;
    if (!questionId || !userId) return res.status(400).json({ error: 'questionId and userId required' });

    const question = DB.getQuestion(questionId);
    if (!question) return res.status(404).json({ error: 'question not found' });

    let correct = false;
    let awardedMarks = 0;
    const maxMarks = question.marks || 1;

    if (question.type === 'mcq') {
      // answerText should be the selected option text or index. Normalize.
      const answerKey = question.answerKey;
      if (!answerKey) {
        // fallback: grade by comparing option index
        correct = String(answerText).trim() === String(question.options?.[0] || '').trim();
      } else {
        correct = String(answerText).trim().toLowerCase() === String(answerKey).trim().toLowerCase();
      }
      awardedMarks = correct ? maxMarks : 0;
    } else {
      // For text question: call evaluate with openai to give a score 0..maxMarks based on model solution
      const modelSolution = question.modelSolution || '';
      if (!OPENAI_KEY) {
        // fallback: naive string compare
        const sim = modelSolution && answerText && modelSolution.toLowerCase().split(' ').filter(Boolean).length > 0 &&
          answerText.toLowerCase().includes(modelSolution.split(' ')[0]);
        awardedMarks = sim ? Math.round(maxMarks * 0.6) : 0;
        correct = awardedMarks > 0;
      } else {
        // call OpenAI to grade briefly
        const prompt = `You are an objective grader. Model solution:
"""${modelSolution}"""

Student answer:
"""${answerText}"""

Rate the answer between 0 and ${maxMarks} (integer). Return JSON: {"score": <int>, "comment":"one-line comment"} and nothing else.`;
        const completion = await openai.chat.completions.create({
          model: MODEL,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.0,
          max_tokens: 200
        });
        const raw = completion.choices?.[0]?.message?.content || '';
        try {
          const j = JSON.parse(raw);
          awardedMarks = Number(j.score || 0);
          correct = awardedMarks > 0;
        } catch (err) {
          // fallback
          awardedMarks = 0;
          correct = false;
        }
      }
    }

    // record attempt
    const attempt = {
      attemptId: uuidv4(),
      userId: String(userId),
      questionId,
      timestamp: Date.now(),
      timeSpentSeconds: Number(timeSpentSeconds || 0),
      correct: correct ? 1 : 0,
      marksObtained: awardedMarks
    };
    DB.insertAttempt(attempt);

    return res.json({ ok: true, correct: !!correct, awardedMarks });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: String(err) });
  }
});

// ---- Endpoint: record attempt manually ----
app.post('/api/progress/attempt', (req, res) => {
  /**
   * Body: { userId, questionId, timeSpentSeconds, correct (0|1), marksObtained }
   */
  try {
    const { userId, questionId } = req.body;
    if (!userId || !questionId) return res.status(400).json({ error: 'userId and questionId required' });
    const attempt = {
      attemptId: uuidv4(),
      userId: String(userId),
      questionId,
      timestamp: Date.now(),
      timeSpentSeconds: Number(req.body.timeSpentSeconds || 0),
      correct: req.body.correct ? 1 : 0,
      marksObtained: Number(req.body.marksObtained || 0)
    };
    DB.insertAttempt(attempt);
    return res.json({ ok: true, attempt });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: String(err) });
  }
});

// ---- Endpoint: get progress for a user (aggregated) ----
app.get('/api/progress/user/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    const attempts = DB.getAttemptsByUser(userId);

    // Aggregate metrics: totalTime, totalAttempts, accuracy, totalMarks, avgTimePerQuestion, attemptsPerQuestion map
    const totalAttempts = attempts.length;
    const totalTime = attempts.reduce((s, a) => s + (a.timeSpentSeconds || 0), 0);
    const totalCorrect = attempts.reduce((s, a) => s + (a.correct || 0), 0);
    const totalMarks = attempts.reduce((s, a) => s + (a.marksObtained || 0), 0);
    const accuracy = totalAttempts ? (totalCorrect / totalAttempts) : 0;

    // per-question stats
    const perQuestion = {};
    for (const a of attempts) {
      const qid = a.questionId;
      perQuestion[qid] = perQuestion[qid] || { attempts: 0, correct: 0, totalTime: 0, marks: 0 };
      perQuestion[qid].attempts += 1;
      perQuestion[qid].correct += Number(a.correct || 0);
      perQuestion[qid].totalTime += Number(a.timeSpentSeconds || 0);
      perQuestion[qid].marks += Number(a.marksObtained || 0);
    }

    // add question prompts to perQuestion
    const enriched = [];
    for (const [qid, stats] of Object.entries(perQuestion)) {
      const q = DB.getQuestion(qid);
      enriched.push({
        questionId: qid,
        prompt: q ? q.prompt : null,
        topic: q ? q.topic : null,
        difficulty: q ? q.difficulty : null,
        attempts: stats.attempts,
        correct: stats.correct,
        accuracy: stats.attempts ? (stats.correct / stats.attempts) : 0,
        avgTimeSeconds: stats.attempts ? (stats.totalTime / stats.attempts) : 0,
        totalMarks: stats.marks
      });
    }

    return res.json({
      userId,
      totalAttempts,
      totalTime,
      totalMarks,
      accuracy,
      perQuestion: enriched
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: String(err) });
  }
});

// ---- helpful: get question by id ----
app.get('/api/questions/:id', (req, res) => {
  const q = DB.getQuestion(req.params.id);
  if (!q) return res.status(404).json({ error: 'not found' });
  // convert options JSON string back to array
  if (q.options) {
    try { q.options = JSON.parse(q.options); } catch(e){}
  }
  // hide answerKey when returning to student UI (unless admin param)
  const hide = req.query.admin ? false : true;
  if (hide) delete q.answerKey;
  return res.json({ ok: true, question: q });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
