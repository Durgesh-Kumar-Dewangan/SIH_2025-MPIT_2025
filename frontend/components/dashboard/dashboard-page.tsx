"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Sidebar from "./sidebar"
import UpcomingAssessmentCard from "./upcoming-assessment-card"
import ProgressTracker from "./progress-tracker"
import RecentResults from "./recent-results"
import ExamInterface from "@/components/exam/exam-interface"
import AssessmentComplete from "@/components/assessment/assessment-complete"
import SyllabusUploader from "@/components/syllabus/syllabus-uploader"
import type { Question } from "@/components/exam/exam-interface"

type Mode = "dashboard" | "exam" | "complete"

export default function DashboardPage() {
  const [mode, setMode] = useState<Mode>("dashboard")
  const [aiInsight, setAiInsight] = useState<string>("AI-powered insights: Focus on module 3")
  const [highContrast, setHighContrast] = useState(false)
  const [bigText, setBigText] = useState(false)
  const [dyslexia, setDyslexia] = useState(false)
  const [genQuestions, setGenQuestions] = useState<Question[] | null>(null)

  // Persist and apply accessibility classes to <html>
  useEffect(() => {
    const root = document.documentElement
    if (highContrast) root.classList.add("high-contrast")
    else root.classList.remove("high-contrast")

    if (bigText) root.classList.add("text-scale-lg")
    else root.classList.remove("text-scale-lg")

    if (dyslexia) root.classList.add("dyslexia-friendly")
    else root.classList.remove("dyslexia-friendly")
  }, [highContrast, bigText, dyslexia])

  const handleGenerateInsights = async () => {
    try {
      const prompt = `You are tutoring a student in Mathematics II (Calculus).
Strengths: Algebra, Geometry. Weaknesses: Probability, Statistics.
Provide one concise, practical insight focusing on Module 3 (applications of integrals), and a single actionable tip.`
      const res = await fetch("/api/generate-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })
      const data = await res.json()
      setAiInsight(data?.text?.trim() || "Focus on Module 3: Applications of Integrals with real-world examples.")
    } catch {
      setAiInsight("Focus on Module 3: Applications of Integrals with real-world examples.")
    }
  }

  return (
    <div className="min-h-dvh">
      <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-[240px_1fr]">
        <aside className="border-r bg-transparent">
          <div className="sr-only">Sidebar</div>
          <Sidebar onStartExam={() => setMode("exam")} onShowDashboard={() => setMode("dashboard")} />
        </aside>

        <main className="p-4 md:p-6">
          {mode === "dashboard" && (
            <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-3">
              <div className="lg:col-span-2 grid gap-4">
                <header className="flex items-center justify-between">
                  <div>
                    {/* sr-only heading for accessibility while removing visual clutter */}
                    <h1 className="sr-only">Student Dashboard</h1>
                    <p className="text-muted-foreground">Mathematics II - Calculus • Due Oct 26, 2023</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" onClick={() => setHighContrast((v) => !v)} aria-pressed={highContrast}>
                      {highContrast ? "Color Scheme: High Contrast" : "Color Scheme: Standard"}
                    </Button>
                    <Button variant="secondary" onClick={() => setBigText((v) => !v)} aria-pressed={bigText}>
                      {bigText ? "Font Size: Large" : "Font Size: Normal"}
                    </Button>
                    <Button variant="secondary" onClick={() => setDyslexia((v) => !v)} aria-pressed={dyslexia}>
                      {dyslexia ? "Dyslexia Font: On" : "Dyslexia Font: Off"}
                    </Button>
                  </div>
                </header>

                <div className="grid gap-4 sm:grid-cols-2">
                  <UpcomingAssessmentCard />
                  <Card>
                    <CardHeader>
                      <h2 className="sr-only">AI-powered Insights</h2>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                      <p className="text-pretty">{aiInsight}</p>
                      <div className="flex gap-2">
                        <Button onClick={handleGenerateInsights}>Generate Insights</Button>
                        <Button variant="outline" onClick={() => setMode("exam")}>
                          Start Exam
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <SyllabusUploader
                  onGenerated={(qs) => {
                    setGenQuestions(qs)
                    // Optionally navigate to exam automatically:
                    // setMode("exam")
                  }}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <ProgressTracker />
                  <RecentResults />
                </div>
              </div>

              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <h2 className="sr-only">Topic Mastery</h2>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm leading-6">
                      <li className="flex items-center justify-between">
                        <span>Calculus</span>
                        <span className="font-medium">85%</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>Linear Algebra</span>
                        <span className="font-medium">75%</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>Statistics</span>
                        <span className="font-medium">50%</span>
                      </li>
                    </ul>
                    <div className="mt-4">
                      <Button className="w-full bg-transparent" variant="outline" onClick={() => setMode("exam")}>
                        Continue Online Exam
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {mode === "exam" && (
            <ExamInterface
              course="Mathematics II - Calculus"
              initialIndex={3}
              initialTimeSeconds={5025} // 1:23:45
              onSubmit={() => setMode("complete")}
              onExitToDashboard={() => setMode("dashboard")}
              generatedQuestions={genQuestions || undefined} // pass generated questions
            />
          )}

          {mode === "complete" && (
            <AssessmentComplete
              course="Mathematics II"
              overallScore={78}
              topicScores={[
                { topic: "Calculus", percent: 85 },
                { topic: "Linear Algebra", percent: 75 },
                { topic: "Statistics", percent: 50 },
              ]}
              onBackToDashboard={() => setMode("dashboard")}
            />
          )}
        </main>
      </div>
    </div>
  )
}
