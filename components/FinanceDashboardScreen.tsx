
import React, { useMemo } from 'react';
import { Transaction, ExpenseCategory } from '../types';
import { useApp } from '../context/AppContext';
import { ProgressBar } from './ProgressBar';

interface FinanceDashboardScreenProps {
    transactions: Transaction[];
    expenses: ExpenseCategory[];
}

export const FinanceDashboardScreen: React.FC<FinanceDashboardScreenProps> = ({ transactions, expenses }) => {
    const { t, user } = useApp();
    
    // Valor base de orçamento (poderia vir das preferências do utilizador no futuro)
    const totalBudget = 500;

    const totalSpent = useMemo(() => {
        return transactions.reduce((acc, tx) => acc + Math.abs(tx.amount), 0);
    }, [transactions]);

    const spentPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    const displayName = user?.name || 'Utilizador';

    return (
        <div className="h-full overflow-y-auto p-4 bg-light-bg dark:bg-dark-bg">
            <header className="mb-6">
                <p className="text-gray-500 dark:text-gray-400">{t('dashboard_title')}</p>
                <h1 className="text-2xl font-bold">{displayName}</h1>
            </header>

            <div className="bg-light-surface dark:bg-dark-surface rounded-2xl p-5 mb-6 shadow-sm border border-gray-50 dark:border-gray-800">
                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">{t('total_spent_this_month')}</p>
                <p className="text-3xl font-black mb-4 text-light-text dark:text-dark-text">{totalSpent.toFixed(2)} €</p>
                <ProgressBar progress={spentPercentage} />
                <div className="flex justify-between text-[10px] mt-2 font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter">
                    <span>{t('used')} {spentPercentage.toFixed(0)}%</span>
                    <span>{t('remaining')} {Math.max(0, totalBudget - totalSpent).toFixed(2)} €</span>
                </div>
            </div>

            <div className="bg-light-surface dark:bg-dark-surface rounded-2xl p-5 mb-6 shadow-sm border border-gray-50 dark:border-gray-800">
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-light-text dark:text-dark-text">{t('expenses_by_category')}</h2>
                    {expenses.length > 0 && <button className="text-primary font-bold text-xs uppercase tracking-tight">{t('view_all')}</button>}
                </div>
                {expenses.length > 0 ? (
                    <div className="space-y-4">
                        {expenses.map(expense => (
                            <div key={expense.name}>
                                <div className="flex justify-between text-xs font-bold mb-1.5 text-gray-600 dark:text-gray-300">
                                    <span>{expense.name}</span>
                                    <span>{expense.value.toFixed(2)}€</span>
                                </div>
                                <ProgressBar progress={totalSpent > 0 ? (expense.value / totalSpent) * 100 : 0} color={expense.color} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center py-4 text-sm text-gray-400 italic">{t('no_expenses')}</p>
                )}
            </div>
            
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-light-text dark:text-dark-text">{t('recent_activity')}</h2>
                </div>
                {transactions.length > 0 ? (
                    <div className="space-y-3">
                        {transactions.map(tx => (
                            <div key={tx.id} className="flex items-center bg-light-surface dark:bg-dark-surface p-4 rounded-2xl shadow-sm border border-gray-50 dark:border-gray-800 active:scale-[0.98] transition-transform">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mr-4">
                                   <tx.icon className="w-6 h-6 text-primary"/>
                                </div>
                                <div className="flex-grow">
                                    <p className="font-bold text-light-text dark:text-dark-text leading-tight">{tx.description}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">{tx.date}</p>
                                </div>
                                <p className="font-black text-light-text dark:text-dark-text">{tx.amount.toFixed(2)}€</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-light-surface dark:bg-dark-surface rounded-2xl p-8 border border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                             <span className="text-xl">💳</span>
                        </div>
                        <p className="text-sm text-gray-400 font-medium">{t('empty_dashboard')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};
