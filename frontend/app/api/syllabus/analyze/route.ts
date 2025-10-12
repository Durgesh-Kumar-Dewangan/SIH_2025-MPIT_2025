import { z } from "zod"
import { generateObject } from "ai"

const QuestionSchema = z.object({
  id: z.string().describe("Stable unique id for the question"),
  type: z.enum(["mcq", "text"]).describe("Question type: 'mcq' or 'text'"),
  prompt: z.string().min(8).describe("The question prompt"),
  options: z.array(z.string()).optional().describe("MCQ options if type is 'mcq' (4 concise choices)"),
  topic: z.string().optional().describe("Primary topic or chapter for this question"),
  marks: z.number().min(1).max(20).optional().describe("Nominal marks for this question"),
  answerKey: z.string().optional().describe("Correct option text for MCQ (do not reveal to student UI)"),
  modelSolution: z.string().optional().describe("Concise model solution for text questions"),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
})

const ResponseSchema = z.object({
  questions: z.array(QuestionSchema).min(3).max(30),
  topicWeights: z
    .array(
      z.object({
        topic: z.string(),
        weight: z.number().min(0).max(1),
      }),
    )
    .describe("Normalized weights across topics; sum close to 1"),
})

function arrayBufferToBase64(buf: ArrayBuffer) {
  return Buffer.from(buf).toString("base64")
}

export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") || ""
  let syllabusText = ""
  let count = 10
  let difficulty = "medium"

  if (contentType.includes("application/json")) {
    // JSON mode
    try {
      const body = await req.json()
      syllabusText = String(body?.syllabusText || "").trim()
      count = Number(body?.count || 10)
      difficulty = String(body?.difficulty || "medium")
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 })
    }
  } else {
    // Multipart mode (backwards compatible)
    const form = await req.formData()
    const file = form.get("file") as File | null
    const plainText = (form.get("plainText") as string) || ""
    count = Number(form.get("count") || 10)
    difficulty = String(form.get("difficulty") || "medium")

    if (!file && !plainText) {
      return new Response(JSON.stringify({ error: "Missing file or plainText" }), { status: 400 })
    }

    if (plainText) {
      syllabusText = plainText.trim()
    } else if (file) {
      // Best effort: try to read file as text (not all formats will parse). Prefer client-side OCR/text extraction.
      try {
        syllabusText = (await file.text()).trim()
      } catch {
        return new Response(JSON.stringify({ error: "Unsupported file format. Provide plainText via OCR or TXT." }), {
          status: 400,
        })
      }
    }
  }

  if (!syllabusText) {
    return new Response(JSON.stringify({ error: "Empty syllabusText after parsing" }), { status: 400 })
  }

  const prompt = [
    "You read a syllabus and synthesize an exam blueprint.",
    `Create ${count} ${difficulty}-level questions, mixing MCQ and short-text.`,
    "For MCQ, include exactly 4 plausible options and the answerKey.",
    "Add topic and marks per question based on topic importance.",
    "Also return topicWeights (normalized; weights sum close to 1).",
    "Avoid revealing answerKey or modelSolution in student-facing text; keep them in metadata only.",
    "",
    "Syllabus text:",
    syllabusText,
  ].join("\n")

  const { object } = await generateObject({
    model: "openai/gpt-5-mini",
    schema: ResponseSchema,
    prompt,
  })

  return Response.json(object)
}
