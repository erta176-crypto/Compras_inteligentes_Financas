
import React, { useState, useCallback, useRef } from 'react';
import { ListItem } from '../types';
import { useApp } from '../context/AppContext';
import { suggestItemDetails, generateItemImage } from '../services/geminiService';
import { CameraIcon } from './icons/CameraIcon';
import { SparkleIcon } from './icons/SparkleIcon';
import { ImageCropperModal } from './ImageCropperModal';
import { ConfirmationModal } from './ConfirmationModal';

interface AddItemScreenProps {
    onSave: (item: ListItem) => void;
    onCancel: () => void;
    onDelete: (itemId: string) => void;
    item?: ListItem | null;
}

const defaultItem: Omit<ListItem, 'id' | 'completed'> = {
    name: '',
    quantity: 1,
    unit: 'un',
    category: 'Mercearia',
    price: undefined,
    image: undefined,
};

const units: ListItem['unit'][] = ['un', 'kg', 'g', 'L', 'cx'];

export const AddItemScreen: React.FC<AddItemScreenProps> = ({ onSave, onCancel, onDelete, item }) => {
    const { t, categories } = useApp();
    const [formData, setFormData] = useState(item ? { ...item } : { ...defaultItem });
    const [isFetchingSuggestion, setIsFetchingSuggestion] = useState(false);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    
    // Cropper State
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const [tempImageToCrop, setTempImageToCrop] = useState<string | null>(null);

    // Confirmation State
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchSuggestion = useCallback(async () => {
        const name = formData.name.trim();
        if (!name || name.length < 2) return;
        
        setIsFetchingSuggestion(true);
        const availableCategoryNames = categories.map(c => c.name);
        const suggestion = await suggestItemDetails(name, availableCategoryNames, units);
        
        if (suggestion) {
            setFormData(prev => ({ 
                ...prev, 
                category: suggestion.category, 
                unit: suggestion.unit as ListItem['unit'] 
            }));
        }
        setIsFetchingSuggestion(false);
    }, [formData.name, categories]);
    
    const handleGenerateImage = async () => {
        if (!formData.name) return;
        setIsGeneratingImage(true);
        const imageUrl = await generateItemImage(formData.name);
        if (imageUrl) {
            setTempImageToCrop(imageUrl);
            setIsCropperOpen(true);
        }
        setIsGeneratingImage(false);
    };

    const handleTakePhoto = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setTempImageToCrop(reader.result as string);
                setIsCropperOpen(true);
            };
            reader.readAsDataURL(file);
        }
        if (event.target) event.target.value = '';
    };

    const handleCropComplete = (croppedImage: string) => {
        handleChange('image', croppedImage);
        setTempImageToCrop(null);
    };

    const handleSave = () => {
        if (!formData.name) return;
        const itemToSave: ListItem = {
            ...formData,
            id: item?.id || `item-${Date.now()}`,
            completed: item?.completed || false,
            promotionStatus: item?.promotionStatus || 'idle',
        } as ListItem;
        onSave(itemToSave);
    };
    
    const confirmDelete = () => {
        if (item) {
            onDelete(item.id);
            setIsDeleteConfirmOpen(false);
        }
    }

    const handleChange = (field: keyof Omit<ListItem, 'id' | 'completed' | 'priceHistory' | 'alert' | 'source' | 'promotions' | 'promotionStatus' | 'selectedPromotion'>, value: string | number | undefined) => {
        setFormData(prev => ({...prev, [field]: value}));
    }

    return (
        <div className="h-full flex flex-col bg-light-bg dark:bg-dark-bg">
            <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-light-surface dark:bg-dark-surface sticky top-0 z-10">
                <button onClick={onCancel} className="text-primary font-medium">{t('cancel')}</button>
                <h1 className="font-bold text-lg">{item ? t('edit_item_title') : t('add_item_title')}</h1>
                <button onClick={handleSave} className="font-bold text-primary">{t('save')}</button>
            </header>

            <div className="flex-grow overflow-y-auto p-4 space-y-6">
                <div>
                    <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('item_image')}</label>
                    <div className="mt-2 flex items-center gap-4">
                        <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 relative group">
                           {formData.image ? (
                               <img src={formData.image} alt="Item" className="w-full h-full object-cover"/>
                           ) : (
                               <CameraIcon className="w-8 h-8 text-gray-400"/>
                           )}
                           {formData.image && (
                               <button 
                                onClick={() => {
                                    setTempImageToCrop(formData.image || null);
                                    setIsCropperOpen(true);
                                }}
                                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                               >
                                   <span className="text-white text-xs font-bold">{t('edit')}</span>
                               </button>
                           )}
                        </div>
                        <div className="flex-1 space-y-2">
                             <button onClick={handleTakePhoto} className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-semibold active:bg-gray-100 dark:active:bg-gray-800 transition-colors">
                                 <CameraIcon className="w-5 h-5"/> {t('take_photo')}
                             </button>
                             <button onClick={handleGenerateImage} disabled={isGeneratingImage || !formData.name} className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-transparent rounded-lg text-sm font-semibold bg-primary/10 text-primary disabled:opacity-50 hover:bg-primary/20 transition-colors">
                                 <SparkleIcon className={`w-5 h-5 ${isGeneratingImage ? 'animate-spin' : ''}`}/> {isGeneratingImage ? t('generating_image') : t('generate_image')}
                             </button>
                        </div>
                    </div>
                     <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                </div>

                <div>
                    <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('item_name')}</label>
                    <div className="flex gap-2 mt-1">
                        <input 
                            type="text" 
                            placeholder="Ex: Maçãs Gala"
                            value={formData.name} 
                            onChange={e => handleChange('name', e.target.value)} 
                            className="flex-1 p-3 bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all" 
                        />
                        <button 
                            onClick={fetchSuggestion}
                            disabled={isFetchingSuggestion || !formData.name || formData.name.length < 2}
                            className={`p-3 bg-primary/10 text-primary rounded-lg border-2 border-transparent hover:border-primary/30 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed group relative`}
                            title={t('ai_suggestions')}
                        >
                            <SparkleIcon className={`w-6 h-6 ${isFetchingSuggestion ? 'animate-pulse' : ''}`} />
                            <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                {t('ai_suggestions')}
                            </span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('quantity')}</label>
                        <input type="number" value={formData.quantity} onChange={e => handleChange('quantity', parseFloat(e.target.value))} className="w-full mt-1 p-3 bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                     <div>
                        <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('unit')}</label>
                        <select value={formData.unit} onChange={e => handleChange('unit', e.target.value as any)} className="w-full mt-1 p-3 bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary appearance-none">
                            {units.map(u => <option key={u} value={u}>{u.toUpperCase()}</option>)}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('price_optional')}</label>
                    <div className="relative mt-1">
                        <input type="number" step="0.01" placeholder="0.00" value={formData.price || ''} onChange={e => handleChange('price', parseFloat(e.target.value))} className="w-full p-3 bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary pr-10" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                    </div>
                </div>
                
                <div>
                    <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t('category')}</label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                        {categories.map(cat => (
                             <button key={cat.id} onClick={() => handleChange('category', cat.name)} className={`p-2 rounded-lg text-xs font-semibold border-2 transition-all ${formData.category === cat.name ? 'bg-primary/10 border-primary text-primary' : 'bg-light-surface dark:bg-dark-surface border-transparent text-gray-500'}`}>{cat.name}</button>
                        ))}
                    </div>
                </div>

                {isFetchingSuggestion && (
                    <div className="flex items-center justify-center gap-2 text-sm text-primary font-medium animate-pulse">
                        <SparkleIcon className="w-4 h-4" />
                        {t('ai_suggestions')}...
                    </div>
                )}
                
                {item && (
                    <div className="pt-8">
                        <button onClick={() => setIsDeleteConfirmOpen(true)} className="w-full text-red-500 font-bold py-3 bg-red-500/10 rounded-xl hover:bg-red-500/20 transition-colors">{t('delete')}</button>
                    </div>
                )}
            </div>

            {isCropperOpen && tempImageToCrop && (
                <ImageCropperModal 
                    imageSrc={tempImageToCrop}
                    onClose={() => setIsCropperOpen(false)}
                    onCrop={handleCropComplete}
                />
            )}

            <ConfirmationModal 
                isOpen={isDeleteConfirmOpen}
                title={t('confirm_delete_item')}
                message={`${t('confirm_delete_item_msg') || 'Tens a certeza que desejas apagar o artigo'} "${formData.name}"?`}
                onConfirm={confirmDelete}
                onCancel={() => setIsDeleteConfirmOpen(false)}
            />
        </div>
    );
};
