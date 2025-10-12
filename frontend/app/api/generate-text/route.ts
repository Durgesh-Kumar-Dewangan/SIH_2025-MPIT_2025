import { generateText } from "ai"

export async function POST(req: Request) {
  const { prompt } = await req.json()

  const { text, usage, finishReason } = await generateText({
    model: "openai/gpt-5-mini", // Updated model string
    prompt,
    maxOutputTokens: 2000,
    temperature: 0.7,
    topP: 0.9,
    frequencyPenalty: 0.1,
    presencePenalty: 0.1,
  })

  return Response.json({
    text,
    usage,
    finishReason,
  })
}
