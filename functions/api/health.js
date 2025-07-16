export async function onRequestGet() {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  return new Response(JSON.stringify({
    status: 'ok',
    service: 'sentauri-backend',
    timestamp: new Date().toISOString(),
  }), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}