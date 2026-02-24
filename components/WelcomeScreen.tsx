
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { WelcomeIcon } from './icons/WelcomeIcon';
import { GOOGLE_CLIENT_ID } from '../constants';

interface WelcomeScreenProps {
    onComplete: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onComplete }) => {
    const { t, loginWithGoogle, login } = useApp();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const googleBtnRef = useRef<HTMLDivElement>(null);

    // Mock Login para demonstração (caso o Google falhe por configuração)
    const handleDemoLogin = () => {
        setIsLoading(true);
        setTimeout(() => {
            login({
                id: 'demo-user',
                name: 'Utilizador Demo',
                email: 'demo@smartshop.pt',
                photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
                isProfileComplete: false, // Forces setup profile
                memberSince: new Date().getFullYear().toString(),
                biometricsEnabled: false
            });
            // Note: onComplete() is not strictly needed here because App.tsx 
            // will react to the user state change and redirect to SetupProfile
        }, 800);
    };

    useEffect(() => {
        const loadGoogleButton = () => {
            if ((window as any).google && googleBtnRef.current) {
                try {
                    const client = (window as any).google.accounts.id;
                    
                    client.initialize({
                        client_id: GOOGLE_CLIENT_ID,
                        callback: async (response: any) => {
                            setIsLoading(true);
                            setError(null);
                            try {
                                await loginWithGoogle(response.credential);
                                // Successful login triggers App.tsx to redirect based on isProfileComplete status
                            } catch (err) {
                                console.error(err);
                                setIsLoading(false);
                                setError("Não foi possível iniciar sessão com o Google.");
                            }
                        },
                        auto_select: false,
                        cancel_on_tap_outside: true
                    });

                    client.renderButton(googleBtnRef.current, {
                        theme: "outline", 
                        size: "large",
                        type: "standard",
                        shape: "pill",
                        text: "continue_with",
                        width: "100%",
                        logo_alignment: "left"
                    });
                } catch (e) {
                    console.error("Erro ao inicializar Google:", e);
                }
            }
        };

        // Check periodically for the Google SDK to load
        const intervalId = setInterval(() => {
            if ((window as any).google) {
                loadGoogleButton();
                clearInterval(intervalId);
            }
        }, 300);

        return () => clearInterval(intervalId);
    }, [loginWithGoogle]);

    return (
        <div className="relative flex flex-col h-full bg-light-surface dark:bg-dark-bg overflow-hidden">
            {/* Background Decorativo */}
            <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[60%] bg-gradient-to-b from-primary/20 to-transparent rounded-b-full blur-3xl pointer-events-none" />

            <div className="flex-grow flex flex-col items-center justify-center p-8 z-10 animate-in fade-in zoom-in-95 duration-700">
                <div className="w-24 h-24 bg-white dark:bg-dark-surface rounded-3xl shadow-xl flex items-center justify-center mb-8 transform transition-transform hover:scale-105 duration-300">
                    <WelcomeIcon className="w-14 h-14 text-primary" />
                </div>
                
                <h1 className="text-3xl md:text-4xl font-black text-center text-light-text dark:text-dark-text mb-3 tracking-tight">
                    {t('welcome_title')}
                </h1>
                
                <p className="text-center text-gray-500 dark:text-gray-400 max-w-xs font-medium leading-relaxed">
                    {t('welcome_desc')}
                </p>
            </div>

            <div className="p-8 z-10 w-full max-w-md mx-auto space-y-4 animate-in slide-in-from-bottom-10 duration-700 delay-100">
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold p-3 rounded-xl text-center mb-4 border border-red-100 dark:border-red-800">
                        {error}
                        <br/>
                        <span className="font-normal opacity-80">Verifique a configuração do Google Console.</span>
                    </div>
                )}

                {/* Google Button Container - Altura fixa para evitar layout shift */}
                <div className="h-[44px] w-full flex justify-center">
                    <div ref={googleBtnRef} className="w-full"></div>
                </div>

                {/* Separator */}
                <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-400 text-[10px] font-bold uppercase tracking-widest">ou</span>
                    <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                </div>

                {/* Demo/Guest Button */}
                <button 
                    onClick={handleDemoLogin}
                    disabled={isLoading}
                    className="w-full bg-white dark:bg-dark-surface border-2 border-primary/20 hover:border-primary hover:bg-primary/5 text-primary dark:text-primary font-bold py-3.5 rounded-full transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <span>Experimentar sem Conta</span>
                    )}
                </button>

                <p className="text-[10px] text-center text-gray-400 pt-4 leading-tight">
                    Nota: O Login Google requer configuração de domínio permitida.
                    <br/>
                    Para testar agora, use a opção <b>Experimentar sem Conta</b>.
                </p>

                <p className="text-[10px] text-center text-gray-300 dark:text-gray-600 pt-4">
                    Ao continuar, aceita os nossos Termos de Serviço e Política de Privacidade.
                </p>
            </div>
        </div>
    );
};
