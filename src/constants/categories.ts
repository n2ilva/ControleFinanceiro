/**
 * Ícones para cada categoria de despesa/receita
 */
export const CATEGORY_ICONS: { [key: string]: string } = {
    // Moradia
    moradia: 'home',
    aluguel: 'home-outline',
    condominio: 'business',
    agua: 'water',
    energia: 'flash',
    internet: 'wifi',
    gas: 'flame',
    telefone: 'call',
    
    // Alimentação
    mercado: 'cart',
    alimentacao: 'restaurant',
    lanche: 'fast-food',
    restaurante: 'restaurant-outline',
    delivery: 'bicycle',
    
    // Transporte
    transporte: 'car',
    combustivel: 'speedometer',
    estacionamento: 'car-sport',
    uber: 'car-outline',
    
    // Saúde e Bem-estar
    saude: 'medical',
    farmacia: 'medkit',
    academia: 'barbell',
    
    // Educação
    educacao: 'school',
    cursos: 'book',
    livros: 'library',
    
    // Pessoal
    vestuario: 'shirt',
    beleza: 'sparkles',
    pets: 'paw',
    
    // Lazer
    lazer: 'game-controller',
    viagem: 'airplane',
    cinema: 'film',
    streaming: 'tv',
    jogos: 'game-controller-outline',
    
    // Presentes e Doações
    presentes: 'gift',
    doacoes: 'heart',
    
    // Financeiro
    assinaturas: 'card',
    cartao: 'card-outline',
    impostos: 'document-text',
    taxas: 'receipt',
    juros: 'trending-down',
    
    // Casa
    manutencao: 'construct',
    moveis: 'bed',
    eletronicos: 'laptop',
    
    // Receitas
    salario: 'cash',
    deposito: 'card',
    freelance: 'briefcase',
    bonus: 'sparkles',
    rendimentos: 'trending-up',
    investimentos: 'stats-chart',
    aluguelRecebido: 'home',
    reembolso: 'refresh',
    vendas: 'pricetag',
    extra: 'gift',
    
    // Outros
    outros: 'ellipsis-horizontal',
};

/**
 * Categorias de despesas
 */
export const EXPENSE_CATEGORIES = [
    { id: 'moradia', label: 'Moradia', icon: 'home' },
    { id: 'aluguel', label: 'Aluguel', icon: 'home-outline' },
    { id: 'condominio', label: 'Condomínio', icon: 'business' },
    { id: 'agua', label: 'Água', icon: 'water' },
    { id: 'energia', label: 'Energia', icon: 'flash' },
    { id: 'internet', label: 'Internet', icon: 'wifi' },
    { id: 'gas', label: 'Gás', icon: 'flame' },
    { id: 'telefone', label: 'Telefone', icon: 'call' },
    { id: 'mercado', label: 'Mercado', icon: 'cart' },
    { id: 'alimentacao', label: 'Alimentação', icon: 'restaurant' },
    { id: 'lanche', label: 'Lanche', icon: 'fast-food' },
    { id: 'restaurante', label: 'Restaurante', icon: 'restaurant-outline' },
    { id: 'delivery', label: 'Delivery', icon: 'bicycle' },
    { id: 'transporte', label: 'Transporte', icon: 'car' },
    { id: 'combustivel', label: 'Combustível', icon: 'speedometer' },
    { id: 'estacionamento', label: 'Estacionamento', icon: 'car-sport' },
    { id: 'uber', label: 'Uber/99', icon: 'car-outline' },
    { id: 'saude', label: 'Saúde', icon: 'medical' },
    { id: 'farmacia', label: 'Farmácia', icon: 'medkit' },
    { id: 'academia', label: 'Academia', icon: 'barbell' },
    { id: 'educacao', label: 'Educação', icon: 'school' },
    { id: 'cursos', label: 'Cursos', icon: 'book' },
    { id: 'livros', label: 'Livros', icon: 'library' },
    { id: 'vestuario', label: 'Vestuário', icon: 'shirt' },
    { id: 'beleza', label: 'Beleza', icon: 'sparkles' },
    { id: 'pets', label: 'Pets', icon: 'paw' },
    { id: 'lazer', label: 'Lazer', icon: 'game-controller' },
    { id: 'viagem', label: 'Viagem', icon: 'airplane' },
    { id: 'cinema', label: 'Cinema', icon: 'film' },
    { id: 'streaming', label: 'Streaming', icon: 'tv' },
    { id: 'presentes', label: 'Presentes', icon: 'gift' },
    { id: 'assinaturas', label: 'Assinaturas', icon: 'card' },
    { id: 'cartao', label: 'Cartão', icon: 'card-outline' },
    { id: 'impostos', label: 'Impostos', icon: 'document-text' },
    { id: 'taxas', label: 'Taxas', icon: 'receipt' },
    { id: 'manutencao', label: 'Manutenção', icon: 'construct' },
    { id: 'moveis', label: 'Móveis', icon: 'bed' },
    { id: 'eletronicos', label: 'Eletrônicos', icon: 'laptop' },
    { id: 'outros', label: 'Outros', icon: 'ellipsis-horizontal' },
];

