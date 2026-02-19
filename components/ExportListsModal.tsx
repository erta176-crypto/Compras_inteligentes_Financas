
import React, { useState, useRef } from 'react';
import { ShoppingList, Store, ListItem } from '../types';
import { useApp } from '../context/AppContext';
import { FileTextIcon } from './icons/FileTextIcon';
import { XIcon } from './icons/XIcon';
import { UploadIcon } from './icons/UploadIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface ExportListsModalProps {
    isOpen: boolean;
    onClose: () => void;
    lists: ShoppingList[];
    stores: Store[];
    onImport: (lists: ShoppingList[]) => void;
}

type Tab = 'export' | 'import';

export const ExportListsModal: React.FC<ExportListsModalProps> = ({ isOpen, onClose, lists, stores, onImport }) => {
    const { t, categories: appCategories } = useApp();
    const [activeTab, setActiveTab] = useState<Tab>('export');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [importMessage, setImportMessage] = useState('');

    if (!isOpen) return null;

    const getStoreName = (storeId?: string) => stores.find(s => s.id === storeId)?.name || '';
    const getStoreIdByName = (name: string) => {
        if (!name) return undefined;
        return stores.find(s => s.name.toLowerCase() === name.toLowerCase())?.id;
    };

    // --- TEMPLATE GENERATOR ---
    const handleDownloadTemplate = () => {
        const headers = ["Lista", "Item", "Qtd", "Un", "Categoria", "Loja", "Preço", "Comprado"];
        const sample = ["Compras de Casa", "Pão", "2", "un", "Padaria", "Continente", "1.20", "Não"];
        const csvContent = "\uFEFF" + [headers.join(','), sample.join(',')].join('\n');
        downloadFile(csvContent, 'template_importacao.csv', 'text/csv;charset=utf-8');
    };

    // --- EXPORT FUNCTIONS ---

    const handleExportCSV = () => {
        const escapeCSV = (str: string | number) => `"${String(str).replace(/"/g, '""')}"`;
        const headers = ["Lista", "Loja", "Status", "Item", "Qtd", "Un", "Categoria", "Preço", "Comprado"];
        
        let rows: string[] = [];
        lists.forEach(list => {
            if (list.items.length === 0) {
                rows.push([escapeCSV(list.name), escapeCSV(getStoreName(list.storeId)), escapeCSV(list.status), "", "", "", "", "", ""].join(','));
            } else {
                list.items.forEach(item => {
                    rows.push([
                        escapeCSV(list.name),
                        escapeCSV(getStoreName(list.storeId)),
                        escapeCSV(list.status),
                        escapeCSV(item.name),
                        escapeCSV(item.quantity),
                        escapeCSV(item.unit),
                        escapeCSV(item.category),
                        escapeCSV(item.price?.toFixed(2) || ''),
                        escapeCSV(item.completed ? "Sim" : "Não")
                    ].join(','));
                });
            }
        });

        const csvContent = "\uFEFF" + [headers.join(','), ...rows].join('\n');
        downloadFile(csvContent, 'shopping_lists.csv', 'text/csv;charset=utf-8');
    };

    const handleExportExcel = () => {
        const data = lists.flatMap(list => {
            if (list.items.length === 0) {
                return [{ Lista: list.name, Loja: getStoreName(list.storeId), Status: list.status }];
            }
            return list.items.map(item => ({
                Lista: list.name,
                Loja: getStoreName(list.storeId),
                Status: list.status,
                Item: item.name,
                Qtd: item.quantity,
                Un: item.unit,
                Categoria: item.category,
                Preco: item.price,
                Comprado: item.completed ? 'Sim' : 'Não'
            }));
        });

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Listas");
        XLSX.writeFile(wb, "listas_compras.xlsx");
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Relatório de Compras", 14, 20);
        doc.setFontSize(10);
        doc.text(`Data: ${new Date().toLocaleDateString()}`, 14, 28);
        let finalY = 35;

        lists.forEach((list) => {
            if (finalY > 250) { doc.addPage(); finalY = 20; }
            doc.setFontSize(14);
            doc.text(`${list.icon} ${list.name} (${getStoreName(list.storeId)})`, 14, finalY);
            
            const tableData = list.items.map(item => [
                item.name,
                `${item.quantity} ${item.unit}`,
                item.category,
                item.price ? `${item.price.toFixed(2)}€` : '-',
                item.completed ? '✓' : '○'
            ]);

            autoTable(doc, {
                startY: finalY + 5,
                head: [['Artigo', 'Qtd', 'Categoria', 'Preço', 'Status']],
                body: tableData,
                theme: 'striped',
                headStyles: { fillColor: [46, 204, 113] },
            });

            // @ts-ignore
            finalY = doc.lastAutoTable.finalY + 15;
        });
        doc.save("listas_compras.pdf");
    };

    const handleExportBackup = () => {
        const json = JSON.stringify(lists, null, 2);
        downloadFile(json, 'backup_compras.json', 'application/json');
    }

    const downloadFile = (content: string, fileName: string, mimeType: string) => {
        const blob = new Blob([content], { type: mimeType });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- IMPORT LOGIC ---

    const processImportedData = (jsonData: any[]) => {
        const listsMap = new Map<string, ShoppingList>();
        let newListsCount = 0;

        try {
            jsonData.forEach((row: any) => {
                // Normalize keys to support common variations
                const listName = row['Lista'] || row['List'] || row['Name'] || 'Importada';
                
                if (!listsMap.has(listName)) {
                    const storeName = row['Loja'] || row['Store'];
                    listsMap.set(listName, {
                        id: `list-imp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                        name: listName,
                        icon: '📝',
                        storeId: getStoreIdByName(storeName),
                        status: 'active',
                        itemCount: 0,
                        estimatedCost: 0,
                        progress: 0,
                        items: []
                    });
                    newListsCount++;
                }

                const currentList = listsMap.get(listName)!;
                const itemName = row['Item'] || row['Produto'] || row['Artigo'];

                if (itemName) {
                    const priceVal = row['Preço'] || row['Preco'] || row['Price'] || row['Custo'];
                    const price = typeof priceVal === 'number' ? priceVal : parseFloat(String(priceVal).replace('€', '').trim());
                    const qtyVal = row['Qtd'] || row['Quantidade'] || row['Quantity'] || 1;
                    const isCompleted = String(row['Comprado'] || row['Completed'] || '').toLowerCase().includes('sim') || 
                                       String(row['Comprado'] || row['Completed'] || '').toLowerCase() === 'true';
                    
                    const newItem: ListItem = {
                        id: `item-imp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                        name: itemName,
                        quantity: typeof qtyVal === 'number' ? qtyVal : parseFloat(qtyVal) || 1,
                        unit: (row['Un'] || row['Unidade'] || row['Unit'] || 'un').toLowerCase() as any,
                        category: row['Categoria'] || row['Category'] || appCategories[0]?.name || 'Outros',
                        price: isNaN(price) ? undefined : price,
                        completed: isCompleted,
                        promotionStatus: 'idle'
                    };
                    
                    currentList.items.push(newItem);
                    currentList.itemCount++;
                }
            });

            const finalLists: ShoppingList[] = Array.from(listsMap.values()).map(l => {
                const completedCount = l.items.filter(i => i.completed).length;
                return {
                    ...l,
                    progress: l.itemCount > 0 ? Math.round((completedCount / l.itemCount) * 100) : 0,
                    estimatedCost: l.items.reduce((acc, item) => acc + (item.price || 0), 0)
                };
            });

            if (finalLists.length > 0) {
                onImport(finalLists);
                setImportStatus('success');
                setImportMessage(`${newListsCount} listas carregadas.`);
            } else {
                throw new Error("Empty lists");
            }

        } catch (error) {
            console.error("Import failed", error);
            setImportStatus('error');
            setImportMessage('Formato de ficheiro não reconhecido.');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();

        if (file.name.endsWith('.json')) {
            reader.onload = (evt) => {
                try {
                    const parsed = JSON.parse(evt.target?.result as string);
                    if (Array.isArray(parsed)) {
                        onImport(parsed as ShoppingList[]);
                        setImportStatus('success');
                        setImportMessage('Backup restaurado.');
                    }
                } catch (err) {
                    setImportStatus('error');
                    setImportMessage('JSON inválido.');
                }
            };
            reader.readAsText(file);
        } else {
            reader.onload = (evt) => {
                try {
                    const data = new Uint8Array(evt.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(sheet);
                    processImportedData(jsonData);
                } catch (err) {
                    setImportStatus('error');
                    setImportMessage('Erro ao ler CSV/Excel.');
                }
            };
            reader.readAsArrayBuffer(file);
        }
        e.target.value = ''; 
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-light-surface dark:bg-dark-surface rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
                
                <div className="flex border-b border-gray-100 dark:border-gray-800">
                    <button 
                        className={`flex-1 py-4 font-bold text-sm ${activeTab === 'export' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-gray-400'}`}
                        onClick={() => setActiveTab('export')}
                    >
                        {t('export')}
                    </button>
                    <button 
                        className={`flex-1 py-4 font-bold text-sm ${activeTab === 'import' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-gray-400'}`}
                        onClick={() => setActiveTab('import')}
                    >
                        {t('import')}
                    </button>
                    <button onClick={onClose} className="px-4 text-gray-400 hover:text-gray-600">
                        <XIcon className="w-5 h-5"/>
                    </button>
                </div>

                <div className="p-6">
                    {activeTab === 'export' ? (
                        <div className="space-y-3">
                            <div className="text-center mb-4">
                                <p className="text-sm text-gray-500">{lists.length} listas selecionadas.</p>
                            </div>
                            
                            <button onClick={handleExportPDF} className="w-full flex items-center justify-between p-4 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors border border-red-100 dark:border-red-900/20">
                                <span className="font-bold">{t('export_as_pdf')}</span>
                                <FileTextIcon className="w-6 h-6"/>
                            </button>

                            <button onClick={handleExportExcel} className="w-full flex items-center justify-between p-4 rounded-xl bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400 hover:bg-green-100 transition-colors border border-green-100 dark:border-green-900/20">
                                <span className="font-bold">{t('export_as_excel')}</span>
                                <FileTextIcon className="w-6 h-6"/>
                            </button>

                            <button onClick={handleExportCSV} className="w-full flex items-center justify-between p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors border border-blue-100 dark:border-blue-900/20">
                                <span className="font-bold">{t('export_as_csv')}</span>
                                <FileTextIcon className="w-6 h-6"/>
                            </button>

                            <button onClick={handleExportBackup} className="w-full flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 transition-colors border border-gray-200 dark:border-gray-700 mt-4">
                                <div className="text-left">
                                    <span className="font-bold block text-sm">Backup Local (JSON)</span>
                                    <span className="text-[10px] text-gray-400">Preserva todos os metadados</span>
                                </div>
                                <DownloadIcon className="w-6 h-6"/>
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-8 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900/50">
                                <UploadIcon className="w-10 h-10 text-primary mb-3" />
                                <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Carregar ficheiro</p>
                                <p className="text-xs text-gray-400 mb-6 text-center">Arraste um CSV, Excel ou JSON aqui.</p>
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:shadow-lg active:scale-95 transition-all"
                                >
                                    {t('select_file')}
                                </button>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept=".json,.csv,.xlsx,.xls" 
                                    onChange={handleFileChange}
                                />
                            </div>

                            <button 
                                onClick={handleDownloadTemplate}
                                className="w-full flex items-center justify-center gap-2 text-primary font-bold text-xs p-2 rounded-lg hover:bg-primary/5 transition-colors"
                            >
                                <DownloadIcon className="w-4 h-4" />
                                {t('download_template')}
                            </button>

                            {importStatus === 'success' && (
                                <div className="p-3 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl text-center text-sm font-bold">
                                    {importMessage}
                                </div>
                            )}

                             {importStatus === 'error' && (
                                <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl text-center text-sm font-bold">
                                    {importMessage}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
