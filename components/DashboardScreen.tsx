import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { TrendingUpIcon } from './icons/TrendingUpIcon';
import { TrendingDownIcon } from './icons/TrendingDownIcon';

const MONTHS = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

export const DashboardScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { t, purchaseHistory, transactions } = useApp();

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    const [selectedYear, setSelectedYear] = useState<number>(currentYear);
    const [selectedMonth, setSelectedMonth] = useState<number | 'all'>(currentMonth);

    // Get available years from data
    const availableYears = useMemo(() => {
        const years = new Set<number>([currentYear]);
        transactions.forEach(tx => years.add(new Date(tx.date).getFullYear()));
        purchaseHistory.forEach(ph => years.add(new Date(ph.date).getFullYear()));
        return Array.from(years).sort((a, b) => b - a);
    }, [transactions, purchaseHistory, currentYear]);

    // Filter data based on selection
    const filteredTransactions = useMemo(() => {
        return transactions.filter(tx => {
            const date = new Date(tx.date);
            if (date.getFullYear() !== selectedYear) return false;
            if (selectedMonth !== 'all' && date.getMonth() !== selectedMonth) return false;
            return true;
        });
    }, [transactions, selectedYear, selectedMonth]);

    const filteredPurchases = useMemo(() => {
        return purchaseHistory.filter(ph => {
            const date = new Date(ph.date);
            if (date.getFullYear() !== selectedYear) return false;
            if (selectedMonth !== 'all' && date.getMonth() !== selectedMonth) return false;
            return true;
        });
    }, [purchaseHistory, selectedYear, selectedMonth]);

    // Summaries
    const totalIncome = useMemo(() => 
        filteredTransactions.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0),
    [filteredTransactions]);

    const totalExpense = useMemo(() => 
        filteredTransactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0),
    [filteredTransactions]);

    // Evolution Chart Data (Monthly breakdown for the selected year)
    const evolutionData = useMemo(() => {
        if (selectedMonth !== 'all') return [];
        
        const monthlyData = MONTHS.map((month, index) => ({
            name: month.substring(0, 3),
            income: 0,
            expense: 0
        }));

        transactions.forEach(tx => {
            const date = new Date(tx.date);
            if (date.getFullYear() === selectedYear) {
                const monthIdx = date.getMonth();
                if (tx.type === 'income') {
                    monthlyData[monthIdx].income += tx.amount;
                } else {
                    monthlyData[monthIdx].expense += tx.amount;
                }
            }
        });

        return monthlyData;
    }, [transactions, selectedYear, selectedMonth]);

    // Category Chart Data (Expenses only)
    const categoryData = useMemo(() => {
        const categoryTotals: Record<string, number> = {};
        filteredTransactions.filter(tx => tx.type === 'expense').forEach(tx => {
            const cat = tx.category || 'Outros';
            categoryTotals[cat] = (categoryTotals[cat] || 0) + tx.amount;
        });

        return Object.entries(categoryTotals)
            .map(([name, value], index) => ({
                name,
                value,
                color: COLORS[index % COLORS.length]
            }))
            .filter(item => item.value > 0)
            .sort((a, b) => b.value - a.value);
    }, [filteredTransactions]);

    // List Category Data (Shopping list items)
    const listCategoryData = useMemo(() => {
        const listCategoryTotals: Record<string, number> = {};
        filteredPurchases.forEach(record => {
            record.items.forEach(item => {
                const cat = item.category || 'Outros';
                const itemTotal = (item.price || 0) * item.quantity;
                listCategoryTotals[cat] = (listCategoryTotals[cat] || 0) + itemTotal;
            });
        });

        return Object.entries(listCategoryTotals)
            .map(([name, value]) => ({ name, value }))
            .filter(item => item.value > 0)
            .sort((a, b) => b.value - a.value);
    }, [filteredPurchases]);

    // Store Data
    const storeData = useMemo(() => {
        const storeTotals: Record<string, number> = {};
        filteredPurchases.forEach(record => {
            const store = record.store || 'Desconhecida';
            storeTotals[store] = (storeTotals[store] || 0) + record.totalAmount;
        });

        return Object.entries(storeTotals)
            .map(([name, value]) => ({ name, value }))
            .filter(item => item.value > 0)
            .sort((a, b) => b.value - a.value)
            .slice(0, 5); // Top 5 stores
    }, [filteredPurchases]);

    return (
        <div className="h-full flex flex-col bg-light-bg dark:bg-dark-bg">
            <header className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-light-surface dark:bg-dark-surface sticky top-0 z-10">
                <button onClick={onBack} className="p-1"><ChevronLeftIcon className="w-6 h-6" /></button>
                <div className="flex-1 text-center px-2">
                    <h1 className="font-bold text-lg">Histórico e Estatísticas</h1>
                </div>
                <div className="w-8"></div>
            </header>

            <div className="flex-grow overflow-y-auto p-4 space-y-6 pb-24">
                
                {/* Filters */}
                <div className="flex gap-2">
                    <select 
                        value={selectedYear} 
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="flex-1 p-3 bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-2xl font-bold focus:outline-none focus:border-primary"
                    >
                        {availableYears.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                    <select 
                        value={selectedMonth} 
                        onChange={(e) => setSelectedMonth(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                        className="flex-2 p-3 bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-2xl font-bold focus:outline-none focus:border-primary"
                    >
                        <option value="all">Todos os Meses</option>
                        {MONTHS.map((month, index) => (
                            <option key={index} value={index}>{month}</option>
                        ))}
                    </select>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-light-surface dark:bg-dark-surface rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                                <TrendingUpIcon className="w-4 h-4 text-green-500" />
                            </div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rendimentos</span>
                        </div>
                        <p className="font-black text-2xl text-green-500">+{totalIncome.toFixed(2)}€</p>
                    </div>
                    <div className="bg-light-surface dark:bg-dark-surface rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                                <TrendingDownIcon className="w-4 h-4 text-red-500" />
                            </div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Despesas</span>
                        </div>
                        <p className="font-black text-2xl text-red-500">-{totalExpense.toFixed(2)}€</p>
                    </div>
                </div>

                {/* Evolution Chart (Only visible if 'all' months is selected) */}
                {selectedMonth === 'all' && evolutionData.length > 0 && (
                    <div className="bg-light-surface dark:bg-dark-surface rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
                        <h2 className="font-black text-sm mb-6 uppercase tracking-widest text-gray-400">Evolução Anual</h2>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={evolutionData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 'bold' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 'bold' }} />
                                    <Tooltip 
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', paddingTop: '20px' }} />
                                    <Bar dataKey="income" name="Rendimentos" fill="#22C55E" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="expense" name="Despesas" fill="#EF4444" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Category Chart */}
                {categoryData.length > 0 && (
                    <div className="bg-light-surface dark:bg-dark-surface rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
                        <h2 className="font-black text-sm mb-4 uppercase tracking-widest text-gray-400">Despesas por Categoria (Orçamento)</h2>
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
                                        formatter={(value: number) => [`${value.toFixed(2)}€`, 'Gasto']}
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 space-y-2">
                            {categoryData.map((cat, idx) => (
                                <div key={idx} className="flex items-center justify-between text-sm font-bold">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                                        <span>{cat.name}</span>
                                    </div>
                                    <span>{cat.value.toFixed(2)}€</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* List Category Chart (Horizontal Bar) */}
                {listCategoryData.length > 0 && (
                    <div className="bg-light-surface dark:bg-dark-surface rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
                        <h2 className="font-black text-sm mb-4 uppercase tracking-widest text-gray-400">Despesas por Categoria (Listas)</h2>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={listCategoryData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 'bold' }} />
                                    <Tooltip 
                                        formatter={(value: number) => [`${value.toFixed(2)}€`, 'Gasto']}
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                                        cursor={{ fill: 'transparent' }}
                                    />
                                    <Bar dataKey="value" fill="#8B5CF6" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Top Stores */}
                {storeData.length > 0 && (
                    <div className="bg-light-surface dark:bg-dark-surface rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
                        <h2 className="font-black text-sm mb-4 uppercase tracking-widest text-gray-400">Top Lojas (Supermercado)</h2>
                        <div className="space-y-3">
                            {storeData.map((store, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-xs">
                                            {index + 1}
                                        </div>
                                        <span className="font-bold">{store.name}</span>
                                    </div>
                                    <span className="font-black text-primary">{store.value.toFixed(2)}€</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {filteredTransactions.length === 0 && filteredPurchases.length === 0 && (
                    <div className="text-center py-10 opacity-50">
                        <p className="font-bold">Sem dados para o período selecionado.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
