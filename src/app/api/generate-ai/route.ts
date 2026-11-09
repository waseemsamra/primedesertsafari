export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey || !apiKey.startsWith('sk-')) {
      return Response.json({ error: 'OpenAI API key not configured on server. Set OPENAI_API_KEY in Vercel environment variables.' }, { status: 500 });
    }

    const { prompt } = await req.json();

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert travel copywriter for UAE desert safari and tour experiences. Write compelling, SEO-friendly content. Return ONLY the requested content, no extra explanation.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return Response.json({ error: `OpenAI error: ${err}` }, { status: 500 });
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content?.trim() || '';

    return Response.json({ content });
  } catch (err: any) {
    return Response.json({ error: err?.message || 'Generation failed' }, { status: 500 });
  }
}
