"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

const topicData = [
  { topic: "Calculus", percent: 85 },
  { topic: "Linear Algebra", percent: 75 },
  { topic: "Statistics", percent: 50 },
]

export default function ProgressTracker() {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-1">
        <CardTitle>Progress Tracker</CardTitle>
        <div className="text-sm text-muted-foreground">Topic Mastery</div>
      </CardHeader>
      <CardContent>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topicData} margin={{ left: 8, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="topic" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="percent" fill="hsl(var(--chart-1))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
