
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserIcon } from './icons/UserIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { ManageStoresModal } from './ManageStoresModal';
import { ManageCategoriesModal } from './ManageCategoriesModal';

const ProfileRow: React.FC<{ label: string; value: string; isNav?: boolean; onClick?: () => void }> = ({ label, value, isNav, onClick }) => (
    <div className={`flex justify-between items-center py-3 ${onClick ? 'cursor-pointer active:opacity-70' : ''}`} onClick={onClick}>
        <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{label}</p>
            <p className="font-semibold">{value}</p>
        </div>
        {isNav && <ChevronRightIcon className="w-5 h-5 text-gray-400" />}
    </div>
);

const ToggleRow: React.FC<{ label: string; description?: string; enabled: boolean; onToggle: () => void; }> = ({ label, description, enabled, onToggle }) => (
    <div className="flex justify-between items-center py-3">
        <div>
            <p className="font-semibold">{label}</p>
            {description && <p className="text-gray-500 dark:text-gray-400 text-sm">{description}</p>}
        </div>
        <button onClick={onToggle} className={`w-12 h-6 rounded-full p-1 flex items-center cursor-pointer transition-colors ${enabled ? 'bg-primary justify-end' : 'bg-gray-300 dark:bg-gray-600 justify-start'}`}>
            <div className="w-4 h-4 bg-white rounded-full transition-transform" />
        </button>
    </div>
);


export const ProfileScreen: React.FC = () => {
    const { t, theme, setTheme } = useApp();
    const isDarkMode = theme === 'dark';
    const [isManageStoresOpen, setIsManageStoresOpen] = useState(false);
    const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);

    return (
        <div className="h-full overflow-y-auto bg-light-bg dark:bg-dark-bg p-4">
            <h1 className="text-2xl font-bold mb-6">{t('my_profile')}</h1>

            <div className="flex items-center bg-light-surface dark:bg-dark-surface p-4 rounded-lg mb-6">
                 <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-4">
                    <UserIcon className="w-8 h-8 text-gray-600 dark:text-gray-300" />
                </div>
                <div>
                    <h2 className="font-bold text-lg">{t('alexandre_marques')}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('member_since')}</p>
                </div>
            </div>

            <div className="bg-light-surface dark:bg-dark-surface p-4 rounded-lg divide-y divide-gray-200 dark:divide-gray-700">
                <h3 className="font-bold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider pb-2">{t('personal_info')}</h3>
                <ProfileRow label={t('full_name')} value={t('alexandre_marques')} isNav />
                <ProfileRow label={t('email')} value="a.marques@email.com" isNav />
            </div>

            <div className="bg-light-surface dark:bg-dark-surface p-4 rounded-lg divide-y divide-gray-200 dark:divide-gray-700 mt-6">
                <h3 className="font-bold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider pb-2">{t('manage_data')}</h3>
                <ProfileRow label={t('manage_stores')} value="" isNav onClick={() => setIsManageStoresOpen(true)} />
                <ProfileRow label={t('manage_categories')} value="" isNav onClick={() => setIsManageCategoriesOpen(true)} />
            </div>

            <div className="bg-light-surface dark:bg-dark-surface p-4 rounded-lg divide-y divide-gray-200 dark:divide-gray-700 mt-6">
                <h3 className="font-bold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider pb-2">{t('preferences')}</h3>
                <ToggleRow label={t('dark_mode')} enabled={isDarkMode} onToggle={() => setTheme(isDarkMode ? 'light' : 'dark')} />
                <ToggleRow label={t('price_alerts')} description={t('notify_price_drops')} enabled={true} onToggle={() => {}}/>
            </div>
            
            <button className="w-full text-red-500 font-semibold py-3 mt-6 bg-light-surface dark:bg-dark-surface rounded-lg">{t('terminate_session')}</button>

            {isManageStoresOpen && <ManageStoresModal onClose={() => setIsManageStoresOpen(false)} />}
            {isManageCategoriesOpen && <ManageCategoriesModal onClose={() => setIsManageCategoriesOpen(false)} />}
        </div>
    );
};
