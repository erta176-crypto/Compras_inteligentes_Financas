
import React from 'react';

export interface Store {
    id: string;
    name: string;
    icon?: string;
    color?: string;
}

export interface Category {
    id: string;
    name: string;
}

export interface Promotion {
    store: string;
    description: string;
    price?: number;
    source: {
        uri: string;
        title: string;
    };
}

export interface ListItem {
    id:string;
    name: string;
    quantity: number;
    unit: 'un' | 'kg' | 'g' | 'L' | 'cx';
    category: string;
    price?: number;
    completed: boolean;
    image?: string;
    priceHistory?: number[];
    alert?: 'up' | 'down' | 'stable' | 'checking';
    source?: {
        uri: string;
        title: string;
    }
    promotions?: Promotion[];
    promotionStatus?: 'idle' | 'checking' | 'checked';
    selectedPromotion?: Promotion;
}

export interface ShoppingList {
    id: string;
    name: string;
    itemCount: number;
    estimatedCost: number;
    progress: number;
    icon: string;
    items: ListItem[];
    status: 'active' | 'archived' | 'shared';
    description?: string;
    storeId?: string;
}

export interface Transaction {
    id: string;
    category: string;
    description: string;
    amount: number;
    date: string;
    icon: React.FC<{className?: string}>;
}

export interface ExpenseCategory {
    name: string;
    value: number;
    color: string;
}

export type AppScreen = 'onboarding' | 'welcome' | 'lists' | 'listDetail' | 'addItem' | 'dashboard' | 'profile';

export type Language = 'en' | 'pt';

export type Theme = 'light' | 'dark';

export interface AppContextType {
    language: Language;
    setLanguage: (language: Language) => void;
    theme: Theme;
    setTheme: (theme: Theme) => void;
    t: (key: string) => string;
    stores: Store[];
    setStores: React.Dispatch<React.SetStateAction<Store[]>>;
    categories: Category[];
    setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}