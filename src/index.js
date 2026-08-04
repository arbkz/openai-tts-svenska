export default {
  async fetch(request, env) {

    //
    // Only POST is supported
    //
    if (request.method !== "POST") {
      return jsonResponse(
        {
          error: "Method Not Allowed"
        },
        405
      );
    }

    //
    // Authentication
    //
    const auth = request.headers.get("Authorization") || "";

    if (!auth.startsWith("Bearer ")) {
      return jsonResponse(
        {
          error: "Missing bearer token"
        },
        401
      );
    }

    const token = auth.substring(7);

    if (token !== env.WORKER_TOKEN) {
      return jsonResponse(
        {
          error: "Invalid bearer token"
        },
        401
      );
    }

    //
    // Parse request
    //
    let body;

    try {
      body = await request.json();
    }
    catch {
      return jsonResponse(
        {
          error: "Invalid JSON"
        },
        400
      );
    }

    const {
      text,
      voice,
      speed,
      instructions
    } = body;

    //
    // Validate input
    //
    if (typeof text !== "string" || text.trim() === "") {
      return missingField("text");
    }

    if (typeof voice !== "string" || voice.trim() === "") {
      return missingField("voice");
    }

    if (typeof speed !== "number") {
      return missingField("speed");
    }

    if (typeof instructions !== "string" || instructions.trim() === "") {
      return missingField("instructions");
    }

    const validVoices = [
      "alloy",
      "ash",
      "ballad",
      "coral",
      "echo",
      "onyx",
      "sage",
      "shimmer"
    ];

    if (!validVoices.includes(voice)) {
      return jsonResponse(
        {
          error: "Invalid voice",
          allowed: validVoices
        },
        400
      );
    }

    //
    // Forward request to OpenAI
    //
    const openaiResponse = await fetch(
      "https://api.openai.com/v1/audio/speech",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o-mini-tts",
          input: text,
          voice,
          speed,
          instructions,
          response_format: "mp3"
        })
      }
    );

    if (!openaiResponse.ok) {

      const error = await openaiResponse.text();

      console.log(error);

      return new Response(error, {
        status: openaiResponse.status,
        headers: {
          "Content-Type": "application/json"
        }
      });

    }

    //
    // Return MP3
    //
    return new Response(openaiResponse.body, {
      headers: {
        "Content-Type": "audio/mpeg"
      }
    });

  }
};

function jsonResponse(body, status) {
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
}

function missingField(field) {
  return jsonResponse(
    {
      error: "Missing required field",
      field
    },
    400
  );
}