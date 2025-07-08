import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const FILTER_OPTIONS = ['7', '30', 'All'];

const AgentReports = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await axios.get(
          'https://claimit-backend-q4jj.onrender.com/api/claims/agent/reports',
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const submittedReports = res.data.claims.filter(claim => claim.agentReport);
        setReports(submittedReports);
        setFilteredReports(submittedReports);
      } catch (err) {
        console.error('Error fetching reports:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [search, filter]);

  const applyFilters = () => {
    let filtered = [...reports];

    // Filter by search text
    if (search.trim()) {
      filtered = filtered.filter(item =>
        `${item.driverName} ${item.location}`
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    // Filter by date range
    if (filter !== 'All') {
      const days = parseInt(filter);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);

      filtered = filtered.filter(item => new Date(item.agentReportDate) >= cutoff);
    }

    setFilteredReports(filtered);
  };

  const renderReportCard = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>👤 Driver: {item.driverName}</Text>
     <Text style={styles.text}>
  📍 Location:{' '}
  {item.location?.latitude && item.location?.longitude
    ? `Lat ${item.location.latitude.toFixed(4)}, Lng ${item.location.longitude.toFixed(4)}`
    : 'Not provided'}
</Text>

      <Text style={styles.text}>📄 Status: {item.status}</Text>
      <Text style={styles.text}>📝 Report: {item.agentReport}</Text>
      <Text style={styles.date}>
        📅 Submitted: {new Date(item.agentReportDate).toLocaleString()}
      </Text>
      <TouchableOpacity
        onPress={() => navigation.navigate('AgentClaimDetails', { claimId: item._id })}
        style={styles.button}
      >
        <Text style={styles.buttonText}>View Full Claim</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 40 }} color="#0F172A" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📑 Agent Reports</Text>

      {/* Search */}
      <TextInput
        placeholder="Search by driver or location..."
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
        placeholderTextColor="#94A3B8"
      />

      {/* Filter Buttons */}
      <View style={styles.filterRow}>
        {FILTER_OPTIONS.map(option => (
          <TouchableOpacity
            key={option}
            onPress={() => setFilter(option)}
            style={[
              styles.filterButton,
              filter === option && styles.activeFilter,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                filter === option && styles.activeFilterText,
              ]}
            >
              {option === 'All' ? 'All Time' : `Last ${option} Days`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <Text style={styles.noResults}>No matching reports found.</Text>
      ) : (
        <FlatList
          data={filteredReports}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingBottom: 80 }}
          renderItem={renderReportCard}
        />
      )}
    </View>
  );
};

export default AgentReports;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F8FAFC',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#0F172A',
  },
  searchInput: {
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#0F172A',
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
  },
  activeFilter: {
    backgroundColor: '#38BDF8',
  },
  filterText: {
    color: '#334155',
    fontSize: 14,
  },
  activeFilterText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  text: {
    fontSize: 14,
    color: '#334155',
    marginTop: 4,
  },
  date: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 8,
  },
  button: {
    backgroundColor: '#0F172A',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  noResults: {
    marginTop: 30,
    textAlign: 'center',
    color: '#64748B',
    fontSize: 16,
  },
});
