
import { GoogleGenAI } from "@google/genai";
import { BusinessData } from "../types";

export const getBusinessInsights = async (data: BusinessData): Promise<string> => {
  // Always use process.env.API_KEY directly as per @google/genai guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const salesSummary = data.sales.reduce((acc, s) => acc + s.amount, 0);
  const expenseSummary = data.expenses.reduce((acc, e) => acc + e.amount, 0);
  const profitMargin = data.config?.targetProfitMargin || 0;
  
  const prompt = `
    Act as a high-level business consultant. Analyze the following business data and provide 3-4 concise, actionable insights for growth or efficiency.
    
    Business: ${data.config?.companyName} (${data.config?.industry})
    Target Profit Margin: ${profitMargin}%
    Total Sales to date: ${data.config?.currency}${salesSummary}
    Total Expenses to date: ${data.config?.currency}${expenseSummary}
    
    Expenses Breakdown:
    ${JSON.stringify(data.expenses.slice(-10))}
    
    Format the output in professional Markdown with sections for:
    1. Financial Health Check
    2. Strategic Recommendations
    3. Potential Risks
  `;

  try {
    const response = await ai.models.generateContent({
      // Using gemini-3-pro-preview for complex reasoning tasks like business consultancy
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    // response.text is a property, not a method
    return response.text || "Unable to generate insights at this moment.";
  } catch (error) {
    console.error("Gemini Insights Error:", error);
    return "Error generating insights. Please check your data and try again.";
  }
};
