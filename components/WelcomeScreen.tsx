
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { WelcomeIcon } from './icons/WelcomeIcon';
import { GoogleIcon } from './icons/GoogleIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';

interface WelcomeScreenProps {
    onComplete: () => void;
}

type AuthView = 'initial' | 'login' | 'register';

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onComplete }) => {
    const { t, loginWithGoogle, loginWithBiometrics, login, user } = useApp();
    const [isLoading, setIsLoading] = useState(false);
    const [view, setView] = useState<AuthView>('initial');
    const [error, setError] = useState<string | null>(null);
    const [biometricsAvailable, setBiometricsAvailable] = useState(false);
    
    // Form fields
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        // Check if biometrics was previously enabled for any user on this device
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            const parsed = JSON.parse(savedUser);
            if (parsed.biometricsEnabled) {
                setBiometricsAvailable(true);
            }
        }
    }, []);

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await loginWithGoogle();
            onComplete();
        } catch (err) {
            setError("Falha na autenticação com Google.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleBiometricLogin = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const success = await loginWithBiometrics();
            if (success) {
                onComplete();
            } else {
                setError(t('biometric_failed'));
            }
        } catch (err) {
            setError(t('biometric_failed'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleAuthAction = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (view === 'register' && !name) {
            setError("Por favor, introduza o seu nome.");
            return;
        }
        if (!email || !password) {
            setError("Preencha todos os campos.");
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            try {
                const mockUser = {
                    id: 'email-' + Math.random().toString(36).substr(2, 9),
                    name: view === 'register' ? name : 'Utilizador Smart',
                    email: email,
                    photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
                    isProfileComplete: view !== 'register', // If new, need setup
                    memberSince: new Date().getFullYear().toString()
                };
                
                login(mockUser);
                onComplete();
            } catch (err) {
                setError("Erro ao processar os seus dados.");
            } finally {
                setIsLoading(false);
            }
        }, 1200);
    };

    if (view === 'login' || view === 'register') {
        return (
            <div className="flex flex-col h-full p-8 bg-light-surface dark:bg-dark-surface animate-in slide-in-from-bottom duration-500 overflow-y-auto">
                <button onClick={() => setView('initial')} className="self-start p-2 -ml-2 mb-4">
                    <ChevronLeftIcon className="w-6 h-6 text-gray-500" />
                </button>
                
                <h2 className="text-3xl font-black mb-2 text-light-text dark:text-dark-text">
                    {view === 'login' ? 'Bem-vindo!' : 'Criar Conta'}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">
                    {view === 'login' ? 'Introduza os seus dados para aceder às suas listas.' : 'Registe-se para começar a organizar as suas compras.'}
                </p>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl text-sm font-bold">
                        {error}
                    </div>
                )}

                <form onSubmit={handleAuthAction} className="space-y-4">
                    {view === 'register' && (
                        <div>
                            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Nome Completo</label>
                            <input 
                                type="text" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Seu Nome"
                                className="w-full mt-1 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary transition-all text-light-text dark:text-dark-text"
                            />
                        </div>
                    )}
                    <div>
                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Email</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="exemplo@email.com"
                            className="w-full mt-1 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary transition-all text-light-text dark:text-dark-text"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Password</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full mt-1 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary transition-all text-light-text dark:text-dark-text"
                        />
                    </div>
                    
                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary hover:bg-primary-dark text-white font-black py-4 rounded-2xl shadow-xl shadow-primary/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
                    >
                        {isLoading ? (
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            view === 'login' ? 'Entrar Agora' : 'Finalizar Registo'
                        )}
                    </button>
                </form>

                <button 
                    onClick={() => setView(view === 'login' ? 'register' : 'login')}
                    className="mt-8 text-sm text-center text-primary font-black uppercase tracking-widest"
                >
                    {view === 'login' ? 'Não tem conta? Crie uma aqui' : 'Já é membro? Faça Login'}
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full p-8 text-center bg-light-surface dark:bg-dark-surface animate-in fade-in duration-500 overflow-y-auto">
            <div className="flex-grow flex flex-col items-center justify-center">
                <div className="w-28 h-28 bg-primary/10 rounded-[32px] flex items-center justify-center mb-10 rotate-3 shadow-inner">
                    <WelcomeIcon className="w-16 h-16 text-primary" />
                </div>
                <h1 className="text-4xl font-black mb-4 text-light-text dark:text-dark-text leading-[1.1] tracking-tight">{t('welcome_title')}</h1>
                <p className="text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed font-medium">{t('welcome_desc')}</p>
            </div>
            
            <div className="space-y-4">
                <button 
                    onClick={() => setView('register')} 
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-primary-dark text-white font-black py-5 px-4 rounded-3xl shadow-2xl shadow-primary/40 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                    Começar Agora
                </button>
                
                {biometricsAvailable && (
                    <button 
                        onClick={handleBiometricLogin}
                        disabled={isLoading}
                        className="w-full bg-light-bg dark:bg-gray-800 text-light-text dark:text-dark-text font-black py-5 px-4 rounded-3xl border border-gray-100 dark:border-gray-700 transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                        {isLoading ? (
                             <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <span className="text-2xl">☝️</span>
                                {t('biometric_login')}
                            </>
                        )}
                    </button>
                )}

                <div className="relative flex py-6 items-center">
                    <div className="flex-grow border-t border-gray-100 dark:border-gray-800"></div>
                    <span className="flex-shrink mx-4 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">ou entrar com</span>
                    <div className="flex-grow border-t border-gray-100 dark:border-gray-800"></div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                     <button 
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="bg-white dark:bg-gray-800 text-light-text dark:text-dark-text font-black py-5 rounded-3xl flex items-center justify-center gap-3 border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-95 disabled:opacity-70"
                    >
                        {!isLoading && <GoogleIcon className="w-5 h-5" />}
                        Google
                    </button>
                    <button 
                        onClick={() => setView('login')}
                        disabled={isLoading}
                        className="bg-white dark:bg-gray-800 text-light-text dark:text-dark-text font-black py-5 rounded-3xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-95"
                    >
                        Email
                    </button>
                </div>
            </div>
            
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-10 leading-relaxed px-6 font-medium">
                Sua segurança é nossa prioridade. Usamos encriptação de ponta a ponta.
            </p>
        </div>
    );
};
