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
    seguroResidencial: 'shield-checkmark',

    // Alimentação
    mercado: 'cart',
    alimentacao: 'restaurant',
    lanche: 'fast-food',
    restaurante: 'restaurant-outline',
    delivery: 'bicycle',
    padaria: 'cafe',
    hortifruti: 'leaf',

    // Transporte
    transporte: 'car',
    combustivel: 'speedometer',
    estacionamento: 'car-sport',
    uber: 'car-outline',
    onibus: 'bus',
    metro: 'train',
    manutencaoVeiculo: 'build',
    seguroVeiculo: 'shield',
    pedagio: 'git-merge',

    // Saúde e Bem-estar
    saude: 'medical',
    farmacia: 'medkit',
    academia: 'barbell',
    consultaMedica: 'stethoscope',
    dentista: 'medkit-outline',
    planoSaude: 'heart-circle',
    terapia: 'happy',
    exames: 'document',

    // Educação
    educacao: 'school',
    cursos: 'book',
    livros: 'library',
    material: 'pencil',
    mensalidade: 'newspaper',

    // Pessoal
    vestuario: 'shirt',
    beleza: 'sparkles',
    pets: 'paw',
    higiene: 'water-outline',
    barbearia: 'cut',

    // Lazer
    lazer: 'game-controller',
    viagem: 'airplane',
    cinema: 'film',
    streaming: 'tv',
    jogos: 'game-controller-outline',
    shows: 'musical-notes',
    esportes: 'football',
    bares: 'beer',
    festas: 'balloon',

    // Presentes e Doações
    presentes: 'gift',
    doacoes: 'heart',

    // Financeiro
    assinaturas: 'card',
    cartao: 'card-outline',
    impostos: 'document-text',
    taxas: 'receipt',
    juros: 'trending-down',
    seguro: 'shield-outline',
    multas: 'warning',
    emprestimo: 'cash-outline',
    previdencia: 'lock-closed',

    // Casa
    manutencao: 'construct',
    moveis: 'bed',
    eletronicos: 'laptop',
    decoracao: 'color-palette',
    eletrodomesticos: 'tv-outline',

    // Receitas
    salario: 'cash',
    decimoTerceiro: 'cash-outline',
    ferias: 'sunny',
    deposito: 'card',
    freelance: 'briefcase',
    bonus: 'sparkles',
    rendimentos: 'trending-up',
    investimentos: 'stats-chart',
    aluguelRecebido: 'home',
    reembolso: 'refresh',
    vendas: 'pricetag',
    extra: 'gift',
    dividendos: 'pie-chart',
    criptomoedas: 'logo-bitcoin',
    consultoria: 'people',
    comissoes: 'podium',
    horasExtras: 'time',
    participacaoLucros: 'trophy',
    heranca: 'ribbon',
    premio: 'star',

    // Outros
    outros: 'ellipsis-horizontal',
};

/**
 * Categorias de despesas
 */
