import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';

export const DashboardScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { t, purchaseHistory, categories } = useApp();

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Filter history for current month
    const thisMonthHistory = useMemo(() => {
        return purchaseHistory.filter(record => {
            const date = new Date(record.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });
    }, [purchaseHistory, currentMonth, currentYear]);

    const totalSpentThisMonth = useMemo(() => {
        return thisMonthHistory.reduce((sum, record) => sum + record.totalAmount, 0);
    }, [thisMonthHistory]);

    // Data for Category Pie Chart
    const categoryData = useMemo(() => {
        const categoryTotals: Record<string, number> = {};
        thisMonthHistory.forEach(record => {
            record.items.forEach(item => {
                const cat = item.category || 'Outros';
                const itemTotal = (item.price || 0) * item.quantity;
                categoryTotals[cat] = (categoryTotals[cat] || 0) + itemTotal;
            });
        });

        return Object.entries(categoryTotals)
            .map(([name, value]) => ({
                name,
                value,
                color: categories.find(c => c.name === name)?.color || '#6B7280'
            }))
            .filter(item => item.value > 0)
            .sort((a, b) => b.value - a.value);
    }, [thisMonthHistory, categories]);

    // Data for Store Bar Chart
    const storeData = useMemo(() => {
        const storeTotals: Record<string, number> = {};
        thisMonthHistory.forEach(record => {
            const store = record.store || 'Desconhecida';
            storeTotals[store] = (storeTotals[store] || 0) + record.totalAmount;
        });

        return Object.entries(storeTotals)
            .map(([name, value]) => ({ name, value }))
            .filter(item => item.value > 0)
            .sort((a, b) => b.value - a.value);
    }, [thisMonthHistory]);

    return (
        <div className="h-full flex flex-col bg-light-bg dark:bg-dark-bg">
            <header className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-light-surface dark:bg-dark-surface sticky top-0 z-10">
                <button onClick={onBack} className="p-1"><ChevronLeftIcon className="w-6 h-6" /></button>
                <div className="flex-1 text-center px-2">
                    <h1 className="font-bold text-lg">{t('dashboard') || 'Estatísticas'}</h1>
                </div>
                <div className="w-8"></div>
            </header>

            <div className="flex-grow overflow-y-auto p-4 space-y-6">
                {/* Total Spent Card */}
                <div className="bg-primary/10 rounded-2xl p-6 text-center">
                    <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">
                        {t('spent_this_month') || 'Gasto este Mês'}
                    </p>
                    <p className="text-4xl font-black text-primary">
                        {totalSpentThisMonth.toFixed(2)} €
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                        {thisMonthHistory.length} {t('purchases') || 'compras registadas'}
                    </p>
                </div>

                {/* Category Chart */}
                {categoryData.length > 0 && (
                    <div className="bg-light-surface dark:bg-dark-surface rounded-2xl p-4 shadow-sm">
                        <h2 className="font-bold text-sm mb-4">{t('spending_by_category') || 'Gastos por Categoria'}</h2>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        formatter={(value: number) => `${value.toFixed(2)} €`}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Store Chart */}
                {storeData.length > 0 && (
                    <div className="bg-light-surface dark:bg-dark-surface rounded-2xl p-4 shadow-sm">
                        <h2 className="font-bold text-sm mb-4">{t('spending_by_store') || 'Gastos por Loja'}</h2>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={storeData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} style={{ fontSize: '12px', fontWeight: 'bold' }} />
                                    <Tooltip 
                                        formatter={(value: number) => `${value.toFixed(2)} €`}
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="value" fill="#2ECC71" radius={[0, 4, 4, 0]} barSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Recent Purchases List */}
                {thisMonthHistory.length > 0 && (
                    <div className="bg-light-surface dark:bg-dark-surface rounded-2xl p-4 shadow-sm">
                        <h2 className="font-bold text-sm mb-4">{t('recent_purchases') || 'Compras Recentes'}</h2>
                        <div className="space-y-3">
                            {thisMonthHistory.slice().reverse().map(record => (
                                <div key={record.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                                    <div>
                                        <p className="font-bold text-sm">{record.store || record.listName}</p>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                                            {new Date(record.date).toLocaleDateString()} • {record.items.length} {t('articles') || 'artigos'}
                                        </p>
                                    </div>
                                    <div className="font-black text-primary">
                                        {record.totalAmount.toFixed(2)} €
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {thisMonthHistory.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        <p>{t('no_history_yet') || 'Ainda não tem compras finalizadas este mês.'}</p>
                    </div>
                )}
            </div>
        </div>
    );
};
