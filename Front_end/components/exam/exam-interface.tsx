"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export type Question = {
  id: string
  type: "mcq" | "text"
  prompt: string
  options?: string[]
  topic?: string
  marks?: number
  answerKey?: string // not shown to user
  modelSolution?: string // not shown to user
}

const defaultQuestions: Question[] = [
  {
    id: "q1",
    type: "text",
    prompt:
      "Based on your performance, the AI has adapted this question:\nDescribe the applications of integrals in real-world scenarios. Provide an example.",
  },
  {
    id: "q2",
    type: "mcq",
    prompt: "Which of Newton's laws describes inertia?",
    options: ["First", "Second", "Third", "Fourth"],
  },
  {
    id: "q3",
    type: "text",
    prompt: "Explain how the Fundamental Theorem of Calculus connects differentiation and integration.",
  },
  {
    id: "q4",
    type: "mcq",
    prompt: "Evaluate ∫ x dx from 0 to 2.",
    options: ["1", "2", "3", "4"],
  },
]

export default function ExamInterface({
  course,
  initialIndex = 0,
  initialTimeSeconds = 3600,
  onSubmit,
  onExitToDashboard,
  generatedQuestions,
}: {
  course: string
  initialIndex?: number
  initialTimeSeconds?: number
  onSubmit: (answers: Record<string, string>, questions: Question[]) => void
  onExitToDashboard: () => void
  generatedQuestions?: Question[]
}) {
  const [qs, setQs] = useState<Question[]>(() => (generatedQuestions?.length ? generatedQuestions : defaultQuestions))
  useEffect(() => {
    if (generatedQuestions?.length) setQs(generatedQuestions)
  }, [generatedQuestions])

  const [index, setIndex] = useState(initialIndex)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [secondsLeft, setSecondsLeft] = useState(initialTimeSeconds)
  const [voiceToText, setVoiceToText] = useState(false)
  const [textToSpeech, setTextToSpeech] = useState(false)
  const [adapting, setAdapting] = useState(false)

  const recognitionRef = useRef<any>(null)
  const q = qs[index % qs.length]

  useEffect(() => {
    const timer = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(timer)
  }, [])

  const timeStr = useMemo(() => {
    const h = Math.floor(secondsLeft / 3600)
    const m = Math.floor((secondsLeft % 3600) / 60)
    const s = secondsLeft % 60
    const pad = (n: number) => n.toString().padStart(2, "0")
    return `${h}:${pad(m)}:${pad(s)}`
  }, [secondsLeft])

  useEffect(() => {
    if (!textToSpeech) return
    if (typeof window === "undefined") return
    const synth = window.speechSynthesis
    if (!synth) return
    const utter = new SpeechSynthesisUtterance(q.prompt)
    synth.cancel()
    synth.speak(utter)
  }, [q.prompt, textToSpeech])

  useEffect(() => {
    const WSR: any = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    if (!voiceToText || !WSR) return

    const rec = new WSR()
    rec.continuous = true
    rec.interimResults = true
    recognitionRef.current = rec

    rec.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join(" ")
      setAnswers((prev) => ({
        ...prev,
        [q.id]: (prev[q.id] || "") + " " + transcript,
      }))
    }
    rec.onerror = () => {
      setVoiceToText(false)
    }
    rec.onend = () => {
      setVoiceToText(false)
    }

    rec.start()
    return () => rec.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceToText])

  const setAnswer = (value: string) => {
    setAnswers((prev) => ({ ...prev, [q.id]: value }))
  }

  const adaptQuestion = async () => {
    setAdapting(true)
    try {
      const res = await fetch("/api/generate-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `You are an exam engine for ${course}. Current question: "${q.prompt}"
Student shows weakness in Statistics; simplify or adjust difficulty and return ONLY the new question text.`,
        }),
      })
      const data = await res.json()
      const newPrompt = (data?.text || "").trim()
      if (newPrompt) {
        setQs((prev) => {
          const next = [...prev]
          const idx = index % prev.length
          next[idx] = { ...prev[idx], prompt: newPrompt }
          return next
        })
      }
    } finally {
      setAdapting(false)
    }
  }

  return (
    <div className="grid gap-4">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="sr-only">Online Exam Interface</h2>
          <p className="text-muted-foreground">{course}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">
            Question {index + 1} of {qs.length}
          </div>
          <div className="text-lg font-medium">{timeStr}</div>
        </div>
      </header>

      <Card>
        <CardHeader>
          <h3 className="sr-only">Question</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="whitespace-pre-wrap">{q.prompt}</p>

          {q.type === "mcq" ? (
            <div className="grid gap-2">
              {q.options?.map((opt) => (
                <label key={opt} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={q.id}
                    className="size-4"
                    checked={answers[q.id] === opt}
                    onChange={() => setAnswer(opt)}
                    aria-label={opt}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          ) : (
            <textarea
              className="w-full min-h-40 rounded-md border bg-background p-3"
              placeholder="Type your answer..."
              value={answers[q.id] || ""}
              onChange={(e) => setAnswer(e.target.value)}
              aria-label="Answer text"
            />
          )}

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={() => setVoiceToText((v) => !v)} aria-pressed={voiceToText}>
              {voiceToText ? "Voice-to-Text: On" : "Voice-to-Text: Off"}
            </Button>
            <Button variant="secondary" onClick={() => setTextToSpeech((v) => !v)} aria-pressed={textToSpeech}>
              {textToSpeech ? "Text-to-Speech: On" : "Text-to-Speech: Off"}
            </Button>
            <Button variant="outline" onClick={adaptQuestion} disabled={adapting}>
              {adapting ? "Adapting..." : "Adapt Question (AI)"}
            </Button>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button variant="outline" onClick={() => setIndex((i) => Math.max(0, i - 1))}>
              Previous
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={onExitToDashboard}>
                Exit
              </Button>
              <Button onClick={() => setIndex((i) => Math.min(qs.length - 1, i + 1))}>Next</Button>
              <Button variant="default" onClick={() => onSubmit(answers, qs)}>
                Submit Assessment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
