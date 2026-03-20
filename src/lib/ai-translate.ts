export async function aiTranslate(
  text: string, 
  targetLanguage: string, 
  provider: 'openai' | 'gemini' | 'none',
  // apiKey is no longer needed here as it's securely stored in a cookie
  _apiKey?: string 
): Promise<string> {
  if (!text.trim() || provider === 'none') return text;
  
  const response = await fetch('/api/translate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      targetLanguage,
      provider
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Failed to translate');
  }

  const data = await response.json();
  return data.translatedText || text;
}
