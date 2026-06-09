import { NextRequest, NextResponse } from "next/server";

const MODELS: Record<string, string> = {
  "gpt-4o":      "gpt-4o",
  "gpt-4o-mini": "gpt-4o-mini",
};

export async function POST(request: NextRequest) {
  const { prompt, model = "gpt-4o" } = await request.json();

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY no configurada en las variables de entorno de Vercel." },
      { status: 500 }
    );
  }

  const openaiModel = MODELS[model] || "gpt-4o";

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: openaiModel,
        max_tokens: 1500,
        temperature: 0.3,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json(
        { error: `OpenAI error ${res.status}: ${err?.error?.message || "desconocido"}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "Sin respuesta.";
    return NextResponse.json({ text, model: openaiModel, tokens: data.usage });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
