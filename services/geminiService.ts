
import { GoogleGenAI } from "@google/genai";

/**
 * Get the Gemini API key from environment variables
 * Validates that the key is configured before use
 */
const getApiKey = (): string => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error(
      'Gemini API key is not configured. Please set GEMINI_API_KEY in your .env.local file. ' +
      'See .env.example for setup instructions.'
    );
  }
  
  return apiKey;
};

export const generateJobDescription = async (title: string, company: string): Promise<string> => {
  try {
    const apiKey = getApiKey();
    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a short, engaging job description for a part-time student job: ${title} at ${company}. Keep it under 100 words and mention that flexibility is provided for students.`
    });
    return response.text || "Failed to generate description.";
  } catch (error) {
    console.error("AI Generation Error:", error);
    if (error instanceof Error && error.message.includes('API key')) {
      return "API key not configured. Please check your .env.local file.";
    }
    return "Error generating description. Please try again.";
  }
};

export const improveBio = async (currentBio: string): Promise<string> => {
  try {
    const apiKey = getApiKey();
    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Improve this student bio for a part-time job application: "${currentBio}". Make it professional yet approachable for employers looking for student help. Keep it concise.`
    });
    return response.text || currentBio;
  } catch (error) {
    console.error("AI Generation Error:", error);
    return currentBio;
  }
};
