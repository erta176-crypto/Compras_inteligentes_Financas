import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Transaction } from '../types';
import { XIcon } from './icons/XIcon';

interface AddTransactionModalProps {
    onClose: () => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ onClose }) => {
    const { t, setTransactions, transactions, budgetCategories } = useApp();
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !description || !category) return;

        const newTx: Transaction = {
            id: `tx-${Date.now()}`,
            amount: parseFloat(amount),
            description,
            category,
            date: new Date().toISOString(),
            type,
            isRecurring: false
        };

        setTransactions([newTx, ...transactions]);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center p-4" onClick={onClose}>
            <div className="bg-light-surface dark:bg-dark-surface w-full max-w-md rounded-t-[40px] sm:rounded-[40px] p-8 animate-in slide-in-from-bottom duration-300" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black">{t('add_transaction')}</h2>
                    <button onClick={onClose}><XIcon className="w-6 h-6" /></button>
                </div>

                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-6">
                    <button 
                        className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${type === 'expense' ? 'bg-white dark:bg-gray-700 shadow-sm text-red-500' : 'text-gray-400'}`}
                        onClick={() => setType('expense')}
                    >
                        {t('expense')}
                    </button>
                    <button 
                        className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${type === 'income' ? 'bg-white dark:bg-gray-700 shadow-sm text-green-500' : 'text-gray-400'}`}
                        onClick={() => setType('income')}
                    >
                        {t('income')}
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">{t('transaction_amount')}</label>
                        <input 
                            type="number" 
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full p-4 bg-light-bg dark:bg-dark-bg border border-gray-100 dark:border-gray-800 rounded-2xl focus:outline-none text-2xl font-black"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">{t('transaction_description')}</label>
                        <input 
                            type="text" 
                            value={description}
                            onChange={e => {
                                const val = e.target.value;
                                setDescription(val.charAt(0).toUpperCase() + val.slice(1));
                            }}
                            placeholder="Ex: Jantar, Salário..."
                            className="w-full p-4 bg-light-bg dark:bg-dark-bg border border-gray-100 dark:border-gray-800 rounded-2xl focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">{t('category')}</label>
                        <select 
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                            className="w-full p-4 bg-light-bg dark:bg-dark-bg border border-gray-100 dark:border-gray-800 rounded-2xl focus:outline-none appearance-none"
                        >
                            <option value="">{t('select_category')}</option>
                            {budgetCategories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                            <option value="Outros">Outros</option>
                        </select>
                    </div>

                    <button 
                        type="submit" 
                        className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 mt-4 active:scale-95 transition-all"
                    >
                        {t('save')}
                    </button>
                </form>
            </div>
        </div>
    );
};
