/**
 * Calcula a distância de Levenshtein entre duas strings.
 * Quanto menor a distância, mais semelhantes as strings são.
 */
function levenshtein(a: string, b: string): number {
    const m = a.length;
    const n = b.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            dp[i][j] = Math.min(
                dp[i - 1][j] + 1,
                dp[i][j - 1] + 1,
                dp[i - 1][j - 1] + cost,
            );
        }
    }
    return dp[m][n];
}

/**
 * Verifica se uma palavra do query faz match fuzzy com alguma palavra do texto.
 * Tolera erros de digitação proporcionais ao tamanho da palavra.
 */
function fuzzyWordMatch(queryWord: string, text: string): boolean {
    if (text.includes(queryWord)) return true;

    const words = text.split(/\s+/);
    // Tolerância: 1 erro para palavras de 3-5 chars, 2 para 6+
    const maxDistance = queryWord.length <= 2 ? 0 : queryWord.length <= 5 ? 1 : 2;

    for (const word of words) {
        // Compara com substrings do tamanho similar para detectar erros no meio de palavras longas
        if (word.length >= queryWord.length) {
            // Verifica match parcial (substring fuzzy)
            for (let i = 0; i <= word.length - queryWord.length; i++) {
                const sub = word.substring(i, i + queryWord.length);
                if (levenshtein(queryWord, sub) <= maxDistance) return true;
            }
            // Também compara palavra inteira se tamanhos próximos
            if (Math.abs(word.length - queryWord.length) <= maxDistance) {
                if (levenshtein(queryWord, word) <= maxDistance) return true;
            }
        } else if (Math.abs(word.length - queryWord.length) <= maxDistance) {
            if (levenshtein(queryWord, word) <= maxDistance) return true;
        }
    }
    return false;
}

/**
 * Realiza busca fuzzy em uma lista de campos de texto.
 * Cada palavra do query precisa fazer match em pelo menos um campo.
 */
export function fuzzySearch(query: string, fields: string[]): boolean {
    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery) return true;

    const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 0);
    const normalizedFields = fields.map(f => f.toLowerCase());
    const joinedFields = normalizedFields.join(' ');

    // Cada palavra do query deve fazer match em algum campo
    return queryWords.every(word => fuzzyWordMatch(word, joinedFields));
}
