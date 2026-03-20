import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const apiKey = cookieStore.get("sc-ai-key")?.value;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI API key not configured. Please set it in AI Settings." },
        { status: 401 }
      );
    }

    const { text, targetLanguage, provider } = await request.json();

    if (!text || !targetLanguage || !provider) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let translatedText = text;

    if (provider === "openai") {
      translatedText = await translateOpenAI(text, targetLanguage, apiKey);
    } else if (provider === "gemini") {
      translatedText = await translateGemini(text, targetLanguage, apiKey);
    } else {
      return NextResponse.json(
        { error: "Unsupported provider" },
        { status: 400 }
      );
    }

    return NextResponse.json({ translatedText });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Translation failed" },
      { status: 500 }
    );
  }
}

async function translateOpenAI(text: string, targetLanguage: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator for Shopify e-commerce. Translate the given text to the target locale code '${targetLanguage}'. Only return the translated text, nothing else. Preserve any HTML tags exactly as they are.`
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.2
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Failed to translate via OpenAI');
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || text;
}

async function translateGemini(text: string, targetLanguage: string, apiKey: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `You are a professional translator for Shopify e-commerce. Translate the following text to the locale code '${targetLanguage}'. Only output the translated text, nothing else. Preserve any HTML tags exactly as they are. Here is the text:\n\n${text}`
        }]
      }],
      generationConfig: {
        temperature: 0.2
      }
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Failed to translate via Gemini');
  }

  const data = await response.json();
  const result = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (result) {
    return result.replace(/^```\n?/, '').replace(/\n?```$/, '').trim();
  }
  return text;
}
