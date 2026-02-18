
import React, { useState } from 'react';
import { ShoppingList, Store } from '../types';
import { useApp } from '../context/AppContext';

interface EditListModalProps {
    list: ShoppingList;
    stores: Store[];
    onClose: () => void;
    onSave: (listId: string, name: string, icon: string, storeId?: string) => void;
}

export const EditListModal: React.FC<EditListModalProps> = ({ list, stores, onClose, onSave }) => {
    const { t } = useApp();
    const [name, setName] = useState(list.name);
    const [icon, setIcon] = useState(list.icon);
    const [storeId, setStoreId] = useState(list.storeId);

    const handleSave = () => {
        if (name.trim()) {
            onSave(list.id, name.trim(), icon.trim() || '📝', storeId);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-light-surface dark:bg-dark-surface rounded-lg shadow-xl p-6 w-full max-w-sm m-4" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4">{t('edit_list')}</h2>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('list_name')}</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full mt-1 p-3 bg-light-bg dark:bg-dark-bg border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('list_icon')}</label>
                        <input
                            type="text"
                            value={icon}
                            onChange={e => setIcon(e.target.value)}
                            maxLength={2}
                            className="w-full mt-1 p-3 bg-light-bg dark:bg-dark-bg border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                     <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('store')}</label>
                        <select
                            value={storeId || ''}
                            onChange={e => setStoreId(e.target.value)}
                            className="w-full mt-1 p-3 bg-light-bg dark:bg-dark-bg border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                        >
                            <option value="">{t('select_store')}</option>
                            {stores.map(store => (
                                <option key={store.id} value={store.id}>{store.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700">{t('cancel')}</button>
                    <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark">{t('save')}</button>
                </div>
            </div>
        </div>
    );
};
