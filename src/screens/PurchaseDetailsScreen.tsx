import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { loadPurchases, savePurchases, Purchase, Item } from '../store/storage';
import { RootStackParamList } from '../../App';

type PurchaseDetailsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PurchaseDetails'>;
type PurchaseDetailsScreenRouteProp = RouteProp<RootStackParamList, 'PurchaseDetails'>;

interface Props {
  navigation: PurchaseDetailsScreenNavigationProp;
  route: PurchaseDetailsScreenRouteProp;
}

const PurchaseDetailsScreen = ({ navigation, route }: Props) => {
  const { purchase: initialPurchase } = route.params;
  const [purchase, setPurchase] = useState<Purchase>({ ...initialPurchase });
  const [isEditing, setIsEditing] = useState(false);

  const updateItem = (index: number, field: 'name' | 'quantity' | 'rate', value: string) => {
    const newItems = [...purchase.items];
    if (field === 'quantity' || field === 'rate') {
      newItems[index][field] = parseFloat(value) || 0;
      newItems[index].amount = newItems[index].quantity * newItems[index].rate;
    } else {
      newItems[index][field] = value;
    }
    setPurchase({ ...purchase, items: newItems, total: newItems.reduce((sum, item) => sum + item.amount, 0) });
  };

  const addItem = () => {
    setPurchase({
      ...purchase,
      items: [...purchase.items, { name: '', quantity: 0, rate: 0, amount: 0 }],
    });
  };

  const removeItem = (index: number) => {
    const newItems = purchase.items.filter((_, i) => i !== index);
    setPurchase({
      ...purchase,
      items: newItems,
      total: newItems.reduce((sum, item) => sum + item.amount, 0),
    });
  };

  const saveEditedPurchase = async () => {
    const allPurchases = await loadPurchases();
    const updatedPurchases = allPurchases.map((p) => (p.id === purchase.id ? purchase : p));
    await savePurchases(updatedPurchases);
    setIsEditing(false);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1E3A8A', '#3B82F6']} style={styles.header}>
        <Text style={styles.headerText}>Purchase Details - {purchase.date}</Text>
      </LinearGradient>

      {isEditing ? (
        <>
          <FlatList
            data={purchase.items}
            renderItem={({ item, index }) => (
              <View style={styles.itemContainer}>
                <TextInput
                  style={styles.input}
                  value={item.name}
                  onChangeText={(text) => updateItem(index, 'name', text)}
                  placeholder="Item Name"
                />
                <TextInput
                  style={styles.input}
                  value={item.quantity.toString()}
                  onChangeText={(text) => updateItem(index, 'quantity', text)}
                  keyboardType="numeric"
                  placeholder="Quantity"
                />
                <TextInput
                  style={styles.input}
                  value={item.rate.toString()}
                  onChangeText={(text) => updateItem(index, 'rate', text)}
                  keyboardType="numeric"
                  placeholder="Rate"
                />
                <Text style={styles.amount}>₹{item.amount}</Text>
                <TouchableOpacity onPress={() => removeItem(index)}>
                  <MaterialIcons name="delete" size={24} color="#F28C38" />
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={(_, index) => index.toString()}
          />
          <TouchableOpacity style={styles.addButton} onPress={addItem}>
            <Text style={styles.addButtonText}>Add Item</Text>
          </TouchableOpacity>
        </>
      ) : (
        <FlatList
          data={purchase.items}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <Text style={styles.itemText}>{item.name}</Text>
              <Text style={styles.itemText}>Qty: {item.quantity}</Text>
              <Text style={styles.itemText}>Rate: ₹{item.rate}</Text>
              <Text style={styles.itemText}>Amount: ₹{item.amount}</Text>
            </View>
          )}
          keyExtractor={(_, index) => index.toString()}
        />
      )}

      <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(!isEditing)}>
        <LinearGradient colors={['#F28C38', '#FBBF24']} style={styles.buttonGradient}>
          <Text style={styles.buttonText}>{isEditing ? 'Cancel' : 'Edit'}</Text>
        </LinearGradient>
      </TouchableOpacity>

      {isEditing && (
        <TouchableOpacity style={styles.saveButton} onPress={saveEditedPurchase}>
          <LinearGradient colors={['#3B82F6', '#1E3A8A']} style={styles.buttonGradient}>
            <Text style={styles.buttonText}>Save Changes</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { padding: 20, paddingTop: 40, alignItems: 'center' },
  headerText: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold' },
  itemContainer: {
    margin: 10,
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemText: { fontSize: 16, color: '#1E3A8A' },
  input: {
    flex: 1,
    marginVertical: 5,
    padding: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
    fontSize: 16,
    marginRight: 10,
  },
  amount: { fontSize: 16, color: '#F28C38', fontWeight: 'bold', marginRight: 10 },
  addButton: {
    margin: 10,
    padding: 10,
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: { color: '#FFFFFF', fontSize: 16 },
  editButton: { margin: 10 },
  saveButton: { margin: 10 },
  buttonGradient: { padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});

export default PurchaseDetailsScreen;