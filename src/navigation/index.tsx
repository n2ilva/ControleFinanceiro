import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { useAuth } from '../contexts/AuthContext';

import HomeScreen from '../screens/HomeScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import EditTransactionScreen from '../screens/EditTransactionScreen';
import ChartsScreen from '../screens/ChartsScreen';
import QRScannerScreen from '../screens/QRScannerScreen';
import GroupScreen from '../screens/GroupScreen';
import CreditCardsScreen from '../screens/CreditCardsScreen';
import SalariesScreen from '../screens/SalariesScreen';
import AddSalaryScreen from '../screens/AddSalaryScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            screenOptions={({ navigation }) => ({
                tabBarStyle: {
                    backgroundColor: theme.colors.backgroundCard,
                    borderTopColor: theme.colors.border,
                    borderTopWidth: 1,
                    height: 60 + insets.bottom,
                    paddingBottom: 8 + insets.bottom,
                    paddingTop: 8,
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textMuted,
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
                    <Ionicons
                        name="people"
                        size={22}
                        color={theme.colors.text}
                        style={{ marginRight: theme.spacing.md }}
                        onPress={() => navigation.navigate('Group')}
                    />
                ),
            })}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    title: 'Transações',
                    tabBarLabel: 'Início',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="wallet" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="CreditCards"
                component={CreditCardsScreen}
                options={{
                    title: 'Cartões',
                    tabBarLabel: 'Cartões',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="card" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Charts"
                component={ChartsScreen}
                options={{
                    title: 'Gráficos',
                    tabBarLabel: 'Análises',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="stats-chart" size={size} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
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
                name="AddSalary"
                component={AddSalaryScreen}
                options={{
                    title: 'Novo Salário',
                    presentation: 'modal',
                }}
            />
            <Stack.Screen
                name="Salaries"
                component={SalariesScreen}
                options={{
                    title: 'Salários',
                    presentation: 'modal',
                }}
            />
            <Stack.Screen
                name="QRScanner"
                component={QRScannerScreen}
                options={{
                    headerShown: false,
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
