
import React from 'react';
import { AppScreen } from '../types';
import { useApp } from '../context/AppContext';
import { DashboardIcon } from './icons/DashboardIcon';
import { FileTextIcon } from './icons/FileTextIcon';
import { SparkleIcon } from './icons/SparkleIcon';
import { TagIcon } from './icons/TagIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { ListsIcon } from './icons/ListsIcon';

interface BottomNavBarProps {
    activeScreen: AppScreen;
    setScreen: (screen: AppScreen) => void;
}

const navItems = [
    { screen: 'dashboard' as AppScreen, labelKey: 'nav_dashboard', Icon: DashboardIcon },
    { screen: 'budget' as AppScreen, labelKey: 'nav_budget', Icon: TagIcon },
    { screen: 'lists' as AppScreen, labelKey: 'nav_lists', Icon: ListsIcon },
    { screen: 'settings' as AppScreen, labelKey: 'nav_settings', Icon: SettingsIcon },
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
