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
    const { command, context = {} } = await request.json();
    
    if (!command || typeof command !== 'string') {
      return new Response(JSON.stringify({ error: 'Command is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Call OpenAI GPT-4 API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are Sentauri, an AI assistant that helps users modify websites using voice commands. 
            Convert natural language commands into specific actions. Respond with:
            1. action: The type of change (title, background, button, feature, etc.)
            2. target: What element to change
            3. value: The new value
            4. response: A friendly confirmation message
            
            Example: "Make the background blue"
            Response: {
                "action": "style",
                "target": "background",
                "value": "#3498db",
                "response": "I've changed the background to a beautiful blue!"
            }`
          },
          {
            role: 'user',
            content: command
          }
        ],
        temperature: 0.7,
        max_tokens: 200,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify({
      success: true,
      command: command,
      ...result,
      usage: data.usage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('GPT-4 error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process command' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
