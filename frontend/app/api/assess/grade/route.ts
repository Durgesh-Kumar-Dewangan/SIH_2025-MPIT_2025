import { NextResponse } from "next/server"
import { generateObject } from "ai"
import { z } from "zod"

const GradeSchema = z.object({
  perQuestion: z.array(
    z.object({
      id: z.string(),
      score: z.number().min(0),
      maxPoints: z.number().min(1),
      feedback: z.string(),
      correct: z.boolean().optional(),
      idealSolution: z.string().optional(),
      topic: z.string().optional(),
    }),
  ),
  totalScore: z.number().min(0),
  totalMax: z.number().min(1),
  summary: z.string(),
  solutionsDocument: z.string(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const questions = Array.isArray(body?.questions) ? body.questions : []
    const answers = Array.isArray(body?.answers) ? body.answers : []

    if (!questions.length || !answers.length || questions.length !== answers.length) {
      return NextResponse.json(
        { error: "Questions and answers must be non-empty arrays of equal length." },
        { status: 400 },
      )
    }

    const { object } = await generateObject({
      model: "openai/gpt-5-mini",
      schema: GradeSchema,
      system: [
        "You are an experienced examiner. Grade fairly and consistently using provided metadata (topic, marks, modelSolution, answerKey).",
        "MCQ: full marks only for exact match with answerKey.",
        "Text answers: award partial credit based on modelSolution and question intent; give concise feedback.",
        "Return a clean solutionsDocument with ideal solutions and brief explanations by question.",
      ].join(" "),
      prompt: [
        "Grade the following submission.",
        "Questions JSON (includes topic, marks, optional answerKey/modelSolution):",
        JSON.stringify(questions),
        "Answers JSON (parallel order):",
        JSON.stringify(answers),
        "Return perQuestion, totalScore/totalMax, summary, and solutionsDocument.",
      ].join("\n"),
    })

    return NextResponse.json(object, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to grade assessment" }, { status: 500 })
  }
}
