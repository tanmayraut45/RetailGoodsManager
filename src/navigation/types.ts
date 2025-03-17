import { StackNavigationProp } from '@react-navigation/stack';

// Define and export the navigation stack param list
export type RootStackParamList = {
  Home: undefined;
  AddPurchase: undefined;
  Spending: undefined;
};

// Optional: Export a navigation prop type if needed elsewhere
export type AppNavigationProp = StackNavigationProp<RootStackParamList>;