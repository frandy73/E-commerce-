
import { GoogleGenAI } from "@google/genai";
import { Product, CartItem } from './types';

export const getShoppingAssistantResponse = async (userMessage: string, cart: CartItem[], products: Product[]) => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) return "Mwen la pou m ede w chwazi pi bon pwodui yo! (API Key manke)";

    const ai = new GoogleGenAI({ apiKey });
    const cartContext = cart.length > 0
      ? `Le client a déjà ${cart.length} articles dans son panier pour un total de ${cart.reduce((s, i) => s + (i.price * i.quantity), 0)} Gdes.`
      : "Le panier est vide.";

    const catalogContext = products.slice(0, 10).map(p => `${p.name} (${p.price} Gdes)`).join(", ");

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: `Tu es "Boutik Paw Assistant", un vendeur expert en Haïti. 
      Contexte Panier: ${cartContext}
      Catalogue partiel: ${catalogContext}
      Message client: ${userMessage}
      Réponds en Créole Haïtien de manière amicale, courte et persuasive. Utilise des emojis. Max 40 mots.`,
    });
    return response.text || "Mwen la pou m ede w!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Mwen pa ka reponn kounye a, men m pare pou m pran kòmand ou!";
  }
};

export const getShoppingAdvice = async (cartTotal: number, products: Product[]) => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) return "Prèt pou vwayaje ak nou ?";
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: `L'utilisateur a un panier de ${cartTotal} Gdes. Catalogue: ${JSON.stringify(products.slice(0, 5).map(p => ({ name: p.name, category: p.category })))}. Donne un conseil d'achat ultra-court (max 12 mots) en créole haïtien pour encourager l'achat.`,
    });
    return response.text || "Prèt pou kòmand ?";
  } catch (error) {
    return "Bon chwa, kontinye konsa!";
  }
};

export const generateProductDescription = async (productName: string, category: string) => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) return "Yon bèl pwodui ou pa dwe manke!";
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: `Écris une description de vente courte et attrayante (max 25 mots) pour "${productName}" (${category}) en Haïti. Ton pro et engageant.`,
    });
    return response.text?.trim() || "Yon bèl pwodui ou pa dwe manke!";
  } catch (error) {
    return "Yon bèl pwodui ou pa dwe manke!";
  }
};
