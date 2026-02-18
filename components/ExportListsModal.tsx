
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
    const { t } = useApp();
    const [activeTab, setActiveTab] = useState<Tab>('export');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');

    if (!isOpen) return null;

    const getStoreName = (storeId?: string) => stores.find(s => s.id === storeId)?.name || '';

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

        const csvContent = "\uFEFF" + [headers.join(','), ...rows].join('\n'); // Add BOM for Excel utf-8
        downloadFile(csvContent, 'shopping_lists.csv', 'text/csv;charset=utf-8');
    };

    const handleExportExcel = () => {
        // Flatten data for Excel
        const data = [];
        lists.forEach(list => {
            if (list.items.length === 0) {
                data.push({
                    Lista: list.name,
                    Loja: getStoreName(list.storeId),
                    Status: list.status,
                    Item: '', Qtd: '', Un: '', Categoria: '', Preco: '', Comprado: ''
                });
            } else {
                list.items.forEach(item => {
                    data.push({
                        Lista: list.name,
                        Loja: getStoreName(list.storeId),
                        Status: list.status,
                        Item: item.name,
                        Qtd: item.quantity,
                        Un: item.unit,
                        Categoria: item.category,
                        Preco: item.price,
                        Comprado: item.completed ? 'Sim' : 'Não'
                    });
                });
            }
        });

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Listas");
        XLSX.writeFile(wb, "shopping_lists.xlsx");
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.text("Listas de Compras", 14, 20);
        doc.setFontSize(10);
        doc.text(`Gerado em: ${new Date().toLocaleDateString()}`, 14, 28);

        let finalY = 35;

        lists.forEach((list) => {
            doc.setFontSize(14);
            doc.text(`${list.icon} ${list.name} (${getStoreName(list.storeId)})`, 14, finalY);
            
            const tableData = list.items.map(item => [
                item.name,
                `${item.quantity} ${item.unit}`,
                item.category,
                item.price ? `${item.price.toFixed(2)}€` : '-',
                item.completed ? '[x]' : '[ ]'
            ]);

            autoTable(doc, {
                startY: finalY + 5,
                head: [['Artigo', 'Qtd', 'Categoria', 'Preço', 'Status']],
                body: tableData,
                theme: 'striped',
                headStyles: { fillColor: [46, 204, 113] }, // Primary color #2ECC71
            });

            // @ts-ignore
            finalY = doc.lastAutoTable.finalY + 15;
            
            // Add new page if needed
            if (finalY > 250) {
                doc.addPage();
                finalY = 20;
            }
        });

        doc.save("shopping_lists.pdf");
    };

    const handleExportBackup = () => {
        const json = JSON.stringify(lists, null, 2);
        downloadFile(json, 'shopping_lists_backup.json', 'application/json');
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

    // --- IMPORT FUNCTIONS ---

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const content = evt.target?.result;
            if (typeof content === 'string') {
                try {
                    // Try JSON first (Full Backup)
                    if (file.name.endsWith('.json')) {
                        const parsed = JSON.parse(content);
                        if (Array.isArray(parsed)) {
                            onImport(parsed as ShoppingList[]);
                            setImportStatus('success');
                            return;
                        }
                    }
                    // Fallback to basic JSON check if extension doesn't match
                    try {
                         const parsed = JSON.parse(content);
                         if (Array.isArray(parsed)) {
                             onImport(parsed as ShoppingList[]);
                             setImportStatus('success');
                             return;
                         }
                    } catch(e) {
                        // Not JSON, ignore
                    }
                    
                    setImportStatus('error');
                } catch (err) {
                    console.error(err);
                    setImportStatus('error');
                }
            }
        };
        reader.readAsText(file);
        // Reset input
        e.target.value = '';
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-light-surface dark:bg-dark-surface rounded-xl shadow-xl w-full max-w-sm m-4 overflow-hidden" onClick={e => e.stopPropagation()}>
                
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    <button 
                        className={`flex-1 py-4 font-bold text-sm ${activeTab === 'export' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
                        onClick={() => setActiveTab('export')}
                    >
                        {t('export')}
                    </button>
                    <button 
                        className={`flex-1 py-4 font-bold text-sm ${activeTab === 'import' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
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
                                <p className="text-sm text-gray-500">{lists.length} listas prontas para exportar.</p>
                             </div>
                            
                            <button onClick={handleExportPDF} className="w-full flex items-center justify-between p-4 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors border border-red-100">
                                <span className="font-bold">{t('export_as_pdf')}</span>
                                <FileTextIcon className="w-6 h-6"/>
                            </button>

                            <button onClick={handleExportExcel} className="w-full flex items-center justify-between p-4 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-colors border border-green-100">
                                <span className="font-bold">{t('export_as_excel')}</span>
                                <FileTextIcon className="w-6 h-6"/>
                            </button>

                            <button onClick={handleExportCSV} className="w-full flex items-center justify-between p-4 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border border-blue-100">
                                <span className="font-bold">{t('export_as_csv')}</span>
                                <FileTextIcon className="w-6 h-6"/>
                            </button>

                            <button onClick={handleExportBackup} className="w-full flex items-center justify-between p-4 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors border border-gray-200">
                                <div className="text-left">
                                    <span className="font-bold block">Backup Completo (JSON)</span>
                                    <span className="text-xs text-gray-500">Para restaurar noutro dispositivo</span>
                                </div>
                                <DownloadIcon className="w-6 h-6"/>
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6 text-center">
                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 flex flex-col items-center justify-center">
                                <UploadIcon className="w-12 h-12 text-gray-400 mb-4" />
                                <p className="text-sm text-gray-500 mb-4">{t('import_json')}</p>
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition-colors"
                                >
                                    {t('select_file')}
                                </button>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept=".json" // For now only JSON support for simplicity
                                    onChange={handleFileChange}
                                />
                            </div>

                            {importStatus === 'success' && (
                                <div className="p-3 bg-green-100 text-green-700 rounded-lg text-sm font-bold animate-pulse">
                                    {t('import_success')}
                                </div>
                            )}

                             {importStatus === 'error' && (
                                <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm font-bold">
                                    {t('import_error')}
                                </div>
                            )}
                            
                            <div className="text-xs text-left text-gray-400">
                                Note: Currently supports JSON backups created by this app.
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};