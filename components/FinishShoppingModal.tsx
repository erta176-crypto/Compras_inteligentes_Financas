import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ListItem } from '../types';
import { XIcon } from './icons/XIcon';
import { CheckIcon } from './icons/CheckIcon';

interface FinishShoppingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (store: string, archiveList: boolean) => void;
    completedItems: ListItem[];
    totalAmount: number;
}

export const FinishShoppingModal: React.FC<FinishShoppingModalProps> = ({ isOpen, onClose, onConfirm, completedItems, totalAmount }) => {
    const { t, stores } = useApp();
    const [selectedStore, setSelectedStore] = useState<string>('');
    const [archiveList, setArchiveList] = useState<boolean>(false);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-light-surface dark:bg-dark-surface rounded-2xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <h2 className="font-bold text-lg">{t('finish_shopping') || 'Finalizar Compra'}</h2>
                    <button onClick={onClose} className="p-1"><XIcon className="w-6 h-6 text-gray-400 hover:text-gray-600"/></button>
                </header>
                
                <div className="p-6 flex flex-col gap-6">
                    <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('total_spent') || 'Total Gasto'}</p>
                        <p className="text-4xl font-black text-primary">{totalAmount.toFixed(2)} €</p>
                        <p className="text-xs text-gray-400 mt-2">{completedItems.length} {t('items_selected') || 'artigos'}</p>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 block">
                            {t('store') || 'Loja (Opcional)'}
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {stores.map(store => (
                                <button
                                    key={store.id}
                                    onClick={() => setSelectedStore(store.name === selectedStore ? '' : store.name)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                                        selectedStore === store.name 
                                            ? 'bg-primary text-white border-primary' 
                                            : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                                    }`}
                                >
                                    {store.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                            {archiveList 
                                ? (t('finish_shopping_archive_info') || 'Ao finalizar, a lista inteira será arquivada com a data de hoje para manter o histórico.')
                                : (t('finish_shopping_info') || 'Ao finalizar, estes artigos serão guardados no seu Histórico de Compras e removidos desta lista.')}
                        </p>
                    </div>

                    <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <input 
                            type="checkbox" 
                            checked={archiveList} 
                            onChange={(e) => setArchiveList(e.target.checked)}
                            className="w-5 h-5 text-primary rounded focus:ring-primary"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('archive_list_after_shopping') || 'Arquivar lista para histórico'}
                        </span>
                    </label>

                    <button
                        onClick={() => onConfirm(selectedStore, archiveList)}
                        className="w-full bg-primary text-white font-bold py-4 rounded-xl active:scale-95 transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
                    >
                        <CheckIcon className="w-5 h-5" />
                        {t('confirm') || 'Confirmar'}
                    </button>
                </div>
            </div>
        </div>
    );
};
