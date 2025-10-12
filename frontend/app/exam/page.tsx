"use client"

import React from "react"
import ExamInterface, { type Question } from "@/components/exam/exam-interface"
import AssessmentComplete from "@/components/assessment/assessment-complete"

type GradeResult = {
  perQuestion: { id: string; score: number; maxPoints: number; feedback: string; topic?: string }[]
  totalScore: number
  totalMax: number
  summary: string
  solutionsDocument: string
}

export default function ExamPage() {
  const [qs, setQs] = React.useState<Question[] | null>(null)
  const [mode, setMode] = React.useState<"exam" | "complete">("exam")
  const [grade, setGrade] = React.useState<GradeResult | null>(null)

  React.useEffect(() => {
    try {
      const raw = sessionStorage.getItem("generatedQuestions")
      if (raw) setQs(JSON.parse(raw) as Question[])
    } catch {}
  }, [])

  async function handleSubmit(answersMap: Record<string, string>, questions: Question[]) {
    const orderedAnswers = questions.map((q) => answersMap[q.id] || "")
    try {
      const res = await fetch("/api/assess/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions, answers: orderedAnswers }),
      })
      if (!res.ok) throw new Error("Failed to grade assessment")
      const data = (await res.json()) as GradeResult
      setGrade(data)
      setMode("complete")
    } catch (e) {
      // fallback: show completion with approximate score
      const totalMax = questions.reduce((s, q) => s + (q.marks || 5), 0)
      setGrade({
        perQuestion: questions.map((q) => ({
          id: q.id,
          score: 0,
          maxPoints: q.marks || 5,
          feedback: "Grading failed. Please retry.",
          topic: q.topic,
        })),
        totalScore: 0,
        totalMax,
        summary: "Grading failed.",
        solutionsDocument: "",
      })
      setMode("complete")
    }
  }

  function topicPercentsFromGrade(g: GradeResult, questions: Question[]) {
    const totals = new Map<string, { score: number; max: number }>()
    g.perQuestion.forEach((pq) => {
      const topic = pq.topic || "General"
      const t = totals.get(topic) || { score: 0, max: 0 }
      t.score += pq.score
      t.max += pq.maxPoints
      totals.set(topic, t)
    })
    // if no topics in grade, fallback to question metadata
    if (!totals.size) {
      questions.forEach((q) => {
        const topic = q.topic || "General"
        const t = totals.get(topic) || { score: 0, max: 0 }
        t.max += q.marks || 5
        totals.set(topic, t)
      })
    }
    return Array.from(totals.entries()).map(([topic, v]) => ({
      topic,
      percent: Math.round(v.max ? (100 * v.score) / v.max : 0),
    }))
  }

  if (mode === "complete" && grade) {
    const overall = Math.round((100 * grade.totalScore) / (grade.totalMax || 1))
    const topics = topicPercentsFromGrade(grade, qs || [])
    return (
      <main className="container mx-auto p-4">
        <AssessmentComplete
          course="Mathematics II - Calculus"
          overallScore={overall}
          topicScores={topics}
          solutionsDocument={grade.solutionsDocument}
          perQuestion={grade.perQuestion}
          onBackToDashboard={() => (window.location.href = "/")}
        />
      </main>
    )
  }

  return (
    <main className="container mx-auto p-4">
      <ExamInterface
        course="Mathematics II - Calculus"
        generatedQuestions={qs || undefined}
        onSubmit={handleSubmit}
        onExitToDashboard={() => (window.location.href = "/")}
      />
    </main>
  )
}
