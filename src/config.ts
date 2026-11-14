// EXPO_PUBLIC_* variables are inlined into the bundle at build time by Expo.
export const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';
// Gemini 2.5 Flash is restricted for new API projects. This stable Flash-Lite
// model accepts image input and is suitable for OCR and classification.
export const GEMINI_MODEL = 'gemini-3.1-flash-lite';
export const SCREENSHOT_ALBUM = 'Screenshots';
export const MAX_IMAGE_WIDTH = 1024; // resize before upload: smaller payload, faster and cheaper
