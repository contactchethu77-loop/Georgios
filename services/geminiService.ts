
import { GoogleGenAI } from "@google/genai";
import { Product, ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const extractJson = (text: string) => {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(text);
  } catch (e) {
    console.error("JSON Parse Error:", e, "Text:", text);
    return null;
  }
};

export const identifyCropFromImage = async (base64Image: string): Promise<{ name: string; grade: string; reason: string } | null> => {
  try {
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
    const prompt = `Act as a strict agricultural quality control officer. Analyze this image of a crop.
    1. Identify the name (e.g., Tomato, Onion, Cauliflower).
    2. Assign a Grade strictly based on safety and visual appeal:
       - **INEDIBLE (REJECT)**: Visible mold, rot, or unsafe damage.
       - **Grade A**: Premium. Perfect shape and color.
       - **Grade B**: Good. Minor blemishes.
       - **Grade C**: Edible but "Ugly". Significant scars, scabs, or deformities.
    Return strictly as JSON: {"name": "Cauliflower", "grade": "Grade A", "reason": "Tightly packed white curd with fresh green leaves."}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [{ inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } }, { text: prompt }]
      },
      config: { responseMimeType: 'application/json' }
    });
    return extractJson(response.text || "{}");
  } catch (error) {
    console.error("AI Crop ID Error:", error);
    return null;
  }
};

export interface PricePredictionResult {
  conclusivePrice: string;
  advice: string;
  sources: { title: string; uri: string }[];
}

export const predictCropPrice = async (cropName: string, location: string, grade: string, month: string, timeOfDay: string): Promise<PricePredictionResult> => {
  try {
    const prompt = `Act as an expert agricultural market analyst for the Indian market.
    RESEARCH TASK:
    1. Search for today's real-time MANDI (APMC) and retail prices of ${cropName} in ${location}.
    2. Factor in the quality grade: ${grade}. 
    Return strictly as JSON: {"conclusivePrice": "₹XX.XX", "advice": "Short market explanation...", "sources": [{"title": "Source name", "uri": "URL"}]}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { 
        responseMimeType: 'application/json',
        tools: [{ googleSearch: {} }] 
      }
    });
    
    return extractJson(response.text || "{}") || { conclusivePrice: "N/A", advice: "Unable to reach APMC servers.", sources: [] };
  } catch (error) {
    console.error("Price Prediction Error:", error);
    return { conclusivePrice: "N/A", advice: "Error fetching market data.", sources: [] };
  }
};

export const chatWithAssistant = async (
  message: string, 
  history: ChatMessage[], 
  availableProducts: Product[],
  language: 'English' | 'Kannada' | 'Hindi'
): Promise<string> => {
  try {
    const productContext = availableProducts.map(p => 
      `${p.name} at ₹${p.pricePerKg}/kg from ${p.farmerVillage}`
    ).join(", ");

    const systemInstruction = `You are "Georgios AI", a helpful marketplace assistant for farmers and buyers.
    Current marketplace products: ${productContext || 'None available yet'}.
    User Language: ${language}.
    Rules:
    - ALWAYS reply in the requested language: ${language}.
    - For non-literate users, keep explanations VERY simple and direct.
    - If asked about prices, provide the current marketplace prices listed above.
    - Be polite, encouraging, and helpful.
    - Tone should be like a friendly village helper.`;

    const contents = history.map(h => ({
      role: h.role,
      parts: [{ text: h.text }]
    }));

    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents as any,
      config: { systemInstruction }
    });

    return response.text || "I am sorry, I couldn't understand that. / ಕ್ಷಮಿಸಿ, ನನಗೆ ಅರ್ಥವಾಗಲಿಲ್ಲ. / क्षमा करें, मैं समझ नहीं पाया।";
  } catch (error) {
    console.error("Chat Error:", error);
    return "Connection error. Please try again.";
  }
};
