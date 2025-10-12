"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

export default function AssessmentComplete({
  course,
  overallScore,
  topicScores,
  onBackToDashboard,
  solutionsDocument,
  perQuestion,
}: {
  course: string
  overallScore: number
  topicScores: { topic: string; percent: number }[]
  onBackToDashboard: () => void
  solutionsDocument?: string
  perQuestion?: { id: string; score: number; maxPoints: number; feedback: string; topic?: string }[]
}) {
  const pieData = [
    { name: "Correct", value: overallScore },
    { name: "Remaining", value: 100 - overallScore },
  ]
  const colors = ["hsl(var(--chart-2))", "hsl(var(--muted))"]

  return (
    <div className="grid gap-4">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="sr-only">Assessment Complete</h2>
          <p className="text-muted-foreground">
            Overall Proficiency - {overallScore}% • {course}
          </p>
        </div>
        <Button variant="outline" onClick={onBackToDashboard}>
          Back to Dashboard
        </Button>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <h3 className="sr-only">Overall Score</h3>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip />
                <Legend />
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  label
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={colors[i % colors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="sr-only">Scores by Topic</h3>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {topicScores.map((t) => (
                <li key={t.topic} className="text-sm">
                  <div className="flex items-center justify-between">
                    <span>{t.topic}</span>
                    <span className="font-medium">{t.percent}%</span>
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${t.percent}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Per-Question Feedback */}
      {perQuestion?.length ? (
        <Card>
          <CardHeader>
            <h3 className="sr-only">Per-Question Feedback</h3>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {perQuestion.map((pq) => (
              <div key={pq.id} className="rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Question {pq.id}</span>
                  <span>
                    {pq.score}/{pq.maxPoints}
                  </span>
                </div>
                {pq.topic ? <div className="text-xs text-muted-foreground mt-1">Topic: {pq.topic}</div> : null}
                <div className="mt-2">{pq.feedback}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {/* Solutions Document */}
      {solutionsDocument ? (
        <Card>
          <CardHeader>
            <h3 className="sr-only">Solutions</h3>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm">{solutionsDocument}</pre>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <h3 className="sr-only">AI Recommendation</h3>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>Strengths: Excellent grasp of integration.</p>
          <p>Areas for practice: Statistical analysis.</p>
          <p>AI Recommendation: Personalized practice module on Probability Theory has been added to your dashboard.</p>
        </CardContent>
      </Card>
    </div>
  )
}
