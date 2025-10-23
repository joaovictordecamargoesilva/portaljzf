import { GoogleGenAI } from "@google/genai";
import type { Chat } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Gemini features will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// --- Scenario Simulation Chat ---
let simulationChatInstance: Chat | null = null;

export const startSimulationChat = (): Chat => {
  if (!API_KEY) throw new Error("Gemini API key is not configured.");
  if (!simulationChatInstance) {
    simulationChatInstance = ai.chats.create({
      model: 'gemini-2.5-pro',
      config: {
        systemInstruction: `You are a sophisticated financial scenario simulator for Brazilian businesses, acting as an expert financial consultant.
Your name is "Simulador JZF".
Your primary goal is to help users understand the full impact of their financial decisions.
When a user presents a scenario (e.g., taking a loan, hiring employees, making an investment), your FIRST step is to ask clarifying questions to gather all necessary details. DO NOT provide a final analysis until you have enough information.
Your questions should be direct, clear, and grouped logically.

Example Interaction Flow:
1. User asks a broad question: "se eu pedir um empréstimo de alavancagem, como pode me afetar?"
2. You respond with targeted clarifying questions: "Entendido. Para analisar o impacto de um empréstimo de alavancagem, preciso de algumas informações-chave. Por favor, me informe:
   * **Sobre o Empréstimo:** Qual o valor total que você pretende solicitar? Qual a taxa de juros anual (CET) e o prazo de pagamento em meses?
   * **Sobre sua Empresa:** Qual o faturamento médio mensal e o lucro líquido atual da sua empresa?
   * **Sobre a Aplicação:** Como você planeja usar os recursos? (Ex: capital de giro, compra de maquinário, expansão, marketing, etc.)
   * **Riscos:** Você possui garantias a oferecer?"

Only after the user provides these details should you generate the comprehensive analysis.
Your final analysis must be detailed, covering impacts on cash flow, profitability, tax implications, and potential risks.
Always respond in plain text, using newlines to separate paragraphs and asterisks for bullet points. Do not use any HTML tags.`,
      },
    });
  }
  return simulationChatInstance;
};

export const sendMessageToSimulator = async (message: string): Promise<string> => {
    if (!API_KEY) return "Gemini API key is not configured.";
    try {
        const chat = startSimulationChat();
        const result = await chat.sendMessage({ message });
        return result.text;
    } catch (error) {
        console.error("Error sending message to simulator:", error);
        return "Desculpe, estou com problemas para analisar o cenário agora. Tente novamente mais tarde.";
    }
};


// --- Opportunity Search ---
export const findOpportunities = async (businessType: string): Promise<string> => {
  if (!API_KEY) return "Gemini API key is not configured.";
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: `Find public sector and government contract opportunities in Brazil for a company that sells: "${businessType}". List the top 5 relevant opportunities with a brief description and a fictional link to the bidding portal. Format the output as clean HTML list.`,
    });
    return response.text;
  } catch (error) {
    console.error("Error finding opportunities:", error);
    return "An error occurred while searching for opportunities.";
  }
};

// --- Virtual Assistant Chat ---
let chatInstance: Chat | null = null;

export const startChat = (): Chat => {
  if (!API_KEY) throw new Error("Gemini API key is not configured.");
  if (!chatInstance) {
    chatInstance = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: 'You are a helpful accounting assistant for a Brazilian company. Answer questions clearly and concisely. Your name is JZF Assistant.',
      },
    });
  }
  return chatInstance;
};

export const sendMessageToBot = async (message: string): Promise<string> => {
    if (!API_KEY) return "Gemini API key is not configured.";
    try {
        const chat = startChat();
        const result = await chat.sendMessage({ message });
        return result.text;
    } catch (error) {
        console.error("Error sending message to bot:", error);
        return "Sorry, I'm having trouble connecting right now.";
    }
};