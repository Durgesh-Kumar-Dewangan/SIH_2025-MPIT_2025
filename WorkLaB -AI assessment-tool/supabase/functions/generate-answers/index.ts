import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { questions, provider = "gemini", subject } = await req.json();

    console.log('Generating answers for:', { provider, subject, numQuestions: questions.length });

    let apiResponse;
    const systemPrompt = `You are an expert educator. Generate comprehensive, well-structured answers for the following exam questions. Each answer should be detailed, accurate, and educational.`;

    const prompt = `Subject: ${subject}

Generate detailed answers for these questions:

${questions.map((q: any, idx: number) => `
Question ${idx + 1} (${q.marks} marks):
${q.question}
Topic: ${q.topic}
`).join('\n')}

Please provide a comprehensive answer for each question. Format the response as JSON with this structure:
{
  "answers": [
    {
      "questionId": "question_id",
      "answer": "detailed answer text"
    }
  ]
}`;

    if (provider === "openai") {
      const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
      if (!OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
      }

      apiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-5-mini-2025-08-07',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          max_completion_tokens: 4000,
        }),
      });
    } else {
      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
      if (!LOVABLE_API_KEY) {
        throw new Error('Lovable API key not configured');
      }

      apiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
        }),
      });
    }

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('AI API error:', apiResponse.status, errorText);
      throw new Error(`AI API request failed: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    const content = data.choices[0].message.content;

    console.log('AI response received');

    let parsedResponse;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Failed to parse AI response as JSON');
    }

    if (!parsedResponse.answers || !Array.isArray(parsedResponse.answers)) {
      throw new Error('Invalid response format from AI');
    }

    return new Response(
      JSON.stringify({
        answers: parsedResponse.answers,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in generate-answers function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});