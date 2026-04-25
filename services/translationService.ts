import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || "" });

async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function translateText(text: string, targetLanguage: string, retries = 3): Promise<string> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("VITE_GEMINI_API_KEY is not defined");
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Translate the following text to ${targetLanguage}. Return only the translated text.\n\nText:\n${text}`,
        });
        return response.text || "";
    } catch (error: any) {
        if (retries > 0 && (error.status === 503 || error.code === 503)) {
            console.warn(`Translation service busy, retrying... (${retries} attempts left)`);
            await delay(2000 * (4 - retries)); // Exponential backoff: 2s, 4s, 6s
            return translateText(text, targetLanguage, retries - 1);
        }
        console.error("Translation error:", error);
        throw error;
    }
}
