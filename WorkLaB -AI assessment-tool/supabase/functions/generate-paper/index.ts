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
    const { formData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Construct the prompt for question paper generation
    const prompt = `Generate a ${formData.difficulty} difficulty question paper for ${formData.subject}, 
class ${formData.classLevel}, total marks ${formData.totalMarks}, pattern type ${formData.patternType}.
Book type: ${formData.bookType}.
${formData.chapters ? `Focus on chapters: ${formData.chapters}` : ''}
${formData.topics ? `Specific topics to include: ${formData.topics}` : ''}
${formData.instructions ? `Additional instructions: ${formData.instructions}` : ''}
${formData.syllabus ? `Syllabus reference: ${formData.syllabus}` : ''}

Return the question paper in clear Markdown format with:
1. A title and header with subject, class, and total marks
2. Clear section headings
3. Numbered questions with marks allocation
4. Proper spacing and formatting

Make sure the questions are well-structured, relevant to the topics, and appropriate for the difficulty level specified.`;

    console.log('Generating question paper with prompt:', prompt);

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
            content: 'You are an expert educator and question paper designer. Create comprehensive, well-structured question papers that test student understanding effectively.'
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
    const generatedPaper = data.choices?.[0]?.message?.content;

    if (!generatedPaper) {
      throw new Error('No paper content generated');
    }

    console.log('Question paper generated successfully');

    return new Response(
      JSON.stringify({ paper: generatedPaper }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-paper function:', error);
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
