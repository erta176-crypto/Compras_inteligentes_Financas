
import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect, useMemo } from 'react';
import { AppContextType, Language, Theme, Store, Category, User, ShoppingList, Transaction, Budget, PurchaseRecord } from '../types';
import { translations, initialStores, initialCategories, GOOGLE_CLIENT_ID } from '../constants';

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper robusto para decodificar JWT sem bibliotecas externas
const decodeJwt = (token: string) => {
    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) return null;
        let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) {
            base64 += '=';
        }
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Erro ao decodificar JWT:", e);
        return null;
    }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('pt');
    const [theme, setTheme] = useState<Theme>('light');
    const [stores, setStores] = useState<Store[]>(() => {
        const stored = localStorage.getItem('stores');
        return stored ? JSON.parse(stored) : initialStores;
    });
    const [categories, setCategories] = useState<Category[]>(() => {
        const stored = localStorage.getItem('categories');
        return stored ? JSON.parse(stored) : initialCategories;
    });
    const [lists, setLists] = useState<ShoppingList[]>(() => {
        const stored = localStorage.getItem('shopping_lists');
        return stored ? JSON.parse(stored) : [];
    });
    const [transactions, setTransactions] = useState<Transaction[]>(() => {
        const stored = localStorage.getItem('transactions');
        if (stored) return JSON.parse(stored);
        return [
            { id: '1', description: 'Supermercado Continente', amount: 85.40, date: new Date().toISOString().split('T')[0], type: 'expense', category: 'Supermercado' },
            { id: '2', description: 'Salário Mensal', amount: 2500.00, date: new Date().toISOString().split('T')[0], type: 'income', category: 'Salário' },
            { id: '3', description: 'Jantar Restaurante', amount: 45.00, date: new Date().toISOString().split('T')[0], type: 'expense', category: 'Restauração' },
            { id: '4', description: 'Pagamento Renda', amount: 850.00, date: new Date().toISOString().split('T')[0], type: 'expense', category: 'Habitação', isRecurring: true },
            { id: '5', description: 'Combustível Galp', amount: 60.00, date: new Date().toISOString().split('T')[0], type: 'expense', category: 'Combustível' }
        ];
    });
    const [budgets, setBudgets] = useState<Budget[]>(() => {
        const stored = localStorage.getItem('budgets');
        if (stored) return JSON.parse(stored);
        return [
            { id: '1', category: 'Supermercado', limit: 400, spent: 85.40, period: 'monthly' },
            { id: '2', category: 'Restauração', limit: 200, spent: 45.00, period: 'monthly' },
            { id: '3', category: 'Combustível', limit: 120, spent: 60.00, period: 'monthly' }
        ];
    });
    const [budgetCategories, setBudgetCategories] = useState<string[]>(() => {
        const stored = localStorage.getItem('budget_categories');
        return stored ? JSON.parse(stored) : ['Supermercado', 'Restauração', 'Vestuário', 'Combustível', 'Lazer', 'Habitação', 'Saúde', 'Transportes'];
    });
    const [purchaseHistory, setPurchaseHistory] = useState<PurchaseRecord[]>(() => {
        const stored = localStorage.getItem('purchase_history');
        return stored ? JSON.parse(stored) : [];
    });
    
    // Inicialização segura do utilizador
    const [user, setUser] = useState<User | null>(() => {
        try {
            const saved = localStorage.getItem('user');
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            localStorage.removeItem('user'); // Limpar dados corrompidos
            return null;
        }
    });

    // Efeitos de inicialização
    useEffect(() => {
        const storedTheme = localStorage.getItem('theme') as Theme;
        if (storedTheme) {
            setTheme(storedTheme);
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme('dark');
        }
    }, []);

    // Aplicar tema ao documento
    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Persistência das listas
    useEffect(() => {
        if (lists.length > 0) {
            localStorage.setItem('shopping_lists', JSON.stringify(lists));
        }
    }, [lists]);

    useEffect(() => {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }, [transactions]);

    useEffect(() => {
        localStorage.setItem('budgets', JSON.stringify(budgets));
    }, [budgets]);

    useEffect(() => {
        localStorage.setItem('budget_categories', JSON.stringify(budgetCategories));
    }, [budgetCategories]);

    useEffect(() => {
        localStorage.setItem('purchase_history', JSON.stringify(purchaseHistory));
    }, [purchaseHistory]);

    const login = (newUser: User) => {
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
        localStorage.setItem('last_logged_email', newUser.email);
        if (newUser.biometricsEnabled) {
            localStorage.setItem(`bio_v2_${newUser.email}`, 'true');
        }
    };

    const updateUser = (updates: Partial<User>) => {
        if (!user) return;
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        if (updatedUser.biometricsEnabled) {
            localStorage.setItem(`bio_v2_${updatedUser.email}`, 'true');
        } else {
            localStorage.removeItem(`bio_v2_${user.email}`);
        }
    };

    const loginWithGoogle = async (credential?: string) => {
        if (!credential) {
            console.error("Credencial Google não fornecida");
            return;
        }

        const payload = decodeJwt(credential);
        if (payload) {
            const googleUser: User = {
                id: payload.sub,
                name: payload.name,
                email: payload.email,
                photo: payload.picture,
                // Set to false to force the SetupProfileScreen redirect in App.tsx
                isProfileComplete: false, 
                memberSince: new Date().getFullYear().toString(),
                biometricsEnabled: localStorage.getItem(`bio_v2_${payload.email}`) === 'true'
            };
            login(googleUser);
        } else {
            throw new Error("Falha ao processar dados do Google");
        }
    };

    const loginWithBiometrics = async (): Promise<boolean> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const email = localStorage.getItem('last_logged_email');
                const isBioEnabled = email ? localStorage.getItem(`bio_v2_${email}`) === 'true' : false;
                
                if (isBioEnabled && email) {
                    const saved = localStorage.getItem('user');
                    if (saved) {
                        try {
                            const parsed = JSON.parse(saved);
                            if (parsed.email === email) {
                                setUser(parsed);
                                resolve(true);
                                return;
                            }
                        } catch (e) { console.error(e); }
                    }
                }
                resolve(false);
            }, 1000);
        });
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        if ((window as any).google) {
            try {
                (window as any).google.accounts.id.disableAutoSelect();
            } catch (e) {}
        }
    };

    const t = useCallback((key: string): string => {
        return (translations[language] as any)[key] || key;
    }, [language]);

    const addPurchaseRecord = useCallback((record: PurchaseRecord) => {
        setPurchaseHistory(prev => [record, ...prev]);
    }, []);

    const budgetsWithSpent = useMemo(() => {
        const now = new Date();
        return budgets.map(budget => {
            const transactionSpent = transactions
                .filter(tx => 
                    tx.type === 'expense' && 
                    tx.category.toLowerCase() === budget.category.toLowerCase() &&
                    new Date(tx.date).getMonth() === now.getMonth() &&
                    new Date(tx.date).getFullYear() === now.getFullYear()
                )
                .reduce((sum, tx) => sum + tx.amount, 0);

            const listSpent = lists
                .filter(list => 
                    list.status === 'active' &&
                    list.budgetCategory &&
                    list.budgetCategory.toLowerCase() === budget.category.toLowerCase()
                )
                .reduce((listSum, list) => {
                    const itemsCost = list.items
                        .filter(item => item.completed)
                        .reduce((itemSum, item) => itemSum + ((item.price || 0) * item.quantity), 0);
                    return listSum + itemsCost;
                }, 0);

            return { ...budget, spent: transactionSpent + listSpent };
        });
    }, [budgets, transactions, lists]);

    return (
        <AppContext.Provider value={{ 
            language, setLanguage, 
            theme, setTheme,
            user, loginWithGoogle, loginWithBiometrics, logout, updateUser, login,
            t, 
            stores, setStores, 
            categories, setCategories,
            lists, setLists,
            transactions, setTransactions,
            budgets, setBudgets,
            budgetsWithSpent,
            budgetCategories, setBudgetCategories,
            purchaseHistory, setPurchaseHistory, addPurchaseRecord
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (context === undefined) throw new Error('useApp must be used within an AppProvider');
    return context;
};
