import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Item {
  name: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Purchase {
  id: string;
  date: string;
  items: Item[];
  total: number;
}

const STORAGE_KEY = '@purchases';

export const loadPurchases = async (): Promise<Purchase[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    const data = jsonValue != null ? JSON.parse(jsonValue) : [];
    console.log('Raw AsyncStorage data:', jsonValue);
    // Type guard to ensure data is an array of Purchase
    if (!Array.isArray(data)) {
      console.error('Stored data is not an array:', data);
      return [];
    }
    return data as Purchase[];
  } catch (e) {
    console.error('Error loading purchases:', e);
    return [];
  }
};

export const savePurchases = async (purchases: Purchase[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(purchases);
    console.log('Saving to AsyncStorage:', jsonValue);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
  } catch (e) {
    console.error('Error saving purchases:', e);
  }
};

export const getPreviousRates = async (itemName: string): Promise<{ date: string; rate: number }[]> => {
  const purchases = await loadPurchases();
  const rates: { date: string; rate: number }[] = [];
  
  purchases.forEach((purchase) => {
    purchase.items.forEach((item) => {
      if (item.name.toLowerCase() === itemName.toLowerCase()) {
        rates.push({ date: purchase.date, rate: item.rate });
      }
    });
  });
  
  return rates.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    
    if (isNaN(dateB) && isNaN(dateA)) return 0;
    if (isNaN(dateB)) return -1;
    if (isNaN(dateA)) return 1;
    
    return dateB - dateA;
  }).slice(0, 5);
};

export const updatePurchase = async (updatedPurchase: Purchase): Promise<void> => {
  const purchases = await loadPurchases();
  const updatedPurchases = purchases.map((p) => (p.id === updatedPurchase.id ? updatedPurchase : p));
  await savePurchases(updatedPurchases);
};