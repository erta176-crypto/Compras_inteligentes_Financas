
import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { UserIcon } from './icons/UserIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { CameraIcon } from './icons/CameraIcon';
import { ManageStoresModal } from './ManageStoresModal';
import { ManageCategoriesModal } from './ManageCategoriesModal';
import { ManageBudgetCategoriesModal } from './ManageBudgetCategoriesModal';
import { ConfirmationModal } from './ConfirmationModal';
import { UserManualModal } from './UserManualModal';

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
    const { t, theme, setTheme, colorTheme, setColorTheme, user, logout, updateUser } = useApp();
    const isDarkMode = theme === 'dark';
    const [isManageStoresOpen, setIsManageStoresOpen] = useState(false);
    const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
    const [isManageBudgetCategoriesOpen, setIsManageBudgetCategoriesOpen] = useState(false);
    const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
    const [isUserManualOpen, setIsUserManualOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const displayName = user?.name || t('default_user');
    const displayEmail = user?.email || 'utilizador@email.pt';

    const handleLogout = () => {
        logout();
        setIsLogoutConfirmOpen(false);
    };

    const handleToggleBiometrics = () => {
        const newState = !user?.biometricsEnabled;
        updateUser({ biometricsEnabled: newState });
        if (newState) {
            alert(t('biometrics_enabled_msg') || 'Biometria ativada. Use a sua impressão digital ou FaceID no próximo login.');
        } else {
            alert(t('biometrics_disabled_msg') || 'Biometria desativada.');
        }
    };

    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handleCameraClick = () => {
        cameraInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateUser({ photo: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="h-full overflow-y-auto bg-light-bg dark:bg-dark-bg p-6 pb-24 animate-in fade-in duration-500">
            <h1 className="text-3xl font-black mb-8 tracking-tight">{t('nav_settings')}</h1>

            <div className="flex items-center bg-light-surface dark:bg-dark-surface p-6 rounded-[40px] mb-8 shadow-sm border border-gray-100 dark:border-gray-800">
                 <input 
                     type="file" 
                     accept="image/*" 
                     ref={fileInputRef} 
                     onChange={handleFileChange} 
                     className="hidden" 
                 />
                 <input 
                     type="file" 
                     accept="image/*" 
                     capture="user"
                     ref={cameraInputRef} 
                     onChange={handleFileChange} 
                     className="hidden" 
                 />
                 <div 
                     className="relative w-20 h-20 rounded-[28px] bg-primary/10 flex items-center justify-center mr-5 overflow-hidden border-2 border-white dark:border-gray-700 shadow-lg cursor-pointer group"
                     onClick={handlePhotoClick}
                 >
                    {user?.photo ? (
                        <img src={user.photo} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <UserIcon className="w-10 h-10 text-primary/40" />
                    )}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <CameraIcon className="w-6 h-6 text-white" />
                    </div>
                </div>
                <div>
                    <h2 className="font-black text-xl text-light-text dark:text-dark-text">{displayName}</h2>
                    <div className="flex gap-4 mt-2">
                        <p 
                            className="text-xs font-bold text-primary cursor-pointer hover:opacity-80 transition-opacity bg-primary/10 px-3 py-1.5 rounded-full"
                            onClick={handlePhotoClick}
                        >
                            Galeria
                        </p>
                        <p 
                            className="text-xs font-bold text-primary cursor-pointer hover:opacity-80 transition-opacity bg-primary/10 px-3 py-1.5 rounded-full"
                            onClick={handleCameraClick}
                        >
                            Câmera
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-light-surface dark:bg-dark-surface p-8 rounded-[40px] divide-y divide-gray-50 dark:divide-gray-800 shadow-sm border border-gray-100 dark:border-gray-800">
                    <h3 className="font-black text-gray-400 dark:text-gray-500 text-[10px] uppercase tracking-[0.2em] pb-6">{t('personal_info')}</h3>
                    <ProfileRow label={t('full_name')} value={displayName} isNav onClick={() => {}} />
                    <ProfileRow label={t('email')} value={displayEmail} isNav onClick={() => {}} />
                </div>

                <div className="bg-light-surface dark:bg-dark-surface p-8 rounded-[40px] divide-y divide-gray-50 dark:divide-gray-800 shadow-sm border border-gray-100 dark:border-gray-800">
                    <h3 className="font-black text-gray-400 dark:text-gray-500 text-[10px] uppercase tracking-[0.2em] pb-6">{t('security')}</h3>
                    <ToggleRow 
                        label={t('enable_biometrics')} 
                        description={t('biometrics_desc')} 
                        enabled={!!user?.biometricsEnabled} 
                        onToggle={handleToggleBiometrics} 
                    />
                </div>

                <div className="bg-light-surface dark:bg-dark-surface p-8 rounded-[40px] divide-y divide-gray-50 dark:divide-gray-800 shadow-sm border border-gray-100 dark:border-gray-800">
                    <h3 className="font-black text-gray-400 dark:text-gray-500 text-[10px] uppercase tracking-[0.2em] pb-6">{t('settings')}</h3>
                    
                    <div className="flex justify-between items-center py-3">
                        <div className="flex-1">
                            <p className="text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-wider">Início do Ciclo Mensal</p>
                            <p className="font-bold text-light-text dark:text-dark-text pr-4">Dia do Mês</p>
                        </div>
                        <select 
                            value={user?.billingCycleStartDay || 1}
                            onChange={(e) => updateUser({ billingCycleStartDay: Number(e.target.value) })}
                            className="bg-gray-100 dark:bg-gray-800 border-none rounded-xl px-4 py-2 font-bold text-sm focus:ring-2 focus:ring-primary outline-none"
                        >
                            {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                <option key={day} value={day}>{day}</option>
                            ))}
                        </select>
                    </div>

                    <ProfileRow label={t('manage_stores')} value="" isNav onClick={() => setIsManageStoresOpen(true)} />
                    <ProfileRow label={t('manage_categories')} value="" isNav onClick={() => setIsManageCategoriesOpen(true)} />
                    <ProfileRow label={t('manage_budget_categories')} value="" isNav onClick={() => setIsManageBudgetCategoriesOpen(true)} />
                    <ProfileRow label={t('user_manual')} value="" isNav onClick={() => setIsUserManualOpen(true)} />
                    <ToggleRow label={t('dark_mode')} enabled={isDarkMode} onToggle={() => setTheme(isDarkMode ? 'light' : 'dark')} />
                    
                    <div className="flex flex-col items-center py-5 gap-4">
                        <div className="text-center">
                            <p className="text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-wider mb-1">Cor da Aplicação</p>
                            <p className="font-bold text-light-text dark:text-dark-text">Tema Principal</p>
                        </div>
                        <div className="flex gap-3 justify-center">
                            {(['purple', 'green', 'blue', 'orange', 'pink'] as const).map(color => (
                                <button
                                    key={color}
                                    onClick={() => setColorTheme(color)}
                                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                                        colorTheme === color ? 'border-light-text dark:border-dark-text scale-110 shadow-md' : 'border-transparent scale-100'
                                    }`}
                                    style={{
                                        backgroundColor: 
                                            color === 'purple' ? '#7C3AED' :
                                            color === 'green' ? '#2ECC71' :
                                            color === 'blue' ? '#3B82F6' :
                                            color === 'orange' ? '#F97316' : '#EC4899'
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            
            <button 
                onClick={() => setIsLogoutConfirmOpen(true)}
                className="w-full text-red-500 font-black py-6 mt-10 bg-white dark:bg-dark-surface rounded-[40px] shadow-sm active:scale-95 transition-all border border-red-50 dark:border-red-900/20"
            >
                {t('terminate_session')}
            </button>

            {isManageStoresOpen && <ManageStoresModal onClose={() => setIsManageStoresOpen(false)} />}
            {isManageCategoriesOpen && <ManageCategoriesModal onClose={() => setIsManageCategoriesOpen(false)} />}
            {isManageBudgetCategoriesOpen && <ManageBudgetCategoriesModal onClose={() => setIsManageBudgetCategoriesOpen(false)} />}
            {isUserManualOpen && <UserManualModal onClose={() => setIsUserManualOpen(false)} />}

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
