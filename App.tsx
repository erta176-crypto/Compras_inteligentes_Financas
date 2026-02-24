
import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AppScreen, ShoppingList, ListItem } from './types';
import { OnboardingScreen } from './components/OnboardingScreen';
import { WelcomeScreen } from './components/WelcomeScreen';
import { SetupProfileScreen } from './components/SetupProfileScreen';
import { ShoppingListsScreen } from './components/ShoppingListsScreen';
import { ListDetailScreen } from './components/ListDetailScreen';
import { AddItemScreen } from './components/AddItemScreen';
import { FinanceDashboardScreen } from './components/FinanceDashboardScreen';
import { BudgetScreen } from './components/BudgetScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { BottomNavBar } from './components/BottomNavBar';
import { EditListModal } from './components/EditListModal';
import { PriceAlertModal } from './components/PriceAlertModal';
import { PromotionsModal } from './components/PromotionsModal';
import { initialStores } from './constants';
import { fetchItemPrice, fetchItemPromotions, suggestItemDetails } from './services/geminiService';

const AppContent: React.FC = () => {
    const { user, t, lists, setLists, categories, budgetCategories, stores } = useApp();
    const [screen, setScreen] = useState<AppScreen>('welcome');
    const [selectedListId, setSelectedListId] = useState<string | null>(null);
    const [editingItem, setEditingItem] = useState<ListItem | null>(null);
    const [editingList, setEditingList] = useState<ShoppingList | null>(null);
    const [alertItem, setAlertItem] = useState<ListItem | null>(null);
    const [promoItem, setPromoItem] = useState<ListItem | null>(null);
    
    useEffect(() => {
        const onboardingDone = localStorage.getItem('onboarding_done');
        if (!onboardingDone) setScreen('onboarding');
        else if (!user) setScreen('welcome');
        else if (!user.isProfileComplete) setScreen('setupProfile');
        else if (screen === 'welcome' || screen === 'onboarding') setScreen('dashboard');
    }, [user]);

    const handleQuickAdd = async (listId: string, name: string) => {
        const newItemId = `item-${Date.now()}`;
        const newItem: ListItem = {
            id: newItemId,
            name: name,
            quantity: 1,
            unit: 'un',
            category: 'Mercearia',
            completed: false,
            promotionStatus: 'idle'
        };

        setLists(prev => prev.map(l => {
            if (l.id !== listId) return l;
            const updatedItems = [...l.items, newItem];
            return {
                ...l,
                items: updatedItems,
                itemCount: updatedItems.length,
                progress: updatedItems.length > 0 ? Math.round((updatedItems.filter(i => i.completed).length / updatedItems.length) * 100) : 0
            };
        }));

        const availableCatNames = categories.map(c => c.name);
        // Updated unit list based on the image provided
        const availableUnits: ListItem['unit'][] = ['kg', 'lt', 'un', 'cx', 'dz', 'pct', 'ml', 'g'];
        const suggestion = await suggestItemDetails(name, availableCatNames, availableUnits);
        
        if (suggestion) {
            setLists(prev => prev.map(l => {
                if (l.id !== listId) return l;
                return {
                    ...l,
                    items: l.items.map(i => i.id === newItemId ? { ...i, category: suggestion.category, unit: suggestion.unit as any } : i)
                };
            }));
        }
    };

    const selectedList = lists.find(l => l.id === selectedListId);

    const handleOnboardingComplete = () => {
        localStorage.setItem('onboarding_done', 'true');
        setScreen('welcome');
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

    const handleToggleItem = (listId: string, itemId: string) => {
        setLists(lists.map(list => {
            if (list.id !== listId) return list;
            const updatedItems = list.items.map(item => 
                item.id === itemId ? { ...item, completed: !item.completed } : item
            );
            return {
                ...list,
                items: updatedItems,
                progress: updatedItems.length > 0 ? Math.round((updatedItems.filter(i => i.completed).length / updatedItems.length) * 100) : 0
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
            
            // Fix: Calculate completedCount locally to update list statistics correctly
            const completedCount = updatedItems.filter(i => i.completed).length;

            return {
                ...list,
                items: updatedItems,
                itemCount: updatedItems.length,
                estimatedCost: updatedItems.reduce((acc, i) => acc + ((i.price || 0) * i.quantity), 0),
                progress: updatedItems.length > 0 ? Math.round((completedCount / updatedItems.length) * 100) : 0
            };
        }));
        setScreen('listDetail');
        setEditingItem(null);
    };

    const handleCheckPrice = async (listId: string, itemId: string) => {
        const item = lists.find(l => l.id === listId)?.items.find(i => i.id === itemId);
        if (!item) return;

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
                    const alert = result.price < (i.price || result.price) ? 'down' : result.price > (i.price || result.price) ? 'up' : 'stable';
                    return { ...i, price: result.price, alert, source: result.source };
                })
            } : l));
        }
    };

    const handleSearchPromotions = async (listId: string, itemId: string) => {
        const list = lists.find(l => l.id === listId);
        const item = list?.items.find(i => i.id === itemId);
        if (!item) return;

        setLists(prev => prev.map(l => l.id === listId ? {
            ...l,
            items: l.items.map(i => i.id === itemId ? { ...i, promotionStatus: 'checking' } : i)
        } : l));

        try {
            const promos = await fetchItemPromotions(item.name);
            setLists(prev => prev.map(l => l.id === listId ? {
                ...l,
                items: l.items.map(i => i.id === itemId ? { ...i, promotions: promos || [], promotionStatus: 'checked' } : i)
            } : l));
        } catch (error) {
            console.error("Failed to fetch promotions", error);
            setLists(prev => prev.map(l => l.id === listId ? {
                ...l,
                items: l.items.map(i => i.id === itemId ? { ...i, promotionStatus: 'idle' } : i)
            } : l));
        }
    };

    const renderScreen = () => {
        switch (screen) {
            case 'onboarding': return <OnboardingScreen onComplete={handleOnboardingComplete} />;
            case 'welcome': return <WelcomeScreen onComplete={() => setScreen('dashboard')} />;
            case 'setupProfile': return <SetupProfileScreen onComplete={() => setScreen('dashboard')} />;
            case 'dashboard': return <FinanceDashboardScreen />;
            case 'budget': return <BudgetScreen />;
            case 'lists': return (
                <ShoppingListsScreen 
                    lists={lists} 
                    onSelectList={(id) => { setSelectedListId(id); setScreen('listDetail'); }}
                    onAddList={handleAddList}
                    onDeleteList={(id) => setLists(lists.filter(l => l.id !== id))}
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
                    onQuickAdd={handleQuickAdd}
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
            case 'settings': return <ProfileScreen />;
            default: return null;
        }
    };

    const showNavBar = ['dashboard', 'budget', 'lists', 'settings'].includes(screen);

    return (
        <div className="h-full flex flex-col bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text max-w-md mx-auto shadow-2xl relative overflow-hidden">
            <main className="flex-grow overflow-hidden h-full">{renderScreen()}</main>
            {showNavBar && <BottomNavBar activeScreen={screen} setScreen={setScreen} />}
            {editingList && (
                <EditListModal 
                    list={editingList}
                    stores={stores}
                    budgetCategories={budgetCategories}
                    onClose={() => setEditingList(null)}
                    onSave={(id, name, icon, storeId, budgetCategory) => {
                        setLists(lists.map(l => l.id === id ? { ...l, name, icon, storeId, budgetCategory } : l));
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
    <AppProvider><AppContent /></AppProvider>
);

export default App;
