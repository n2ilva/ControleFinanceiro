import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Platform, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { useAuth } from '../contexts/AuthContext';
import { useResponsive } from '../hooks/useResponsive';

import HomeScreen from '../screens/HomeScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import EditTransactionScreen from '../screens/EditTransactionScreen';
import ChartsScreen from '../screens/ChartsScreen';

import GroupScreen from '../screens/GroupScreen';
import CreditCardsScreen from '../screens/CreditCardsScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import CardDetailsScreen from '../screens/CardDetailsScreen';
import CardMonthDetailsScreen from '../screens/CardMonthDetailsScreen';
import BudgetsScreen from '../screens/BudgetsScreen';
import GoalsScreen from '../screens/GoalsScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const BodyStack = createNativeStackNavigator();

// Refs para o layout desktop – preenchidos por DesktopTabContent
const _desktopBodyNavRef: { current: any } = { current: null };
let _setDesktopTabProps: ((p: BottomTabBarProps) => void) | null = null;

// ─── Sidebar e Tab config ────────────────────────────────────────────────────

const NAV_ITEMS: { name: string; label: string; icon: keyof typeof Ionicons.glyphMap; iconOutline: keyof typeof Ionicons.glyphMap }[] = [
    { name: 'Home', label: 'Início', icon: 'wallet', iconOutline: 'wallet-outline' },
    { name: 'CreditCards', label: 'Cartões', icon: 'card', iconOutline: 'card-outline' },
    { name: 'Budgets', label: 'Orçamentos', icon: 'pie-chart', iconOutline: 'pie-chart-outline' },
    { name: 'Goals', label: 'Metas', icon: 'flag', iconOutline: 'flag-outline' },
    { name: 'Charts', label: 'Análises', icon: 'stats-chart', iconOutline: 'stats-chart-outline' },
];

const SIDEBAR_ACTIONS: { name: string; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { name: 'Group', label: 'Configurações', icon: 'settings' },
];

