import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart } from 'react-native-chart-kit';
import { loadPurchases, Purchase } from '../store/storage';

const SpendingScreen = () => {
  const screenWidth = Dimensions.get('window').width;
  const [chartData, setChartData] = useState({
    labels: [] as string[],
    datasets: [{ data: [] as number[] }],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to parse multiple date formats
  const parseCustomDate = (dateStr: string): Date => {
    // Try "DD MMM YYYY" format (e.g., "18 Mar 2025")
    const spaceSplit = dateStr.split(' ');
    if (spaceSplit.length === 3) {
      const [day, monthStr, year] = spaceSplit;
      const monthMap: { [key: string]: number } = {
        Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
        Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
      };
      const month = monthMap[monthStr];
      if (month !== undefined && day && year) {
        return new Date(parseInt(year), month, parseInt(day));
      }
    }

    // Try "DD/MM/YYYY" format (e.g., "18/03/2025")
    const slashSplit = dateStr.split('/');
    if (slashSplit.length === 3) {
      const [day, month, year] = slashSplit.map(Number);
      if (day && month && year) {
        return new Date(year, month - 1, day); // month - 1 because JS months are 0-based
      }
    }

    return new Date(NaN); // Invalid date
  };

  useEffect(() => {
    const fetchSpending = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const purchases = await loadPurchases();
        console.log('Purchases loaded:', purchases); // Debug raw data

        const monthlyTotals: { [key: string]: number } = {};
        purchases.forEach((purchase: Purchase) => {
          const parsedDate = parseCustomDate(purchase.date);
          if (isNaN(parsedDate.getTime())) {
            console.warn(`Invalid date found: ${purchase.date}, skipping...`);
            return; // Skip invalid dates
          }
          const monthYear = `${parsedDate.toLocaleString('default', { month: 'short' })} ${parsedDate.getFullYear()}`;
          monthlyTotals[monthYear] = (monthlyTotals[monthYear] || 0) + purchase.total;
        });

        const labels = Object.keys(monthlyTotals).sort((a, b) => {
          return new Date(`01 ${a}`).getTime() - new Date(`01 ${b}`).getTime(); // Sort chronologically
        });
        const data = labels.map((label) => monthlyTotals[label]);

        if (labels.length === 0) {
          setError('No valid spending data available.');
        } else {
          setChartData({
            labels,
            datasets: [{ data }],
          });
        }
      } catch (e) {
        console.error('Error fetching spending data:', e);
        setError('Failed to load spending trends.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSpending();
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1E3A8A', '#3B82F6']} style={styles.header}>
        <Text style={styles.headerText}>Spending Trends</Text>
      </LinearGradient>

      <Text style={styles.chartTitle}>Monthly Spending</Text>
      
      {isLoading ? (
        <ActivityIndicator size="large" color="#F28C38" style={styles.loading} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : chartData.labels.length > 0 ? (
        <LineChart
          data={chartData}
          width={screenWidth - 40}
          height={250}
          yAxisLabel="₹"
          chartConfig={{
            backgroundGradientFrom: '#FFFFFF',
            backgroundGradientTo: '#E5E7EB',
            decimalPlaces: 0,
            color: () => '#F28C38',
            labelColor: () => '#1E3A8A',
            style: { borderRadius: 16 },
            propsForDots: { r: '6', strokeWidth: '2', stroke: '#FBBF24' },
          }}
          bezier
          style={styles.chart}
          withShadow
          withInnerLines
        />
      ) : (
        <Text style={styles.noData}>No spending data yet.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { padding: 20, paddingTop: 40, alignItems: 'center' },
  headerText: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold' },
  chartTitle: { fontSize: 18, color: '#1E3A8A', textAlign: 'center', margin: 20, fontWeight: '600' },
  chart: {
    marginHorizontal: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  noData: { textAlign: 'center', fontSize: 16, color: '#9CA3AF', marginTop: 20 },
  errorText: { textAlign: 'center', fontSize: 16, color: '#F28C38', marginTop: 20 },
  loading: { marginTop: 20 },
});

export default SpendingScreen;