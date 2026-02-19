
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

    const formatPrice = (price: any): string => {
        if (price === null || price === undefined) return '';
        const num = Number(price);
        return isNaN(num) ? '' : num.toFixed(2);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-light-surface dark:bg-dark-surface rounded-lg shadow-xl p-6 w-full max-w-md m-4 flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <TagIcon className="w-6 h-6 text-primary" />
                        <h2 className="text-xl font-bold">{t('promotions_for')}</h2>
                    </div>
                    <button onClick={onClose}><XIcon className="w-6 h-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" /></button>
                </div>
                <p className="font-semibold text-lg mb-4 text-center flex-shrink-0">{name}</p>

                <div className="flex-grow overflow-y-auto space-y-3 pr-2">
                    {promotions && promotions.length > 0 ? (
                        promotions.map((promo, index) => {
                            const formattedPrice = formatPrice(promo.price);
                            return (
                                <div key={index} className="bg-light-bg dark:bg-dark-bg p-4 rounded-lg flex flex-col gap-2 border border-gray-100 dark:border-gray-800">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 mr-2">
                                            <p className="font-bold text-primary">{promo.store}</p>
                                            <p className="text-sm font-medium text-light-text dark:text-dark-text leading-tight">{promo.description}</p>
                                        </div>
                                        {formattedPrice && (
                                            <p className="font-bold text-lg text-primary whitespace-nowrap">
                                                {formattedPrice}€
                                            </p>
                                        )}
                                    </div>
                                    
                                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                         {promo.source && promo.source.uri ? (
                                            <a href={promo.source.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] text-gray-500 dark:text-gray-400 hover:underline flex items-center gap-1 truncate max-w-[150px]">
                                                <ExternalLinkIcon className="w-3 h-3"/>
                                                {promo.source.title}
                                            </a>
                                        ) : (<span></span>)}

                                        {onSelectPromotion && (
                                            <button 
                                                onClick={() => onSelectPromotion(promo)}
                                                className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-lg transition-colors flex items-center gap-1 active:scale-95"
                                            >
                                                <CheckCircleIcon className="w-4 h-4" />
                                                {t('apply') || 'Aplicar'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 opacity-40">
                            <TagIcon className="w-12 h-12 mb-2" />
                            <p className="text-center text-sm font-medium">{t('no_promotions_found')}</p>
                        </div>
                    )}
                </div>
                 <button onClick={onClose} className="w-full mt-4 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex-shrink-0">{t('done')}</button>
            </div>
        </div>
    );
};
