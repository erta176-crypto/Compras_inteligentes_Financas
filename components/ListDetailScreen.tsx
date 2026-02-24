
import React, { useMemo, useState } from 'react';
import { ShoppingList, ListItem } from '../types';
import { useApp } from '../context/AppContext';
import { ProgressBar } from './ProgressBar';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { CircleIcon } from './icons/CircleIcon';
import { ShareIcon } from './icons/ShareIcon';
import { RefreshIcon } from './icons/RefreshIcon';
import { TrendingUpIcon } from './icons/TrendingUpIcon';
import { TrendingDownIcon } from './icons/TrendingDownIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { TagIcon } from './icons/TagIcon';
import { TrashIcon } from './icons/TrashIcon';
import { LayersIcon } from './icons/LayersIcon';
import { PlusIcon } from './icons/PlusIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { ArrowRightIcon } from './icons/ArrowRightIcon';
import { ArrowUpIcon } from './icons/ArrowUpIcon';
import { ArrowDownIcon } from './icons/ArrowDownIcon';
import { MoveItemsModal } from './MoveItemsModal';
import { SwipeableItem } from './SwipeableItem';
import { ConfirmationModal } from './ConfirmationModal';

interface ListDetailScreenProps {
    list: ShoppingList;
    lists: ShoppingList[];
    onBack: () => void;
    onAddItem: () => void;
    onToggleItem: (listId: string, itemId: string) => void;
    onEditItem: (item: ListItem) => void;
    onDeleteItem: (itemId: string) => void;
    onEditList: () => void;
    onCheckPrice: (listId: string, itemId: string) => void;
    onShowPriceAlert: (item: ListItem) => void;
    onSearchPromotions: (listId: string, itemId: string) => void;
    onShowPromotions: (item: ListItem) => void;
    onQuickAdd: (listId: string, name: string) => void;
    onBulkUpdate: (listId: string, itemIds: string[], updates: Partial<ListItem>) => void;
    onBulkDelete: (listId: string, itemIds: string[]) => void;
    onBulkMove: (sourceListId: string, destListId: string, itemIds: string[]) => void;
}

