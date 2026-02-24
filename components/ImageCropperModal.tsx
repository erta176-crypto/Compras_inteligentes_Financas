
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { XIcon } from './icons/XIcon';
import { CheckIcon } from './icons/CheckIcon';

interface ImageCropperModalProps {
    imageSrc: string;
    onClose: () => void;
    onCrop: (croppedImage: string) => void;
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({ imageSrc, onClose, onCrop }) => {
    const { t } = useApp();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [startPan, setStartPan] = useState({ x: 0, y: 0 });

    const CROP_SIZE = 280; // Size of the square viewport
    const OUTPUT_SIZE = 500; // Resolution of saved image

    useEffect(() => {
        const img = new Image();
        img.src = imageSrc;
        img.onload = () => {
            setImage(img);
            // Fit image initially
            const scale = Math.max(CROP_SIZE / img.width, CROP_SIZE / img.height);
            setZoom(scale);
            // Center image
            setOffset({
                x: (CROP_SIZE - img.width * scale) / 2,
                y: (CROP_SIZE - img.height * scale) / 2
            });
        };
    }, [imageSrc]);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !image) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw image with transformations
        ctx.save();
        ctx.translate(offset.x, offset.y);
        ctx.scale(zoom, zoom);
        ctx.drawImage(image, 0, 0);
        ctx.restore();

        // Draw overlay mask (darkened area outside crop box)
        // Note: The canvas is size of viewport (CROP_SIZE x CROP_SIZE), so we don't strictly need a mask
        // if the canvas itself serves as the "viewport".
        // However, if we want to support panning 'out' of bounds (seeing background), we could add style.
        // For this implementation, the canvas IS the crop view.
    }, [image, zoom, offset]);

    useEffect(() => {
        draw();
    }, [draw]);

    const handlePointerDown = (e: React.PointerEvent) => {
        setIsDragging(true);
        setStartPan({ x: e.clientX - offset.x, y: e.clientY - offset.y });
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging) return;
        setOffset({
            x: e.clientX - startPan.x,
            y: e.clientY - startPan.y
        });
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        setIsDragging(false);
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    };

    const handleSave = () => {
        if (!image) return;
        
        // Create an output canvas for higher resolution result
        const outputCanvas = document.createElement('canvas');
        outputCanvas.width = OUTPUT_SIZE;
        outputCanvas.height = OUTPUT_SIZE;
        const ctx = outputCanvas.getContext('2d');
        
        if (ctx) {
            // Calculate ratio between displayed crop size and output size
            const ratio = OUTPUT_SIZE / CROP_SIZE;
            
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
            
            ctx.save();
            // Apply the same transforms but scaled up
            ctx.translate(offset.x * ratio, offset.y * ratio);
            ctx.scale(zoom * ratio, zoom * ratio);
            ctx.drawImage(image, 0, 0);
            ctx.restore();
            
            onCrop(outputCanvas.toDataURL('image/jpeg', 0.9));
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-light-surface dark:bg-dark-surface rounded-xl shadow-xl w-full max-w-sm flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <h2 className="font-bold text-lg">{t('crop_image')}</h2>
                    <button onClick={onClose}><XIcon className="w-6 h-6 text-gray-400"/></button>
                </header>

                <div className="p-6 flex flex-col items-center gap-4">
                    <p className="text-sm text-gray-500">{t('drag_to_position')}</p>
                    
                    <div 
                        ref={containerRef}
                        className="relative overflow-hidden border-2 border-primary rounded-lg shadow-inner bg-gray-100 dark:bg-gray-800 cursor-move touch-none"
                        style={{ width: CROP_SIZE, height: CROP_SIZE }}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerLeave={handlePointerUp}
                    >
                         <canvas 
                            ref={canvasRef}
                            width={CROP_SIZE}
                            height={CROP_SIZE}
                            className="block"
                        />
                        {/* Grid Overlay for visual guide */}
                        <div className="absolute inset-0 pointer-events-none opacity-30">
                            <div className="w-full h-1/3 border-b border-gray-400 absolute top-0"></div>
                            <div className="w-full h-1/3 border-b border-gray-400 absolute top-1/3"></div>
                            <div className="h-full w-1/3 border-r border-gray-400 absolute left-0"></div>
                            <div className="h-full w-1/3 border-r border-gray-400 absolute left-1/3"></div>
                        </div>
                    </div>

                    <div className="w-full px-4">
                        <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                            <span>-</span>
                            <span>{t('zoom')}</span>
                            <span>+</span>
                        </div>
                        <input 
                            type="range" 
                            min="0.1" 
                            max="3" 
                            step="0.05" 
                            value={isNaN(zoom) ? 1 : zoom} 
                            onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                setZoom(isNaN(val) ? 1 : val);
                            }}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-gray-500 font-semibold">{t('cancel')}</button>
                    <button 
                        onClick={handleSave}
                        className="px-4 py-2 bg-primary text-white rounded-lg font-bold flex items-center gap-2"
                    >
                        <CheckIcon className="w-5 h-5" />
                        {t('apply')}
                    </button>
                </div>
            </div>
        </div>
    );
};