
import { ShoppingList, ListItem, Transaction, ExpenseCategory, Store, Category } from './types';
import { CartIcon } from './components/icons/CartIcon';
import { PlaneIcon } from './components/icons/PlaneIcon';
import { BusIcon } from './components/icons/BusIcon';

export const initialStores: Store[] = [
    { id: '1', name: 'Continente', icon: '🛒', color: '#2ECC71' },
    { id: '2', name: 'Pingo Doce', icon: '🥬', color: '#3B82F6' },
    { id: '3', name: 'Lidl', icon: '🥨', color: '#F59E0B' },
    { id: '4', name: 'Auchan', icon: '🐦', color: '#EF4444' },
];

export const initialCategories: Category[] = [
    { id: '1', name: 'Frescos' },
    { id: '2', name: 'Padaria' },
    { id: '3', name: 'Laticínios' },
    { id: '4', name: 'Congelados' },
    { id: '5', name: 'Talho' },
    { id: '6', name: 'Mercearia' },
    { id: '7', name: 'Limpeza' },
    { id: '8', name: 'Bebidas' },
    { id: '9', name: 'Outros' },
];

export const listItems: ListItem[] = [
    { id: '1', name: 'Maçã Gala', quantity: 6, unit: 'un', category: 'Frescos', price: 8.50, completed: false, priceHistory: [8.50] },
    { id: '2', name: 'Leite Meio-Gordo', quantity: 2, unit: 'L', category: 'Laticínios', price: 9.00, completed: false, priceHistory: [9.00] },
    { id: '3', name: 'Arroz Carolino', quantity: 5, unit: 'kg', category: 'Mercearia', price: 22.90, completed: false, priceHistory: [22.90] },
    { id: '4', name: 'Carne Picada', quantity: 500, unit: 'g', category: 'Talho', price: 18.50, completed: false, priceHistory: [18.50] },
    { id: '5', name: 'Detergente', quantity: 1, unit: 'un', category: 'Limpeza', price: 2.50, completed: true, priceHistory: [2.50] },
];

export const shoppingLists: ShoppingList[] = [
    {
        id: '1',
        name: 'Supermercado Semanal',
        itemCount: 15,
        estimatedCost: 120.00,
        progress: 68,
        icon: '🛒',
        items: listItems,
        status: 'active',
        description: '15 artigos - Est. 120,00 €',
        storeId: '1',
    }
];

export const recentTransactions: Transaction[] = [
    { id: 't1', category: 'Supermercado', description: 'Supermercado Central', amount: -124.50, date: 'Ontem, 17:42', icon: CartIcon },
    { id: 't2', category: 'Compras', description: 'Compras Online', amount: -45.99, date: '24 Out, 14:15', icon: PlaneIcon },
    { id: 't3', category: 'Transporte', description: 'Transporte Urbano', amount: -18.25, date: '22 Out, 09:30', icon: BusIcon },
];

export const expensesByCategory: ExpenseCategory[] = [
    { name: 'Supermercado', value: 247.5, color: '#3B82F6' },
    { name: 'Vestuário', value: 112.5, color: '#8B5CF6' },
    { name: 'Lanches', value: 45, color: '#F59E0B' },
    { name: 'Pessoal', value: 45, color: '#EC4899' },
];