export const EXPENSE_CATEGORIES = [
    // Moradia
    { id: 'moradia', label: 'Moradia', icon: 'home', group: 'Moradia' },
    { id: 'aluguel', label: 'Aluguel', icon: 'home-outline', group: 'Moradia' },
    { id: 'condominio', label: 'Condomínio', icon: 'business', group: 'Moradia' },
    { id: 'agua', label: 'Água', icon: 'water', group: 'Moradia' },
    { id: 'energia', label: 'Energia', icon: 'flash', group: 'Moradia' },
    { id: 'gas', label: 'Gás', icon: 'flame', group: 'Moradia' },
    { id: 'internet', label: 'Internet', icon: 'wifi', group: 'Moradia' },
    { id: 'telefone', label: 'Telefone', icon: 'call', group: 'Moradia' },
    { id: 'seguroResidencial', label: 'Seguro Residencial', icon: 'shield-checkmark', group: 'Moradia' },
    // Alimentação
    { id: 'mercado', label: 'Mercado', icon: 'cart', group: 'Alimentação' },
    { id: 'alimentacao', label: 'Alimentação', icon: 'restaurant', group: 'Alimentação' },
    { id: 'lanche', label: 'Lanche', icon: 'fast-food', group: 'Alimentação' },
    { id: 'restaurante', label: 'Restaurante', icon: 'restaurant-outline', group: 'Alimentação' },
    { id: 'delivery', label: 'Delivery', icon: 'bicycle', group: 'Alimentação' },
    { id: 'padaria', label: 'Padaria', icon: 'cafe', group: 'Alimentação' },
    { id: 'hortifruti', label: 'Hortifruti', icon: 'leaf', group: 'Alimentação' },
    // Transporte
    { id: 'transporte', label: 'Transporte', icon: 'car', group: 'Transporte' },
    { id: 'combustivel', label: 'Combustível', icon: 'speedometer', group: 'Transporte' },
    { id: 'estacionamento', label: 'Estacionamento', icon: 'car-sport', group: 'Transporte' },
    { id: 'uber', label: 'Uber/99', icon: 'car-outline', group: 'Transporte' },
    { id: 'onibus', label: 'Ônibus/Metrô', icon: 'bus', group: 'Transporte' },
    { id: 'manutencaoVeiculo', label: 'Manutenção Veículo', icon: 'build', group: 'Transporte' },
    { id: 'seguroVeiculo', label: 'Seguro do Carro', icon: 'shield', group: 'Transporte' },
    { id: 'pedagio', label: 'Pedágio', icon: 'git-merge', group: 'Transporte' },
    // Saúde
    { id: 'saude', label: 'Saúde', icon: 'medical', group: 'Saúde' },
    { id: 'farmacia', label: 'Farmácia', icon: 'medkit', group: 'Saúde' },
    { id: 'academia', label: 'Academia', icon: 'barbell', group: 'Saúde' },
    { id: 'consultaMedica', label: 'Consulta Médica', icon: 'stethoscope', group: 'Saúde' },
    { id: 'dentista', label: 'Dentista', icon: 'medkit-outline', group: 'Saúde' },
    { id: 'planoSaude', label: 'Plano de Saúde', icon: 'heart-circle', group: 'Saúde' },
    { id: 'terapia', label: 'Terapia', icon: 'happy', group: 'Saúde' },
    { id: 'exames', label: 'Exames', icon: 'document', group: 'Saúde' },
    // Educação
    { id: 'educacao', label: 'Educação', icon: 'school', group: 'Educação' },
    { id: 'cursos', label: 'Cursos', icon: 'book', group: 'Educação' },
    { id: 'livros', label: 'Livros', icon: 'library', group: 'Educação' },
    { id: 'material', label: 'Material Escolar', icon: 'pencil', group: 'Educação' },
    { id: 'mensalidade', label: 'Mensalidade', icon: 'newspaper', group: 'Educação' },
    // Pessoal
    { id: 'vestuario', label: 'Vestuário', icon: 'shirt', group: 'Pessoal' },
    { id: 'beleza', label: 'Beleza', icon: 'sparkles', group: 'Pessoal' },
    { id: 'pets', label: 'Pets', icon: 'paw', group: 'Pessoal' },
    { id: 'higiene', label: 'Higiene', icon: 'water-outline', group: 'Pessoal' },
    { id: 'barbearia', label: 'Barbearia', icon: 'cut', group: 'Pessoal' },
    // Lazer
    { id: 'lazer', label: 'Lazer', icon: 'game-controller', group: 'Lazer' },
    { id: 'viagem', label: 'Viagem', icon: 'airplane', group: 'Lazer' },
    { id: 'cinema', label: 'Cinema', icon: 'film', group: 'Lazer' },
    { id: 'streaming', label: 'Streaming', icon: 'tv', group: 'Lazer' },
    { id: 'jogos', label: 'Jogos', icon: 'game-controller-outline', group: 'Lazer' },
    { id: 'shows', label: 'Shows/Eventos', icon: 'musical-notes', group: 'Lazer' },
    { id: 'esportes', label: 'Esportes', icon: 'football', group: 'Lazer' },
    { id: 'bares', label: 'Bares/Baladas', icon: 'beer', group: 'Lazer' },
    { id: 'presentes', label: 'Presentes', icon: 'gift', group: 'Lazer' },
    { id: 'doacoes', label: 'Doações', icon: 'heart', group: 'Lazer' },
    // Financeiro
    { id: 'assinaturas', label: 'Assinaturas', icon: 'card', group: 'Financeiro' },
    { id: 'cartao', label: 'Cartão de Crédito', icon: 'card-outline', group: 'Financeiro' },
    { id: 'impostos', label: 'Impostos', icon: 'document-text', group: 'Financeiro' },
    { id: 'taxas', label: 'Taxas/Tarifas', icon: 'receipt', group: 'Financeiro' },
    { id: 'juros', label: 'Juros', icon: 'trending-down', group: 'Financeiro' },
    { id: 'seguro', label: 'Seguro', icon: 'shield-outline', group: 'Financeiro' },
    { id: 'multas', label: 'Multas', icon: 'warning', group: 'Financeiro' },
    { id: 'emprestimo', label: 'Empréstimo', icon: 'cash-outline', group: 'Financeiro' },
    { id: 'previdencia', label: 'Previdência', icon: 'lock-closed', group: 'Financeiro' },
    // Casa
    { id: 'manutencao', label: 'Manutenção', icon: 'construct', group: 'Casa' },
    { id: 'moveis', label: 'Móveis', icon: 'bed', group: 'Casa' },
    { id: 'eletronicos', label: 'Eletrônicos', icon: 'laptop', group: 'Casa' },
    { id: 'decoracao', label: 'Decoração', icon: 'color-palette', group: 'Casa' },
    { id: 'eletrodomesticos', label: 'Eletrodomésticos', icon: 'tv-outline', group: 'Casa' },
    // Outros
    { id: 'outros', label: 'Outros', icon: 'ellipsis-horizontal', group: 'Outros' },
];

