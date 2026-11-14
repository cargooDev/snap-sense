import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { GEMINI_API_KEY, GEMINI_MODEL, MAX_IMAGE_WIDTH } from '../config';
import { Analysis, CATEGORIES, Category } from '../types';

const PROMPT = `You are analysing a phone screenshot.
1. Transcribe all readable text exactly (OCR).
2. Choose ONE category from: ${CATEGORIES.join(', ')}.
3. Write a one-sentence summary of what the screenshot is about.
Reply ONLY with JSON: {"text": string, "category": string, "summary": string}`;

// Shrink and re-encode as JPEG so the upload is small. Returns base64 text.
async function toBase64(uri: string): Promise<string> {
  const result = await manipulateAsync(uri, [{ resize: { width: MAX_IMAGE_WIDTH } }], {
    compress: 0.7,
    format: SaveFormat.JPEG,
    base64: true,
  });
  if (!result.base64) throw new Error('Could not read image data');
  return result.base64;
}

// Models sometimes return an unexpected category or wrap JSON in text.
// This function never trusts the reply: it validates and falls back to safe values.
export function parseAnalysis(raw: string): Analysis {
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('AI reply was not JSON');

  const data = JSON.parse(raw.slice(start, end + 1));
  const category: Category = CATEGORIES.includes(data.category) ? data.category : 'general';
  return {
    text: typeof data.text === 'string' ? data.text.trim() : '',
    category,
    summary: typeof data.summary === 'string' ? data.summary.trim() : '',
  };
}

// One API call does both jobs: OCR (text extraction) and classification.
export async function analyseImage(uri: string): Promise<Analysis> {
  if (!GEMINI_API_KEY) throw new Error('Missing EXPO_PUBLIC_GEMINI_API_KEY in .env');

  const imageBase64 = await toBase64(uri);
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY },
      body: JSON.stringify({
        contents: [{ parts: [{ text: PROMPT }, { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    },
  );

  if (!response.ok) {
    // A temporary Gemini outage should not block the rest of the organiser.
    // Save an honest local result so the user can still favourite or remind
    // themselves about the image; a later version could add a retry queue.
    if (response.status === 503) {
      return {
        text: '',
        category: 'general',
        summary: 'AI analysis is temporarily unavailable. This screenshot is saved for later review.',
      };
    }
    throw new Error(`Gemini request failed (${response.status})`);
  }
  const json = await response.json();
  const raw: string | undefined = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) throw new Error('Gemini returned an empty answer');
  return parseAnalysis(raw);
}
