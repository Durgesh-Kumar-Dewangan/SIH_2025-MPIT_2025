import { NextResponse } from "next/server"
import { z } from "zod"
import { generateObject } from "ai"

const QuestionSchema = z.object({
  id: z.string(),
  topic: z.string(),
  prompt: z.string(),
  type: z.enum(["mcq", "short", "long"]).default("short"),
  options: z.array(z.string()).optional(),
  answerKey: z.string().optional(),
  marks: z.number().int().min(1).max(20),
})

const TopicPlanSchema = z.object({
  name: z.string(),
  weight: z.number().min(0).max(1),
  questions: z.array(QuestionSchema),
})

const PlanSchema = z.object({
  topics: z.array(TopicPlanSchema).min(1),
  totalQuestions: z.number().int().min(1),
  notes: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { syllabusText, topics, targetCount = 10, difficulty = "medium", subject = "General" } = body || {}

    if (!syllabusText && (!topics || topics.length === 0)) {
      return NextResponse.json({ error: "Provide syllabusText or topics[]" }, { status: 400 })
    }

    const userTopics = Array.isArray(topics) && topics.length > 0 ? topics : undefined

    const { object } = await generateObject({
      model: "openai/gpt-5-mini",
      schema: PlanSchema,
      system:
        "You are an expert exam setter. Read the syllabus/curriculum and produce a balanced plan: topics with weights in [0,1] summing ~1. Then generate well-formed questions per topic. Prefer concise, unambiguous phrasing. Calibrate difficulty.",
      prompt: `
Subject: ${subject}
Target Question Count: ${targetCount}
Requested Difficulty: ${difficulty}

Syllabus/Curriculum (raw or OCR):
"""${syllabusText || ""}"""

${
  userTopics
    ? `User-provided topic hints:
${userTopics.map((t: string, i: number) => `${i + 1}. ${t}`).join("\n")}`
    : "No explicit topic hints provided. Infer topics from the syllabus."
}

Requirements:
- Weight per topic in [0,1] and weights should roughly sum to 1.
- Allocate questions across topics proportional to weight (ceil/floor as needed).
- Include question type (mcq/short/long). For MCQs, include 3-5 options and set answerKey.
- Each question must include a marks value (1-20). Total marks proportional to weight is preferred.
- Avoid duplicate questions/titles; no superfluous section headers.
- Keep prompts precise. Avoid editorial commentary.
- totalQuestions should equal the number of generated questions.
      `,
    })

    return NextResponse.json(object, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Failed to iterate curriculum" }, { status: 500 })
  }
}
