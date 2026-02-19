
import React from 'react';
import { useApp } from '../context/AppContext';
import { XIcon } from './icons/XIcon';
import { TrashIcon } from './icons/TrashIcon';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isDestructive?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
    isOpen, 
    title, 
    message, 
    confirmLabel, 
    cancelLabel, 
    onConfirm, 
    onCancel,
    isDestructive = true
}) => {
    const { t } = useApp();
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-6 animate-in fade-in duration-200" onClick={onCancel}>
            <div 
                className="bg-light-surface dark:bg-dark-surface rounded-3xl shadow-2xl w-full max-w-xs overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 text-center">
                    <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${isDestructive ? 'bg-red-50 dark:bg-red-900/20 text-red-500' : 'bg-primary/10 text-primary'}`}>
                        {isDestructive ? <TrashIcon className="w-8 h-8" /> : <XIcon className="w-8 h-8" />}
                    </div>
                    <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-2">{title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{message}</p>
                </div>
                
                <div className="flex border-t border-gray-100 dark:border-gray-800">
                    <button 
                        onClick={onCancel}
                        className="flex-1 py-4 text-sm font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-r border-gray-100 dark:border-gray-800"
                    >
                        {cancelLabel || t('cancel')}
                    </button>
                    <button 
                        onClick={onConfirm}
                        className={`flex-1 py-4 text-sm font-bold transition-colors hover:opacity-90 ${isDestructive ? 'text-red-500 bg-red-50/30' : 'text-primary bg-primary/5'}`}
                    >
                        {confirmLabel || (isDestructive ? t('delete') : t('confirm'))}
                    </button>
                </div>
            </div>
        </div>
    );
};
