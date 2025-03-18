import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { loadPurchases, savePurchases, Purchase } from '../store/storage';
import { RootStackParamList } from '../../App';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

// Function to generate HTML for a single purchase
const createPurchaseHtml = (purchase: Purchase) => {
  const itemsHtml = purchase.items
    .map(item => `<tr><td>${item.name}</td><td>${item.quantity}</td><td>₹${item.rate}</td><td>₹${item.amount}</td></tr>`)
    .join('');
  return `
    <style>
      table { width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; }
      th, td { padding: 8px; text-align: left; border: 1px solid #ddd; }
      th { background-color: #f2f2f2; }
      h2 { color: #1E3A8A; }
      p { font-weight: bold; }
    </style>
    <h2>Purchase on ${purchase.date}</h2>
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th>Quantity</th>
          <th>Rate</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>
    <p>Total: ₹${purchase.total}</p>
  `;
};

// Function to generate HTML for all purchases
const createAllPurchasesHtml = (purchases: Purchase[]) => {
  const purchasesHtml = purchases
    .map(purchase => createPurchaseHtml(purchase))
    .join('<hr style="margin: 20px 0;">');
  return `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          hr { border: 1px solid #ddd; }
        </style>
      </head>
      <body>
        <h1>All Purchases</h1>
        ${purchasesHtml}
      </body>
    </html>
  `;
};

// Function to generate and share PDF
const generateAndSharePDF = async (html: string, fileName: string) => {
  try {
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });
    const newUri = `${FileSystem.documentDirectory}${fileName}.pdf`;
    await FileSystem.moveAsync({
      from: uri,
      to: newUri,
    });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(newUri, {
        mimeType: 'application/pdf',
        dialogTitle: `Share ${fileName}`,
        UTI: 'com.adobe.pdf',
      });
    } else {
      Alert.alert('Error', 'Sharing is not available on this device.');
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    Alert.alert('Error', 'Failed to generate or share PDF.');
  }
};

const HomeScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [search, setSearch] = useState('');
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  const fetchPurchases = useCallback(async () => {
    const data = await loadPurchases();
    console.log('Loaded purchases:', data);
    setPurchases(data);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchPurchases();
    }, [fetchPurchases])
  );

  const filteredPurchases = purchases.filter((item) =>
    item.date.toLowerCase().includes(search.toLowerCase()) ||
    item.items.some((i) => i.name.toLowerCase().includes(search.toLowerCase()))
  );

  const handleCardPress = (purchase: Purchase) => {
    navigation.navigate('PurchaseDetails', { purchase });
  };

  const handleDownload = (purchase: Purchase) => {
    const html = createPurchaseHtml(purchase);
    generateAndSharePDF(html, `Purchase_${purchase.date}`);
  };

  const handleDelete = async (purchaseId: string) => {
    const updatedPurchases = purchases.filter((p) => p.id !== purchaseId);
    await savePurchases(updatedPurchases);
    setPurchases(updatedPurchases);
  };

  const handleExportAll = () => {
    const html = createAllPurchasesHtml(purchases);
    generateAndSharePDF(html, 'All_Purchases');
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1E3A8A', '#3B82F6']} style={styles.header}>
        <Text style={styles.headerText}>Retail Goods Manager</Text>
        <TouchableOpacity style={styles.exportButton} onPress={handleExportAll}>
          <MaterialIcons name="file-download" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>

      <TextInput
        style={styles.searchInput}
        placeholder="Search by date or item..."
        placeholderTextColor="#9CA3AF"
        value={search}
        onChangeText={setSearch}
      />

      <TouchableOpacity style={styles.editToggle} onPress={() => setIsEditing(!isEditing)}>
        <Text style={styles.editToggleText}>{isEditing ? 'Done Editing' : 'Edit Purchases'}</Text>
      </TouchableOpacity>

      <FlatList
        data={filteredPurchases}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => !isEditing && handleCardPress(item)}>
            <LinearGradient
              colors={['#FFFFFF', '#E5E7EB']}
              style={styles.card}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.cardContent}>
                <Text style={styles.cardText}>{item.date}</Text>
                <Text style={styles.cardTotal}>₹{item.total}</Text>
              </View>
              {isEditing ? (
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
                  <MaterialIcons name="delete" size={20} color="#F28C38" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.downloadButton} onPress={() => handleDownload(item)}>
                  <MaterialIcons name="download" size={20} color="#F28C38" />
                </TouchableOpacity>
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddPurchase')}
      >
        <MaterialIcons name="add" size={30} color="#FFFFFF" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.chartButton}
        onPress={() => navigation.navigate('Spending')}
      >
        <LinearGradient colors={['#F28C38', '#FBBF24']} style={styles.chartGradient}>
          <Text style={styles.chartText}>View Spending Trends</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { padding: 20, paddingTop: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerText: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold' },
  exportButton: { padding: 5 },
  searchInput: {
    margin: 10,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    fontSize: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  editToggle: {
    marginHorizontal: 10,
    padding: 10,
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    alignItems: 'center',
  },
  editToggleText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  card: {
    marginHorizontal: 10,
    marginVertical: 5,
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  cardContent: { flexDirection: 'row', justifyContent: 'space-between', flex: 1 },
  cardText: { fontSize: 16, color: '#1E3A8A' },
  cardTotal: { fontSize: 16, fontWeight: 'bold', color: '#F28C38' },
  downloadButton: { marginLeft: 10 },
  deleteButton: { marginLeft: 10 },
  list: { paddingBottom: 100 },
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    backgroundColor: '#3B82F6',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  chartButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  chartGradient: { padding: 15, borderRadius: 10, alignItems: 'center' },
  chartText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});

export default HomeScreen;