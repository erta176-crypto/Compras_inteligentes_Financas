
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserIcon } from './icons/UserIcon';
import { CameraIcon } from './icons/CameraIcon';

interface SetupProfileScreenProps {
    onComplete: () => void;
}

export const SetupProfileScreen: React.FC<SetupProfileScreenProps> = ({ onComplete }) => {
    const { t, user, updateUser } = useApp();
    const [name, setName] = useState(user?.name || '');
    const [photo, setPhoto] = useState(user?.photo || '');
    const [enableBiometrics, setEnableBiometrics] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleFinish = () => {
        if (!name.trim()) return;
        setIsLoading(true);
        
        // Simulate saving
        setTimeout(() => {
            updateUser({
                name: name.trim(),
                photo,
                biometricsEnabled: enableBiometrics,
                isProfileComplete: true
            });
            setIsLoading(false);
            onComplete();
        }, 1000);
    };

    return (
        <div className="flex flex-col h-full p-8 bg-light-surface dark:bg-dark-surface animate-in fade-in duration-500 overflow-y-auto">
            <div className="flex-grow flex flex-col items-center">
                <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                    <UserIcon className="w-10 h-10 text-primary" />
                </div>
                <h1 className="text-3xl font-black mb-2 text-light-text dark:text-dark-text leading-tight">{t('setup_profile')}</h1>
                <p className="text-center text-gray-500 dark:text-gray-400 mb-10 font-medium">{t('complete_profile_desc')}</p>

                <div className="w-full space-y-8">
                    <div className="flex flex-col items-center">
                        <div className="relative w-24 h-24 rounded-[32px] overflow-hidden bg-gray-100 dark:bg-gray-800 border-4 border-white dark:border-dark-surface shadow-xl">
                            {photo ? (
                                <img src={photo} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <UserIcon className="w-10 h-10 text-gray-300" />
                                </div>
                            )}
                            <button className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                <CameraIcon className="w-6 h-6 text-white" />
                            </button>
                        </div>
                        <p className="mt-3 text-xs font-black text-primary uppercase tracking-widest cursor-pointer">Alterar Foto</p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Como devemos chamar-lhe?</label>
                            <input 
                                type="text" 
                                value={name}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setName(val.charAt(0).toUpperCase() + val.slice(1));
                                }}
                                placeholder="Seu Nome"
                                className="w-full mt-1 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary transition-all text-light-text dark:text-dark-text font-bold"
                            />
                        </div>

                        <div className="p-5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl">
                            <div className="flex justify-between items-center">
                                <div className="flex-1 mr-4">
                                    <p className="font-bold text-sm text-light-text dark:text-dark-text">{t('enable_biometrics')}</p>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed mt-1">{t('biometrics_desc')}</p>
                                </div>
                                <button 
                                    onClick={() => setEnableBiometrics(!enableBiometrics)}
                                    className={`w-12 h-6 rounded-full p-1 flex items-center transition-colors ${enableBiometrics ? 'bg-primary justify-end' : 'bg-gray-300 dark:bg-gray-700 justify-start'}`}
                                >
                                    <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <button 
                onClick={handleFinish}
                disabled={!name.trim() || isLoading}
                className="w-full bg-primary hover:bg-primary-dark text-white font-black py-5 rounded-3xl shadow-xl shadow-primary/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 mt-10"
            >
                {isLoading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                    t('finish_setup')
                )}
            </button>
        </div>
    );
};
