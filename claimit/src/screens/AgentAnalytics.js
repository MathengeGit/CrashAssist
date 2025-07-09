import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PieChart, BarChart, LineChart } from 'react-native-chart-kit';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

const StatCard = ({ title, value, icon, color }) => (
  <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: color }]}>
    <View style={styles.cardHeader}>
      <MaterialCommunityIcons name={icon} size={20} color={color} />
      <Text style={[styles.cardTitle, { color }]}>{title}</Text>
    </View>
    <Text style={styles.cardValue}>{value}</Text>
  </View>
);

const AgentAnalyticsScreen = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await axios.get(
          'https://claimit-backend-q4jj.onrender.com/api/analytics/summary',
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setData(res.data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );

  if (!data)
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="chart-line" size={40} color="#9CA3AF" />
        <Text style={styles.errorText}>
          Unable to load analytics. Please try again.
        </Text>
      </View>
    );

  // Breakdown statusCounts
  const statusMap = {};
  data.statusCounts.forEach((item) => {
    statusMap[item._id.charAt(0).toUpperCase() + item._id.slice(1).toLowerCase()] = item.count;
  });

  const pieChartData = data.statusCounts.map((item, index) => ({
    name: item._id,
    population: item.count,
    color: ['#4F46E5', '#10B981', '#EF4444'][index % 3],
    legendFontColor: '#6B7280',
    legendFontSize: 12,
  }));

  const barChartData = {
    labels: data.claimsByDate.map((i) => `${i._id.month}/${i._id.day}`),
    datasets: [{ 
      data: data.claimsByDate.map((i) => i.count),
      colors: data.claimsByDate.map((_, index) => 
        (opacity = 1) => `rgba(79, 70, 229, ${opacity})`
      )
    }],
  };

  const chartConfig = {
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#4F46E5',
    },
    fillShadowGradient: '#4F46E5',
    fillShadowGradientOpacity: 0.2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Analytics Dashboard</Text>
        <View style={styles.headerDivider} />
      </View>

      {/* Stat Cards */}
      <View style={styles.cardGrid}>
        <StatCard 
          title="Total Claims" 
          value={data.totalClaims} 
          icon="file-document-multiple" 
          color="#4F46E5" 
        />
        <StatCard 
          title="Pending" 
          value={statusMap.Pending || 0} 
          icon="clock" 
          color="#F59E0B" 
        />
        <StatCard 
          title="Approved" 
          value={statusMap.Approved || 0} 
          icon="check-circle" 
          color="#10B981" 
        />
        <StatCard 
          title="Rejected" 
          value={statusMap.Rejected || 0} 
          icon="close-circle" 
          color="#EF4444" 
        />
      </View>

      {/* Charts Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="chart-pie" size={20} color="#4F46E5" />
          <Text style={styles.sectionTitle}>Claims Status Distribution</Text>
        </View>
        <PieChart
          data={pieChartData}
          width={screenWidth - 32}
          height={200}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          chartConfig={chartConfig}
          absolute
          style={styles.chart}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="chart-bar" size={20} color="#4F46E5" />
          <Text style={styles.sectionTitle}>Recent Claims Activity</Text>
        </View>
        <BarChart
          data={barChartData}
          width={screenWidth - 32}
          height={220}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={chartConfig}
          style={styles.chart}
          verticalLabelRotation={30}
          fromZero
        />
      </View>
    </ScrollView>
  );
};

export default AgentAnalyticsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  headerContainer: {
    marginBottom: 24,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  headerDivider: {
    height: 4,
    width: 48,
    backgroundColor: '#4F46E5',
    marginTop: 8,
    borderRadius: 2,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  chart: {
    borderRadius: 8,
    marginTop: 8,
  },
});