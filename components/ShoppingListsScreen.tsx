
import React, { useState, useMemo } from 'react';
import { ShoppingList, Store } from '../types';
import { useApp } from '../context/AppContext';
import { SearchIcon } from './icons/SearchIcon';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { UploadIcon } from './icons/UploadIcon';
import { ExportListsModal } from './ExportListsModal';
import { SwipeableItem } from './SwipeableItem';
import { ConfirmationModal } from './ConfirmationModal';

interface ShoppingListsScreenProps {
    lists: ShoppingList[];
    onSelectList: (listId: string) => void;
    onAddList: () => void;
    onDeleteList: (listId: string) => void;
    onImportLists: (lists: ShoppingList[]) => void;
}

type Tab = 'active' | 'archived' | 'shared';

const ListCard: React.FC<{ 
    list: ShoppingList; 
    store?: Store; 
    onClick: () => void; 
    isEditing: boolean; 
    onDelete: () => void; 
}> = ({ list, store, onClick, isEditing, onDelete }) => {
    const { t } = useApp();
    const description = store ? `${store.name} • ${list.items.length} ${t('articles')}` : `${list.items.length} ${t('articles')}`;
    const budgetInfo = list.budgetCategory ? list.budgetCategory : null;

    return (
        <SwipeableItem 
            onSwipeLeft={onDelete} 
            disableSwipe={isEditing} 
            className="rounded-2xl mb-4 shadow-sm"
        >
            <div 
                className={`bg-light-surface dark:bg-dark-surface p-4 flex items-center space-x-4 transition-all border-l-4 ${!isEditing ? 'active:scale-[0.98] cursor-pointer' : 'cursor-default'}`}
                style={{ borderLeftColor: store?.color || 'transparent' }}
                onClick={(e) => {
                    if (!isEditing) onClick();
                }}
            >
                {isEditing && (
                    <button 
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            onDelete(); 
                        }} 
                        className="text-red-500 hover:text-red-700 p-2 shrink-0 z-10"
                    >
                        <TrashIcon className="w-6 h-6" />
                    </button>
                )}
                
                <div className="relative flex-shrink-0">
                    <div className="text-3xl w-12 h-12 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-xl">
                        {list.icon}
                    </div>
                    {store?.icon && (
                        <div className="absolute -bottom-1 -right-1 text-sm bg-white dark:bg-dark-surface rounded-full w-6 h-6 flex items-center justify-center shadow-sm border border-gray-100 dark:border-gray-800">
                            {store.icon}
                        </div>
                    )}
                </div>

                <div className="flex-grow overflow-hidden">
                    <div className="flex items-center gap-2">
                        <p className="font-bold text-light-text dark:text-dark-text leading-tight truncate">{list.name}</p>
                        {budgetInfo && (
                            <span className="text-[8px] font-black uppercase tracking-widest bg-primary/10 text-primary px-1.5 py-0.5 rounded-full shrink-0">
                                {budgetInfo}
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">{description}</p>
                </div>

                {!isEditing && (
                    <div className="flex-shrink-0">
                        <div 
                            className="w-12 h-12 rounded-full border-2 flex items-center justify-center text-xs font-black transition-colors"
                            style={{ 
                                borderColor: list.progress === 100 ? '#2ECC71' : (store?.color || '#2ECC71'),
                                color: list.progress === 100 ? '#2ECC71' : (store?.color || '#2ECC71')
                            }}
                        >
                            {list.progress}%
                        </div>
                    </div>
                )}
            </div>
        </SwipeableItem>
    );
}

