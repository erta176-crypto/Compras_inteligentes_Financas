
import React from 'react';
import { ShoppingList } from '../types';
import { useApp } from '../context/AppContext';
import { XIcon } from './icons/XIcon';
import { ArrowRightIcon } from './icons/ArrowRightIcon';

interface MoveItemsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onMove: (destinationListId: string) => void;
    lists: ShoppingList[];
    currentListId: string;
}

export const MoveItemsModal: React.FC<MoveItemsModalProps> = ({ isOpen, onClose, onMove, lists, currentListId }) => {
    const { t } = useApp();
    const availableLists = lists
        .filter(l => l.id !== currentListId && l.status === 'active')
        .sort((a, b) => a.name.localeCompare(b.name));

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-light-surface dark:bg-dark-surface rounded-xl shadow-xl w-full max-w-sm flex flex-col max-h-[70vh]" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <h2 className="font-bold text-lg">{t('move_to')}</h2>
                    <button onClick={onClose}><XIcon className="w-6 h-6 text-gray-400"/></button>
                </header>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-900">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('select_destination_list')}</p>
                </div>

                <div className="flex-grow overflow-y-auto p-2">
                    {availableLists.length > 0 ? (
                        availableLists.map(list => (
                            <button 
                                key={list.id} 
                                onClick={() => onMove(list.id)}
                                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{list.icon}</span>
                                    <div>
                                        <p className="font-bold text-light-text dark:text-dark-text">{list.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{list.items.length} {t('articles')}</p>
                                    </div>
                                </div>
                                <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                            </button>
                        ))
                    ) : (
                        <p className="text-center p-6 text-gray-500">{t('no_other_lists') || "Nenhuma outra lista disponível"}</p>
                    )}
                </div>
            </div>
        </div>
    );
};