import AsyncStorage from '@react-native-async-storage/async-storage';

const CUSTOM_EXPENSE_KEY = '@controlefinanceiro:custom_expense_categories';
const CUSTOM_INCOME_KEY = '@controlefinanceiro:custom_income_categories';

export interface CustomCategory {
    id: string;
    label: string;
    icon: string;
    group?: string;
}

const AVAILABLE_ICONS = [
    'bookmark', 'star', 'heart', 'flag', 'attach', 'bulb',
    'brush', 'build', 'cafe', 'calendar', 'camera', 'chatbubble',
    'clipboard', 'cloud', 'code', 'cog', 'color-palette', 'compass',
    'cut', 'desktop', 'diamond', 'earth', 'egg', 'eye',
    'fitness', 'flower', 'football', 'hammer', 'hand-left', 'headset',
    'home', 'ice-cream', 'key', 'leaf', 'link', 'location',
    'lock-closed', 'mail', 'map', 'megaphone', 'mic', 'moon',
    'musical-notes', 'newspaper', 'notifications', 'nutrition', 'paper-plane', 'pencil',
    'people', 'person', 'phone-portrait', 'pizza', 'planet', 'print',
    'pulse', 'rainy', 'rocket', 'rose', 'sad', 'save',
    'search', 'share', 'shield', 'skull', 'snow', 'storefront',
    'sunny', 'thumbs-up', 'ticket', 'time', 'today', 'trail-sign',
    'trophy', 'umbrella', 'walk', 'wallet', 'watch', 'wine',
];

export { AVAILABLE_ICONS };

export async function getCustomCategories(type: 'expense' | 'income'): Promise<CustomCategory[]> {
    const key = type === 'expense' ? CUSTOM_EXPENSE_KEY : CUSTOM_INCOME_KEY;
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

export async function addCustomCategory(type: 'expense' | 'income', category: CustomCategory): Promise<void> {
    const existing = await getCustomCategories(type);
    existing.push(category);
    const key = type === 'expense' ? CUSTOM_EXPENSE_KEY : CUSTOM_INCOME_KEY;
    await AsyncStorage.setItem(key, JSON.stringify(existing));
}

export async function removeCustomCategory(type: 'expense' | 'income', categoryId: string): Promise<void> {
    const existing = await getCustomCategories(type);
    const filtered = existing.filter(c => c.id !== categoryId);
    const key = type === 'expense' ? CUSTOM_EXPENSE_KEY : CUSTOM_INCOME_KEY;
    await AsyncStorage.setItem(key, JSON.stringify(filtered));
}
