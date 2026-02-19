
import { GoogleGenAI, Type } from "@google/genai";
import { Promotion } from '../types';

// Assume process.env.API_KEY is configured in the build environment
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    console.warn("API_KEY for Gemini is not set. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const suggestItemDetails = async (itemName: string, availableCategories: string[], availableUnits: string[]): Promise<{ category: string, unit: string } | null> => {
    if (!API_KEY) return null;

    const itemSuggestionSchema = {
        type: Type.OBJECT,
        properties: {
            category: {
                type: Type.STRING,
                description: "The most likely category for the grocery item.",
                enum: availableCategories
            },
            unit: {
                type: Type.STRING,
                description: "The most common unit of measurement for this item.",
                enum: availableUnits
            },
        },
        required: ['category', 'unit']
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `For the grocery item "${itemName}", suggest a common category and unit from the following options:
            Categories: ${availableCategories.join(', ')}
            Units: ${availableUnits.join(', ')}`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: itemSuggestionSchema,
            },
        });
        const jsonString = response.text;
        if (jsonString) return JSON.parse(jsonString);
        return null;
    } catch (error) {
        console.error("Error fetching item suggestions from Gemini API:", error);
        return null;
    }
};

const priceCheckSchema = {
    type: Type.OBJECT,
    properties: {
        price: {
            type: Type.NUMBER,
            description: "The average current price of the item in euros."
        }
    },
    required: ["price"]
};

// Helper to safely parse JSON from model output that might contain markdown
const parseJSON = (text: string) => {
    try {
        // Remove markdown code blocks if present
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
    } catch (e) {
        return null;
    }
};

export const fetchItemPrice = async (itemName: string): Promise<{ price: number; source: { uri: string; title: string } | null } | null> => {
    if (!API_KEY) return null;

    // First attempt: Try with Google Search for real-time data
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `What is the current average price for "${itemName}" in euros? Return a strictly valid JSON object with a "price" property (number). Example: {"price": 2.50}. Do not include markdown formatting.`,
            config: {
                tools: [{ googleSearch: {} }],
                // Note: We do NOT set responseMimeType: 'application/json' here because 
                // it can cause permission errors or empty responses when combined with googleSearch.
            },
        });

        const sourceChunk = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.[0]?.web;
        const source = sourceChunk ? { uri: sourceChunk.uri, title: sourceChunk.title || 'Source' } : null;

        const parsed = parseJSON(response.text || '');
        if (parsed && typeof parsed.price !== 'undefined') {
            return { price: Number(parsed.price), source };
        }
    } catch (error: any) {
        // Only log warning, as we will try fallback
        console.warn("Gemini Search Grounding failed (likely permission/403 or unavailable), falling back to estimate.", error.message);
    }

    // Fallback: Estimate based on model knowledge without search
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Estimate the average price for "${itemName}" in euros based on general knowledge.`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: priceCheckSchema,
            },
        });
        const jsonString = response.text;
        if (jsonString) {
            const parsed = JSON.parse(jsonString);
            return { price: Number(parsed.price), source: null };
        }
    } catch (error) {
        console.error("Error fetching fallback item price from Gemini API:", error);
    }
    
    return null;
};

export const fetchItemPromotions = async (itemName: string): Promise<Promotion[] | null> => {
    if (!API_KEY) return null;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Find current promotions for "${itemName}" at major Portuguese supermarkets like Continente, Pingo Doce, and Lidl. 
            Return a strictly valid JSON object with a "promotions" array containing objects with "store", "description", and optional "price". 
            Do not use markdown code blocks.`,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        const source = groundingChunks && groundingChunks.length > 0 && groundingChunks[0].web
            ? { uri: groundingChunks[0].web.uri, title: groundingChunks[0].web.title || 'Source' }
            : { uri: '', title: 'Source not available' };
        
        const parsed = parseJSON(response.text || '');
        if (parsed && Array.isArray(parsed.promotions)) {
            return parsed.promotions.map((promo: any) => ({ 
                ...promo, 
                price: promo.price ? Number(promo.price) : undefined,
                source 
            }));
        }
        return [];
    } catch (error) {
        console.error("Error fetching item promotions from Gemini API:", error);
        return [];
    }
};

export const generateItemImage = async (itemName: string): Promise<string | null> => {
    if (!API_KEY) return null;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: `a clear, high-quality image of ${itemName} on a clean white background` }]
            },
        });
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64EncodeString: string = part.inlineData.data;
                return `data:image/png;base64,${base64EncodeString}`;
            }
        }
        return null;
    } catch (error) {
        console.error("Error generating image from Gemini API:", error);
        return null;
    }
};
