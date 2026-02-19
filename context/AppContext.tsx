
import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { AppContextType, Language, Theme, Store, Category, User } from '../types';
import { translations, initialStores, initialCategories } from '../constants';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('pt');
    const [theme, setTheme] = useState<Theme>('light');
    const [stores, setStores] = useState<Store[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    
    const [user, setUser] = useState<User | null>(() => {
        try {
            const saved = localStorage.getItem('user');
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            return null;
        }
    });

    useEffect(() => {
        const storedTheme = localStorage.getItem('theme') as Theme;
        if (storedTheme) setTheme(storedTheme);

        const storedStores = localStorage.getItem('stores');
        setStores(storedStores ? JSON.parse(storedStores) : initialStores);

        const storedCategories = localStorage.getItem('categories');
        setCategories(storedCategories ? JSON.parse(storedCategories) : initialCategories);
    }, []);

    const login = (newUser: User) => {
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    const updateUser = (updates: Partial<User>) => {
        if (!user) return;
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    const loginWithGoogle = async () => {
        // Safe simulation of Google Login
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                const mockUser: User = {
                    id: 'google-' + Math.random().toString(36).substr(2, 9),
                    name: 'Utilizador Google',
                    email: 'user@google.com',
                    photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=GoogleUser`,
                    isProfileComplete: false,
                    memberSince: new Date().getFullYear().toString()
                };
                login(mockUser);
                resolve();
            }, 1000);
        });
    };

    const loginWithBiometrics = async (): Promise<boolean> => {
        // Simulation of platform biometric check
        return new Promise((resolve) => {
            setTimeout(() => {
                const savedUser = localStorage.getItem('user');
                if (savedUser) {
                    const parsed = JSON.parse(savedUser) as User;
                    if (parsed.biometricsEnabled) {
                        setUser(parsed);
                        resolve(true);
                        return;
                    }
                }
                resolve(false);
            }, 1500);
        });
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    const t = useCallback((key: string): string => {
        return (translations[language] as any)[key] || key;
    }, [language]);

    return (
        <AppContext.Provider value={{ 
            language, setLanguage, 
            theme, setTheme: (newTheme: Theme) => {
                setTheme(newTheme);
                localStorage.setItem('theme', newTheme);
            }, 
            user, loginWithGoogle, loginWithBiometrics, logout, updateUser, login,
            t, 
            stores, setStores, 
            categories, setCategories
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};
