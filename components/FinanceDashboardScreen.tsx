
import React from 'react';
import { Transaction, ExpenseCategory } from '../types';
import { useApp } from '../context/AppContext';
import { ProgressBar } from './ProgressBar';

interface FinanceDashboardScreenProps {
    transactions: Transaction[];
    expenses: ExpenseCategory[];
}

const totalBudget = 500;
const totalSpent = 450;

export const FinanceDashboardScreen: React.FC<FinanceDashboardScreenProps> = ({ transactions, expenses }) => {
    const { t } = useApp();
    const spentPercentage = (totalSpent / totalBudget) * 100;

    return (
        <div className="h-full overflow-y-auto p-4 bg-light-bg dark:bg-dark-bg">
            <header className="mb-6">
                <p className="text-gray-500 dark:text-gray-400">{t('dashboard_title')}</p>
                <h1 className="text-2xl font-bold">{t('alexandre_marques')}</h1>
            </header>

            <div className="bg-light-surface dark:bg-dark-surface rounded-lg p-4 mb-6">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">{t('total_spent_this_month')}</p>
                <p className="text-2xl font-bold mb-4">{totalSpent.toFixed(2)} €</p>
                <ProgressBar progress={spentPercentage} />
                <div className="flex justify-between text-xs mt-1 text-gray-500 dark:text-gray-400">
                    <span>{t('used')}</span>
                    <span>{t('remaining')} {(totalBudget - totalSpent).toFixed(2)} €</span>
                </div>
            </div>

            <div className="bg-light-surface dark:bg-dark-surface rounded-lg p-4 mb-6">
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold">{t('expenses_by_category')}</h2>
                    <button className="text-primary font-semibold text-sm">{t('view_all')}</button>
                </div>
                <div className="space-y-3">
                    {expenses.map(expense => (
                        <div key={expense.name}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium">{expense.name}</span>
                                <span className="text-gray-500 dark:text-gray-400">{expense.value.toFixed(2)}€</span>
                            </div>
                            <ProgressBar progress={(expense.value / totalSpent) * 100} color={expense.color} />
                        </div>
                    ))}
                </div>
            </div>
            
            <div>
                <h2 className="font-bold mb-4">{t('recent_activity')}</h2>
                <div className="space-y-3">
                    {transactions.map(tx => (
                        <div key={tx.id} className="flex items-center bg-light-surface dark:bg-dark-surface p-3 rounded-lg">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                               <tx.icon className="w-5 h-5 text-primary"/>
                            </div>
                            <div className="flex-grow">
                                <p className="font-bold">{tx.description}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{tx.date}</p>
                            </div>
                            <p className="font-bold">{tx.amount.toFixed(2)}€</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
