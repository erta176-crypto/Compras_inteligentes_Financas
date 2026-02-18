
import React from 'react';
import { AppScreen } from '../types';
import { useApp } from '../context/AppContext';
import { ListsIcon } from './icons/ListsIcon';
import { DashboardIcon } from './icons/DashboardIcon';
import { ProfileIcon } from './icons/ProfileIcon';

interface BottomNavBarProps {
    activeScreen: AppScreen;
    setScreen: (screen: AppScreen) => void;
}

const navItems = [
    { screen: 'lists' as AppScreen, labelKey: 'nav_lists', Icon: ListsIcon },
    { screen: 'dashboard' as AppScreen, labelKey: 'nav_expenses', Icon: DashboardIcon },
    { screen: 'profile' as AppScreen, labelKey: 'nav_profile', Icon: ProfileIcon },
];

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeScreen, setScreen }) => {
    const { t } = useApp();

    return (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-light-surface dark:bg-dark-surface border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-around items-center h-16">
                {navItems.map(({ screen, labelKey, Icon }) => {
                    const isActive = activeScreen === screen;
                    return (
                        <button
                            key={screen}
                            onClick={() => setScreen(screen)}
                            className={`flex flex-col items-center justify-center w-full transition-colors ${isActive ? 'text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-primary'}`}
                        >
                            <Icon className="w-6 h-6 mb-1" />
                            <span className="text-xs font-bold">{t(labelKey)}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
