
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
                description: "A categoria mais provável para o item de mercearia.",
                enum: availableCategories
            },
            unit: {
                type: Type.STRING,
                description: "A unidade de medida mais comum.",
                enum: availableUnits
            },
        },
        required: ['category', 'unit']
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Para o item de compras "${itemName}", sugere a categoria e unidade correta baseando-te nos hábitos de consumo em Portugal.
            Categorias disponíveis: ${availableCategories.join(', ')}
            Unidades: ${availableUnits.join(', ')}`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: itemSuggestionSchema,
            },
        });
        const jsonString = response.text;
        if (jsonString) return JSON.parse(jsonString);
        return null;
    } catch (error) {
        console.error("Error fetching item suggestions:", error);
        return null;
    }
};

const parseJSON = (text: string) => {
    try {
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
    } catch (e) {
        return null;
    }
};

const parsePrice = (value: any): number | undefined => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        // Remove currency symbols and other non-numeric chars except dot and comma
        const cleaned = value.replace(/[^0-9.,]/g, '').replace(',', '.');
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? undefined : parsed;
    }
    return undefined;
};

export const fetchItemPrice = async (itemName: string): Promise<{ price: number; source: { uri: string; title: string } | null } | null> => {
    if (!API_KEY) return null;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Pesquisa o preço médio atual para "${itemName}" em Portugal. Consulta obrigatoriamente o site "supersave.pt" e grandes superfícies como Continente ou Pingo Doce. Devolve apenas um JSON com a propriedade "price" (number).`,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const sourceChunk = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.[0]?.web;
        const source = sourceChunk ? { uri: sourceChunk.uri, title: sourceChunk.title || 'SuperSave.pt' } : null;

        const parsed = parseJSON(response.text || '');
        if (parsed && typeof parsed.price !== 'undefined') {
            const price = parsePrice(parsed.price);
            if (price !== undefined) {
                return { price, source };
            }
        }
    } catch (error: any) {
        console.warn("Gemini Search Grounding failed, using general knowledge.");
    }
    return null;
};

export const fetchItemPromotions = async (itemName: string): Promise<Promotion[] | null> => {
    if (!API_KEY) return null;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Encontra promoções ativas ou os preços mais baixos para "${itemName}" em Portugal. 
            É MANDATÓRIO verificar o site "https://supersave.pt/" para comparação. 
            Devolve um JSON com um array "promotions", onde cada objeto tem "store", "description" e "price".`,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        const source = groundingChunks && groundingChunks.length > 0 && groundingChunks[0].web
            ? { uri: groundingChunks[0].web.uri, title: groundingChunks[0].web.title || 'SuperSave.pt' }
            : { uri: 'https://supersave.pt/', title: 'SuperSave.pt' };
        
        const parsed = parseJSON(response.text || '');
        if (parsed && Array.isArray(parsed.promotions)) {
            return parsed.promotions.map((promo: any) => ({ 
                ...promo, 
                price: parsePrice(promo.price),
                source 
            }));
        }
        return [];
    } catch (error) {
        console.error("Error fetching promotions:", error);
        return [];
    }
};

export const generateItemImage = async (itemName: string): Promise<string | null> => {
    if (!API_KEY) return null;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: `produto isolado de ${itemName} para lista de compras, fundo branco, realista` }] }
        });
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
        }
        return null;
    } catch (error) { return null; }
};