/**
 * Categorias de receitas
 */
export const INCOME_CATEGORIES = [
    { id: 'salario', label: 'Salário', icon: 'cash' },
    { id: 'deposito', label: 'Depósito', icon: 'card' },
    { id: 'freelance', label: 'Freelance', icon: 'briefcase' },
    { id: 'bonus', label: 'Bônus', icon: 'sparkles' },
    { id: 'rendimentos', label: 'Rendimentos', icon: 'trending-up' },
    { id: 'investimentos', label: 'Investimentos', icon: 'stats-chart' },
    { id: 'aluguelRecebido', label: 'Aluguel Recebido', icon: 'home' },
    { id: 'reembolso', label: 'Reembolso', icon: 'refresh' },
    { id: 'vendas', label: 'Vendas', icon: 'pricetag' },
    { id: 'extra', label: 'Extra', icon: 'gift' },
    { id: 'outros', label: 'Outros', icon: 'ellipsis-horizontal' },
];

/**
 * Grupos de categorias de despesas (para exibição organizada)
 */
export const EXPENSE_CATEGORY_GROUPS = [
    {
        title: 'Moradia',
        categories: ['moradia', 'aluguel', 'condominio', 'agua', 'energia', 'internet', 'gas', 'telefone'],
    },
    {
        title: 'Alimentação',
        categories: ['mercado', 'alimentacao', 'lanche', 'restaurante', 'delivery'],
    },
    {
        title: 'Transporte',
        categories: ['transporte', 'combustivel', 'estacionamento', 'uber'],
    },
    {
        title: 'Saúde',
        categories: ['saude', 'farmacia', 'academia'],
    },
    {
        title: 'Educação',
        categories: ['educacao', 'cursos', 'livros'],
    },
    {
        title: 'Pessoal',
        categories: ['vestuario', 'beleza', 'pets'],
    },
    {
        title: 'Lazer',
        categories: ['lazer', 'viagem', 'cinema', 'streaming', 'presentes'],
    },
    {
        title: 'Financeiro',
        categories: ['assinaturas', 'cartao', 'impostos', 'taxas', 'manutencao'],
    },
    {
        title: 'Outros',
        categories: ['moveis', 'eletronicos', 'outros'],
    },
];

/**
 * Obtém o ícone de uma categoria
 */
export const getCategoryIcon = (category: string): string => {
    return CATEGORY_ICONS[category.toLowerCase()] || CATEGORY_ICONS.outros;
};

/**
 * Obtém o label de uma categoria
 */
export const getCategoryLabel = (categoryId: string): string => {
    const expense = EXPENSE_CATEGORIES.find(c => c.id === categoryId);
    if (expense) return expense.label;
    
    const income = INCOME_CATEGORIES.find(c => c.id === categoryId);
    if (income) return income.label;
    
    return categoryId.charAt(0).toUpperCase() + categoryId.slice(1);
};