export const translations = {
    en: {
        // (Simplified for this version)
    },
    pt: {
        // App General
        'app_name': 'Compras Inteligentes & Finanças',
        'start': 'Começar',
        'next': 'Próximo',
        'skip': 'Pular',
        'get_started': 'Começar a Usar',
        'save': 'Guardar',
        'cancel': 'Cancelar',
        'delete': 'Apagar',
        'edit': 'Editar',
        'done': 'Concluir',
        'confirm_delete_list': 'Tem a certeza que quer apagar esta lista?',
        'confirm_delete_item': 'Tem a certeza que quer apagar este item?',
        'confirm_delete_category': 'Tem a certeza que quer apagar esta categoria?',
        'confirm_delete_store': 'Tem a certeza que quer apagar esta loja?',
        'export': 'Exportar',
        'import': 'Importar',
        'export_lists': 'Gestão de Listas',
        'export_as_csv': 'Exportar como CSV',
        'export_as_pdf': 'Exportar como PDF',
        'export_as_excel': 'Exportar como Excel',
        'import_json': 'Restaurar Backup (JSON)',
        'feature_coming_soon': 'Funcionalidade em breve!',
        'apply': 'Aplicar',
        'select_file': 'Selecionar Ficheiro',
        'import_success': 'Listas importadas com sucesso!',
        'import_error': 'Erro ao importar ficheiro. Verifique o formato.',
        'data_management': 'Gestão de Dados',
        'download_template': 'Baixar Modelo CSV',

        // Onboarding
        'onboarding_welcome_title': 'Listas Inteligentes',
        'onboarding_welcome_desc': 'Crie listas de compras automáticas e nunca mais esqueça um item importante.',
        'onboarding_lists_title': 'Listas que Funcionam',
        'onboarding_lists_desc': 'Crie, edite e organize suas compras em segundos.',
        'onboarding_sync_title': 'Sincronize e Poupe',
        'onboarding_sync_desc': 'Acompanhe os seus gastos em tempo real.',
        
        // Welcome
        'welcome_title': 'Compras & Finanças Inteligentes',
        'welcome_desc': 'Faça a gestão dos seus gastos, maximize as suas poupanças e controle o seu dinheiro.',
        'already_have_account': 'Já tenho conta',

        // Shopping Lists
        'shopping_lists_title': 'Listas de Compras',
        'search_lists_placeholder': 'Pesquisar listas ou produtos...',
        'active': 'Ativas',
        'archived': 'Arquivadas',
        'shared': 'Partilhadas',
        'edit_list': 'Editar Lista',
        'list_name': 'Nome da Lista',
        'list_icon': 'Ícone da Lista (Emoji)',
        'store': 'Loja',
        'select_store': 'Selecione uma loja',
        'all_stores': 'Todas as Lojas',
        
        // List Detail
        'list_detail_title': 'Compras da Semana',
        'total_estimated': 'TOTAL ESTIMADO',
        'articles': 'ARTIGOS',
        'progress': 'Progresso',
        'all': 'Todos',
        'pending': 'Pendentes',
        'completed': 'Comprados',
        'sort_by': 'Ordenar por',
        'name': 'Nome',
        'price': 'Preço',
        'category': 'Categoria',
        'add_item': 'Adicionar Artigo',
        'share_list': 'Partilhar Lista',
        'export_csv': 'Exportar CSV',
        'selection_mode': 'Seleção',
        'bulk_delete': 'Apagar',
        'bulk_mark_done': 'Comprado',
        'bulk_category': 'Categoria',
        'bulk_move': 'Mover',
        'items_selected': 'Selecionados',
        'confirm_bulk_delete': 'Tem a certeza que quer apagar todos os itens selecionados?',
        'deselect_all': 'Desmarcar todos',
        'quick_add_placeholder': 'Adição rápida (ex: Pão)...',
        'move_items': 'Mover Artigos',
        'move_to': 'Mover para...',
        'select_destination_list': 'Selecione a lista de destino',

        // Add Item
        'add_item_title': 'Adicionar Item',
        'edit_item_title': 'Editar Item',
        'item_name': 'Nome do Artigo',
        'quantity': 'Quantidade',
        'unit': 'Unidade',
        'price_optional': 'Preço (Opcional)',
        'category_label': 'Categoria',
        'ai_suggestions': 'Sugestões IA',
        'item_image': 'Imagem do Artigo',
        'take_photo': 'Tirar Foto',
        'generate_image': 'Gerar Imagem',
        'generating_image': 'A gerar imagem...',
        'crop_image': 'Recortar Imagem',
        'zoom': 'Zoom',
        'drag_to_position': 'Arraste para posicionar',

        // Dashboard
        'dashboard_title': 'Bem-vindo de volta,',
        'alexandre_marques': 'Alexandre Marques',
        'total_spent_this_month': 'TOTAL GASTO ESTE MÊS',
        'used': 'Utilizado',
        'remaining': 'Restam',
        'recent_activity': 'Atividade Recente',
        'expenses_by_category': 'Despesas por Categoria',
        'view_all': 'Ver tudo',

        // Profile
        'my_profile': 'O Meu Perfil',
        'member_since': 'Membro desde 2023',
        'personal_info': 'INFORMAÇÕES PESSOAIS',
        'preferences': 'PREFERÊNCIAS',
        'dark_mode': 'Modo Escuro',
        'price_alerts': 'Alertas de Preço',
        'notify_price_drops': 'Notificar descidas de preço',
        'weekly_summary': 'Resumo Semanal',
        'email_with_expenses': 'Email com gastos',
        'security': 'SEGURANÇA',
        'terminate_session': 'Terminar Sessão',
        'manage_data': 'GESTÃO DE DADOS',
        'manage_stores': 'Gerir Lojas',
        'manage_categories': 'Gerir Categorias',
        'store_name': 'Nome da Loja',
        'category_name': 'Nome da Categoria',
        'add_new': 'Adicionar Novo',
        'store_icon': 'Ícone (Emoji)',
        'store_color': 'Cor de Identificação',

        // Nav
        'nav_lists': 'Listas',
        'nav_expenses': 'Finanças',
        'nav_profile': 'Perfil',
    }
};