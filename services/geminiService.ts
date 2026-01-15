
import { GoogleGenAI } from "@google/genai";

export const generateJobDescription = async (title: string, company: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: (process.env.API_KEY as string) });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a short, engaging job description for a part-time student job: ${title} at ${company}. Keep it under 100 words and mention that flexibility is provided for students.`
    });
    return response.text || "Failed to generate description.";
  } catch (error) {
    console.error("AI Generation Error:", error);
    return "Error generating description. Please try again.";
  }
};

export const improveBio = async (currentBio: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: (process.env.API_KEY as string) });
    try {
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
