export async function onRequestPost({ request, env }) {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle OPTIONS request
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio');
    
    if (!audioFile) {
      return new Response(JSON.stringify({ error: 'No audio file provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Convert to blob
    const audioBlob = await audioFile.arrayBuffer();
    
    // Create form data for OpenAI
    const openAIFormData = new FormData();
    openAIFormData.append('file', new Blob([audioBlob], { type: 'audio/webm' }), 'audio.webm');
    openAIFormData.append('model', 'whisper-1');
    openAIFormData.append('language', 'en');

    // Call OpenAI Whisper API
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`
      },
      body: openAIFormData
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const result = await response.json();

    return new Response(JSON.stringify({
      success: true,
      transcript: result.text,
      confidence: 0.95
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Whisper error:', error);
    return new Response(JSON.stringify({ error: 'Failed to transcribe audio' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
