import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import AddPurchaseScreen from './src/screens/AddPurchaseScreen';
import SpendingScreen from './src/screens/SpendingScreen';
import PurchaseDetailsScreen from './src/screens/PurchaseDetailsScreen'; // Correctly imported
import { Purchase } from './src/store/storage'; 

export type RootStackParamList = {
  Home: undefined;
  AddPurchase: undefined;
  Spending: undefined;
  PurchaseDetails: { purchase: Purchase };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AddPurchase" component={AddPurchaseScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Spending" component={SpendingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="PurchaseDetails" component={PurchaseDetailsScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}