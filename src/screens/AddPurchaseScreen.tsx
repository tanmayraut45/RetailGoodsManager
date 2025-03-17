import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import { loadPurchases, savePurchases, getPreviousRates, Purchase, Item } from '../store/storage';
import { RootStackParamList } from '../../App';

type AddPurchaseScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddPurchase'>;

interface Props {
  navigation: AddPurchaseScreenNavigationProp;
}

const AddPurchaseScreen = ({ navigation }: Props) => {
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [items, setItems] = useState<Item[]>([{ name: '', quantity: 0, rate: 0, amount: 0 }]);
  const [suggestions, setSuggestions] = useState<{ date: string; rate: number }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const addItem = () => {
    setItems([...items, { name: '', quantity: 0, rate: 0, amount: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) {
      setError('At least one item is required.');
      return;
    }
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    setError(null); // Clear error if it was set
  };

  const updateItem = (index: number, field: 'name' | 'quantity' | 'rate', value: string) => {
    const newItems = [...items];
    if (field === 'quantity' || field === 'rate') {
      newItems[index][field] = parseFloat(value) || 0;
      newItems[index].amount = newItems[index].quantity * newItems[index].rate;
    } else {
      newItems[index][field] = value;
    }
    setItems(newItems);
  };

  const handleNameChange = async (index: number, value: string) => {
    updateItem(index, 'name', value);
    if (value) {
      const rates = await getPreviousRates(value);
      console.log(`Suggestions for ${value}:`, rates);
      setSuggestions(rates);
    } else {
      setSuggestions([]);
    }
  };

  const savePurchase = async () => {
    if (!items.every((item) => item.name && item.quantity > 0 && item.rate > 0)) {
      setError('Please fill all fields with valid values.');
      return;
    }
    setError(null);
    const total = items.reduce((sum, item) => sum + item.amount, 0);
    const purchase: Purchase = {
      id: Date.now().toString(),
      date: date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      items: items.filter((item) => item.name && item.quantity && item.rate),
      total,
    };
    const existingPurchases = await loadPurchases();
    await savePurchases([...existingPurchases, purchase]);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1E3A8A', '#3B82F6']} style={styles.header}>
        <Text style={styles.headerText}>Add Purchase</Text>
      </LinearGradient>

      <TouchableOpacity onPress={() => setShowPicker(true)}>
        <Text style={styles.input}>
          {date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
        </Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      <FlatList
        data={items}
        renderItem={({ item, index }) => (
          <View style={styles.itemContainer}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemLabel}>Item {index + 1}</Text>
              <TouchableOpacity onPress={() => removeItem(index)}>
                <MaterialIcons name="cancel" size={24} color="#F28C38" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Item Name"
              value={item.name}
              onChangeText={(text) => handleNameChange(index, text)}
            />
            {suggestions.length > 0 && item.name && (
              <FlatList
                data={suggestions}
                renderItem={({ item }) => (
                  <Text style={styles.suggestion}>
                    {item.date}: ₹{item.rate}/unit
                  </Text>
                )}
                keyExtractor={(s) => s.date}
              />
            )}
            <TextInput
              style={styles.input}
              placeholder="Quantity (e.g., 5)"
              value={item.quantity ? item.quantity.toString() : ''}
              onChangeText={(text) => updateItem(index, 'quantity', text)}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Rate (e.g., 100/unit)"
              value={item.rate ? item.rate.toString() : ''}
              onChangeText={(text) => updateItem(index, 'rate', text)}
              keyboardType="numeric"
            />
            <Text style={styles.amount}>Amount: ₹{item.amount}</Text>
          </View>
        )}
        keyExtractor={(_, index) => index.toString()}
      />

      {error && <Text style={styles.errorText}>{error}</Text>}

      <TouchableOpacity style={styles.addButton} onPress={addItem}>
        <Text style={styles.addButtonText}>Add Another Item</Text>
      </TouchableOpacity>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <LinearGradient colors={['#E5E7EB', '#D1D5DB']} style={styles.backGradient}>
            <Text style={styles.backText}>Back</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveButton} onPress={savePurchase}>
          <LinearGradient colors={['#F28C38', '#FBBF24']} style={styles.saveGradient}>
            <Text style={styles.saveText}>Save Purchase</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemLabel: { fontSize: 16, color: '#1E3A8A', fontWeight: 'bold' },
  input: {
    marginVertical: 5,
    padding: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    fontSize: 16,
  },
  suggestion: { padding: 5, color: '#1E3A8A', fontSize: 14 },
  amount: { marginVertical: 5, fontSize: 16, color: '#F28C38', fontWeight: 'bold' },
  errorText: { textAlign: 'center', color: '#F28C38', fontSize: 16, marginVertical: 10 },
  addButton: {
    margin: 10,
    padding: 10,
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: { color: '#FFFFFF', fontSize: 16 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', margin: 10 },
  backButton: { flex: 1, marginRight: 5 },
  saveButton: { flex: 1, marginLeft: 5 },
  backGradient: { padding: 15, borderRadius: 10, alignItems: 'center' },
  backText: { color: '#1E3A8A', fontSize: 16, fontWeight: 'bold' },
  saveGradient: { padding: 15, borderRadius: 10, alignItems: 'center' },
  saveText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});

export default AddPurchaseScreen;