
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TrashIcon } from './icons/TrashIcon';
import { XIcon } from './icons/XIcon';
import { PlusIcon } from './icons/PlusIcon';
import { EditIcon } from './icons/EditIcon';
import { CheckIcon } from './icons/CheckIcon';
import { SwipeableItem } from './SwipeableItem';
import { ConfirmationModal } from './ConfirmationModal';

const CATEGORY_COLORS = [
    '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E', 
    '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1', 
    '#8B5CF6', '#A855F7', '#D946EF', '#EC4899', '#F43F5E', '#6B7280'
];

export const ManageCategoriesModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { t, categories, setCategories } = useApp();
    const [newCatName, setNewCatName] = useState('');
    const [newCatColor, setNewCatColor] = useState(CATEGORY_COLORS[0]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');
    const [editingColor, setEditingColor] = useState('');

    // Confirmation State
    const [catToDeleteId, setCatToDeleteId] = useState<string | null>(null);

    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = newCatName.trim();
        if (!trimmed) return;
        
        const newCat = {
            id: `cat-${Date.now()}`,
            name: trimmed,
            color: newCatColor
        };
        
        setCategories(prev => [...prev, newCat]);
        setNewCatName('');
        setNewCatColor(CATEGORY_COLORS[Math.floor(Math.random() * CATEGORY_COLORS.length)]);
    };

    const confirmDeleteCategory = () => {
        if (catToDeleteId) {
            setCategories(prev => prev.filter(c => c.id !== catToDeleteId));
            setCatToDeleteId(null);
        }
    };

    const startEditing = (id: string, name: string, color?: string) => {
        setEditingId(id);
        setEditingName(name);
        setEditingColor(color || CATEGORY_COLORS[0]);
    };

    const saveEdit = () => {
        if (!editingName.trim()) return;
        setCategories(prev => prev.map(c => c.id === editingId ? { ...c, name: editingName.trim(), color: editingColor } : c));
        setEditingId(null);
    };

    const catToDeleteName = categories.find(c => c.id === catToDeleteId)?.name || '';

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-light-surface dark:bg-dark-surface rounded-2xl shadow-2xl w-full max-w-sm flex flex-col max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <h2 className="font-bold text-lg">{t('manage_categories')}</h2>
                    <button onClick={onClose} className="p-1"><XIcon className="w-6 h-6 text-gray-400 hover:text-gray-600"/></button>
                </header>
                
                <form onSubmit={handleAddCategory} className="p-4 bg-gray-50 dark:bg-gray-900/50 flex flex-col gap-3">
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={newCatName}
                            onChange={e => {
                                const val = e.target.value;
                                setNewCatName(val.charAt(0).toUpperCase() + val.slice(1));
                            }}
                            placeholder={t('category_name')}
                            className="flex-1 p-3 bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        />
                        <button 
                            type="submit"
                            disabled={!newCatName.trim()}
                            className="p-3 bg-primary text-white rounded-xl active:scale-95 transition-all shadow-md disabled:opacity-50 flex items-center justify-center"
                        >
                            <PlusIcon className="w-6 h-6"/>
                        </button>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {CATEGORY_COLORS.map(color => (
                            <button
                                key={color}
                                type="button"
                                onClick={() => setNewCatColor(color)}
                                className={`w-8 h-8 rounded-full flex-shrink-0 border-2 transition-all ${newCatColor === color ? 'scale-110 border-gray-800 dark:border-gray-200' : 'border-transparent hover:scale-105'}`}
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                </form>

                <div className="flex-grow overflow-y-auto p-2 divide-y divide-gray-50 dark:divide-gray-800">
                    {categories.map(cat => (
                        <SwipeableItem 
                            key={cat.id} 
                            onSwipeLeft={() => setCatToDeleteId(cat.id)} 
                            disableSwipe={editingId !== null}
                        >
                            <div className="flex flex-col p-4">
                                {editingId === cat.id ? (
                                    <div className="flex flex-col gap-3">
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                autoFocus
                                                value={editingName}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    setEditingName(val.charAt(0).toUpperCase() + val.slice(1));
                                                }}
                                                onKeyDown={e => e.key === 'Enter' && saveEdit()}
                                                className="flex-1 p-2 bg-white dark:bg-gray-800 border border-primary rounded-lg text-sm focus:outline-none"
                                            />
                                            <button onClick={saveEdit} className="bg-primary text-white p-2 rounded-lg shadow-sm">
                                                <CheckIcon className="w-5 h-5"/>
                                            </button>
                                        </div>
                                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                                            {CATEGORY_COLORS.map(color => (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    onClick={() => setEditingColor(color)}
                                                    className={`w-8 h-8 rounded-full flex-shrink-0 border-2 transition-all ${editingColor === color ? 'scale-110 border-gray-800 dark:border-gray-200' : 'border-transparent hover:scale-105'}`}
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div 
                                                className="w-4 h-4 rounded-full" 
                                                style={{ backgroundColor: cat.color || '#6B7280' }}
                                            />
                                            <span className="font-bold text-light-text dark:text-dark-text">{cat.name}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); startEditing(cat.id, cat.name, cat.color); }} 
                                                className="p-2 text-gray-400 hover:text-primary transition-colors"
                                            >
                                                <EditIcon className="w-5 h-5"/>
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setCatToDeleteId(cat.id); }} 
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
                isOpen={catToDeleteId !== null}
                title={t('confirm_delete_category')}
                message={`${t('confirm_delete_category_msg') || 'Tens a certeza que desejas apagar a categoria'} "${catToDeleteName}"?`}
                onConfirm={confirmDeleteCategory}
                onCancel={() => setCatToDeleteId(null)}
            />
        </div>
    );
};
