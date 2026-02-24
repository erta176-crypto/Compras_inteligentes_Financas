
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TrashIcon } from './icons/TrashIcon';
import { XIcon } from './icons/XIcon';
import { PlusIcon } from './icons/PlusIcon';
import { EditIcon } from './icons/EditIcon';
import { CheckIcon } from './icons/CheckIcon';
import { SwipeableItem } from './SwipeableItem';
import { ConfirmationModal } from './ConfirmationModal';

const PRESET_COLORS = [
    '#2ECC71', // Emerald (Primary)
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#F59E0B', // Amber
    '#EC4899', // Pink
    '#6B7280', // Gray
];

const PRESET_ICONS = ['🛒', '🥬', '🥨', '🐦', '🧴', '🍎', '🥩', '🏪', '📦'];

export const ManageStoresModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { t, stores, setStores } = useApp();
    const [newStoreName, setNewStoreName] = useState('');
    const [newStoreIcon, setNewStoreIcon] = useState('🛒');
    const [newStoreColor, setNewStoreColor] = useState('#2ECC71');
    
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');
    const [editingIcon, setEditingIcon] = useState('');
    const [editingColor, setEditingColor] = useState('');

    // Confirmation State
    const [storeToDeleteId, setStoreToDeleteId] = useState<string | null>(null);

    const handleAddStore = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = newStoreName.trim();
        if (!trimmed) return;
        
        const newStore = {
            id: `store-${Date.now()}`,
            name: trimmed,
            icon: newStoreIcon,
            color: newStoreColor,
        };
        
        setStores(prev => [...prev, newStore]);
        setNewStoreName('');
    };

    const confirmDeleteStore = () => {
        if (storeToDeleteId) {
            setStores(prev => prev.filter(s => s.id !== storeToDeleteId));
            setStoreToDeleteId(null);
        }
    };

    const startEditing = (store: any) => {
        setEditingId(store.id);
        setEditingName(store.name);
        setEditingIcon(store.icon || '🛒');
        setEditingColor(store.color || '#2ECC71');
    };

    const saveEdit = () => {
        if (!editingName.trim()) return;
        setStores(prev => prev.map(s => s.id === editingId ? { 
            ...s, 
            name: editingName.trim(),
            icon: editingIcon,
            color: editingColor
        } : s));
        setEditingId(null);
    };

    const storeToDeleteName = stores.find(s => s.id === storeToDeleteId)?.name || '';

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-light-surface dark:bg-dark-surface rounded-2xl shadow-2xl w-full max-w-sm flex flex-col max-h-[85vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <h2 className="font-bold text-lg">{t('manage_stores')}</h2>
                    <button onClick={onClose} className="p-1"><XIcon className="w-6 h-6 text-gray-400 hover:text-gray-600"/></button>
                </header>
                
                <form onSubmit={handleAddStore} className="p-4 bg-gray-50 dark:bg-gray-900/50 flex flex-col gap-4">
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={newStoreName}
                            onChange={e => {
                                const val = e.target.value;
                                setNewStoreName(val.charAt(0).toUpperCase() + val.slice(1));
                            }}
                            placeholder={t('store_name')}
                            className="flex-1 p-3 bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        />
                        <button 
                            type="submit"
                            disabled={!newStoreName.trim()}
                            className="p-3 bg-primary text-white rounded-xl active:scale-95 transition-all shadow-md disabled:opacity-50 flex items-center justify-center"
                        >
                            <PlusIcon className="w-6 h-6"/>
                        </button>
                    </div>
                    
                    <div className="space-y-3">
                        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                            {PRESET_ICONS.map(icon => (
                                <button 
                                    key={icon} 
                                    type="button"
                                    onClick={() => setNewStoreIcon(icon)}
                                    className={`w-10 h-10 flex-shrink-0 rounded-lg text-lg flex items-center justify-center transition-all ${newStoreIcon === icon ? 'bg-primary text-white scale-110 shadow-lg' : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700'}`}
                                >
                                    {icon}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                            {PRESET_COLORS.map(color => (
                                <button 
                                    key={color} 
                                    type="button"
                                    onClick={() => setNewStoreColor(color)}
                                    className={`w-8 h-8 flex-shrink-0 rounded-full transition-all border-2 shadow-sm ${newStoreColor === color ? 'border-primary scale-110 ring-2 ring-primary/20' : 'border-transparent'}`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>
                </form>

                <div className="flex-grow overflow-y-auto p-2 divide-y divide-gray-50 dark:divide-gray-800">
                    {stores.map(store => (
                        <SwipeableItem 
                            key={store.id} 
                            onSwipeLeft={() => setStoreToDeleteId(store.id)} 
                            disableSwipe={editingId !== null}
                        >
                            <div className="p-3">
                                {editingId === store.id ? (
                                    <div className="space-y-3 p-1">
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                autoFocus
                                                value={editingName}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    setEditingName(val.charAt(0).toUpperCase() + val.slice(1));
                                                }}
                                                className="flex-1 p-2 bg-white dark:bg-gray-800 border border-primary rounded-lg text-sm focus:outline-none"
                                            />
                                            <button onClick={saveEdit} className="bg-primary text-white p-2 rounded-lg shadow-sm">
                                                <CheckIcon className="w-5 h-5"/>
                                            </button>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                                                {PRESET_ICONS.map(icon => (
                                                    <button 
                                                        key={icon} 
                                                        onClick={() => setEditingIcon(icon)}
                                                        className={`w-8 h-8 flex-shrink-0 rounded text-lg transition-all ${editingIcon === icon ? 'bg-primary/20 scale-110' : ''}`}
                                                    >
                                                        {icon}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                                                {PRESET_COLORS.map(color => (
                                                    <button 
                                                        key={color} 
                                                        onClick={() => setEditingColor(color)}
                                                        className={`w-6 h-6 flex-shrink-0 rounded-full transition-all border-2 ${editingColor === color ? 'border-primary scale-110' : 'border-transparent'}`}
                                                        style={{ backgroundColor: color }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex justify-between items-center group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm border border-gray-100 dark:border-gray-800" style={{ backgroundColor: `${store.color}15` }}>
                                                {store.icon || '🏪'}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-light-text dark:text-dark-text">{store.name}</span>
                                                <div className="w-16 h-1 rounded-full mt-1.5" style={{ backgroundColor: store.color || '#ccc' }} />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); startEditing(store); }} 
                                                className="p-2 text-gray-400 hover:text-primary transition-colors"
                                            >
                                                <EditIcon className="w-5 h-5"/>
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setStoreToDeleteId(store.id); }} 
                                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <TrashIcon className="w-5 h-5"/>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </SwipeableItem>
                    ))}
                </div>
            </div>

            <ConfirmationModal 
                isOpen={storeToDeleteId !== null}
                title={t('confirm_delete_store')}
                message={`${t('confirm_delete_store_msg') || 'Tens a certeza que desejas apagar a loja'} "${storeToDeleteName}"?`}
                onConfirm={confirmDeleteStore}
                onCancel={() => setStoreToDeleteId(null)}
            />
        </div>
    );
};
