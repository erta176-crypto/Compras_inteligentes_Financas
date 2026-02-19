
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserIcon } from './icons/UserIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { ManageStoresModal } from './ManageStoresModal';
import { ManageCategoriesModal } from './ManageCategoriesModal';
import { ConfirmationModal } from './ConfirmationModal';

const ProfileRow: React.FC<{ label: string; value: string; isNav?: boolean; onClick?: () => void }> = ({ label, value, isNav, onClick }) => (
    <div className={`flex justify-between items-center py-3 ${onClick ? 'cursor-pointer active:opacity-70' : ''}`} onClick={onClick}>
        <div className="flex-1">
            <p className="text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-wider">{label}</p>
            <p className="font-bold text-light-text dark:text-dark-text truncate pr-4">{value}</p>
        </div>
        {isNav && <ChevronRightIcon className="w-5 h-5 text-gray-400" />}
    </div>
);

const ToggleRow: React.FC<{ label: string; description?: string; enabled: boolean; onToggle: () => void; }> = ({ label, description, enabled, onToggle }) => (
    <div className="flex justify-between items-center py-3">
        <div className="flex-1 mr-4">
            <p className="font-bold text-sm text-light-text dark:text-dark-text">{label}</p>
            {description && <p className="text-gray-500 dark:text-gray-400 text-[10px] leading-tight mt-0.5">{description}</p>}
        </div>
        <button onClick={onToggle} className={`w-12 h-6 rounded-full p-1 flex items-center cursor-pointer transition-colors ${enabled ? 'bg-primary justify-end' : 'bg-gray-300 dark:bg-gray-600 justify-start'}`}>
            <div className="w-4 h-4 bg-white rounded-full transition-transform shadow-sm" />
        </button>
    </div>
);


export const ProfileScreen: React.FC = () => {
    const { t, theme, setTheme, user, logout, updateUser } = useApp();
    const isDarkMode = theme === 'dark';
    const [isManageStoresOpen, setIsManageStoresOpen] = useState(false);
    const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
    const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

    const displayName = user?.name || t('default_user');
    const displayEmail = user?.email || 'utilizador@email.pt';

    const handleLogout = () => {
        logout();
        setIsLogoutConfirmOpen(false);
    };

    const handleToggleBiometrics = () => {
        updateUser({ biometricsEnabled: !user?.biometricsEnabled });
    };

    return (
        <div className="h-full overflow-y-auto bg-light-bg dark:bg-dark-bg p-6 pb-24 animate-in fade-in duration-500">
            <h1 className="text-3xl font-black mb-8 tracking-tight">{t('my_profile')}</h1>

            <div className="flex items-center bg-light-surface dark:bg-dark-surface p-5 rounded-3xl mb-8 shadow-sm border border-gray-100 dark:border-gray-800">
                 <div className="w-20 h-20 rounded-[28px] bg-primary/10 flex items-center justify-center mr-5 overflow-hidden border-2 border-white dark:border-gray-700 shadow-lg">
                    {user?.photo ? (
                        <img src={user.photo} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <UserIcon className="w-10 h-10 text-primary/40" />
                    )}
                </div>
                <div>
                    <h2 className="font-black text-xl text-light-text dark:text-dark-text">{displayName}</h2>
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 mt-1">{t('member_since')} {user?.memberSince || '2025'}</p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-3xl divide-y divide-gray-50 dark:divide-gray-800 shadow-sm border border-gray-100 dark:border-gray-800">
                    <h3 className="font-black text-gray-400 dark:text-gray-500 text-[10px] uppercase tracking-[0.2em] pb-4">{t('personal_info')}</h3>
                    <ProfileRow label={t('full_name')} value={displayName} isNav onClick={() => {}} />
                    <ProfileRow label={t('email')} value={displayEmail} isNav onClick={() => {}} />
                </div>

                <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-3xl divide-y divide-gray-50 dark:divide-gray-800 shadow-sm border border-gray-100 dark:border-gray-800">
                    <h3 className="font-black text-gray-400 dark:text-gray-500 text-[10px] uppercase tracking-[0.2em] pb-4">{t('security')}</h3>
                    <ToggleRow 
                        label={t('enable_biometrics')} 
                        description={t('biometrics_desc')} 
                        enabled={!!user?.biometricsEnabled} 
                        onToggle={handleToggleBiometrics} 
                    />
                </div>

                <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-3xl divide-y divide-gray-50 dark:divide-gray-800 shadow-sm border border-gray-100 dark:border-gray-800">
                    <h3 className="font-black text-gray-400 dark:text-gray-500 text-[10px] uppercase tracking-[0.2em] pb-4">CONFIGURAÇÕES</h3>
                    <ProfileRow label={t('manage_stores')} value="" isNav onClick={() => setIsManageStoresOpen(true)} />
                    <ProfileRow label={t('manage_categories')} value="" isNav onClick={() => setIsManageCategoriesOpen(true)} />
                    <ToggleRow label={t('dark_mode')} enabled={isDarkMode} onToggle={() => setTheme(isDarkMode ? 'light' : 'dark')} />
                </div>
            </div>
            
            <button 
                onClick={() => setIsLogoutConfirmOpen(true)}
                className="w-full text-red-500 font-black py-5 mt-10 bg-white dark:bg-dark-surface rounded-3xl shadow-sm active:scale-95 transition-all border border-red-50 dark:border-red-900/20"
            >
                {t('terminate_session')}
            </button>

            {isManageStoresOpen && <ManageStoresModal onClose={() => setIsManageStoresOpen(false)} />}
            {isManageCategoriesOpen && <ManageCategoriesModal onClose={() => setIsManageCategoriesOpen(false)} />}

            <ConfirmationModal 
                isOpen={isLogoutConfirmOpen}
                title={t('terminate_session')}
                message="Deseja realmente sair da sua conta? Suas listas serão preservadas localmente."
                confirmLabel="Sair"
                onConfirm={handleLogout}
                onCancel={() => setIsLogoutConfirmOpen(false)}
            />
        </div>
    );
};
