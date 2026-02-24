import React from 'react';
import { useApp } from '../context/AppContext';
import { XIcon } from './icons/XIcon';

interface UserManualModalProps {
    onClose: () => void;
}

export const UserManualModal: React.FC<UserManualModalProps> = ({ onClose }) => {
    const { t } = useApp();

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center p-4" onClick={onClose}>
            <div className="bg-light-surface dark:bg-dark-surface w-full max-w-2xl h-[80vh] rounded-t-[40px] sm:rounded-[40px] p-8 animate-in slide-in-from-bottom duration-300 flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black">{t('user_manual')}</h2>
                    <button onClick={onClose}><XIcon className="w-6 h-6" /></button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-6 text-light-text dark:text-dark-text">
                    <section>
                        <h3 className="font-bold text-lg mb-2 text-primary">1. Listas de Compras</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Crie listas para diferentes lojas ou ocasiões. Adicione itens manualmente ou use a adição rápida.
                        </p>
                        <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-2">
                            <li><strong>Adicionar Item:</strong> Use o botão "+" ou a barra de adição rápida.</li>
                            <li><strong>Editar Item:</strong> Toque num item para editar detalhes.</li>
                            <li><strong>Pesquisa de Preços:</strong> Ao editar um item, use o botão de etiqueta para pesquisar promoções online.</li>
                            <li><strong>Modo Seleção:</strong> Toque em "Seleção" para mover ou apagar vários itens de uma vez.</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="font-bold text-lg mb-2 text-primary">2. Dashboard Financeiro</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Acompanhe os seus gastos mensais e saldo total.
                        </p>
                        <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-2">
                            <li><strong>Transações:</strong> Adicione receitas e despesas manualmente.</li>
                            <li><strong>Edição:</strong> Toque numa transação recente para editar ou apagar.</li>
                            <li><strong>Gastos Estimados:</strong> O dashboard inclui o valor dos itens já comprados nas suas listas ativas.</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="font-bold text-lg mb-2 text-primary">3. Orçamentos</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Defina limites de gastos para diferentes categorias (ex: Alimentação, Transportes).
                        </p>
                        <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-2">
                            <li><strong>Criar Orçamento:</strong> Defina um valor limite mensal por categoria.</li>
                            <li><strong>Acompanhamento:</strong> Veja quanto já gastou e quanto resta em cada categoria.</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="font-bold text-lg mb-2 text-primary">4. Definições</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Personalize a aplicação ao seu gosto.
                        </p>
                        <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-2">
                            <li><strong>Gerir Lojas/Categorias:</strong> Adicione ou remova lojas e categorias personalizadas.</li>
                            <li><strong>Modo Escuro:</strong> Alterne entre tema claro e escuro.</li>
                            <li><strong>Biometria:</strong> Ative o login com impressão digital ou FaceID para maior segurança.</li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
};
