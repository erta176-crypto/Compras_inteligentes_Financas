
import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AppScreen, ShoppingList, ListItem, Transaction, ExpenseCategory } from './types';
import { OnboardingScreen } from './components/OnboardingScreen';
import { WelcomeScreen } from './components/WelcomeScreen';
import { SetupProfileScreen } from './components/SetupProfileScreen';
import { ShoppingListsScreen } from './components/ShoppingListsScreen';
import { ListDetailScreen } from './components/ListDetailScreen';
import { AddItemScreen } from './components/AddItemScreen';
import { FinanceDashboardScreen } from './components/FinanceDashboardScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { BottomNavBar } from './components/BottomNavBar';
import { EditListModal } from './components/EditListModal';
import { PriceAlertModal } from './components/PriceAlertModal';
import { PromotionsModal } from './components/PromotionsModal';
import { initialStores } from './constants';
import { fetchItemPrice, fetchItemPromotions } from './services/geminiService';
import { CartIcon } from './components/icons/CartIcon';
import { PlaneIcon } from './components/icons/PlaneIcon';

const AppContent: React.FC = () => {
    const { user, t } = useApp();
    const [screen, setScreen] = useState<AppScreen>('welcome');
    const [lists, setLists] = useState<ShoppingList[]>([]);
    const [selectedListId, setSelectedListId] = useState<string | null>(null);
    const [editingItem, setEditingItem] = useState<ListItem | null>(null);
    const [editingList, setEditingList] = useState<ShoppingList | null>(null);
    const [alertItem, setAlertItem] = useState<ListItem | null>(null);
    const [promoItem, setPromoItem] = useState<ListItem | null>(null);
    
    // Auth state persistence and initialization
    useEffect(() => {
        const onboardingDone = localStorage.getItem('onboarding_done');
        const storedLists = localStorage.getItem('shopping_lists');
        
        if (storedLists) {
            setLists(JSON.parse(storedLists));
        }

        if (!onboardingDone) {
            setScreen('onboarding');
        } else if (!user) {
            setScreen('welcome');
        } else if (!user.isProfileComplete) {
            setScreen('setupProfile');
        } else {
            setScreen('lists');
        }
    }, [user]);

    useEffect(() => {
        if (lists.length > 0) {
            localStorage.setItem('shopping_lists', JSON.stringify(lists));
        }
    }, [lists]);

    // Derived State
    const selectedList = lists.find(l => l.id === selectedListId);

    // Actions
    const handleOnboardingComplete = () => {
        localStorage.setItem('onboarding_done', 'true');
        setScreen('welcome');
    };

    const handleAuthComplete = () => {
        if (user && !user.isProfileComplete) {
            setScreen('setupProfile');
        } else {
            setScreen('lists');
        }
    };

    const handleProfileComplete = () => {
        setScreen('lists');
    };

    const handleAddList = () => {
        const newList: ShoppingList = {
            id: `list-${Date.now()}`,
            name: 'Nova Lista',
            icon: '🛍️',
            itemCount: 0,
            estimatedCost: 0,
            progress: 0,
            items: [],
            status: 'active'
        };
        setLists([...lists, newList]);
        setSelectedListId(newList.id);
        setScreen('listDetail');
    };

    const handleDeleteList = (id: string) => {
        setLists(lists.filter(l => l.id !== id));
    };

    const handleToggleItem = (listId: string, itemId: string) => {
        setLists(lists.map(list => {
            if (list.id !== listId) return list;
            const updatedItems = list.items.map(item => 
                item.id === itemId ? { ...item, completed: !item.completed } : item
            );
            const completedCount = updatedItems.filter(i => i.completed).length;
            return {
                ...list,
                items: updatedItems,
                progress: updatedItems.length > 0 ? Math.round((completedCount / updatedItems.length) * 100) : 0
            };
        }));
    };

    const handleSaveItem = (itemToSave: ListItem) => {
        if (!selectedListId) return;
        setLists(lists.map(list => {
            if (list.id !== selectedListId) return list;
            const itemExists = list.items.some(i => i.id === itemToSave.id);
            const updatedItems = itemExists 
                ? list.items.map(i => i.id === itemToSave.id ? itemToSave : i)
                : [...list.items, itemToSave];
            
            const completedCount = updatedItems.filter(i => i.completed).length;
            return {
                ...list,
                items: updatedItems,
                itemCount: updatedItems.length,
                estimatedCost: updatedItems.reduce((acc, i) => acc + (i.price || 0), 0),
                progress: updatedItems.length > 0 ? Math.round((completedCount / updatedItems.length) * 100) : 0
            };
        }));
        setScreen('listDetail');
        setEditingItem(null);
    };

    const handleCheckPrice = async (listId: string, itemId: string) => {
        const list = lists.find(l => l.id === listId);
        const item = list?.items.find(i => i.id === itemId);
        if (!item) return;

        // Set checking state locally
        setLists(prev => prev.map(l => l.id === listId ? {
            ...l,
            items: l.items.map(i => i.id === itemId ? { ...i, alert: 'checking' } : i)
        } : l));

        const result = await fetchItemPrice(item.name);
        if (result) {
            setLists(prev => prev.map(l => l.id === listId ? {
                ...l,
                items: l.items.map(i => {
                    if (i.id !== itemId) return i;
                    const history = [...(i.priceHistory || []), i.price || result.price];
                    const alert = result.price < (i.price || result.price) ? 'down' : result.price > (i.price || result.price) ? 'up' : 'stable';
                    return { ...i, price: result.price, priceHistory: history, alert, source: result.source };
                })
            } : l));
        }
    };

    const handleSearchPromotions = async (listId: string, itemId: string) => {
        setLists(prev => prev.map(l => l.id === listId ? {
            ...l,
            items: l.items.map(i => i.id === itemId ? { ...i, promotionStatus: 'checking' } : i)
        } : l));

        const promos = await fetchItemPromotions(lists.find(l => l.id === listId)?.items.find(i => i.id === itemId)?.name || '');
        setLists(prev => prev.map(l => l.id === listId ? {
            ...l,
            items: l.items.map(i => i.id === itemId ? { ...i, promotions: promos || [], promotionStatus: 'checked' } : i)
        } : l));
    };

    // Render Logic
    const renderScreen = () => {
        switch (screen) {
            case 'onboarding': return <OnboardingScreen onComplete={handleOnboardingComplete} />;
            case 'welcome': return <WelcomeScreen onComplete={handleAuthComplete} />;
            case 'setupProfile': return <SetupProfileScreen onComplete={handleProfileComplete} />;
            case 'lists': return (
                <ShoppingListsScreen 
                    lists={lists} 
                    onSelectList={(id) => { setSelectedListId(id); setScreen('listDetail'); }}
                    onAddList={handleAddList}
                    onDeleteList={handleDeleteList}
                    onImportLists={(newLists) => setLists([...lists, ...newLists])}
                />
            );
            case 'listDetail': return selectedList ? (
                <ListDetailScreen 
                    list={selectedList}
                    lists={lists}
                    onBack={() => setScreen('lists')}
                    onAddItem={() => { setEditingItem(null); setScreen('addItem'); }}
                    onToggleItem={handleToggleItem}
                    onEditItem={(item) => { setEditingItem(item); setScreen('addItem'); }}
                    onDeleteItem={(itemId) => setLists(lists.map(l => l.id === selectedListId ? { ...l, items: l.items.filter(i => i.id !== itemId) } : l))}
                    onEditList={() => setEditingList(selectedList)}
                    onCheckPrice={handleCheckPrice}
                    onShowPriceAlert={setAlertItem}
                    onSearchPromotions={handleSearchPromotions}
                    onShowPromotions={setPromoItem}
                    onBulkUpdate={(lid, ids, updates) => setLists(lists.map(l => l.id === lid ? { ...l, items: l.items.map(i => ids.includes(i.id) ? { ...i, ...updates } : i) } : l))}
                    onBulkDelete={(lid, ids) => setLists(lists.map(l => l.id === lid ? { ...l, items: l.items.filter(i => !ids.includes(i.id)) } : l))}
                    onBulkMove={(src, dest, ids) => {
                        const itemsToMove = lists.find(l => l.id === src)?.items.filter(i => ids.includes(i.id)) || [];
                        setLists(lists.map(l => {
                            if (l.id === src) return { ...l, items: l.items.filter(i => !ids.includes(i.id)) };
                            if (l.id === dest) return { ...l, items: [...l.items, ...itemsToMove] };
                            return l;
                        }));
                    }}
                />
            ) : null;
            case 'addItem': return (
                <AddItemScreen 
                    item={editingItem}
                    onSave={handleSaveItem}
                    onCancel={() => setScreen('listDetail')}
                    onDelete={(id) => {
                        setLists(lists.map(l => l.id === selectedListId ? { ...l, items: l.items.filter(i => i.id !== id) } : l));
                        setScreen('listDetail');
                    }}
                />
            );
            case 'dashboard': return <FinanceDashboardScreen 
                transactions={[
                    { id: '1', description: 'Supermercado Continente', amount: -45.60, date: 'Hoje', category: 'Alimentação', icon: CartIcon },
                    { id: '2', description: 'Viagem Uber', amount: -12.40, date: 'Ontem', category: 'Transporte', icon: PlaneIcon },
                ]} 
                expenses={[
                    { name: 'Alimentação', value: 120, color: '#2ECC71' },
                    { name: 'Lazer', value: 45, color: '#3B82F6' }
                ]}
            />;
            case 'profile': return <ProfileScreen />;
            default: return null;
        }
    };

    const showNavBar = ['lists', 'dashboard', 'profile'].includes(screen);

    return (
        <div className="h-full flex flex-col bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text max-w-md mx-auto shadow-2xl relative overflow-hidden">
            <main className="flex-grow overflow-hidden h-full">
                {renderScreen()}
            </main>
            
            {showNavBar && <BottomNavBar activeScreen={screen} setScreen={setScreen} />}

            {editingList && (
                <EditListModal 
                    list={editingList}
                    stores={initialStores}
                    onClose={() => setEditingList(null)}
                    onSave={(id, name, icon, storeId) => {
                        setLists(lists.map(l => l.id === id ? { ...l, name, icon, storeId } : l));
                        setEditingList(null);
                    }}
                />
            )}

            {alertItem && <PriceAlertModal item={alertItem} onClose={() => setAlertItem(null)} />}
            {promoItem && (
                <PromotionsModal 
                    item={promoItem} 
                    onClose={() => setPromoItem(null)} 
                    onSelectPromotion={(promo) => {
                        if (selectedListId && promoItem) {
                            setLists(lists.map(l => l.id === selectedListId ? {
                                ...l,
                                items: l.items.map(i => i.id === promoItem.id ? { ...i, selectedPromotion: promo, price: promo.price || i.price } : i)
                            } : l));
                            setPromoItem(null);
                        }
                    }}
                />
            )}
        </div>
    );
};

const App: React.FC = () => (
    <AppProvider>
        <AppContent />
    </AppProvider>
);

export default App;
