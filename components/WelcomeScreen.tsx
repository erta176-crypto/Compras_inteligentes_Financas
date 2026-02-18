
import React from 'react';
import { useApp } from '../context/AppContext';
import { WelcomeIcon } from './icons/WelcomeIcon';
import { GoogleIcon } from './icons/GoogleIcon';

interface WelcomeScreenProps {
    onComplete: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onComplete }) => {
    const { t } = useApp();
    return (
        <div className="flex flex-col h-full p-8 text-center bg-light-surface dark:bg-dark-surface">
            <div className="flex-grow flex flex-col items-center justify-center">
                <WelcomeIcon className="w-24 h-24 text-primary mb-6" />
                <h1 className="text-2xl font-bold mb-3 text-light-text dark:text-dark-text">{t('welcome_title')}</h1>
                <p className="text-gray-600 dark:text-gray-300 max-w-sm">{t('welcome_desc')}</p>
            </div>
            <div className="space-y-4">
                <button onClick={onComplete} className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg transition-colors">
                    {t('start')} →
                </button>
                <button className="text-gray-600 dark:text-gray-300 font-semibold">{t('already_have_account')}</button>
                <div className="relative flex py-5 items-center">
                    <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                    <span className="flex-shrink mx-4 text-gray-400 dark:text-gray-500 text-sm">Or continue with</span>
                    <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <button className="w-full bg-gray-100 dark:bg-gray-700 text-light-text dark:text-dark-text font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-3 border border-gray-200 dark:border-gray-600">
                    <GoogleIcon className="w-5 h-5" />
                    Google
                </button>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-6">
                By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
        </div>
    );
};
