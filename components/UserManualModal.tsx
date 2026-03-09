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
            <div className="bg-light-surface dark:bg-dark-surface w-full max-w-2xl h-[85vh] rounded-t-[40px] sm:rounded-[40px] p-8 animate-in slide-in-from-bottom duration-300 flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black">{t('user_manual')}</h2>
                    <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-8 text-light-text dark:text-dark-text pb-10">
                    
                    <section className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <h3 className="font-black text-lg mb-3 text-primary flex items-center gap-2">
                            <span className="bg-primary/20 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                            Listas de Compras
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Crie e gira as suas listas de compras de forma inteligente, organizadas por supermercado ou ocasião.
                        </p>
                        <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                            <li className="flex gap-2">
                                <span className="text-primary font-bold">•</span>
                                <span><strong>Adicionar Artigos:</strong> Use o botão "+" ou a barra de adição rápida no fundo do ecrã. Pode definir quantidades, unidades de medida (Kg, Lt, Un, etc.), preço estimado e até adicionar uma foto (tirada na hora ou gerada por IA).</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-primary font-bold">•</span>
                                <span><strong>Organização:</strong> Os artigos são automaticamente agrupados por categoria (Higiene, Talho, Frutas, etc.) para facilitar a navegação no supermercado.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-primary font-bold">•</span>
                                <span><strong>Modo de Seleção (Bulk):</strong> Toque em "Seleção" no topo da lista para selecionar vários artigos de uma vez. Pode movê-los para outra lista, apagá-los ou marcá-los como comprados simultaneamente.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-primary font-bold">•</span>
                                <span><strong>Finalizar Compra:</strong> Quando terminar as compras, clique em "Finalizar Compra". A lista será arquivada no seu histórico com a data de hoje, guardando o valor total gasto.</span>
                            </li>
                        </ul>
                    </section>

                    <section className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <h3 className="font-black text-lg mb-3 text-primary flex items-center gap-2">
                            <span className="bg-primary/20 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                            Poupança e Promoções
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Ferramentas integradas para ajudar a poupar dinheiro nas suas compras.
                        </p>
                        <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                            <li className="flex gap-2">
                                <span className="text-primary font-bold">•</span>
                                <span><strong>Pesquisar Promoções:</strong> Deslize um artigo para a esquerda e toque no ícone de "etiqueta" para procurar promoções online desse produto em vários supermercados.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-primary font-bold">•</span>
                                <span><strong>Alertas de Preço:</strong> A aplicação memoriza os preços que insere. Se o preço de um artigo subir ou descer em relação à última compra, será alertado com um ícone colorido junto ao preço.</span>
                            </li>
                        </ul>
                    </section>

                    <section className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <h3 className="font-black text-lg mb-3 text-primary flex items-center gap-2">
                            <span className="bg-primary/20 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                            Dashboard e Estatísticas
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Acompanhe os seus hábitos de consumo através de gráficos intuitivos.
                        </p>
                        <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                            <li className="flex gap-2">
                                <span className="text-primary font-bold">•</span>
                                <span><strong>Gastos por Categoria:</strong> Gráfico circular que mostra onde gasta mais dinheiro (ex: Mercearia vs Laticínios).</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-primary font-bold">•</span>
                                <span><strong>Gastos por Loja:</strong> Gráfico de barras que compara o total gasto em diferentes supermercados (ex: Continente vs Pingo Doce).</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-primary font-bold">•</span>
                                <span><strong>Histórico de Compras:</strong> Registo detalhado de todas as compras finalizadas, organizadas por data.</span>
                            </li>
                        </ul>
                    </section>

                    <section className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <h3 className="font-black text-lg mb-3 text-primary flex items-center gap-2">
                            <span className="bg-primary/20 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm">4</span>
                            Exportação e Partilha
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Leve os seus dados consigo para onde quiser.
                        </p>
                        <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                            <li className="flex gap-2">
                                <span className="text-primary font-bold">•</span>
                                <span><strong>Exportar Listas:</strong> No ecrã principal de listas, use o botão de exportação no topo para guardar as suas listas em formato PDF, Excel ou CSV.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-primary font-bold">•</span>
                                <span><strong>Partilhar Lista:</strong> Dentro de uma lista, use o ícone de partilha no topo para enviar a lista por mensagem ou email.</span>
                            </li>
                        </ul>
                    </section>

                    <section className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <h3 className="font-black text-lg mb-3 text-primary flex items-center gap-2">
                            <span className="bg-primary/20 text-primary w-8 h-8 rounded-full flex items-center justify-center text-sm">5</span>
                            Personalização (Perfil)
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Adapte a aplicação às suas necessidades específicas.
                        </p>
                        <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                            <li className="flex gap-2">
                                <span className="text-primary font-bold">•</span>
                                <span><strong>Gerir Lojas:</strong> Adicione os seus supermercados locais, escolha cores e ícones para cada um.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-primary font-bold">•</span>
                                <span><strong>Gerir Categorias:</strong> Crie novas categorias de produtos com cores personalizadas para melhor organização.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-primary font-bold">•</span>
                                <span><strong>Copiar Listas Antigas:</strong> No separador "Arquivadas", pode copiar uma lista antiga para criar uma nova lista ativa com os mesmos artigos.</span>
                            </li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
};
