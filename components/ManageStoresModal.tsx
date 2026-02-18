
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TrashIcon } from './icons/TrashIcon';
import { XIcon } from './icons/XIcon';
import { PlusIcon } from './icons/PlusIcon';
import { EditIcon } from './icons/EditIcon';
import { CheckIcon } from './icons/CheckIcon';
import { SwipeableItem } from './SwipeableItem';

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

    const handleAddStore = () => {
        if (!newStoreName.trim()) return;
        const newStore = {
            id: `store-${Date.now()}`,
            name: newStoreName.trim(),
            icon: newStoreIcon,
            color: newStoreColor,
        };
        setStores([...stores, newStore]);
        setNewStoreName('');
        setNewStoreIcon('🛒');
        setNewStoreColor('#2ECC71');
    };

    const handleDeleteStore = (id: string) => {
        if (window.confirm(t('confirm_delete_store'))) {
            setStores(stores.filter(s => s.id !== id));
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
        setStores(stores.map(s => s.id === editingId ? { 
            ...s, 
            name: editingName.trim(),
            icon: editingIcon,
            color: editingColor
        } : s));
        setEditingId(null);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-light-surface dark:bg-dark-surface rounded-xl shadow-xl w-full max-w-sm flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <h2 className="font-bold text-lg">{t('manage_stores')}</h2>
                    <button onClick={onClose}><XIcon className="w-6 h-6 text-gray-400"/></button>
                </header>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-900 flex flex-col gap-3">
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={newStoreName}
                            onChange={e => setNewStoreName(e.target.value)}
                            placeholder={t('store_name')}
                            className="flex-1 p-2 bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        />
                        <button 
                            onClick={handleAddStore}
                            className="p-2 bg-primary text-white rounded-lg active:scale-95 transition-transform shrink-0"
                        >
                            <PlusIcon className="w-5 h-5"/>
                        </button>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                         <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
                            {PRESET_ICONS.map(icon => (
                                <button 
                                    key={icon} 
                                    onClick={() => setNewStoreIcon(icon)}
                                    className={`p-2 rounded-lg text-lg transition-all ${newStoreIcon === icon ? 'bg-primary/20 scale-110' : 'bg-transparent hover:bg-gray-200 dark:hover:bg-gray-800'}`}
                                >
                                    {icon}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
                            {PRESET_COLORS.map(color => (
                                <button 
                                    key={color} 
                                    onClick={() => setNewStoreColor(color)}
                                    className={`w-8 h-8 rounded-full transition-all border-2 ${newStoreColor === color ? 'border-primary scale-110' : 'border-transparent'}`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto p-2">
                    {stores.map(store => (
                        <SwipeableItem key={store.id} onSwipeLeft={() => handleDeleteStore(store.id)} disableSwipe={editingId !== null} className="border-b border-gray-50 dark:border-gray-800 last:border-0">
                            <div className="flex flex-col p-3">
                                {editingId === store.id ? (
                                    <div className="space-y-3">
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                autoFocus
                                                value={editingName}
                                                onChange={e => setEditingName(e.target.value)}
                                                className="flex-1 p-1 bg-white dark:bg-gray-800 border border-primary rounded text-sm focus:outline-none"
                                            />
                                            <button onClick={saveEdit} className="text-primary p-1">
                                                <CheckIcon className="w-5 h-5"/>
                                            </button>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
                                                {PRESET_ICONS.map(icon => (
                                                    <button 
                                                        key={icon} 
                                                        onClick={() => setEditingIcon(icon)}
                                                        className={`p-1 rounded text-lg transition-all ${editingIcon === icon ? 'bg-primary/20 scale-110' : ''}`}
                                                    >
                                                        {icon}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
                                                {PRESET_COLORS.map(color => (
                                                    <button 
                                                        key={color} 
                                                        onClick={() => setEditingColor(color)}
                                                        className={`w-6 h-6 rounded-full transition-all border-2 ${editingColor === color ? 'border-primary scale-110' : 'border-transparent'}`}
                                                        style={{ backgroundColor: color }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex justify-between items-center group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm border border-gray-100 dark:border-gray-800" style={{ backgroundColor: `${store.color}15` || 'transparent' }}>
                                                {store.icon || '🏪'}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-light-text dark:text-dark-text">{store.name}</span>
                                                <div className="w-12 h-1 rounded-full mt-1" style={{ backgroundColor: store.color || '#ccc' }} />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => startEditing(store)} 
                                                className="p-1 text-gray-400 hover:text-primary transition-colors"
                                            >
                                                <EditIcon className="w-4 h-4"/>
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteStore(store.id)} 
                                                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <TrashIcon className="w-4 h-4"/>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </SwipeableItem>
                    ))}
                </div>
            </div>
        </div>
    );
};