
import React from 'react';
import { ListItem } from '../types';
import { useApp } from '../context/AppContext';
import { InfoIcon } from './icons/InfoIcon';
import { TrendingUpIcon } from './icons/TrendingUpIcon';
import { TrendingDownIcon } from './icons/TrendingDownIcon';

interface PriceAlertModalProps {
    item: ListItem;
    onClose: () => void;
}

export const PriceAlertModal: React.FC<PriceAlertModalProps> = ({ item, onClose }) => {
    const { t } = useApp();
    const { price, priceHistory, alert, name, source } = item;
    const previousPrice = priceHistory && priceHistory.length > 0 ? priceHistory[priceHistory.length - 1] : undefined;

    const renderAlertInfo = () => {
        if (alert === 'stable' || (price !== undefined && previousPrice !== undefined && price === previousPrice)) {
            return <p className="text-center text-gray-600 dark:text-gray-300">{t('no_price_change')}</p>;
        }

        if (price === undefined || previousPrice === undefined) {
             return <p className="text-center text-gray-600 dark:text-gray-300">Could not determine price change.</p>;
        }

        const priceChange = price - previousPrice;
        const percentageChange = ((priceChange / previousPrice) * 100).toFixed(1);

        return (
            <div className="text-center">
                <div className={`flex items-center justify-center gap-2 font-bold text-lg ${alert === 'up' ? 'text-red-500' : 'text-green-500'}`}>
                    {alert === 'up' ? <TrendingUpIcon className="w-6 h-6" /> : <TrendingDownIcon className="w-6 h-6" />}
                    <span>{priceChange.toFixed(2)}€ ({percentageChange}%)</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t(`price_${alert}`)}</p>
                <div className="flex justify-around mt-4">
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('previous_price')}</p>
                        <p className="font-semibold line-through">{previousPrice.toFixed(2)}€</p>
                    </div>
                    <div>
                        <p className="text-xs text-primary font-bold">{t('new_price')}</p>
                        <p className="font-bold text-primary text-xl">{price.toFixed(2)}€</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-light-surface dark:bg-dark-surface rounded-lg shadow-xl p-6 w-full max-w-sm m-4" onClick={e => e.stopPropagation()}>
                <div className="flex flex-col items-center text-center">
                    <InfoIcon className="w-12 h-12 text-primary mb-3"/>
                    <h2 className="text-xl font-bold mb-2">{t('price_alert')}</h2>
                    <p className="font-semibold text-lg mb-4">{name}</p>
                </div>
                
                {renderAlertInfo()}
                
                {source && source.uri && (
                     <a href={source.uri} target="_blank" rel="noopener noreferrer" className="block w-full text-center mt-6 px-4 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 truncate">
                         {t('view_source')}: {source.title}
                     </a>
                )}

                <button onClick={onClose} className="w-full mt-4 px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary-dark">{t('done')}</button>
            </div>
        </div>
    );
};
