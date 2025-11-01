
import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function simplifyText(text: string, language: string): Promise<string> {
    const model = 'gemini-2.5-flash';

    const prompt = `You are an expert at simplifying complex documents for the average person. 
    Your goal is to make the content clear, friendly, and easy to understand.
    Do not add any preamble or conclusion, just provide the simplified text directly.
    
    Take the following text from a document and explain it in simple ${language}. 
    Avoid jargon and use plain language that anyone can comprehend.

    Here is the text:
    ---
    ${text}
    ---
    `;

    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
    });
    
    return response.text;
}

export async function generateSpeech(text: string): Promise<string> {
    const model = 'gemini-2.5-flash-preview-tts';
    
    const response = await ai.models.generateContent({
        model: model,
        contents: [{ parts: [{ text: text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
            },
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
        throw new Error("No audio data received from the API.");
    }
    
    return base64Audio;
}
