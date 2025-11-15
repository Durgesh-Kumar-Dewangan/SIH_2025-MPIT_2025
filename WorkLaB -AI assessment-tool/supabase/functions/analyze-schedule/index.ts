import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { scheduleId, fileContent } = await req.json();

    console.log('Analyzing schedule for user:', user.id);

    // Call Lovable AI to analyze the schedule
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const aiResponse = await fetch('https://api.lovable.app/v1/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${lovableApiKey}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{
          role: 'user',
          content: `Analyze this class schedule and extract all classes with their details. Return a JSON array with the following structure for each class:
{
  "title": "Course name",
  "course_code": "Course code if available",
  "day": "Day of week (Monday, Tuesday, etc.)",
  "start_time": "Start time in HH:MM format",
  "end_time": "End time in HH:MM format",
  "location": "Room or building",
  "instructor": "Professor name if available",
  "type": "Lecture/Lab/Tutorial"
}

Schedule content:
${fileContent}

Return ONLY valid JSON array, no additional text.`
        }],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error('AI analysis failed');
    }

    const aiResult = await aiResponse.json();
    const analysisText = aiResult.choices[0].message.content;
    
    console.log('AI Analysis result:', analysisText);

    // Parse the JSON from AI response
    let scheduleData;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = analysisText.match(/```json\n?([\s\S]*?)\n?```/);
      const jsonText = jsonMatch ? jsonMatch[1] : analysisText;
      scheduleData = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Failed to parse schedule data');
    }

    // Update the class_schedules table
    const { error: updateError } = await supabase
      .from('class_schedules')
      .update({
        schedule_data: scheduleData,
        analyzed: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', scheduleId)
      .eq('user_id', user.id);

    if (updateError) {
      throw updateError;
    }

    console.log('Schedule analyzed and saved successfully');

    return new Response(
      JSON.stringify({ success: true, scheduleData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error analyzing schedule:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