/**
 * Categorias de receitas
 */
export const INCOME_CATEGORIES = [
    // Principais
    { id: 'salario', label: 'Salário', icon: 'cash', group: 'Principais' },
    { id: 'decimoTerceiro', label: '13º Salário', icon: 'cash-outline', group: 'Principais' },
    { id: 'ferias', label: 'Férias', icon: 'sunny', group: 'Principais' },
    { id: 'bonus', label: 'Bônus', icon: 'sparkles', group: 'Principais' },
    { id: 'participacaoLucros', label: 'Part. nos Lucros', icon: 'trophy', group: 'Principais' },
    // Trabalho Extra
    { id: 'freelance', label: 'Freelance', icon: 'briefcase', group: 'Trabalho Extra' },
    { id: 'consultoria', label: 'Consultoria', icon: 'people', group: 'Trabalho Extra' },
    { id: 'comissoes', label: 'Comissões', icon: 'podium', group: 'Trabalho Extra' },
    { id: 'horasExtras', label: 'Horas Extras', icon: 'time', group: 'Trabalho Extra' },
    // Investimentos
    { id: 'rendimentos', label: 'Rendimentos', icon: 'trending-up', group: 'Investimentos' },
    { id: 'investimentos', label: 'Investimentos', icon: 'stats-chart', group: 'Investimentos' },
    { id: 'dividendos', label: 'Dividendos', icon: 'pie-chart', group: 'Investimentos' },
    { id: 'criptomoedas', label: 'Criptomoedas', icon: 'logo-bitcoin', group: 'Investimentos' },
    // Outros
    { id: 'aluguelRecebido', label: 'Aluguel Recebido', icon: 'home', group: 'Outros' },
    { id: 'vendas', label: 'Vendas', icon: 'pricetag', group: 'Outros' },
    { id: 'reembolso', label: 'Reembolso', icon: 'refresh', group: 'Outros' },
    { id: 'deposito', label: 'Depósito', icon: 'card', group: 'Outros' },
    { id: 'heranca', label: 'Herança', icon: 'ribbon', group: 'Outros' },
    { id: 'premio', label: 'Prêmio', icon: 'star', group: 'Outros' },
    { id: 'extra', label: 'Extra', icon: 'gift', group: 'Outros' },
    { id: 'outros', label: 'Outros', icon: 'ellipsis-horizontal', group: 'Outros' },
];

/**
 * Grupos de categorias de despesas (para exibição organizada)
 */
export const EXPENSE_CATEGORY_GROUPS = [
    {
        title: 'Moradia',
        categories: ['moradia', 'aluguel', 'condominio', 'agua', 'energia', 'gas', 'internet', 'telefone', 'seguroResidencial'],
    },
    {
        title: 'Alimentação',
        categories: ['mercado', 'alimentacao', 'lanche', 'restaurante', 'delivery', 'padaria', 'hortifruti'],
    },
    {
        title: 'Transporte',
        categories: ['transporte', 'combustivel', 'estacionamento', 'uber', 'onibus', 'manutencaoVeiculo', 'seguroVeiculo', 'pedagio'],
    },
    {
        title: 'Saúde',
        categories: ['saude', 'farmacia', 'academia', 'consultaMedica', 'dentista', 'planoSaude', 'terapia', 'exames'],
    },
    {
        title: 'Educação',
        categories: ['educacao', 'cursos', 'livros', 'material', 'mensalidade'],
    },
    {
        title: 'Pessoal',
        categories: ['vestuario', 'beleza', 'pets', 'higiene', 'barbearia'],
    },
    {
        title: 'Lazer',
        categories: ['lazer', 'viagem', 'cinema', 'streaming', 'jogos', 'shows', 'esportes', 'bares', 'presentes', 'doacoes'],
    },
    {
        title: 'Financeiro',
        categories: ['assinaturas', 'cartao', 'impostos', 'taxas', 'juros', 'seguro', 'multas', 'emprestimo', 'previdencia'],
    },
    {
        title: 'Casa',
        categories: ['manutencao', 'moveis', 'eletronicos', 'decoracao', 'eletrodomesticos'],
    },
    {
        title: 'Outros',
        categories: ['outros'],
    },
];

/**
 * Grupos de categorias de receitas (para exibição organizada)
 */
export const INCOME_CATEGORY_GROUPS = [
    {
        title: 'Principais',
        categories: ['salario', 'decimoTerceiro', 'ferias', 'bonus', 'participacaoLucros'],
    },
    {
        title: 'Trabalho Extra',
        categories: ['freelance', 'consultoria', 'comissoes', 'horasExtras'],
    },
    {
        title: 'Investimentos',
        categories: ['rendimentos', 'investimentos', 'dividendos', 'criptomoedas'],
    },
    {
        title: 'Outros',
        categories: ['aluguelRecebido', 'vendas', 'reembolso', 'deposito', 'heranca', 'premio', 'extra', 'outros'],
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
