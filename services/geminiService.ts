
import { GoogleGenAI } from "@google/genai";
import { BusinessData } from "../types.ts";

export const getBusinessInsights = async (data: BusinessData): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const salesSummary = data.sales.reduce((acc, s) => acc + s.amount, 0);
  const expenseSummary = data.expenses.reduce((acc, e) => acc + e.amount, 0);
  
  const prompt = `Analyze this business: ${data.config?.companyName}. 
  Total Sales: ${salesSummary}, Total Expenses: ${expenseSummary}. 
  Industry: ${data.config?.industry}.
  Provide 3-4 bullet points of actionable business advice. Use Markdown.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Unable to generate insights.";
  } catch (error) {
    return "Error generating insights.";
  }
};
