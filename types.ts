
import React from 'react';

export interface User {
    id: string;
    name: string;
    email: string;
    photo?: string;
    isProfileComplete: boolean;
    biometricsEnabled?: boolean;
    memberSince: string;
}

export interface Store {
    id: string;
    name: string;
    icon?: string;
    color?: string;
}

export interface Category {
    id: string;
    name: string;
    color?: string;
}

export interface Promotion {
    id?: string;
    store: string;
    description: string;
    price?: number;
    date?: string;
    source: {
        uri: string;
        title: string;
    };
}

export interface ListItem {
    id:string;
    name: string;
    quantity: number;
    unit: 'kg' | 'lt' | 'un' | 'cx' | 'dz' | 'pct' | 'ml' | 'g';
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

export interface PurchaseRecord {
    id: string;
    date: string;
    totalAmount: number;
    store?: string;
    items: ListItem[];
    listName: string;
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
    isHistoryArchive?: boolean;
    description?: string;
    storeId?: string;
    budgetCategory?: string;
}

export interface Transaction {
    id: string;
    category: string;
    description: string;
    amount: number;
    date: string;
    type: 'expense' | 'income';
    isRecurring?: boolean;
    recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
    storeId?: string;
}

export interface Budget {
    id: string;
    category: string;
    limit: number;
    spent: number;
    period: 'monthly';
}

export interface Insight {
    id: string;
    type: 'saving' | 'warning' | 'tip' | 'optimization';
    title: string;
    description: string;
    impact?: string;
    category?: string;
    date: string;
}

export interface FinancialSummary {
    totalBalance: number;
    monthlySpending: number;
    monthlyIncome: number;
    healthScore: number;
}

export type AppScreen = 'onboarding' | 'welcome' | 'setupProfile' | 'lists' | 'listDetail' | 'addItem' | 'dashboard' | 'budget' | 'settings' | 'history';

export type Language = 'en' | 'pt';

export type Theme = 'light' | 'dark';

export interface AppContextType {
    language: Language;
    setLanguage: (language: Language) => void;
    theme: Theme;
    setTheme: (theme: Theme) => void;
    user: User | null;
    loginWithGoogle: (credential?: string) => Promise<void>;
    loginWithBiometrics: () => Promise<boolean>;
    logout: () => void;
    updateUser: (updates: Partial<User>) => void;
    t: (key: string) => string;
    stores: Store[];
    setStores: React.Dispatch<React.SetStateAction<Store[]>>;
    categories: Category[];
    setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
    lists: ShoppingList[];
    setLists: React.Dispatch<React.SetStateAction<ShoppingList[]>>;
    transactions: Transaction[];
    setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
    budgets: Budget[];
    setBudgets: React.Dispatch<React.SetStateAction<Budget[]>>;
    budgetsWithSpent: Budget[];
    budgetCategories: string[];
    setBudgetCategories: React.Dispatch<React.SetStateAction<string[]>>;
    login: (user: User) => void;
    purchaseHistory: PurchaseRecord[];
    setPurchaseHistory: React.Dispatch<React.SetStateAction<PurchaseRecord[]>>;
    addPurchaseRecord: (record: PurchaseRecord) => void;
}
