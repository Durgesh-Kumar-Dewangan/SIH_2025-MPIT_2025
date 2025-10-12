// db.js
const path = require('path');
const Database = require('better-sqlite3');
const db = new Database(path.join(__dirname, 'data.sqlite'));

module.exports = {
  // initialize will be a no-op if tables already exist
  init: function () {
    db.exec(`
      CREATE TABLE IF NOT EXISTS questions (
        id TEXT PRIMARY KEY,
        topic TEXT,
        prompt TEXT,
        type TEXT,
        options TEXT,
        answerKey TEXT,
        modelSolution TEXT,
        marks INTEGER DEFAULT 1,
        difficulty TEXT DEFAULT 'medium',
        createdAt INTEGER DEFAULT (strftime('%s','now'))
      );
      CREATE TABLE IF NOT EXISTS attempts (
        attemptId TEXT PRIMARY KEY,
        userId TEXT,
        questionId TEXT,
        timestamp INTEGER,
        timeSpentSeconds INTEGER,
        correct INTEGER,
        marksObtained INTEGER
      );
    `);
  },

  insertQuestion: function (q) {
    this.init();
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO questions (id, topic, prompt, type, options, answerKey, modelSolution, marks, difficulty)
      VALUES (@id,@topic,@prompt,@type,@options,@answerKey,@modelSolution,@marks,@difficulty)
    `);
    stmt.run({
      id: q.id,
      topic: q.topic,
      prompt: q.prompt,
      type: q.type,
      options: q.options,
      answerKey: q.answerKey,
      modelSolution: q.modelSolution,
      marks: q.marks,
      difficulty: q.difficulty
    });
  },

  getQuestion: function (id) {
    this.init();
    const row = db.prepare('SELECT * FROM questions WHERE id = ?').get(id);
    if (!row) return null;
    // options stored as JSON string; leave to caller to parse
    return row;
  },

  insertAttempt: function (a) {
    this.init();
    const stmt = db.prepare(`
      INSERT INTO attempts (attemptId, userId, questionId, timestamp, timeSpentSeconds, correct, marksObtained)
      VALUES (@attemptId,@userId,@questionId,@timestamp,@timeSpentSeconds,@correct,@marksObtained)
    `);
    stmt.run({
      attemptId: a.attemptId,
      userId: a.userId,
      questionId: a.questionId,
      timestamp: a.timestamp || Date.now(),
      timeSpentSeconds: a.timeSpentSeconds || 0,
      correct: a.correct ? 1 : 0,
      marksObtained: a.marksObtained || 0
    });
  },

  getAttemptsByUser: function (userId) {
    this.init();
    const rows = db.prepare('SELECT * FROM attempts WHERE userId = ? ORDER BY timestamp DESC').all(userId);
    return rows;
  }
};
