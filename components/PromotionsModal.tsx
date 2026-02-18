
import React from 'react';
import { ListItem, Promotion } from '../types';
import { useApp } from '../context/AppContext';
import { TagIcon } from './icons/TagIcon';
import { XIcon } from './icons/XIcon';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface PromotionsModalProps {
    item: ListItem;
    onClose: () => void;
    onSelectPromotion?: (promotion: Promotion) => void;
}

export const PromotionsModal: React.FC<PromotionsModalProps> = ({ item, onClose, onSelectPromotion }) => {
    const { t } = useApp();
    const { name, promotions } = item;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-light-surface dark:bg-dark-surface rounded-lg shadow-xl p-6 w-full max-w-md m-4 flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <TagIcon className="w-6 h-6 text-primary" />
                        <h2 className="text-xl font-bold">{t('promotions_for')}</h2>
                    </div>
                    <button onClick={onClose}><XIcon className="w-6 h-6 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200" /></button>
                </div>
                <p className="font-semibold text-lg mb-4 text-center flex-shrink-0">{name}</p>

                <div className="flex-grow overflow-y-auto space-y-3 pr-2">
                    {promotions && promotions.length > 0 ? (
                        promotions.map((promo, index) => (
                            <div key={index} className="bg-light-bg dark:bg-dark-bg p-4 rounded-lg flex flex-col gap-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-primary">{promo.store}</p>
                                        <p className="text-sm font-medium text-light-text dark:text-dark-text">{promo.description}</p>
                                    </div>
                                    {promo.price && <p className="font-bold text-lg text-primary">{promo.price.toFixed(2)}€</p>}
                                </div>
                                
                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                     {promo.source && promo.source.uri ? (
                                        <a href={promo.source.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 dark:text-gray-400 hover:underline flex items-center gap-1 truncate max-w-[150px]">
                                            <ExternalLinkIcon className="w-3 h-3"/>
                                            {promo.source.title}
                                        </a>
                                    ) : (<span></span>)}

                                    {onSelectPromotion && (
                                        <button 
                                            onClick={() => onSelectPromotion(promo)}
                                            className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                                        >
                                            <CheckCircleIcon className="w-4 h-4" />
                                            Aplicar
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">{t('no_promotions_found')}</p>
                    )}
                </div>
                 <button onClick={onClose} className="w-full mt-4 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 flex-shrink-0">{t('done')}</button>
            </div>
        </div>
    );
};