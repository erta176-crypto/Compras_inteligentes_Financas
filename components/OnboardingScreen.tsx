
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { OnboardingWelcomeIcon } from './icons/OnboardingWelcomeIcon';
import { OnboardingListsIcon } from './icons/OnboardingListsIcon';
import { OnboardingSyncIcon } from './icons/OnboardingSyncIcon';

interface OnboardingScreenProps {
    onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
    const [step, setStep] = useState(1);
    const { t } = useApp();

    const steps = [
        {
            icon: <OnboardingWelcomeIcon className="w-48 h-48 mx-auto" />,
            title: t('onboarding_welcome_title'),
            description: t('onboarding_welcome_desc'),
        },
        {
            icon: <OnboardingListsIcon className="w-48 h-48 mx-auto" />,
            title: t('onboarding_lists_title'),
            description: t('onboarding_lists_desc'),
        },
        {
            icon: <OnboardingSyncIcon className="w-48 h-48 mx-auto" />,
            title: t('onboarding_sync_title'),
            description: t('onboarding_sync_desc'),
        },
    ];

    const currentStep = steps[step - 1];

    return (
        <div className="flex flex-col h-full bg-light-surface dark:bg-dark-surface p-6">
            <div className="flex justify-end">
                <button onClick={onComplete} className="text-gray-500 dark:text-gray-400 font-semibold">{t('skip')}</button>
            </div>
            <div className="flex-grow flex flex-col items-center justify-center text-center">
                {currentStep.icon}
                <h2 className="text-2xl font-bold mt-8 mb-4 text-light-text dark:text-dark-text">{currentStep.title}</h2>
                <p className="text-gray-600 dark:text-gray-300 max-w-xs">{currentStep.description}</p>
            </div>
            <div className="flex items-center justify-center space-x-2 my-6">
                {steps.map((_, index) => (
                    <div key={index} className={`h-2 rounded-full transition-all duration-300 ${step === index + 1 ? 'w-6 bg-primary' : 'w-2 bg-gray-300 dark:bg-gray-600'}`}></div>
                ))}
            </div>
            <div>
                {step < 3 ? (
                     <button onClick={() => setStep(step + 1)} className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg transition-colors">
                         {t('next')} →
                     </button>
                ) : (
                    <button onClick={onComplete} className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg transition-colors">
                        {t('get_started')} →
                    </button>
                )}
            </div>
        </div>
    );
};
