
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TrashIcon } from './icons/TrashIcon';
import { XIcon } from './icons/XIcon';
import { PlusIcon } from './icons/PlusIcon';
import { EditIcon } from './icons/EditIcon';
import { CheckIcon } from './icons/CheckIcon';
import { SwipeableItem } from './SwipeableItem';

export const ManageCategoriesModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { t, categories, setCategories } = useApp();
    const [newCatName, setNewCatName] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');

    const handleAddCategory = () => {
        if (!newCatName.trim()) return;
        const newCat = {
            id: `cat-${Date.now()}`,
            name: newCatName.trim(),
        };
        setCategories([...categories, newCat]);
        setNewCatName('');
    };

    const handleDeleteCategory = (id: string) => {
        if (window.confirm(t('confirm_delete_category'))) {
            setCategories(categories.filter(c => c.id !== id));
        }
    };

    const startEditing = (id: string, name: string) => {
        setEditingId(id);
        setEditingName(name);
    };

    const saveEdit = () => {
        if (!editingName.trim()) return;
        setCategories(categories.map(c => c.id === editingId ? { ...c, name: editingName.trim() } : c));
        setEditingId(null);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-light-surface dark:bg-dark-surface rounded-xl shadow-xl w-full max-w-sm flex flex-col max-h-[70vh]" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <h2 className="font-bold text-lg">{t('manage_categories')}</h2>
                    <button onClick={onClose}><XIcon className="w-6 h-6 text-gray-400"/></button>
                </header>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-900 flex gap-2">
                    <input 
                        type="text" 
                        value={newCatName}
                        onChange={e => setNewCatName(e.target.value)}
                        placeholder={t('category_name')}
                        className="flex-1 p-2 bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                    <button 
                        onClick={handleAddCategory}
                        className="p-2 bg-primary text-white rounded-lg active:scale-95 transition-transform"
                    >
                        <PlusIcon className="w-5 h-5"/>
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-2">
                    {categories.map(cat => (
                        <SwipeableItem key={cat.id} onSwipeLeft={() => handleDeleteCategory(cat.id)} disableSwipe={editingId !== null} className="border-b border-gray-50 dark:border-gray-800 last:border-0">
                            <div className="flex justify-between items-center p-3 group">
                                {editingId === cat.id ? (
                                    <div className="flex-1 flex gap-2">
                                        <input 
                                            type="text" 
                                            autoFocus
                                            value={editingName}
                                            onChange={e => setEditingName(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && saveEdit()}
                                            className="flex-1 p-1 bg-white dark:bg-gray-800 border border-primary rounded text-sm focus:outline-none"
                                        />
                                        <button onClick={saveEdit} className="text-primary p-1">
                                            <CheckIcon className="w-5 h-5"/>
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <span className="font-medium text-light-text dark:text-dark-text">{cat.name}</span>
                                        <div className="flex items-center gap-1">
                                            <button 
                                                onClick={() => startEditing(cat.id, cat.name)} 
                                                className="p-1 text-gray-400 hover:text-primary transition-colors"
                                            >
                                                <EditIcon className="w-4 h-4"/>
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteCategory(cat.id)} 
                                                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <TrashIcon className="w-4 h-4"/>
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </SwipeableItem>
                    ))}
                </div>
            </div>
        </div>
    );
};