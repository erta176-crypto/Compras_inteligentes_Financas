
import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ProgressBar } from './ProgressBar';
import { ListItem } from '../types';
import { SparkleIcon } from './icons/SparkleIcon';
import { TrendingUpIcon } from './icons/TrendingUpIcon';
import { TrendingDownIcon } from './icons/TrendingDownIcon';
import { AddTransactionModal } from './AddTransactionModal';
import { EditTransactionModal } from './EditTransactionModal';
import { PlusIcon } from './icons/PlusIcon';
import { Transaction } from '../types';

export const FinanceDashboardScreen: React.FC = () => {
    const { t, user, lists, transactions, budgetsWithSpent } = useApp();
    const [showAddModal, setShowAddModal] = React.useState(false);
    const [editingTransaction, setEditingTransaction] = React.useState<Transaction | null>(null);
    
    const currentMonth = new Date().toLocaleString('pt-PT', { month: 'long' });

    const summary = useMemo(() => {
        const now = new Date();
        const currentMonthTxs = transactions.filter(tx => {
            const txDate = new Date(tx.date);
            return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
        });

        let monthlySpending = currentMonthTxs
            .filter(tx => tx.type === 'expense')
            .reduce((sum, tx) => sum + tx.amount, 0);

        const monthlyIncome = currentMonthTxs
            .filter(tx => tx.type === 'income')
            .reduce((sum, tx) => sum + tx.amount, 0);

        // Calculate spending from active shopping lists (completed items)
        const activeListSpending = lists
            .filter(l => l.status === 'active')
            .reduce((total, list) => {
                const listTotal = list.items
                    .filter(i => i.completed)
                    .reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0);
                return total + listTotal;
            }, 0);

        monthlySpending += activeListSpending;

        let totalBalance = transactions.reduce((sum, tx) => {
            return tx.type === 'income' ? sum + tx.amount : sum - tx.amount;
        }, 0);

        totalBalance -= activeListSpending;

        // Simple Health Score logic
        const budgetUsage = budgetsWithSpent.length > 0 
            ? budgetsWithSpent.reduce((sum, b) => sum + (b.limit > 0 ? (b.spent / b.limit) : 0), 0) / budgetsWithSpent.length
            : 0.5;
        const savingRate = monthlyIncome > 0 ? (monthlyIncome - monthlySpending) / monthlyIncome : 0;
        const rawScore = (savingRate * 50) + (1 - budgetUsage) * 50 + 50;
        const healthScore = Math.min(100, Math.max(0, isNaN(rawScore) ? 50 : rawScore));

        return {
            totalBalance,
            monthlySpending,
            monthlyIncome,
            healthScore: Math.round(healthScore)
        };
    }, [transactions, budgetsWithSpent]);

    const displayName = user?.name || t('default_user');

    return (
        <div className="h-full overflow-y-auto p-6 bg-light-bg dark:bg-dark-bg pb-24">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <p className="text-gray-400 dark:text-gray-500 font-black text-[10px] uppercase tracking-[0.2em] mb-1">{t('dashboard_title')}</p>
                    <h1 className="text-3xl font-black text-light-text dark:text-dark-text tracking-tight">{displayName}</h1>
                </div>
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 active:scale-95 transition-all"
                >
                    <PlusIcon className="w-6 h-6 text-primary" />
                </button>
            </header>

            {/* Balance Card */}
            <div className="bg-primary text-white rounded-[40px] p-8 mb-8 shadow-2xl shadow-primary/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                <div className="relative">
                    <p className="text-[10px] font-black opacity-60 uppercase tracking-[0.2em] mb-2">{t('total_balance')}</p>
                    <p className="text-5xl font-black mb-8 tracking-tighter">{summary.totalBalance.toFixed(2)}€</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/10 rounded-3xl p-4 backdrop-blur-md">
                            <div className="flex items-center gap-2 mb-1">
                                <TrendingUpIcon className="w-4 h-4 text-green-300" />
                                <span className="text-[10px] font-black opacity-60 uppercase tracking-widest">{t('income')}</span>
                            </div>
                            <p className="font-black text-lg">+{summary.monthlyIncome.toFixed(2)}€</p>
                        </div>
                        <div className="bg-white/10 rounded-3xl p-4 backdrop-blur-md">
                            <div className="flex items-center gap-2 mb-1">
                                <TrendingDownIcon className="w-4 h-4 text-red-300" />
                                <span className="text-[10px] font-black opacity-60 uppercase tracking-widest">{t('expense')}</span>
                            </div>
                            <p className="font-black text-lg">-{summary.monthlySpending.toFixed(2)}€</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Health Score & Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-800">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">{t('health_score')}</p>
                    <div className="relative w-20 h-20 mx-auto">
                        <svg className="w-full h-full" viewBox="0 0 36 36">
                            <path className="text-gray-100 dark:text-gray-800" strokeDasharray="100, 100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path className="text-primary" strokeDasharray={`${summary.healthScore}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xl font-black text-primary">{summary.healthScore}</span>
                        </div>
                    </div>
                </div>
                <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t('monthly_spending')}</p>
                    <p className="text-2xl font-black text-light-text dark:text-dark-text">{summary.monthlySpending.toFixed(2)}€</p>
                    <p className="text-[10px] text-gray-400 mt-1">{currentMonth}</p>
                </div>
            </div>

            {/* Recent Transactions Preview */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-6 px-2">
                    <h2 className="font-black text-xl tracking-tight">{t('recent_transactions')}</h2>
                    <button className="text-primary text-xs font-black uppercase tracking-widest">{t('view_all_transactions')}</button>
                </div>
                {transactions.length > 0 ? (
                    <div className="space-y-3">
                        {transactions.slice(0, 5).map((tx) => (
                            <div 
                                key={tx.id} 
                                className="flex items-center bg-light-surface dark:bg-dark-surface p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 cursor-pointer active:scale-95 transition-all"
                                onClick={() => setEditingTransaction(tx)}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg mr-4 ${tx.type === 'income' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {tx.type === 'income' ? <TrendingUpIcon className="w-5 h-5" /> : <TrendingDownIcon className="w-5 h-5" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm text-light-text dark:text-dark-text truncate">{tx.description}</p>
                                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">{tx.category}</p>
                                </div>
                                <div className="text-right">
                                    <p className={`font-black text-sm ${tx.type === 'income' ? 'text-green-500' : 'text-light-text dark:text-dark-text'}`}>
                                        {tx.type === 'income' ? '+' : '-'}{tx.amount.toFixed(2)}€
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-light-surface dark:bg-dark-surface rounded-[40px] border border-gray-100 dark:border-gray-800 border-dashed">
                        <p className="text-sm text-gray-400 font-bold">{t('no_expenses')}</p>
                    </div>
                )}
            </div>
            
            {showAddModal && <AddTransactionModal onClose={() => setShowAddModal(false)} />}
            {editingTransaction && <EditTransactionModal transaction={editingTransaction} onClose={() => setEditingTransaction(null)} />}
        </div>
    );
};

// Helper function to generate stable colors for categories
function getColorForCategory(category: string): string {
    const colors = [
        '#2ECC71', '#3B82F6', '#EF4444', '#F59E0B', '#8B5CF6', 
        '#EC4899', '#10B981', '#6366F1', '#F97316', '#14B8A6'
    ];
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
        hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
}
