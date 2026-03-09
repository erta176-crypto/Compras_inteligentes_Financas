
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Budget } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { ProgressBar } from './ProgressBar';
import { TrashIcon } from './icons/TrashIcon';
import { CheckIcon } from './icons/CheckIcon';
import { EditIcon } from './icons/EditIcon';

export const BudgetScreen: React.FC = () => {
    const { t, budgets, setBudgets, budgetsWithSpent, budgetCategories } = useApp();
    const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
    const [editingLimit, setEditingLimit] = useState<number | undefined>(undefined);

    const handleSetBudget = (category: string) => {
        const existingBudget = budgets.find(b => b.category === category);
        if (existingBudget) {
            setEditingBudgetId(existingBudget.id);
            setEditingLimit(existingBudget.limit);
        } else {
            const newBudget: Budget = {
                id: `budget-${Date.now()}`,
                category: category,
                limit: editingLimit || 0,
                spent: 0,
                period: 'monthly'
            };
            setBudgets([...budgets, newBudget]);
            setEditingBudgetId(newBudget.id);
            setEditingLimit(0);
        }
    };

    const handleUpdateBudget = (id: string) => {
        setBudgets(budgets.map(b => b.id === id ? { ...b, limit: editingLimit || 0 } : b));
        setEditingBudgetId(null);
        setEditingLimit(undefined);
    };

    const handleDeleteBudget = (id: string) => {
        setBudgets(budgets.filter(b => b.id !== id));
    };

    const budgetsByCategory = useMemo(() => {
        const map = new Map<string, Budget & { spent: number }>();
        budgetsWithSpent.forEach(b => map.set(b.category, b));
        return map;
    }, [budgetsWithSpent]);

    return (
        <div className="h-full flex flex-col bg-light-bg dark:bg-dark-bg">
            <header className="p-6 pb-2 flex justify-between items-center">
                <h1 className="text-3xl font-black tracking-tight">{t('nav_budget')}</h1>
            </header>

            <div className="flex-1 overflow-y-auto px-6 pb-24">
                {budgetCategories.length > 0 ? (
                    <div className="space-y-6 mt-6">
                        {budgetCategories.map(category => {
                            const budget = budgetsByCategory.get(category);
                            const isEditing = editingBudgetId === budget?.id;

                            if (budget) {
                                const percentage = budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0;
                                const isOver = budget.spent > budget.limit;

                                return (
                                    <div key={budget.id} className="bg-light-surface dark:bg-dark-surface p-6 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-800">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-black text-lg text-light-text dark:text-dark-text">{budget.category}</h3>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('monthly')}</p>
                                            </div>
                                            <button 
                                                onClick={() => handleDeleteBudget(budget.id)}
                                                className="p-2 text-gray-300 hover:text-red-500 transition-all"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {isEditing ? (
                                            <div className="flex items-center gap-2 mb-2">
                                                <input 
                                                    type="number"
                                                    value={editingLimit === undefined ? '' : editingLimit}
                                                    onChange={e => setEditingLimit(parseFloat(e.target.value) || 0)}
                                                    className="flex-1 min-w-0 w-full p-2 text-2xl font-black text-primary bg-light-bg dark:bg-dark-bg border border-primary/20 rounded-xl focus:outline-none"
                                                    autoFocus
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleUpdateBudget(budget.id);
                                                    }}
                                                />
                                                <button onClick={() => handleUpdateBudget(budget.id)} className="p-2 shrink-0 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-colors">
                                                    <CheckIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex justify-between items-end mb-2">
                                                <div 
                                                    className="flex items-center gap-2 cursor-pointer group py-1" 
                                                    onClick={() => { setEditingBudgetId(budget.id); setEditingLimit(budget.limit); }}
                                                >
                                                    <p className={`text-2xl font-black ${isOver ? 'text-red-500' : 'text-primary'}`}>
                                                        {budget.spent.toFixed(2)}€
                                                        <span className="text-sm text-gray-400 font-bold ml-1">/ {budget.limit.toFixed(2)}€</span>
                                                    </p>
                                                    <div className="bg-gray-100 dark:bg-gray-800 p-1.5 rounded-lg group-hover:bg-primary/10 transition-colors">
                                                        <EditIcon className="w-3 h-3 text-gray-400 group-hover:text-primary transition-colors" />
                                                    </div>
                                                </div>
                                                <p className={`text-xs font-black ${isOver ? 'text-red-500' : 'text-gray-400'}`}>
                                                    {percentage.toFixed(0)}%
                                                </p>
                                            </div>
                                        )}

                                        <ProgressBar progress={Math.min(100, percentage)} />
                                        
                                        <div className="flex justify-between mt-3">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                                                {isOver ? 'Excedido' : t('budget_remaining')}
                                            </span>
                                            <span className={`text-[10px] font-black uppercase tracking-wider ${isOver ? 'text-red-500' : 'text-gray-500'}`}>
                                                {Math.abs(budget.limit - budget.spent).toFixed(2)}€
                                            </span>
                                        </div>
                                    </div>
                                );
                            } else {
                                return (
                                    <div key={category} className="bg-light-surface dark:bg-dark-surface p-6 rounded-[32px] shadow-sm border border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                        <h3 className="font-black text-lg text-gray-400 dark:text-gray-500">{category}</h3>
                                        <button 
                                            onClick={() => handleSetBudget(category)}
                                            className="bg-primary/10 text-primary font-bold text-sm px-4 py-2 rounded-xl active:scale-95 transition-all"
                                        >
                                            {t('add_budget')}
                                        </button>
                                    </div>
                                )
                            }
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 opacity-40 text-center">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                            <PlusIcon className="w-10 h-10 text-gray-400" />
                        </div>
                        <p className="font-bold max-w-[200px]">{t('no_budget_categories')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};
