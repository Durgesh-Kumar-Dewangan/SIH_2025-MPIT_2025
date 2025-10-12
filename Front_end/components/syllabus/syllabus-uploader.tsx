"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import type { Question } from "@/components/exam/exam-interface"
import Tesseract from "tesseract.js" // add OCR dependency

export default function SyllabusUploader({
  onGenerated,
}: {
  onGenerated: (questions: Question[]) => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [count, setCount] = useState(10)
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<Question[] | null>(null)

  const handleSubmit = async () => {
    setError(null)
    if (!file) {
      setError("Please select a syllabus file (PDF, TXT, DOCX, or image).")
      return
    }
    setLoading(true)
    try {
      const isImage = file.type.startsWith("image/")
      const isTxt = file.type === "text/plain"

      let syllabusText = ""
      if (isImage) {
        const { data } = await Tesseract.recognize(file, "eng")
        syllabusText = (data?.text || "").trim()
        if (!syllabusText) throw new Error("OCR failed to extract text from image.")
      } else if (isTxt) {
        syllabusText = (await file.text()).trim()
      } else {
        try {
          syllabusText = (await file.text()).trim()
        } catch {
          throw new Error("Unsupported file format for client-side parsing. Please upload TXT or an image.")
        }
      }

      const res = await fetch("/api/syllabus/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          syllabusText,
          count,
          difficulty,
        }),
      })
      if (!res.ok) throw new Error("Failed to analyze syllabus")
      const data = await res.json()

      const questions = (data?.questions || []).map((q: any) => ({
        id: q.id,
        type: q.type === "mcq" ? "mcq" : "text",
        prompt: q.prompt,
        options: q.options,
        topic: q.topic,
        marks: q.marks,
        answerKey: q.answerKey,
        modelSolution: q.modelSolution,
      })) as Question[]

      onGenerated(questions)
      setPreview(questions.slice(0, 3))
      try {
        sessionStorage.setItem("generatedQuestions", JSON.stringify(questions))
      } catch {}
    } catch (e: any) {
      setError(e?.message || "Failed to analyze syllabus")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="sr-only">Upload Syllabus</h2>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="syllabus-file">Syllabus File</Label>
          <Input
            id="syllabus-file"
            type="file"
            accept=".pdf,.txt,.doc,.docx,image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            aria-describedby="syllabus-help"
          />
          <p id="syllabus-help" className="text-xs text-muted-foreground">
            Accepted formats: PDF, TXT, DOC, DOCX, Image
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="question-count">Number of Questions</Label>
            <Input
              id="question-count"
              type="number"
              min={3}
              max={30}
              value={count}
              onChange={(e) => setCount(Math.max(3, Math.min(30, Number(e.target.value) || 10)))}
            />
          </div>
          <div className="grid gap-2">
            <Label>Difficulty</Label>
            <Select value={difficulty} onValueChange={(v: any) => setDifficulty(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-2">
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Spinner className="size-4" /> Generating…
              </span>
            ) : (
              "Generate Questions"
            )}
          </Button>
        </div>

        {preview?.length ? (
          <div className="rounded-md border p-3">
            <div className="text-sm font-medium mb-2">Preview (first 3):</div>
            <ol className="list-decimal pl-4 space-y-2">
              {preview.map((q) => (
                <li key={q.id}>
                  <div className="text-sm">{q.prompt}</div>
                  {q.type === "mcq" && q.options?.length ? (
                    <ul className="list-disc pl-4 text-xs mt-1">
                      {q.options.map((o, idx) => (
                        <li key={idx}>{o}</li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
