export default {
  async fetch(request, env) {

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "POST, OPTIONS"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders
      });
    }

    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({
          error: "Use POST"
        }),
        {
          status: 405,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }

    //
    // Authentication
    //
    const auth = request.headers.get("Authorization") || "";

    if (!auth.startsWith("Bearer ")) {
      return new Response(
          JSON.stringify({ error: "Missing bearer token" }),
          {
              status: 401,
              headers: {
                  ...corsHeaders,
                  "Content-Type": "application/json"
              }
          }
      );
  }

    const token = auth.substring(7);

    if (token !== env.WORKER_TOKEN) {
        return new Response(
            JSON.stringify({ error: "Invalid token" }),
            {
                status: 401,
                headers: {
                    ...corsHeaders,
                    "Content-Type": "application/json"
                }
            }
        );
    }

    let body;

    try {

      body = await request.json();

    } catch {

      return new Response(
        JSON.stringify({
          error: "Invalid JSON"
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );

    }

   let text = body.text;

// Support lesson files with segments
if (!text && Array.isArray(body.segments)) {
    text = body.segments
        .map(s => s.text)
        .filter(Boolean)
        .join("\n");
}

if (!text || text.trim().length === 0) {
    return new Response(
        JSON.stringify({
            error: "Missing text"
        }),
        {
            status: 400,
            headers: {
                ...corsHeaders,
                "Content-Type": "application/json"
            }
        }
    );
}
    const voice = body.voice ?? "onyx";
    const speed = body.speed ?? 1.0;
    const instructions =
      body.instructions ??
      "Speak entirely in Swedish. Use a natural Malmö (Scanian) accent. Use a deep, warm masculine voice. Speak confidently with relaxed conversational rhythm at a moderately fast pace. Pronounce Swedish vowels and prosody naturally, without an English accent.";
    
    console.log({
    voice,
    speed,
    instructions,
    textLength: text.length,
    first200: text.substring(0,200)
});

    const openaiResponse = await fetch(
      "https://api.openai.com/v1/audio/speech",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o-mini-tts",
          voice,
          input: text,
          instructions,
          speed,
          response_format: "mp3"
        })
      }
    );

    if (!openaiResponse.ok) {

      const error = await openaiResponse.text();

      console.log(error);

      return new Response(
        error,
        {
          status: openaiResponse.status,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );

    }

    return new Response(openaiResponse.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
        "Content-Disposition": 'attachment; filename="speech.mp3"'
      }
    });

  }
}