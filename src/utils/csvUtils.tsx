import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Purchase } from '../store/storage';

export const exportToCSV = async (purchases: Purchase[]) => {
  try {
    // CSV header with BOM for Excel compatibility
    let csvContent = '\uFEFFDate,Item,Quantity,Rate,Amount,Total\n'; // BOM (\uFEFF) ensures Excel opens UTF-8 correctly

    // Build CSV rows
    purchases.forEach((purchase) => {
      purchase.items.forEach((item) => {
        csvContent += `${purchase.date},${item.name},${item.quantity},${item.rate},${item.amount},${purchase.total}\n`;
      });
    });

    // Use .csv extension (Excel-compatible)
    const fileName = purchases.length === 1 ? `purchase_${purchases[0].date}_${Date.now()}.csv` : `purchases_${Date.now()}.csv`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    await FileSystem.writeAsStringAsync(fileUri, csvContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Share the file
    await Sharing.shareAsync(fileUri, { mimeType: 'text/csv', dialogTitle: 'Save Purchase Data' });
  } catch (e) {
    console.error('Error exporting CSV:', e);
  }
};