// ─── Mobile Bottom Tab Bar ───────────────────────────────────────────────────

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
    const insets = useSafeAreaInsets();
    const bottomInset = Platform.OS === 'web' ? 0 : insets.bottom;

    return (
        <View style={[tabBarStyles.container, { paddingBottom: 8 + bottomInset }]}>
            {state.routes.map((route, index) => {
                const isFocused = state.index === index;
                const item = NAV_ITEMS.find(i => i.name === route.name);
                if (!item) return null;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });
                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name);
                    }
                };

                return (
                    <TouchableOpacity
                        key={route.key}
                        accessibilityRole="button"
                        accessibilityState={isFocused ? { selected: true } : {}}
                        accessibilityLabel={item.label}
                        onPress={onPress}
                        style={tabBarStyles.tab}
                    >
                        <Ionicons
                            name={isFocused ? item.icon : item.iconOutline}
                            size={24}
                            color={isFocused ? theme.colors.primary : theme.colors.textMuted}
                        />
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

// ─── Desktop Sidebar ─────────────────────────────────────────────────────────

function DesktopSidebar({ state, navigation, onAddExpense, onAddIncome, onShortcut }: BottomTabBarProps & {
    onAddExpense: () => void;
    onAddIncome: () => void;
    onShortcut: (name: string) => void;
}) {
    const { signOut, user } = useAuth();

    const userInitial = user?.displayName
        ? user.displayName.charAt(0).toUpperCase()
        : user?.email?.charAt(0).toUpperCase() || '?';
    const userName = user?.displayName || user?.email?.split('@')[0] || 'Usuário';

    return (
        <View style={sidebarStyles.container}>
            {/* Logo / branding */}
            <View style={sidebarStyles.brandSection}>
                <View style={sidebarStyles.logoContainer}>
                    <Ionicons name="wallet" size={28} color={theme.colors.primary} />
                </View>
                <Text style={sidebarStyles.brandName}>Finanças</Text>
                <Text style={sidebarStyles.brandTagline}>Controle Financeiro</Text>
            </View>

            {/* Separador */}
            <View style={sidebarStyles.divider} />

            {/* Menu principal */}
            <View style={sidebarStyles.navSection}>
                <Text style={sidebarStyles.sectionLabel}>MENU</Text>
                {state.routes.map((route, index) => {
                    const isFocused = state.index === index;
                    const item = NAV_ITEMS.find(i => i.name === route.name);
                    if (!item) return null;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });
                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    return (
                        <TouchableOpacity
                            key={route.key}
                            onPress={onPress}
                            style={[sidebarStyles.navItem, isFocused && sidebarStyles.navItemActive]}
                            activeOpacity={0.7}
                        >
                            <View style={[sidebarStyles.navIconContainer, isFocused && sidebarStyles.navIconContainerActive]}>
                                <Ionicons
                                    name={isFocused ? item.icon : item.iconOutline}
                                    size={20}
                                    color={isFocused ? theme.colors.primary : theme.colors.textMuted}
                                />
                            </View>
                            <Text style={[sidebarStyles.navLabel, isFocused && sidebarStyles.navLabelActive]}>
                                {item.label}
                            </Text>
                            {isFocused && <View style={sidebarStyles.activeIndicator} />}
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Ações – Nova Despesa / Nova Receita */}
            <View style={sidebarStyles.divider} />
            <View style={sidebarStyles.navSection}>
                <Text style={sidebarStyles.sectionLabel}>AÇÕES</Text>
                <TouchableOpacity
                    onPress={onAddExpense}
                    style={sidebarStyles.navItem}
                    activeOpacity={0.7}
                >
                    <View style={[sidebarStyles.navIconContainer, { backgroundColor: theme.colors.danger + '20' }]}>
                        <Ionicons name="trending-down" size={20} color={theme.colors.danger} />
                    </View>
                    <Text style={sidebarStyles.navLabel}>Nova Despesa</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={onAddIncome}
                    style={sidebarStyles.navItem}
                    activeOpacity={0.7}
                >
                    <View style={[sidebarStyles.navIconContainer, { backgroundColor: theme.colors.success + '20' }]}>
                        <Ionicons name="trending-up" size={20} color={theme.colors.success} />
                    </View>
                    <Text style={sidebarStyles.navLabel}>Nova Receita</Text>
                </TouchableOpacity>
            </View>

            {/* Atalhos extras */}
            <View style={sidebarStyles.divider} />
            <View style={sidebarStyles.navSection}>
                <Text style={sidebarStyles.sectionLabel}>ATALHOS</Text>
                {SIDEBAR_ACTIONS.map(action => (
                    <TouchableOpacity
                        key={action.name}
                        onPress={() => onShortcut(action.name)}
                        style={sidebarStyles.navItem}
                        activeOpacity={0.7}
                    >
                        <View style={sidebarStyles.navIconContainer}>
                            <Ionicons name={action.icon} size={20} color={theme.colors.textMuted} />
                        </View>
                        <Text style={sidebarStyles.navLabel}>{action.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Spacer */}
            <View style={{ flex: 1 }} />

            {/* User section */}
            <View style={sidebarStyles.divider} />
            <View style={sidebarStyles.userSection}>
                <View style={sidebarStyles.userAvatar}>
                    <Text style={sidebarStyles.userAvatarText}>{userInitial}</Text>
                </View>
                <View style={sidebarStyles.userInfo}>
                    <Text style={sidebarStyles.userName} numberOfLines={1}>{userName}</Text>
                    <Text style={sidebarStyles.userEmail} numberOfLines={1}>{user?.email || ''}</Text>
                </View>
                <TouchableOpacity onPress={signOut} style={sidebarStyles.logoutButton}>
                    <Ionicons name="log-out-outline" size={20} color={theme.colors.danger} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

// ─── TabBarCapture – extrai state/navigation do Tab.Navigator sem renderizar UI ─

function TabBarCapture({ onCapture, ...props }: BottomTabBarProps & { onCapture: (p: BottomTabBarProps) => void }) {
    const lastIndexRef = React.useRef(-1);
    const onCaptureRef = React.useRef(onCapture);
    onCaptureRef.current = onCapture;

    React.useEffect(() => {
        // Captura apenas quando o índice muda (evita loop infinito)
        if (lastIndexRef.current !== props.state.index) {
            lastIndexRef.current = props.state.index;
            onCaptureRef.current(props as BottomTabBarProps);
        }
    });

    return null;
}

// ─── DesktopTabContent – Tab.Navigator usado dentro do BodyStack no desktop ──

function DesktopTabContent({ navigation }: any) {
    // Expõe a navegação do BodyStack para o sidebar e para ações de adicionar
    React.useEffect(() => {
        _desktopBodyNavRef.current = navigation;
        return () => { _desktopBodyNavRef.current = null; };
    }, [navigation]);

    return (
        <Tab.Navigator
            tabBar={(props) => <TabBarCapture {...props} onCapture={(p) => _setDesktopTabProps?.(p)} />}
            screenOptions={{
                headerStyle: {
                    backgroundColor: theme.colors.backgroundCard,
                    elevation: 0,
                    shadowOpacity: 0,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.border,
                },
                headerTintColor: theme.colors.text,
                headerTitleStyle: {
                    fontWeight: theme.fontWeight.bold,
                    fontSize: theme.fontSize.xl,
                },
            }}
        >
            <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false, tabBarLabel: 'Início' }} />
            <Tab.Screen name="CreditCards" component={CreditCardsScreen} options={{ headerShown: false, tabBarLabel: 'Cartões' }} />
            <Tab.Screen name="Budgets" component={BudgetsScreen} options={{ headerShown: false, tabBarLabel: 'Orçamentos' }} />
            <Tab.Screen name="Goals" component={GoalsScreen} options={{ headerShown: false, tabBarLabel: 'Metas' }} />
            <Tab.Screen name="Charts" component={ChartsScreen} options={{ headerShown: false, tabBarLabel: 'Análises' }} />
        </Tab.Navigator>
    );
}

// ─── HomeTabs ────────────────────────────────────────────────────────────────

function HomeTabs() {
    const { isDesktop } = useResponsive();
    const [tabProps, setTabProps] = React.useState<BottomTabBarProps | null>(null);

    // Registra o setter para DesktopTabContent usar via _setDesktopTabProps
    _setDesktopTabProps = setTabProps;

    if (!isDesktop) {
        // Mobile/tablet: Tab.Navigator com barra inferior
        return (
            <Tab.Navigator
                tabBar={(props) => <CustomTabBar {...props} />}
                screenOptions={({ navigation }) => ({
                    headerStyle: {
                        backgroundColor: theme.colors.backgroundCard,
                        elevation: 0,
                        shadowOpacity: 0,
                        borderBottomWidth: 1,
                        borderBottomColor: theme.colors.border,
                    },
                    headerTintColor: theme.colors.text,
                    headerTitleStyle: {
                        fontWeight: theme.fontWeight.bold,
                        fontSize: theme.fontSize.xl,
                    },
                    headerRight: () => (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <Ionicons
                                name="settings-outline"
                                size={22}
                                color={theme.colors.text}
                                onPress={() => navigation.navigate('Settings')}
                            />
                            <Ionicons
                                name="people"
                                size={22}
                                color={theme.colors.text}
                                style={{ marginRight: theme.spacing.md }}
                                onPress={() => navigation.navigate('Group')}
                            />
                        </View>
                    ),
                })}
            >
                <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false, tabBarLabel: 'Início' }} />
                <Tab.Screen name="CreditCards" component={CreditCardsScreen} options={{ headerShown: false, tabBarLabel: 'Cartões' }} />
                <Tab.Screen name="Budgets" component={BudgetsScreen} options={{ headerShown: false, tabBarLabel: 'Orçamentos' }} />
                <Tab.Screen name="Goals" component={GoalsScreen} options={{ headerShown: false, tabBarLabel: 'Metas' }} />
                <Tab.Screen name="Charts" component={ChartsScreen} options={{ headerShown: false, tabBarLabel: 'Análises' }} />
            </Tab.Navigator>
        );
    }

    // Desktop: Sidebar + BodyStack (navegação de Add Expense/Income fica dentro do body)
    return (
        <View style={{ flex: 1, flexDirection: 'row' }}>

            {/* Sidebar */}
            {tabProps && (
                <DesktopSidebar
                    {...tabProps}
                    onAddExpense={() => _desktopBodyNavRef.current?.navigate('AddExpense')}
                    onAddIncome={() => _desktopBodyNavRef.current?.navigate('AddIncome')}
                    onShortcut={(name) => _desktopBodyNavRef.current?.navigate(name)}
                />
            )}

            {/* Body – contém o Tab.Navigator e as telas de adicionar */}
            <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
                <View style={{ flex: 1, maxWidth: 960, width: '100%', alignSelf: 'center' }}>
                <BodyStack.Navigator
                    screenOptions={{
                        headerStyle: {
                            backgroundColor: theme.colors.backgroundCard,
                        },
                        headerTintColor: theme.colors.text,
                        headerTitleStyle: {
                            fontWeight: theme.fontWeight.bold,
                            fontSize: theme.fontSize.xl,
                        },
                        headerShadowVisible: false,
                        contentStyle: {
                            backgroundColor: theme.colors.background,
                        },
                    }}
                >
                    <BodyStack.Screen
                        name="TabContent"
                        component={DesktopTabContent}
                        options={{ headerShown: false }}
                    />
                    <BodyStack.Screen
                        name="AddExpense"
                        component={AddTransactionScreen}
                        initialParams={{ initialType: 'expense', lockType: true }}
                        options={{ title: 'Nova Despesa' }}
                    />
                    <BodyStack.Screen
                        name="AddIncome"
                        component={AddTransactionScreen}
                        initialParams={{ initialType: 'income', lockType: true }}
                        options={{ title: 'Nova Receita' }}
                    />
                    <BodyStack.Screen
                        name="EditTransaction"
                        component={EditTransactionScreen}
                        options={{ title: 'Editar Transação' }}
                    />
                    <BodyStack.Screen
                        name="Group"
                        component={GroupScreen}
                        options={{ title: 'Grupo', headerShown: false }}
                    />
                </BodyStack.Navigator>
                </View>
            </View>

        </View>
    );
}

function AuthStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: {
                    backgroundColor: theme.colors.background,
                },
            }}
        >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
    );
}

function AppStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: theme.colors.backgroundCard,
                },
                headerTintColor: theme.colors.text,
                headerTitleStyle: {
                    fontWeight: theme.fontWeight.bold,
                    fontSize: theme.fontSize.xl,
                },
                headerShadowVisible: false,
                contentStyle: {
                    backgroundColor: theme.colors.background,
                },
            }}
        >
            <Stack.Screen
                name="MainTabs"
                component={HomeTabs}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="AddExpense"
                component={AddTransactionScreen}
                initialParams={{ initialType: 'expense', lockType: true }}
                options={{
                    title: 'Nova Despesa',
                    presentation: 'modal',
                }}
            />
            <Stack.Screen
                name="AddIncome"
                component={AddTransactionScreen}
                initialParams={{ initialType: 'income', lockType: true }}
                options={{
                    title: 'Nova Receita',
                    presentation: 'modal',
                }}
            />
            <Stack.Screen
                name="EditTransaction"
                component={EditTransactionScreen}
                options={{
                    title: 'Editar Transação',
                    presentation: 'modal',
                }}
            />
            <Stack.Screen
                name="Group"
                component={GroupScreen}
                options={{
                    title: 'Grupo',
                }}
            />
            <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    title: 'Configurações',
                }}
            />
            <Stack.Screen
                name="CardDetails"
                component={CardDetailsScreen}
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="CardMonthDetails"
                component={CardMonthDetailsScreen}
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="AddTransaction"
                component={AddTransactionScreen}
                options={{
                    title: 'Nova Transação',
                    presentation: 'modal',
                }}
            />
        </Stack.Navigator>
    );
}

