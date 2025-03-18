import React, { useState, useCallback, useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import AddPurchaseScreen from './src/screens/AddPurchaseScreen';
import SpendingScreen from './src/screens/SpendingScreen';
import PurchaseDetailsScreen from './src/screens/PurchaseDetailsScreen';
import { Purchase } from './src/store/storage';

// Prevent splash screen auto-hiding as early as possible
SplashScreen.preventAutoHideAsync().catch(console.warn);

export type RootStackParamList = {
  Home: undefined;
  AddPurchase: undefined;
  Spending: undefined;
  PurchaseDetails: { purchase: Purchase };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Simulate loading resources (replace with actual initialization if needed)
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn('Error during app preparation:', e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null; // Prevent rendering until ready
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="AddPurchase" component={AddPurchaseScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Spending" component={SpendingScreen} options={{ headerShown: false }} />
          <Stack.Screen name="PurchaseDetails" component={PurchaseDetailsScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}