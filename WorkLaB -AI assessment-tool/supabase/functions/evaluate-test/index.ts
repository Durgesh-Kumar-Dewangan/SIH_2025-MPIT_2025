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
    const { paper, answers, totalMarks } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Format answers for evaluation
    const answersText = Object.entries(answers)
      .map(([key, value]) => `Question ${key.replace('q', '')}: ${value}`)
      .join('\n\n');

    const prompt = `You are an expert evaluator. Evaluate the following student answers based on the question paper provided.

Question Paper:
${paper}

Student Answers:
${answersText}

Total Marks: ${totalMarks}

Please provide:
1. Score obtained out of ${totalMarks}
2. Percentage
3. Grade (A+, A, B, C, D, or F)
4. Detailed feedback including:
   - Strengths in the answers
   - Areas for improvement
   - Specific suggestions for better performance
   - Topic-wise analysis

Format your response as valid JSON with this structure:
{
  "score": <number>,
  "totalMarks": ${totalMarks},
  "percentage": <number>,
  "grade": "<grade>",
  "feedback": "<detailed markdown formatted feedback>"
}`;

    console.log('Evaluating test answers');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a fair and thorough exam evaluator. Provide constructive feedback and accurate grading.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API Error:', response.status, errorText);
      
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (response.status === 402) {
        throw new Error('Payment required. Please add credits to your Lovable AI workspace.');
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const evaluationText = data.choices?.[0]?.message?.content;

    if (!evaluationText) {
      throw new Error('No evaluation generated');
    }

    // Extract JSON from the response (it might be wrapped in markdown code blocks)
    let results;
    try {
      const jsonMatch = evaluationText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        results = JSON.parse(jsonMatch[0]);
      } else {
        results = JSON.parse(evaluationText);
      }
    } catch (parseError) {
      console.error('Error parsing evaluation JSON:', parseError);
      // Fallback to a default structure
      results = {
        score: 0,
        totalMarks: parseInt(totalMarks),
        percentage: 0,
        grade: 'F',
        feedback: evaluationText
      };
    }

    console.log('Test evaluation completed successfully');

    return new Response(
      JSON.stringify({ results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in evaluate-test function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
