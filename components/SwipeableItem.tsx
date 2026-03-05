
import React, { useState, useRef, ReactNode } from 'react';
import { TrashIcon } from './icons/TrashIcon';
import { CheckIcon } from './icons/CheckIcon';

interface SwipeableItemProps {
    children: ReactNode;
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    disableSwipe?: boolean;
    className?: string;
}

export const SwipeableItem: React.FC<SwipeableItemProps> = ({ 
    children, 
    onSwipeLeft, 
    onSwipeRight, 
    disableSwipe = false,
    className = ""
}) => {
    const [offsetX, setOffsetX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const startX = useRef(0);
    const startY = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const hasMoved = useRef(false);
    const isScrolling = useRef(false);

    // Thresholds
    const DRAG_THRESHOLD = 5; 
    const ACTION_THRESHOLD = 60; 
    const MAX_SWIPE = 90;

    const handlePointerDown = (e: React.PointerEvent) => {
        if (disableSwipe || e.button !== 0) return;
        if (offsetX !== 0) {
            // Se já estiver aberto, o próximo toque fecha
            return;
        }
        startX.current = e.clientX;
        startY.current = e.clientY;
        hasMoved.current = false;
        isScrolling.current = false;
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (disableSwipe || isScrolling.current) return;

        const diffX = e.clientX - startX.current;
        const diffY = e.clientY - startY.current;

        if (!isDragging) {
            if (Math.abs(diffY) > DRAG_THRESHOLD && Math.abs(diffY) > Math.abs(diffX)) {
                isScrolling.current = true;
                return;
            }
            if (Math.abs(diffX) > DRAG_THRESHOLD) {
                setIsDragging(true);
                hasMoved.current = true;
                containerRef.current?.setPointerCapture(e.pointerId);
            }
        }

        if (isDragging) {
            let diff = diffX;
            if (diff > MAX_SWIPE) diff = MAX_SWIPE;
            if (diff < -MAX_SWIPE) diff = -MAX_SWIPE;

            if (!onSwipeRight && diff > 0) return;
            if (!onSwipeLeft && diff < 0) return;

            setOffsetX(diff);
        }
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (!isDragging) return;

        setIsDragging(false);
        containerRef.current?.releasePointerCapture(e.pointerId);

        if (onSwipeLeft && offsetX < -ACTION_THRESHOLD) {
            setOffsetX(-MAX_SWIPE); 
        } else if (onSwipeRight && offsetX > ACTION_THRESHOLD) {
            onSwipeRight();
            setOffsetX(0);
        } else {
            setOffsetX(0);
        }
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (onSwipeLeft) {
            onSwipeLeft();
            setOffsetX(0);
        }
    };

    const handleContentClickCapture = (e: React.MouseEvent) => {
        if (offsetX !== 0) {
            e.stopPropagation();
            e.preventDefault();
            setOffsetX(0);
            return;
        }

        if (hasMoved.current) {
            e.stopPropagation();
            e.preventDefault();
            hasMoved.current = false; 
        }
    };

    return (
        <div 
            className={`relative overflow-hidden touch-pan-y select-none ${className}`} 
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
        >
            {/* Background Actions - Rendered first but can be put on top via z-index if needed */}
            <div className="absolute inset-0 flex justify-between pointer-events-none">
                {/* Right Action (Complete) */}
                {onSwipeRight && (
                    <div 
                        className={`bg-green-500 h-full flex items-center justify-start pl-6 transition-opacity duration-200 ${offsetX > 0 ? 'opacity-100' : 'opacity-0'}`}
                        style={{ width: Math.max(0, offsetX) }}
                    >
                        <CheckIcon className="w-6 h-6 text-white" />
                    </div>
                )}

                {/* Left Action (Delete) */}
                {onSwipeLeft && (
                    <div 
                        className={`absolute inset-y-0 right-0 bg-red-500 flex items-center justify-end transition-opacity duration-200 pointer-events-auto ${offsetX < 0 ? 'opacity-100' : 'opacity-0'}`}
                        style={{ width: MAX_SWIPE }}
                    >
                        <button 
                            onPointerDown={e => e.stopPropagation()} // Evita que o drag do pai interfira
                            onClick={handleDeleteClick}
                            className="h-full w-full flex items-center justify-center text-white active:bg-red-700 transition-colors"
                            aria-label="Confirm Delete"
                        >
                            <TrashIcon className="w-6 h-6" />
                        </button>
                    </div>
                )}
            </div>

            {/* Main Content Layer */}
            <div 
                className="relative bg-light-surface dark:bg-dark-surface z-10"
                style={{ 
                    transform: `translateX(${offsetX}px)`,
                    transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                onClickCapture={handleContentClickCapture}
            >
                {children}
            </div>
        </div>
    );
};
