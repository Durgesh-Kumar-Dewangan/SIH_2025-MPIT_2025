import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RunCodeRequest {
  code: string;
  language: string;
}

// Language mapping for Piston API
const languageMap: Record<string, { language: string; version: string }> = {
  javascript: { language: 'javascript', version: '18.15.0' },
  python: { language: 'python', version: '3.10.0' },
  java: { language: 'java', version: '15.0.2' },
  cpp: { language: 'cpp', version: '10.2.0' },
  c: { language: 'c', version: '10.2.0' },
  csharp: { language: 'csharp', version: '6.12.0' },
  go: { language: 'go', version: '1.16.2' },
  rust: { language: 'rust', version: '1.68.2' },
  ruby: { language: 'ruby', version: '3.0.1' },
  php: { language: 'php', version: '8.2.3' },
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Run code request received');

    const { code, language }: RunCodeRequest = await req.json();

    if (!code || !language) {
      console.error('Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Code and language are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get language configuration
    const langConfig = languageMap[language.toLowerCase()];
    if (!langConfig) {
      console.error('Unsupported language:', language);
      return new Response(
        JSON.stringify({ 
          error: `Unsupported language: ${language}. Supported languages: ${Object.keys(languageMap).join(', ')}` 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Executing ${langConfig.language} code`);

    // Execute code using Piston API
    const pistonResponse = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: langConfig.language,
        version: langConfig.version,
        files: [
          {
            name: `main.${language}`,
            content: code,
          },
        ],
        stdin: '',
        args: [],
        compile_timeout: 10000,
        run_timeout: 3000,
        compile_memory_limit: -1,
        run_memory_limit: -1,
      }),
    });

    if (!pistonResponse.ok) {
      console.error('Piston API error:', pistonResponse.statusText);
      throw new Error('Code execution service unavailable');
    }

    const result = await pistonResponse.json();
    console.log('Execution completed:', result.run?.code);

    // Format the output
    let output = '';
    let error = '';

    if (result.compile && result.compile.output) {
      output += `Compilation Output:\n${result.compile.output}\n\n`;
    }

    if (result.run) {
      if (result.run.stdout) {
        output += result.run.stdout;
      }
      if (result.run.stderr) {
        error = result.run.stderr;
      }
      if (result.run.code !== 0 && !error) {
        error = `Process exited with code ${result.run.code}`;
      }
    }

    return new Response(
      JSON.stringify({
        output: output || 'No output',
        error: error || null,
        executionTime: result.run?.signal || 'N/A',
        language: langConfig.language,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in run-code function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred while executing code';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        output: null,
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
