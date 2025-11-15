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
    const { fileContent, fileName, fileType, subject, numQuestions, difficulty, provider = "gemini", timeLimit = 45 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    
    if (provider === "gemini" && !LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }
    
    if (provider === "openai" && !OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    console.log("Analyzing syllabus:", fileName, "Provider:", provider, "Questions:", numQuestions, "Difficulty:", difficulty);

    // For PDFs and Word docs, we'll need to handle base64 content
    let syllabusText = fileContent;
    if (fileType.includes("pdf") || fileType.includes("word")) {
      // In production, you'd parse the file here
      // For now, we'll ask the user to use TXT files or handle this on the client
      syllabusText = "Please note: For best results, convert your syllabus to plain text format.";
    }

    const prompt = `You are an expert educator and assessment creator. Analyze the following ${subject} syllabus and generate ${numQuestions} high-quality questions covering all major topics.

Subject: ${subject}
Syllabus Content:
${syllabusText}

Instructions:
1. Identify all major topics/chapters in the ${subject} syllabus
2. Generate ${numQuestions} ${difficulty} difficulty questions that cover the entire syllabus comprehensively
3. Distribute questions evenly across all topics
4. Each question should be clear, specific, and appropriate for the difficulty level
5. Assign appropriate marks to each question (ranging from 2-10 marks based on complexity)

IMPORTANT: Return ONLY a valid JSON object in this exact format with no additional text:
{
  "subject": "${subject}",
  "topics": ["Topic 1", "Topic 2", ...],
  "questions": [
    {
      "id": "q1",
      "topic": "Topic Name",
      "question": "Question text here",
      "marks": 5
    }
  ],
  "totalMarks": 100,
  "estimatedTime": 60
}`;

    let response;
    
    if (provider === "openai") {
      response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-5-mini-2025-08-07",
          messages: [
            {
              role: "system",
              content: "You are an expert educator. Always respond with valid JSON only, no additional text.",
            },
            { role: "user", content: prompt },
          ],
          max_completion_tokens: 4000,
        }),
      });
    } else {
      response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
              content: "You are an expert educator. Always respond with valid JSON only, no additional text.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
        }),
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log("AI Response:", content);

    // Parse the JSON response
    let parsedData;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      parsedData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("JSON parse error:", parseError, "Content:", content);
      throw new Error("Failed to parse AI response as JSON");
    }

    // Add timeLimit and provider to response
    const responseData = {
      ...parsedData,
      timeLimit,
      provider,
    };

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-syllabus:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
