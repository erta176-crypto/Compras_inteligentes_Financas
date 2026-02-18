
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { OnboardingScreen } from './components/OnboardingScreen';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ShoppingListsScreen } from './components/ShoppingListsScreen';
import { FinanceDashboardScreen } from './components/FinanceDashboardScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { ListDetailScreen } from './components/ListDetailScreen';
import { AddItemScreen } from './components/AddItemScreen';
import { BottomNavBar } from './components/BottomNavBar';
import { EditListModal } from './components/EditListModal';
import { PriceAlertModal } from './components/PriceAlertModal';
import { PromotionsModal } from './components/PromotionsModal';
import { shoppingLists as initialShoppingLists, recentTransactions, expensesByCategory } from './constants';
import { ShoppingList, ListItem as ItemType, AppScreen, Promotion } from './types';
import { fetchItemPrice, fetchItemPromotions } from './services/geminiService';

const AppContent: React.FC = () => {
    const { theme, stores, categories } = useApp();
    const [screen, setScreen] = useState<AppScreen>('onboarding');
    const [activeListId, setActiveListId] = useState<string | null>(null);
    const [itemToEdit, setItemToEdit] = useState<ItemType | null>(null);
    const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [priceAlertItem, setPriceAlertItem] = useState<ItemType | null>(null);
    const [promotionsModalItem, setPromotionsModalItem] = useState<ItemType | null>(null);


    // Load initial data from localStorage or use initial constants
    useEffect(() => {
        try {
            const storedLists = localStorage.getItem('shoppingLists');
            if (storedLists) {
                setShoppingLists(JSON.parse(storedLists));
            } else {
                setShoppingLists(initialShoppingLists);
            }
        } catch (error) {
            console.error("Failed to parse shopping lists from localStorage", error);
            setShoppingLists(initialShoppingLists);
        }

        if (localStorage.getItem('onboardingComplete')) {
            setScreen('welcome');
        }
    }, []);

    // Persist shopping lists to localStorage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem('shoppingLists', JSON.stringify(shoppingLists));
        } catch (error) {
            console.error("Failed to save shopping lists to localStorage", error);
        }
    }, [shoppingLists]);
    
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    const handleQuickAdd = useCallback((event: any) => {
        const { listId, name } = event.detail;
        const newItem: ItemType = {
            id: `item-${Date.now()}`,
            name,
            quantity: 1,
            unit: 'un',
            category: categories[0]?.name || 'Mercearia',
            completed: false,
            promotionStatus: 'idle',
        };
        
        setShoppingLists(prevLists =>
            prevLists.map(list =>
                list.id === listId
                    ? { ...list, items: [...list.items, newItem], itemCount: list.items.length + 1 }
                    : list
            )
        );
    }, [categories]);

    useEffect(() => {
        window.addEventListener('quick-add', handleQuickAdd);
        return () => window.removeEventListener('quick-add', handleQuickAdd);
    }, [handleQuickAdd]);

    const updateItemInLists = (listId: string, itemId: string, updates: Partial<ItemType>) => {
        setShoppingLists(prevLists =>
            prevLists.map(list =>
                list.id === listId
                    ? {
                        ...list,
                        items: list.items.map(item =>
                            item.id === itemId ? { ...item, ...updates } : item
                        )
                    }
                    : list
            )
        );
    };

    const handleCheckItemPrice = useCallback(async (listId: string, itemId: string) => {
        const list = shoppingLists.find(l => l.id === listId);
        const item = list?.items.find(i => i.id === itemId);
        if (!item) return;
        
        updateItemInLists(listId, itemId, { alert: 'checking' });

        const priceData = await fetchItemPrice(item.name);

        if (priceData) {
            const previousPrice = item.price;
            let alertStatus: ItemType['alert'] = 'stable';
            if (previousPrice) {
                if (priceData.price < previousPrice) alertStatus = 'down';
                else if (priceData.price > previousPrice) alertStatus = 'up';
            }

            const updatedItem = {
                price: priceData.price,
                priceHistory: [...(item.priceHistory || []), previousPrice].filter(p => p !== undefined) as number[],
                alert: alertStatus,
                source: priceData.source || undefined,
            };
            updateItemInLists(listId, itemId, updatedItem);
            
            const currentList = shoppingLists.find(l => l.id === listId);
            const finalUpdatedItem = currentList?.items.find(i => i.id === itemId);
            if (finalUpdatedItem) {
                setPriceAlertItem(finalUpdatedItem);
            }

        } else {
             updateItemInLists(listId, itemId, { alert: undefined }); // Reset on error
        }
    }, [shoppingLists]);

    const handleSearchPromotions = useCallback(async (listId: string, itemId: string) => {
        const list = shoppingLists.find(l => l.id === listId);
        const item = list?.items.find(i => i.id === itemId);
        if (!item) return;
    
        updateItemInLists(listId, itemId, { promotionStatus: 'checking' });
    
        const promotions = await fetchItemPromotions(item.name);
    
        updateItemInLists(listId, itemId, {
            promotions: promotions || [],
            promotionStatus: 'checked'
        });
    }, [shoppingLists]);

    const handleSelectPromotion = useCallback((promotion: Promotion) => {
        if (activeListId && promotionsModalItem) {
            updateItemInLists(activeListId, promotionsModalItem.id, {
                selectedPromotion: promotion,
                price: promotion.price || promotionsModalItem.price,
                source: promotion.source || undefined
            });
            setPromotionsModalItem(null);
        }
    }, [activeListId, promotionsModalItem]);

    const handleOnboardingComplete = useCallback(() => {
        localStorage.setItem('onboardingComplete', 'true');
        setScreen('welcome');
    }, []);

    const handleWelcomeComplete = useCallback(() => {
        setScreen('lists');
    }, []);

    const handleSelectList = useCallback((listId: string) => {
        setActiveListId(listId);
        setScreen('listDetail');
    }, []);

    const handleItemAdded = useCallback((newItem: ItemType) => {
        if (activeListId) {
            setShoppingLists(prevLists =>
                prevLists.map(list =>
                    list.id === activeListId
                        ? { ...list, items: [...list.items, newItem], itemCount: list.items.length + 1 }
                        : list
                )
            );
        }
        setScreen('listDetail');
    }, [activeListId]);
    
    const handleItemUpdated = useCallback((updatedItem: ItemType) => {
        if (activeListId) {
            setShoppingLists(prevLists =>
                prevLists.map(list =>
                    list.id === activeListId
                        ? { ...list, items: list.items.map(item => item.id === updatedItem.id ? updatedItem : item) }
                        : list
                )
            );
        }
        setItemToEdit(null);
        setScreen('listDetail');
    }, [activeListId]);

    const handleItemDeleted = useCallback((itemId: string) => {
        if(activeListId) {
            setShoppingLists(prevLists => 
                prevLists.map(list => 
                    list.id === activeListId
                    ? { ...list, items: list.items.filter(item => item.id !== itemId), itemCount: list.items.length - 1 }
                    : list
                )
            );
        }
        setItemToEdit(null);
        setScreen('listDetail');
    }, [activeListId]);

    const handleToggleItem = useCallback((listId: string, itemId: string) => {
        updateItemInLists(listId, itemId, { completed: !shoppingLists.find(l => l.id === listId)?.items.find(i => i.id === itemId)?.completed });
    }, [shoppingLists]);

    const handleEditItem = useCallback((item: ItemType) => {
        setItemToEdit(item);
        setScreen('addItem');
    }, []);

    const handleAddNewList = useCallback(() => {
        const newList: ShoppingList = {
            id: `list-${Date.now()}`,
            name: 'Nova Lista',
            itemCount: 0,
            estimatedCost: 0,
            progress: 0,
            icon: '📝',
            items: [],
            status: 'active'
        };
        setShoppingLists(prev => [newList, ...prev]);
        setActiveListId(newList.id);
        setIsEditModalOpen(true);
    }, []);

    const handleDeleteList = useCallback((listId: string) => {
        setShoppingLists(prev => prev.filter(list => list.id !== listId));
    }, []);

    const handleUpdateListDetails = useCallback((listId: string, name: string, icon: string, storeId?: string) => {
        setShoppingLists(prev => prev.map(list => list.id === listId ? {...list, name, icon, storeId } : list));
        setIsEditModalOpen(false);
    }, []);

    const handleBulkUpdate = useCallback((listId: string, itemIds: string[], updates: Partial<ItemType>) => {
        setShoppingLists(prevLists =>
            prevLists.map(list =>
                list.id === listId
                    ? {
                        ...list,
                        items: list.items.map(item =>
                            itemIds.includes(item.id) ? { ...item, ...updates } : item
                        )
                    }
                    : list
            )
        );
    }, []);

    const handleBulkDelete = useCallback((listId: string, itemIds: string[]) => {
        setShoppingLists(prevLists =>
            prevLists.map(list =>
                list.id === listId
                    ? {
                        ...list,
                        items: list.items.filter(item => !itemIds.includes(item.id)),
                        itemCount: list.items.length - itemIds.length
                    }
                    : list
            )
        );
    }, []);

    const handleBulkMove = useCallback((sourceListId: string, destListId: string, itemIds: string[]) => {
        setShoppingLists(prevLists => {
            const sourceListIndex = prevLists.findIndex(l => l.id === sourceListId);
            const destListIndex = prevLists.findIndex(l => l.id === destListId);

            if (sourceListIndex === -1 || destListIndex === -1) return prevLists;

            const sourceList = prevLists[sourceListIndex];
            const destList = prevLists[destListIndex];

            // Filter items to move
            const itemsToMove = sourceList.items.filter(item => itemIds.includes(item.id));
            
            // Remove from source
            const newSourceItems = sourceList.items.filter(item => !itemIds.includes(item.id));
            
            // Add to destination
            const newDestItems = [...destList.items, ...itemsToMove];

            const newLists = [...prevLists];
            
            newLists[sourceListIndex] = {
                ...sourceList,
                items: newSourceItems,
                itemCount: newSourceItems.length
            };
            
            newLists[destListIndex] = {
                ...destList,
                items: newDestItems,
                itemCount: newDestItems.length
            };

            return newLists;
        });
    }, []);

    const handleImportLists = useCallback((importedLists: ShoppingList[]) => {
        setShoppingLists(prev => {
            // Generate new IDs to prevent collisions
            const sanitizedImports = importedLists.map(list => ({
                ...list,
                id: `list-imp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                items: list.items.map(item => ({
                    ...item,
                    id: `item-imp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
                }))
            }));
            return [...sanitizedImports, ...prev];
        });
    }, []);

    const activeList = useMemo(() => {
        return shoppingLists.find(list => list.id === activeListId) || null;
    }, [activeListId, shoppingLists]);

    const renderScreen = () => {
        switch (screen) {
            case 'onboarding':
                return <OnboardingScreen onComplete={handleOnboardingComplete} />;
            case 'welcome':
                return <WelcomeScreen onComplete={handleWelcomeComplete} />;
            case 'lists':
                return <ShoppingListsScreen 
                    lists={shoppingLists} 
                    onSelectList={handleSelectList} 
                    onAddList={handleAddNewList} 
                    onDeleteList={handleDeleteList}
                    onImportLists={handleImportLists}
                />;
            case 'dashboard':
                return <FinanceDashboardScreen transactions={recentTransactions} expenses={expensesByCategory} />;
            case 'profile':
                return <ProfileScreen />;
            case 'listDetail':
                return activeList && <ListDetailScreen 
                    list={activeList}
                    lists={shoppingLists}
                    onBack={() => setScreen('lists')} 
                    onAddItem={() => { setItemToEdit(null); setScreen('addItem'); }} 
                    onToggleItem={handleToggleItem} 
                    onEditItem={handleEditItem} 
                    onDeleteItem={handleItemDeleted}
                    onEditList={() => setIsEditModalOpen(true)} 
                    onCheckPrice={handleCheckItemPrice} 
                    onShowPriceAlert={setPriceAlertItem} 
                    onSearchPromotions={handleSearchPromotions} 
                    onShowPromotions={setPromotionsModalItem}
                    onBulkUpdate={handleBulkUpdate}
                    onBulkDelete={handleBulkDelete}
                    onBulkMove={handleBulkMove}
                />;
            case 'addItem':
                 return <AddItemScreen 
                    onSave={itemToEdit ? handleItemUpdated : handleItemAdded} 
                    onCancel={() => setScreen('listDetail')} 
                    onDelete={handleItemDeleted}
                    item={itemToEdit} 
                />;
            default:
                return <ShoppingListsScreen 
                    lists={shoppingLists} 
                    onSelectList={handleSelectList} 
                    onAddList={handleAddNewList} 
                    onDeleteList={handleDeleteList}
                    onImportLists={handleImportLists}
                />;
        }
    };
    
    const showNavBar = ['lists', 'dashboard', 'profile'].includes(screen);

    return (
        <div className="h-screen w-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text font-sans">
            <main className={`h-full w-full max-w-md mx-auto bg-light-bg dark:bg-dark-bg shadow-lg relative ${showNavBar ? 'pb-20' : ''}`}>
                {renderScreen()}
                {showNavBar && <BottomNavBar activeScreen={screen} setScreen={setScreen} />}
                {isEditModalOpen && activeList && (
                    <EditListModal 
                        list={activeList}
                        stores={stores}
                        onClose={() => setIsEditModalOpen(false)}
                        onSave={handleUpdateListDetails}
                    />
                )}
                {priceAlertItem && (
                    <PriceAlertModal
                        item={priceAlertItem}
                        onClose={() => setPriceAlertItem(null)}
                    />
                )}
                {promotionsModalItem && (
                    <PromotionsModal
                        item={promotionsModalItem}
                        onClose={() => setPromotionsModalItem(null)}
                        onSelectPromotion={handleSelectPromotion}
                    />
                )}
            </main>
        </div>
    );
};

const App: React.FC = () => (
    <AppProvider>
        <AppContent />
    </AppProvider>
);

export default App;