export default function Navigation() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            {user ? <AppStack /> : <AuthStack />}
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
    },
});

const tabBarStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: theme.colors.backgroundCard,
        borderTopColor: theme.colors.border,
        borderTopWidth: 1,
        paddingTop: 8,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
    },
});

const sidebarStyles = StyleSheet.create({
    container: {
        width: 240,
        backgroundColor: theme.colors.backgroundCard,
        borderRightWidth: 1,
        borderRightColor: theme.colors.border,
        paddingVertical: 20,
    },
    brandSection: {
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 8,
    },
    logoContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: theme.colors.primary + '15',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    brandName: {
        fontSize: theme.fontSize.xl,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text,
        letterSpacing: 0.5,
    },
    brandTagline: {
        fontSize: theme.fontSize.xs,
        color: theme.colors.textMuted,
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginHorizontal: 20,
        marginVertical: 12,
    },
    navSection: {
        paddingHorizontal: 12,
    },
    sectionLabel: {
        fontSize: 10,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.textMuted,
        letterSpacing: 1.2,
        marginBottom: 8,
        marginLeft: 12,
    },
    navItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: theme.borderRadius.md,
        marginBottom: 2,
        position: 'relative',
    },
    navItemActive: {
        backgroundColor: theme.colors.primary + '12',
    },
    navIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.surface,
        marginRight: 12,
    },
    navIconContainerActive: {
        backgroundColor: theme.colors.primary + '20',
    },
    navLabel: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textSecondary,
        fontWeight: theme.fontWeight.medium,
        flex: 1,
    },
    navLabelActive: {
        color: theme.colors.primary,
        fontWeight: theme.fontWeight.bold,
    },
    activeIndicator: {
        width: 4,
        height: 20,
        borderRadius: 2,
        backgroundColor: theme.colors.primary,
        position: 'absolute',
        right: 0,
    },
    userSection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    userAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    userAvatarText: {
        fontSize: theme.fontSize.sm,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.white,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: theme.fontSize.sm,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.text,
    },
    userEmail: {
        fontSize: 11,
        color: theme.colors.textMuted,
        marginTop: 1,
    },
    logoutButton: {
        padding: 8,
        borderRadius: theme.borderRadius.sm,
    },
});
