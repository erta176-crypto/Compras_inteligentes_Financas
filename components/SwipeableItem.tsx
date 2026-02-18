
import React, { useState, useRef, ReactNode, useEffect } from 'react';
import { TrashIcon } from './icons/TrashIcon';
import { CheckIcon } from './icons/CheckIcon';

interface SwipeableItemProps {
    children: ReactNode;
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    disableSwipe?: boolean;
    className?: string;
    confirmLeft?: boolean; // If true, expects action to potentially cancel, so snaps back
}

export const SwipeableItem: React.FC<SwipeableItemProps> = ({ 
    children, 
    onSwipeLeft, 
    onSwipeRight, 
    disableSwipe = false,
    className = "",
    confirmLeft = false
}) => {
    const [offsetX, setOffsetX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const startX = useRef(0);
    const currentX = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const THRESHOLD = 80; // px to trigger action

    const handleTouchStart = (e: React.TouchEvent) => {
        if (disableSwipe) return;
        startX.current = e.touches[0].clientX;
        currentX.current = e.touches[0].clientX;
        setIsDragging(true);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging || disableSwipe) return;
        currentX.current = e.touches[0].clientX;
        const diff = currentX.current - startX.current;

        // Block swipe directions if action not defined
        if (!onSwipeRight && diff > 0) return;
        if (!onSwipeLeft && diff < 0) return;

        setOffsetX(diff);
    };

    const handleTouchEnd = () => {
        if (!isDragging) return;
        setIsDragging(false);

        if (onSwipeLeft && offsetX < -THRESHOLD) {
            // Trigger Left Action (Delete)
            setOffsetX(-1000); // Animate off screen
            // Small delay to allow animation to start before logic (like alert/confirm) blocks JS
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    onSwipeLeft();
                    // If action didn't unmount us (e.g. cancelled confirm), snap back
                    setTimeout(() => setOffsetX(0), 300);
                });
            });
        } else if (onSwipeRight && offsetX > THRESHOLD) {
            // Trigger Right Action (Complete)
            // For toggle, we usually snap back to 0 immediately so the user sees the state change
            onSwipeRight();
            setOffsetX(0);
        } else {
            // Snap back
            setOffsetX(0);
        }
    };

    return (
        <div className={`relative overflow-hidden touch-pan-y ${className}`} ref={containerRef}>
            {/* Background for Swipe Right (Complete) */}
            <div 
                className={`absolute inset-y-0 left-0 w-full bg-green-500 flex items-center justify-start pl-6 transition-opacity duration-200 ${offsetX > 0 ? 'opacity-100' : 'opacity-0'}`}
            >
                <CheckIcon className="w-6 h-6 text-white" />
            </div>

            {/* Background for Swipe Left (Delete) */}
            <div 
                className={`absolute inset-y-0 right-0 w-full bg-red-500 flex items-center justify-end pr-6 transition-opacity duration-200 ${offsetX < 0 ? 'opacity-100' : 'opacity-0'}`}
            >
                <TrashIcon className="w-6 h-6 text-white" />
            </div>

            {/* Content */}
            <div 
                className="relative bg-light-surface dark:bg-dark-surface transition-transform duration-200 ease-out"
                style={{ 
                    transform: `translateX(${offsetX}px)`,
                    transition: isDragging ? 'none' : 'transform 0.3s ease-out'
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {children}
            </div>
        </div>
    );
};