const ListItemComponent: React.FC<{ 
    item: ListItem; 
    onToggle: () => void; 
    onEdit: () => void; 
    onDelete: () => void;
    onCheckPrice: () => void; 
    onShowPriceAlert: () => void; 
    onSearchPromotions: () => void; 
    onShowPromotions: () => void; 
    isBulkMode: boolean;
    isSelected: boolean;
    onSelect: () => void;
    t: (k:string) => string;
}> = ({ item, onToggle, onEdit, onDelete, onCheckPrice, onShowPriceAlert, onSearchPromotions, onShowPromotions, isBulkMode, isSelected, onSelect, t }) => {
    return (
        <SwipeableItem onSwipeLeft={isBulkMode ? undefined : onDelete} onSwipeRight={isBulkMode ? undefined : onToggle} disableSwipe={isBulkMode} className="rounded-lg mb-2 shadow-sm">
            <div onClick={() => isBulkMode ? onSelect() : onEdit()} className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${isSelected ? 'bg-primary/10 border-primary border' : 'bg-light-surface dark:bg-dark-surface border border-transparent'}`}>
                <div className="flex items-center space-x-4 flex-1">
                     <button onClick={(e) => { e.stopPropagation(); isBulkMode ? onSelect() : onToggle(); }} className="flex-shrink-0">
                        {isBulkMode ? (isSelected ? <CheckCircleIcon className="w-6 h-6 text-primary" /> : <CircleIcon className="w-6 h-6 text-gray-300 dark:text-gray-600" />) : (item.completed ? <CheckCircleIcon className="w-6 h-6 text-primary" /> : <CircleIcon className="w-6 h-6 text-gray-300 dark:text-gray-600" />)}
                    </button>
                    {item.image && <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />}
                    <div className="flex-1">
                        <p className={`font-medium ${item.completed ? 'line-through text-gray-400' : 'text-light-text dark:text-dark-text'}`}>{item.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{`${item.quantity}${item.unit} • ${item.category}`}</p>
                    </div>
                </div>
                {!isBulkMode && (
                    <div className="text-right flex items-center space-x-2">
                        <div className="flex flex-col items-end">
                             <p className={`font-bold ${item.completed ? 'line-through text-gray-400' : ''} ${item.selectedPromotion ? 'text-green-600 dark:text-green-400' : ''}`}>
                                 {item.price ? `${(item.price * item.quantity).toFixed(2)} €` : ''}
                             </p>
                             {item.quantity > 1 && item.price && (
                                 <span className="text-[10px] text-gray-400 font-medium">
                                     {item.quantity} x {item.price.toFixed(2)}€
                                 </span>
                             )}
                             {item.selectedPromotion && <span className="text-[10px] bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded-full font-bold">{item.selectedPromotion.store}</span>}
                        </div>
                        {item.promotionStatus === 'checking' ? (
                            <div className="w-6 h-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                        ) : (
                            <button 
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    if (item.promotionStatus === 'checked' && item.promotions && item.promotions.length > 0) {
                                        onShowPromotions();
                                    } else {
                                        onSearchPromotions();
                                    }
                                }} 
                                className={`p-1 relative transition-all active:scale-90 ${item.selectedPromotion ? 'text-green-500' : item.promotionStatus === 'checked' && item.promotions && item.promotions.length > 0 ? 'text-primary' : 'text-gray-400'}`}
                            >
                                <TagIcon className="w-5 h-5"/>
                                {item.promotionStatus === 'checked' && item.promotions && item.promotions.length > 0 && !item.selectedPromotion && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] rounded-full h-4 w-4 flex items-center justify-center font-bold shadow-sm ring-1 ring-white dark:ring-dark-surface">
                                        {item.promotions.length}
                                    </span>
                                )}
                            </button>
                        )}
                        {item.price !== undefined && (item.alert === 'checking' ? <div className="w-6 h-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div> : <button onClick={(e) => { e.stopPropagation(); onCheckPrice(); }} className="p-1 text-gray-400 hover:text-primary"><RefreshIcon className="w-5 h-5"/></button>)}
                        {item.alert && (item.alert === 'up' || item.alert === 'down') && <button onClick={(e) => { e.stopPropagation(); onShowPriceAlert(); }} className="p-1">{item.alert === 'up' ? <TrendingUpIcon className="w-5 h-5 text-red-500"/> : <TrendingDownIcon className="w-5 h-5 text-green-500"/>}</button>}
                    </div>
                )}
            </div>
        </SwipeableItem>
    );
};

export const ListDetailScreen: React.FC<ListDetailScreenProps> = ({ list, lists, onBack, onAddItem, onToggleItem, onEditItem, onDeleteItem, onEditList, onCheckPrice, onShowPriceAlert, onSearchPromotions, onShowPromotions, onQuickAdd, onBulkUpdate, onBulkDelete, onBulkMove }) => {
    const { t, categories } = useApp();
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
    const [sortBy, setSortBy] = useState<'name' | 'price' | 'category'>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [isGrouped, setIsGrouped] = useState(false);
    const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
    const [showMoveModal, setShowMoveModal] = useState(false);
    const [quickAddName, setQuickAddName] = useState('');
    const [itemToDeleteId, setItemToDeleteId] = useState<string | null>(null);

    const { pendingItems, completedItems, totalCost, totalItems, completedItemsCount } = useMemo(() => {
        const pending = list.items.filter(item => !item.completed);
        const completed = list.items.filter(item => item.completed);
        const cost = list.items.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0);
        return { pendingItems: pending, completedItems: completed, totalCost: cost, totalItems: list.items.length, completedItemsCount: completed.length };
    }, [list.items]);
    
    const progress = totalItems > 0 ? Math.round((completedItemsCount / totalItems) * 100) : 0;

    const filteredItems = useMemo(() => {
        let items = filter === 'pending' ? [...pendingItems] : filter === 'completed' ? [...completedItems] : [...pendingItems, ...completedItems];
        return items.sort((a, b) => {
            let comp = sortBy === 'name' ? a.name.localeCompare(b.name) : sortBy === 'price' ? (a.price || 0) - (b.price || 0) : a.category.localeCompare(b.category);
            return sortDirection === 'asc' ? comp : -comp;
        });
    }, [filter, pendingItems, completedItems, sortBy, sortDirection]);

    const groupedItems = useMemo(() => {
        if (!isGrouped) return null;
        
        const groups: Record<string, ListItem[]> = {};
        filteredItems.forEach(item => {
            const cat = item.category || 'Outros';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(item);
        });
        
        const sortedGroupKeys = Object.keys(groups).sort((a, b) => {
            const indexA = categories.findIndex(c => c.name === a);
            const indexB = categories.findIndex(c => c.name === b);
            
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return a.localeCompare(b);
        });
        
        return sortedGroupKeys.map(key => ({
            category: key,
            items: groups[key]
        }));
    }, [filteredItems, isGrouped, categories]);

    const handleQuickAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (quickAddName.trim()) {
            onQuickAdd(list.id, quickAddName.trim());
            setQuickAddName('');
        }
    };

    return (
        <div className="h-full flex flex-col bg-light-bg dark:bg-dark-bg relative">
            <header className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-light-surface dark:bg-dark-surface sticky top-0 z-10">
                <button onClick={onBack} className="p-1"><ChevronLeftIcon className="w-6 h-6" /></button>
                <div className="flex-1 text-center px-2 min-w-0">
                    <div className="font-bold truncate">{list.icon} {list.name}</div>
                    {list.budgetCategory && (
                        <div className="text-[9px] font-black uppercase tracking-widest text-primary opacity-70 truncate">
                            {list.budgetCategory}
                        </div>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    {!isBulkMode && (
                        <>
                            <button onClick={onEditList} className="p-1 text-gray-500"><SettingsIcon className="w-6 h-6" /></button>
                            <button onClick={() => {}} className="p-1 text-primary"><ShareIcon className="w-6 h-6" /></button>
                        </>
                    )}
                    <button onClick={() => { setIsBulkMode(!isBulkMode); setSelectedItemIds([]); }} className={`font-semibold px-2 py-1 rounded ${isBulkMode ? 'text-red-500' : 'text-primary'}`}>{isBulkMode ? t('cancel') : t('selection_mode')}</button>
                </div>
            </header>

            <div className="flex-grow overflow-y-auto">
                <div className="p-4 space-y-4">
                    {!isBulkMode && (
                        <div className="bg-light-surface dark:bg-dark-surface rounded-2xl p-5 shadow-sm">
                            <div className="flex justify-between text-[10px] text-gray-400 font-black mb-2 uppercase tracking-widest"><span>{t('total_estimated')}</span><span>{t('articles')}</span></div>
                            <div className="flex justify-between items-center font-bold text-2xl mb-4"><span className="text-primary">{totalCost.toFixed(2)} €</span><span>{totalItems}</span></div>
                            <ProgressBar progress={progress} />
                        </div>
                    )}

                    <div className="flex items-center justify-between gap-4">
                        <div className="flex space-x-1 overflow-x-auto no-scrollbar py-1">
                             {(['all', 'pending', 'completed'] as const).map(f => (
                                <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 text-xs font-bold rounded-full whitespace-nowrap transition-all ${filter === f ? 'bg-primary text-white shadow-md' : 'bg-light-surface dark:bg-dark-surface text-gray-500'}`}>{t(f)}</button>
                             ))}
                        </div>
                        {!isBulkMode && (
                            <div className="flex items-center space-x-2">
                                <button onClick={() => setIsGrouped(!isGrouped)} className={`p-2 rounded-xl border ${isGrouped ? 'bg-primary text-white border-primary' : 'bg-light-surface dark:bg-dark-surface border-gray-200 dark:border-gray-700 text-gray-500'}`}>
                                    <LayersIcon className="w-4 h-4"/>
                                </button>
                                <button onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')} className="p-2 bg-light-surface dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-gray-700">{sortDirection === 'asc' ? <ArrowUpIcon className="w-4 h-4"/> : <ArrowDownIcon className="w-4 h-4"/>}</button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2 pb-32">
                        {isGrouped && groupedItems ? (
                            groupedItems.map(group => (
                                <div key={group.category} className="space-y-2">
                                    <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider px-1 pt-2">{group.category}</h3>
                                    {group.items.map(item => (
                                        <ListItemComponent key={item.id} item={item} onToggle={() => onToggleItem(list.id, item.id)} onEdit={() => onEditItem(item)} onDelete={() => setItemToDeleteId(item.id)} onCheckPrice={() => onCheckPrice(list.id, item.id)} onShowPriceAlert={() => onShowPriceAlert(item)} onSearchPromotions={() => onSearchPromotions(list.id, item.id)} onShowPromotions={() => onShowPromotions(item)} isBulkMode={isBulkMode} isSelected={selectedItemIds.includes(item.id)} onSelect={() => setSelectedItemIds(prev => prev.includes(item.id) ? prev.filter(i => i !== item.id) : [...prev, item.id])} t={t} />
                                    ))}
                                </div>
                            ))
                        ) : (
                            filteredItems.map(item => (
                                <ListItemComponent key={item.id} item={item} onToggle={() => onToggleItem(list.id, item.id)} onEdit={() => onEditItem(item)} onDelete={() => setItemToDeleteId(item.id)} onCheckPrice={() => onCheckPrice(list.id, item.id)} onShowPriceAlert={() => onShowPriceAlert(item)} onSearchPromotions={() => onSearchPromotions(list.id, item.id)} onShowPromotions={() => onShowPromotions(item)} isBulkMode={isBulkMode} isSelected={selectedItemIds.includes(item.id)} onSelect={() => setSelectedItemIds(prev => prev.includes(item.id) ? prev.filter(i => i !== item.id) : [...prev, item.id])} t={t} />
                            ))
                        )}
                    </div>
                </div>
            </div>

            {isBulkMode ? (
                <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-light-surface dark:bg-dark-surface border-t p-4 shadow-2xl z-50 flex flex-col space-y-4">
                    <div className="flex justify-between items-center"><span className="text-xs font-black text-gray-500 uppercase">{selectedItemIds.length} {t('items_selected')}</span><button onClick={() => setSelectedItemIds([])} className="text-xs text-primary font-black uppercase">{t('deselect_all')}</button></div>
                    <div className="grid grid-cols-4 gap-2">
                        <button onClick={() => { onBulkUpdate(list.id, selectedItemIds, { completed: true }); setIsBulkMode(false); }} className="bg-primary/10 text-primary p-3 rounded-xl flex flex-col items-center"><CheckCircleIcon className="w-5 h-5" /><span className="text-[10px] mt-1">{t('bulk_mark_done')}</span></button>
                        <button onClick={() => setShowMoveModal(true)} className="bg-purple-500/10 text-purple-500 p-3 rounded-xl flex flex-col items-center"><ArrowRightIcon className="w-5 h-5" /><span className="text-[10px] mt-1">{t('bulk_move')}</span></button>
                        <button onClick={() => { onBulkDelete(list.id, selectedItemIds); setIsBulkMode(false); }} className="bg-red-500/10 text-red-500 p-3 rounded-xl flex flex-col items-center"><TrashIcon className="w-5 h-5" /><span className="text-[10px] mt-1">{t('bulk_delete')}</span></button>
                    </div>
                </footer>
            ) : (
                <>
                    <button onClick={onAddItem} className="fixed bottom-24 right-6 w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white shadow-2xl active:scale-90 transition-all z-50"><PlusIcon className="w-8 h-8"/></button>
                    <footer className="p-4 bg-light-surface dark:bg-dark-surface border-t border-gray-200 dark:border-gray-700 z-10">
                        <form onSubmit={handleQuickAddSubmit} className="flex gap-2">
                            <input type="text" placeholder={t('quick_add_placeholder')} value={quickAddName} onChange={(e) => { const val = e.target.value; setQuickAddName(val.charAt(0).toUpperCase() + val.slice(1)); }} className="flex-1 p-3 bg-light-bg dark:bg-dark-bg border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none text-sm" />
                            <button type="submit" disabled={!quickAddName.trim()} className="bg-primary text-white p-3 rounded-xl disabled:opacity-50"><PlusIcon className="w-6 h-6" /></button>
                        </form>
                    </footer>
                </>
            )}
            
            <MoveItemsModal isOpen={showMoveModal} onClose={() => setShowMoveModal(false)} onMove={(dest) => { onBulkMove(list.id, dest, selectedItemIds); setIsBulkMode(false); setShowMoveModal(false); }} lists={lists} currentListId={list.id} />
            <ConfirmationModal isOpen={itemToDeleteId !== null} title={t('confirm_delete_item')} message={`${t('confirm_delete_item_msg')} "${list.items.find(i=>i.id===itemToDeleteId)?.name}"?`} onConfirm={() => { onDeleteItem(itemToDeleteId!); setItemToDeleteId(null); }} onCancel={() => setItemToDeleteId(null)} />
        </div>
    );
};
