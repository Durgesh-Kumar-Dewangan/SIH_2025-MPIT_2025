import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { questions, answers, totalMarks } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Evaluating answers for", questions.length, "questions");

    // Build the evaluation prompt
    const questionsAndAnswers = questions.map((q: any, idx: number) => {
      const userAnswer = answers.find((a: any) => a.questionId === q.id);
      return `
Question ${idx + 1} (${q.marks} marks) - Topic: ${q.topic}
${q.question}

Student's Answer:
${userAnswer?.answer || "Not answered"}
${userAnswer?.hasFile ? "(File uploaded)" : ""}
`;
    }).join("\n---\n");

    const prompt = `You are an expert examiner evaluating student answers. Analyze each answer carefully and provide detailed feedback.

Questions and Student Answers:
${questionsAndAnswers}

Total Marks: ${totalMarks}

Instructions:
1. Evaluate each answer based on accuracy, completeness, and understanding
2. Award appropriate marks (can be partial marks)
3. Provide constructive feedback for each answer
4. For EACH question, provide a comprehensive model answer that demonstrates the ideal response students can learn from
5. Calculate total score and percentage
6. Assign a grade (A+, A, B, C, D, F)
7. Identify 3-5 key strengths and 3-5 areas for improvement
8. Provide overall feedback

IMPORTANT: Return ONLY a valid JSON object in this exact format with no additional text:
{
  "totalScore": 85,
  "totalMarks": ${totalMarks},
  "percentage": 85.0,
  "grade": "A",
  "overallFeedback": "Overall performance summary...",
  "strengths": ["Strength 1", "Strength 2", ...],
  "weaknesses": ["Area 1", "Area 2", ...],
  "questionResults": [
    {
      "question": "Question text",
      "topic": "Topic name",
      "marks": 10,
      "userAnswer": "Student answer",
      "score": 8,
      "feedback": "Detailed feedback",
      "modelAnswer": "Comprehensive ideal answer that covers all key points and demonstrates mastery of the topic. This should be a complete, well-structured answer that students can learn from."
    }
  ]
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are an expert examiner. Always respond with valid JSON only, no additional text. Be fair, constructive, and detailed in your evaluation. Always provide comprehensive model answers for students to learn from.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log("AI Evaluation Response:", content);

    // Parse the JSON response
    let parsedData;
    try {
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      parsedData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("JSON parse error:", parseError, "Content:", content);
      throw new Error("Failed to parse AI response as JSON");
    }

    return new Response(
      JSON.stringify({ results: parsedData }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in evaluate-answers:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