export const ShoppingListsScreen: React.FC<ShoppingListsScreenProps> = ({ lists, onSelectList, onAddList, onDeleteList, onImportLists }) => {
    const [activeTab, setActiveTab] = useState<Tab>('active');
    const [activeStoreFilter, setActiveStoreFilter] = useState<string>('all');
    const [isEditing, setIsEditing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const { t, stores } = useApp();

    // Confirm state
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    const filteredLists = useMemo(() => {
        return lists
            .filter(list => list.status === activeTab)
            .filter(list => list.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .filter(list => activeStoreFilter === 'all' || list.storeId === activeStoreFilter)
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [lists, activeTab, searchQuery, activeStoreFilter]);

    const handleDelete = (listId: string) => {
        setConfirmDeleteId(listId);
    };

    const confirmDelete = () => {
        if (confirmDeleteId) {
            onDeleteList(confirmDeleteId);
            setConfirmDeleteId(null);
        }
    };
    
    const getStore = (storeId?: string) => {
        return stores.find(s => s.id === storeId);
    }

    const listToDeleteName = lists.find(l => l.id === confirmDeleteId)?.name || '';

    return (
        <div className="h-full flex flex-col bg-light-bg dark:bg-dark-bg">
            <header className="p-4 pb-2">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">{t('shopping_lists_title')}</h1>
                    <div className="flex items-center space-x-4">
                         <button onClick={() => setIsExportModalOpen(true)} className="text-primary hover:text-primary-dark transition-colors p-1">
                            <UploadIcon className="w-6 h-6" />
                        </button>
                        <button onClick={() => setIsEditing(!isEditing)} className="font-semibold text-primary hover:text-primary-dark transition-colors p-1">
                            {isEditing ? t('done') : t('edit')}
                        </button>
                    </div>
                </div>

                <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder={t('search_lists_placeholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
            </header>

            <div className="px-4 mb-2 flex space-x-2 overflow-x-auto pb-2 no-scrollbar">
                <button
                     onClick={() => setActiveStoreFilter('all')}
                     className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                         activeStoreFilter === 'all'
                             ? 'bg-primary text-white shadow-lg'
                             : 'bg-light-surface dark:bg-dark-surface text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                     }`}
                >
                    {t('all_stores')}
                </button>
                {stores.map(store => (
                    <button
                        key={store.id}
                        onClick={() => setActiveStoreFilter(store.id)}
                        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-1 ${
                            activeStoreFilter === store.id
                                ? 'shadow-lg text-white'
                                : 'bg-light-surface dark:bg-dark-surface text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                        }`}
                        style={{ 
                            backgroundColor: activeStoreFilter === store.id ? store.color : undefined 
                        }}
                    >
                        <span>{store.icon}</span>
                        <span>{store.name}</span>
                    </button>
                ))}
            </div>
            
            <div className="px-4">
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    {(['active', 'archived', 'shared'] as Tab[]).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-2 px-4 text-sm font-bold transition-colors ${activeTab === tab ? 'border-b-2 border-primary text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-light-text dark:hover:text-dark-text'}`}
                        >
                           {t(tab)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-grow overflow-y-auto p-4 pb-24">
                {filteredLists.length > 0 ? (
                    filteredLists.map(list => (
                        <ListCard 
                            key={list.id} 
                            list={list} 
                            store={getStore(list.storeId)} 
                            onClick={() => onSelectList(list.id)} 
                            isEditing={isEditing} 
                            onDelete={() => handleDelete(list.id)} 
                        />
                    ))
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60 py-20">
                        <SearchIcon className="w-12 h-12 mb-4" />
                        <p className="font-medium text-sm text-center px-10">Nenhuma lista encontrada.</p>
                    </div>
                )}
            </div>
            
            {!isEditing && (
                 <button 
                    onClick={(e) => {
                        e.preventDefault();
                        onAddList();
                    }} 
                    className="fixed bottom-24 right-6 w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white shadow-2xl hover:bg-primary-dark active:scale-90 transition-all z-50 pointer-events-auto"
                    aria-label="Adicionar Lista"
                >
                    <PlusIcon className="w-8 h-8"/>
                </button>
            )}
            
            <ExportListsModal 
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                lists={filteredLists}
                stores={stores}
                onImport={onImportLists}
            />

            <ConfirmationModal 
                isOpen={confirmDeleteId !== null}
                title={t('confirm_delete_list')}
                message={`${t('confirm_delete_list_msg') || 'Tens a certeza que desejas apagar a lista'} "${listToDeleteName}"?`}
                onConfirm={confirmDelete}
                onCancel={() => setConfirmDeleteId(null)}
            />
        </div>
    );
};
