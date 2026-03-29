export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }

    const url = new URL(request.url);

    try {
      if (url.pathname === "/api/word-info") {
        return await handleWordInfo(request, env);
      } else if (url.pathname === "/api/gif") {
        return await handleGif(request, env);
      }
      return new Response("Not found", { status: 404 });
    } catch (e) {
      return jsonResponse({ error: e.message }, 500);
    }
  },
};

const RESPONSE_FORMAT = `Return a JSON object with:
- "partOfSpeech": the part of speech (noun, verb, adjective, adverb, etc.)
- "definition": a short definition of the word as used in context
- "gifKeyword": one or two keywords that are the closest synonyms of the original word in context

Reply with ONLY the JSON object, no other text.`;

function buildPrompt(word, sentence) {
  if (sentence) {
    return `Word: "${word}"\nSentence: "${sentence}"\n\nGiven the word in this sentence, ${RESPONSE_FORMAT}`;
  }
  return `Word: "${word}"\n\n${RESPONSE_FORMAT}`;
}

async function handleWordInfo(request, env) {
  const { word, sentence } = await request.json();
  const prompt = buildPrompt(word, sentence);

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.CLAUDE_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 100,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await res.json();
  const raw = data.content?.[0]?.text?.trim();
  const text = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  const result = JSON.parse(text);
  return jsonResponse(result);
}

async function handleGif(request, env) {
  const { query } = await request.json();
  const url = `https://api.giphy.com/v1/gifs/search?api_key=${env.GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=1&rating=g&lang=en`;
  const res = await fetch(url);
  const data = await res.json();
  const gifUrl =
    data.data && data.data.length > 0
      ? data.data[0].images.fixed_height.url
      : null;
  return jsonResponse({ gifUrl });
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(),
    },
  });
}
