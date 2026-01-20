/**
 * Formata um valor numérico para moeda brasileira (BRL)
 */
export const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

/**
 * Formata um valor numérico para moeda com símbolo
 */
export const formatCurrencyWithSymbol = (value: number): string => {
    return `R$ ${formatCurrency(value)}`;
};

/**
 * Formata uma data ISO para formato brasileiro
 */
export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
};

/**
 * Formata uma data ISO para formato brasileiro com hora
 */
export const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
};

/**
 * Retorna o nome do mês em português
 */
export const getMonthName = (month: number): string => {
    const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril',
        'Maio', 'Junho', 'Julho', 'Agosto',
        'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[month] || '';
};

/**
 * Retorna o nome abreviado do mês em português
 */
export const getMonthShortName = (month: number): string => {
    const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
    return months[month] || '';
};

/**
 * Gera um ID único
 */
export const generateUniqueId = (): string => {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};
