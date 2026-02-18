
import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { AppContextType, Language, Theme, Store, Category } from '../types';
import { translations, initialStores, initialCategories } from '../constants';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('pt');
    const [theme, setTheme] = useState<Theme>('light');
    const [stores, setStores] = useState<Store[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        // Theme logic
        const storedTheme = localStorage.getItem('theme') as Theme;
        if (storedTheme) {
            setTheme(storedTheme);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme('dark');
        }

        // Stores logic
        const storedStores = localStorage.getItem('stores');
        if (storedStores) {
            setStores(JSON.parse(storedStores));
        } else {
            setStores(initialStores);
        }

        // Categories logic
        const storedCategories = localStorage.getItem('categories');
        if (storedCategories) {
            setCategories(JSON.parse(storedCategories));
        } else {
            setCategories(initialCategories);
        }
    }, []);

    useEffect(() => {
        if (stores.length > 0) localStorage.setItem('stores', JSON.stringify(stores));
    }, [stores]);

    useEffect(() => {
        if (categories.length > 0) localStorage.setItem('categories', JSON.stringify(categories));
    }, [categories]);

    const handleSetTheme = (newTheme: Theme) => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    const t = useCallback((key: string): string => {
        return translations[language][key] || key;
    }, [language]);

    return (
        <AppContext.Provider value={{ 
            language, setLanguage, 
            theme, setTheme: handleSetTheme, 
            t, 
            stores, setStores, 
            categories, setCategories 
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = (): AppContextType => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};
