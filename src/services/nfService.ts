export interface NFData {
    amount?: number;
    date?: string; // ISO ou formatada
    items?: Array<{ description: string; amount: number }>;
    url: string;
    store?: string;
}

export const NfService = {
    /**
     * Consulta dados da Nota Fiscal fazendo scraping direto da URL do QR Code.
     * Tenta extrair Valor Total, Data e Nome do Estabelecimento do HTML retornado.
     */
    fetchNfData: async (url: string): Promise<NFData> => {
        console.log('Iniciando scraping direto da URL:', url);

        try {
            const response = await fetch(url);
            const html = await response.text();
            
            // --- ESTRATÉGIAS DE EXTRAÇÃO (REGEX) ---
            
            // 1. Valor Total
            // Tenta flexibilidade para 'Vl. Total', 'Valor Total', 'Total R$', etc.
            // Ex SEFAZ GO: <span class="totalNumb">13,64</span> ou texto puro perto de 'Total'
            let amount = 0;
            const totalRegexes = [
                /class="totalNumb">([\d,.]+)/, // Padrão comum em algumas SEFAZ
                /Vl\.\s*Total.*?([\d,.]+)/is,
                /Total\s*R\$\s*([\d,.]+)/is,
                /Valor\s*Total.*?([\d,.]+)/is
            ];

            for (const regex of totalRegexes) {
                const match = html.match(regex);
                if (match && match[1]) {
                    // Remove pontos de milhar e troca vírgula decimal por ponto
                    const cleanValue = match[1].replace(/\./g, '').replace(',', '.');
                    amount = parseFloat(cleanValue);
                    if (!isNaN(amount)) break;
                }
            }

            // 2. Nome do Estabelecimento
            // Geralmente no topo em div class='txtTopo' ou 'emitente'
            let store: string | undefined;
            const storeRegexes = [
                /class="txtTopo"[^>]*>([^<]+)</i, 
                /<td[^>]*class="text"[^>]*>([^<]+)</i,
                /id="u20"[^>]*>([^<]+)</i // Exemplo genérico
            ];

            for (const regex of storeRegexes) {
                const match = html.match(regex);
                if (match && match[1]) {
                    store = match[1].trim();
                    break;
                }
            }

            // 3. Data de Emissão
            // Procura formato dd/mm/aaaa
            let date: string | undefined;
            const dateMatch = html.match(/(\d{2}\/\d{2}\/\d{4})/);
            if (dateMatch) {
                // Tenta converter para ISO
                const parts = dateMatch[1].split('/');
                if (parts.length === 3) {
                    const dt = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                    date = dt.toISOString();
                }
            }

            console.log('Scraping Resultado:', { amount, store, date });

            return {
                url,
                amount,
                store,
                date
            };

        } catch (error) {
            console.error('Erro ao fazer scraping da NF:', error);
            // Retorna apenas URL em caso de erro, permitindo edição manual
            return { url };
        }
    }
};
