import { GoogleGenAI } from "@google/genai";
import { Order } from '../types';

if (!process.env.API_KEY) {
  // In a real app, you'd want to handle this more gracefully.
  // For this example, we'll alert the user and disable the feature.
  console.error("API_KEY environment variable not set. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const getAiSummaryForOrders = async (orders: Order[]): Promise<string> => {
  if (!process.env.API_KEY) {
    return "AI features are disabled because the API key is not configured.";
  }
  if (orders.length === 0) {
    return "There is no order data to analyze.";
  }

  const model = 'gemini-2.5-flash';
  
  const simplifiedOrders = orders.map(o => ({
    status: o.status,
    product: o.productDescription,
    pieces: o.pieces,
    karigar: o.karigarName,
  }));

  const prompt = `
    You are an expert business analyst for a high-end jewelry market. 
    Analyze the following list of recent orders and provide a concise, insightful summary for the business owner.
    The data is provided as a JSON array.

    Your summary should be formatted in Markdown and include:
    1.  **Overall Status Breakdown:** A quick overview of how many orders are in each status category (e.g., Received, With Vendor, Completed).
    2.  **Key Trends & Observations:** Identify any interesting patterns. For example, are certain Karigars (craftsmen) handling more orders? Are there any potential bottlenecks indicated by a large number of orders stuck in a particular status?
    3.  **Actionable Advice:** Based on your analysis, provide one or two clear, actionable recommendations for the business owner to improve workflow or manage workload among Karigars.

    Here is the order data:
    ${JSON.stringify(simplifiedOrders)}
  `;

  try {
    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "An error occurred while generating the AI summary. Please check the console for details.";
  }
};
