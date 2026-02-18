
import React, { useMemo, useState } from 'react';
import { ShoppingList, ListItem } from '../types';
import { useApp } from '../context/AppContext';
import { ProgressBar } from './ProgressBar';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { CircleIcon } from './icons/CircleIcon';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
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
    onBulkUpdate: (listId: string, itemIds: string[], updates: Partial<ListItem>) => void;
    onBulkDelete: (listId: string, itemIds: string[]) => void;
    onBulkMove: (sourceListId: string, destListId: string, itemIds: string[]) => void;
}

type SortOption = 'name' | 'price' | 'category';
type SortDirection = 'asc' | 'desc';

const ListItemComponent: React.FC<{ 
    listId: string; 
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
}> = ({ listId, item, onToggle, onEdit, onDelete, onCheckPrice, onShowPriceAlert, onSearchPromotions, onShowPromotions, isBulkMode, isSelected, onSelect, t }) => {
    const handleClick = () => {
        if (isBulkMode) {
            onSelect();
        } else {
            onEdit();
        }
    };
    
    const handleDelete = () => {
        if(window.confirm(t('confirm_delete_item'))) {
            onDelete();
        }
    }

    return (
        <SwipeableItem 
            onSwipeLeft={isBulkMode ? undefined : handleDelete}
            onSwipeRight={isBulkMode ? undefined : onToggle}
            disableSwipe={isBulkMode}
            className="rounded-lg mb-2 shadow-sm"
        >
            <div 
                onClick={handleClick} 
                className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${isSelected ? 'bg-primary/10 border-primary border' : 'bg-light-surface dark:bg-dark-surface border border-transparent'}`}
            >
                <div className="flex items-center space-x-4 flex-1">
                     <button 
                        onClick={(e) => { e.stopPropagation(); isBulkMode ? onSelect() : onToggle(); }} 
                        className="flex-shrink-0"
                    >
                        {isBulkMode ? (
                            isSelected ? <CheckCircleIcon className="w-6 h-6 text-primary" /> : <CircleIcon className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                        ) : (
                            item.completed ? <CheckCircleIcon className="w-6 h-6 text-primary" /> : <CircleIcon className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                        )}
                    </button>
                    {item.image && (
                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                    )}
                    <div className="flex-1">
                        <p className={`font-medium ${item.completed ? 'line-through text-gray-400' : 'text-light-text dark:text-dark-text'}`}>{item.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{`${item.quantity}${item.unit} • ${item.category}`}</p>
                    </div>
                </div>
                {!isBulkMode && (
                    <div className="text-right flex items-center space-x-2">
                        <div className="flex flex-col items-end">
                             <p className={`font-bold ${item.completed ? 'line-through text-gray-400' : 'text-light-text dark:text-dark-text'} ${item.selectedPromotion ? 'text-green-600 dark:text-green-400' : ''}`}>
                                 {item.price ? `${item.price.toFixed(2)} €` : ''}
                             </p>
                             {item.selectedPromotion && (
                                 <span className="text-[10px] bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded-full font-bold">
                                     {item.selectedPromotion.store}
                                 </span>
                             )}
                             {item.price && item.quantity > 1 && !item.selectedPromotion && <p className="text-xs text-gray-400">{`${(item.price/item.quantity).toFixed(2)} €/${item.unit}`}</p>}
                        </div>

                        {item.promotionStatus === 'checking' ? (
                            <div className="w-6 h-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                        ) : (
                            <button 
                                onClick={(e) => { e.stopPropagation(); onSearchPromotions(); }} 
                                className={`p-1 relative ${item.selectedPromotion ? 'text-green-500' : 'text-gray-400 hover:text-primary'}`}
                                title="Procurar promoções"
                            >
                                <TagIcon className="w-5 h-5"/>
                                {item.promotionStatus === 'checked' && item.promotions && item.promotions.length > 0 && !item.selectedPromotion && (
                                     <span 
                                        onClick={(e) => { e.stopPropagation(); onShowPromotions(); }}
                                        className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center cursor-pointer"
                                     >
                                         {item.promotions.length}
                                     </span>
                                )}
                            </button>
                        )}

                        {item.price !== undefined && (
                            item.alert === 'checking' ? (
                                <div className="w-6 h-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                            ) : (
                                <button onClick={(e) => { e.stopPropagation(); onCheckPrice(); }} className="p-1 text-gray-400 hover:text-primary">
                                    <RefreshIcon className="w-5 h-5"/>
                                </button>
                            )
                        )}
                        {item.alert && (item.alert === 'up' || item.alert === 'down') && (
                             <button onClick={(e) => { e.stopPropagation(); onShowPriceAlert(); }} className="p-1">
                                 {item.alert === 'up' && <TrendingUpIcon className="w-5 h-5 text-red-500"/>}
                                 {item.alert === 'down' && <TrendingDownIcon className="w-5 h-5 text-green-500"/>}
                             </button>
                        )}
                    </div>
                )}
            </div>
        </SwipeableItem>
    );
};

export const ListDetailScreen: React.FC<ListDetailScreenProps> = ({ list, lists, onBack, onAddItem, onToggleItem, onEditItem, onDeleteItem, onEditList, onCheckPrice, onShowPriceAlert, onSearchPromotions, onShowPromotions, onBulkUpdate, onBulkDelete, onBulkMove }) => {
    const { t, categories } = useApp();
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
    const [sortBy, setSortBy] = useState<SortOption>('name');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
    const [showBulkCategoryPicker, setShowBulkCategoryPicker] = useState(false);
    const [showMoveModal, setShowMoveModal] = useState(false);
    const [quickAddName, setQuickAddName] = useState('');

    const { pendingItems, completedItems, totalCost, totalItems, completedItemsCount } = useMemo(() => {
        const pending = list.items.filter(item => !item.completed);
        const completed = list.items.filter(item => item.completed);
        const cost = list.items.reduce((sum, item) => sum + (item.price || 0), 0);
        return {
            pendingItems: pending,
            completedItems: completed,
            totalCost: cost,
            totalItems: list.items.length,
            completedItemsCount: completed.length
        };
    }, [list.items]);
    
    const progress = totalItems > 0 ? Math.round((completedItemsCount / totalItems) * 100) : 0;

    const filteredItems = useMemo(() => {
        let baseItems: ListItem[] = [];
        if (filter === 'pending') baseItems = [...pendingItems];
        else if (filter === 'completed') baseItems = [...completedItems];
        else baseItems = [...pendingItems, ...completedItems];

        return baseItems.sort((a, b) => {
            let comparison = 0;
            if (sortBy === 'name') {
                comparison = a.name.localeCompare(b.name);
            } else if (sortBy === 'price') {
                const priceA = a.price || 0;
                const priceB = b.price || 0;
                comparison = priceA - priceB;
            } else if (sortBy === 'category') {
                comparison = a.category.localeCompare(b.category);
            }
            
            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }, [filter, pendingItems, completedItems, sortBy, sortDirection]);
    
    const toggleSelection = (itemId: string) => {
        setSelectedItemIds(prev => 
            prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
        );
    };

    const handleBulkDeleteAction = () => {
        if (selectedItemIds.length > 0 && window.confirm(t('confirm_bulk_delete'))) {
            onBulkDelete(list.id, selectedItemIds);
            setSelectedItemIds([]);
            setIsBulkMode(false);
        }
    };

    const handleBulkToggleAction = () => {
        if (selectedItemIds.length === 0) return;
        const firstItemSelected = list.items.find(i => i.id === selectedItemIds[0]);
        const newStatus = firstItemSelected ? !firstItemSelected.completed : true;
        
        onBulkUpdate(list.id, selectedItemIds, { completed: newStatus });
        setSelectedItemIds([]);
        setIsBulkMode(false);
    };

    const handleBulkCategoryAction = (category: string) => {
        onBulkUpdate(list.id, selectedItemIds, { category });
        setSelectedItemIds([]);
        setShowBulkCategoryPicker(false);
        setIsBulkMode(false);
    };

    const handleMoveItems = (destinationListId: string) => {
        onBulkMove(list.id, destinationListId, selectedItemIds);
        setSelectedItemIds([]);
        setShowMoveModal(false);
        setIsBulkMode(false);
    };

    const handleShare = async () => {
        const formatItems = (items: ListItem[]) => items.map(item => `- ${item.name} (${item.quantity} ${item.unit})`).join('\n');
        
        let shareText = `${list.name}\n\n`;
        if (pendingItems.length > 0) {
            shareText += `${t('pending')}:\n${formatItems(pendingItems)}\n\n`;
        }
        if (completedItems.length > 0) {
            shareText += `${t('completed')}:\n${formatItems(completedItems)}`;
        }

        if (navigator.share) {
            try {
                await navigator.share({ title: t('share_list'), text: shareText });
            } catch (error) { console.error('Error sharing:', error); }
        } else {
            navigator.clipboard.writeText(shareText).then(() => alert('List copied to clipboard!'));
        }
    };

    const handleExportCSV = () => {
        const headers = ["Nome", "Quantidade", "Unidade", "Categoria", "Preço", "Comprado"];
        const rows = list.items.map(item => 
            [
                `"${item.name.replace(/"/g, '""')}"`,
                item.quantity,
                item.unit,
                item.category,
                item.price?.toFixed(2) || '',
                item.completed ? "Sim" : "Não"
            ].join(',')
        );
        
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${list.name}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    return (
        <div className="h-full flex flex-col bg-light-bg dark:bg-dark-bg">
            <header className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-light-surface dark:bg-dark-surface sticky top-0 z-10">
                <button onClick={onBack}><ChevronLeftIcon className="w-6 h-6" /></button>
                <div className="flex-1 text-center">
                     <h1 className="font-bold text-lg truncate px-2">{list.icon} {list.name}</h1>
                </div>
                <div className="flex items-center space-x-2">
                     {!isBulkMode && (
                         <>
                            <button onClick={onEditList} title={t('edit_list')}><SettingsIcon className="w-6 h-6 text-gray-500" /></button>
                            <button onClick={handleExportCSV} title={t('export_csv')}><DownloadIcon className="w-6 h-6 text-primary" /></button>
                            <button onClick={handleShare} title={t('share_list')}><ShareIcon className="w-6 h-6 text-primary" /></button>
                         </>
                     )}
                     <button 
                        onClick={() => {
                            setIsBulkMode(!isBulkMode);
                            setSelectedItemIds([]);
                        }} 
                        className={`font-semibold transition-colors ${isBulkMode ? 'text-red-500' : 'text-primary'}`}
                    >
                        {isBulkMode ? t('cancel') : t('selection_mode')}
                    </button>
                </div>
            </header>

            <div className="flex-grow overflow-y-auto">
                <div className="p-4 space-y-4">
                    {!isBulkMode && (
                        <div className="bg-light-surface dark:bg-dark-surface rounded-lg p-4">
                            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 font-bold mb-2">
                                <span>{t('total_estimated')}</span>
                                <span>{t('articles')}</span>
                            </div>
                            <div className="flex justify-between items-center font-bold text-lg mb-4">
                                <span>{totalCost.toFixed(2)} €</span>
                                <span>{totalItems}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 font-bold mb-1">
                                 <span>{t('progress')}</span>
                                 <span>{progress}%</span>
                            </div>
                            <ProgressBar progress={progress} />
                        </div>
                    )}

                    <div className="flex items-center justify-between gap-4">
                        <div className="flex space-x-1 overflow-x-auto no-scrollbar py-1">
                             {(['all', 'pending', 'completed'] as const).map(f => (
                                <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap transition-colors ${filter === f ? 'bg-primary text-white' : 'bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700'}`}>
                                    {t(f)}
                                </button>
                             ))}
                        </div>
                        {!isBulkMode && (
                            <div className="flex items-center space-x-2 bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-lg p-1">
                                <select 
                                    id="sort-select"
                                    value={sortBy} 
                                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                                    className="text-xs font-bold bg-transparent px-2 py-1 text-primary focus:outline-none cursor-pointer"
                                >
                                    <option value="name">{t('name')}</option>
                                    <option value="price">{t('price')}</option>
                                    <option value="category">{t('category')}</option>
                                </select>
                                <button 
                                    onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                                    className="p-1 text-gray-500 hover:text-primary transition-colors"
                                >
                                    {sortDirection === 'asc' ? <ArrowUpIcon className="w-4 h-4"/> : <ArrowDownIcon className="w-4 h-4"/>}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2 pb-24">
                        {filteredItems.map(item => (
                            <ListItemComponent 
                                key={item.id} 
                                listId={list.id} 
                                item={item} 
                                onToggle={() => onToggleItem(list.id, item.id)} 
                                onEdit={() => onEditItem(item)}
                                onDelete={() => onDeleteItem(item.id)}
                                onCheckPrice={() => onCheckPrice(list.id, item.id)}
                                onShowPriceAlert={() => onShowPriceAlert(item)}
                                onSearchPromotions={() => onSearchPromotions(list.id, item.id)}
                                onShowPromotions={() => onShowPromotions(item)}
                                isBulkMode={isBulkMode}
                                isSelected={selectedItemIds.includes(item.id)}
                                onSelect={() => toggleSelection(item.id)}
                                t={t}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {isBulkMode ? (
                <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-light-surface dark:bg-dark-surface border-t border-gray-200 dark:border-gray-700 p-4 shadow-2xl z-30">
                    <div className="flex flex-col space-y-3">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-bold text-gray-500">{selectedItemIds.length} {t('items_selected')}</span>
                            <button onClick={() => setSelectedItemIds([])} className="text-xs text-primary font-bold">{t('deselect_all')}</button>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            <button 
                                onClick={handleBulkToggleAction}
                                disabled={selectedItemIds.length === 0}
                                className="col-span-1 bg-primary/10 text-primary font-bold py-2 rounded-lg text-xs flex flex-col items-center justify-center gap-1 hover:bg-primary/20 transition-colors disabled:opacity-50"
                            >
                                <CheckCircleIcon className="w-5 h-5" />
                                <span className="truncate w-full text-center">{t('bulk_mark_done')}</span>
                            </button>
                            <button 
                                onClick={() => setShowBulkCategoryPicker(!showBulkCategoryPicker)}
                                disabled={selectedItemIds.length === 0}
                                className="col-span-1 bg-blue-500/10 text-blue-500 font-bold py-2 rounded-lg text-xs flex flex-col items-center justify-center gap-1 hover:bg-blue-500/20 transition-colors disabled:opacity-50"
                            >
                                <LayersIcon className="w-5 h-5" />
                                <span className="truncate w-full text-center">{t('bulk_category')}</span>
                            </button>
                             <button 
                                onClick={() => setShowMoveModal(true)}
                                disabled={selectedItemIds.length === 0}
                                className="col-span-1 bg-purple-500/10 text-purple-500 font-bold py-2 rounded-lg text-xs flex flex-col items-center justify-center gap-1 hover:bg-purple-500/20 transition-colors disabled:opacity-50"
                            >
                                <ArrowRightIcon className="w-5 h-5" />
                                <span className="truncate w-full text-center">{t('bulk_move')}</span>
                            </button>
                            <button 
                                onClick={handleBulkDeleteAction}
                                disabled={selectedItemIds.length === 0}
                                className="col-span-1 bg-red-500/10 text-red-500 font-bold py-2 rounded-lg text-xs flex flex-col items-center justify-center gap-1 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                            >
                                <TrashIcon className="w-5 h-5" />
                                <span className="truncate w-full text-center">{t('bulk_delete')}</span>
                            </button>
                        </div>
                        {showBulkCategoryPicker && (
                            <div className="pt-2 grid grid-cols-3 gap-1 animate-in slide-in-from-bottom-2 duration-200 max-h-40 overflow-y-auto">
                                {categories.map(cat => (
                                    <button 
                                        key={cat.id} 
                                        onClick={() => handleBulkCategoryAction(cat.name)}
                                        className="text-[10px] py-1 px-2 border border-gray-200 dark:border-gray-700 rounded bg-light-bg dark:bg-dark-bg hover:bg-primary/10 transition-colors"
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </footer>
            ) : (
                <footer className="p-4 bg-light-surface dark:bg-dark-surface border-t border-gray-200 dark:border-gray-700 space-y-4">
                    <form 
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (quickAddName.trim()) {
                                (window as any).dispatchEvent(new CustomEvent('quick-add', { 
                                    detail: { listId: list.id, name: quickAddName.trim() } 
                                }));
                                setQuickAddName('');
                            }
                        }}
                        className="flex gap-2"
                    >
                        <input 
                            type="text" 
                            placeholder={t('quick_add_placeholder') || "Adição rápida..."}
                            value={quickAddName}
                            onChange={(e) => setQuickAddName(e.target.value)}
                            className="flex-1 p-3 bg-light-bg dark:bg-dark-bg border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        />
                        <button 
                            type="submit"
                            disabled={!quickAddName.trim()}
                            className="bg-primary text-white p-3 rounded-lg disabled:opacity-50 active:scale-95 transition-all"
                        >
                            <PlusIcon className="w-5 h-5" />
                        </button>
                    </form>
                    <button onClick={onAddItem} className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
                        <PlusCircleIcon className="w-6 h-6" />
                        <span>{t('add_item')}</span>
                    </button>
                </footer>
            )}
            
            <MoveItemsModal 
                isOpen={showMoveModal}
                onClose={() => setShowMoveModal(false)}
                onMove={handleMoveItems}
                lists={lists}
                currentListId={list.id}
            />
        </div>
    );
};