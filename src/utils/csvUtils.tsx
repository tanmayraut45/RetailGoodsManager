import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Purchase } from '../store/storage';

export const exportToCSV = async (purchases: Purchase[]) => {
  try {
    const headers = ['Date,Item Name,Quantity,Rate,Amount,Total'];
    const rows = purchases.flatMap((purchase) =>
      purchase.items.map((item) =>
        `${purchase.date},${item.name},${item.quantity},${item.rate},${item.amount},${purchase.total}`
      )
    );
    const csvContent = headers.concat(rows).join('\n');

    const fileUri = `${FileSystem.documentDirectory}purchase_${Date.now()}.csv`;

    // Write UTF-8 BOM for Excel compatibility
    const BOM = '\uFEFF';
    await FileSystem.writeAsStringAsync(fileUri, BOM + csvContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Share the CSV file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Share your purchase data',
        UTI: 'public.comma-separated-values-text', // iOS-specific
      });
    } else {
      console.log('Sharing is not available on this device');
    }
  } catch (error) {
    console.error('Error exporting to CSV:', error);
  }
};