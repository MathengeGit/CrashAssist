import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Pressable,
  Picker,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const AdminDashboard = () => {
  const [claims, setClaims] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedClaimId, setSelectedClaimId] = useState(null);
  const [newAgentId, setNewAgentId] = useState('');
  const [availableAgents, setAvailableAgents] = useState([]);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [claimsRes, agentsRes] = await Promise.all([
        axios.get('https://claimit-backend-q4jj.onrender.com/api/claims/admin/all', { headers }),
        axios.get('https://claimit-backend-q4jj.onrender.com/api/claims/admin/agents', { headers }),
      ]);

      setClaims(claimsRes.data.claims);
      setAgents(agentsRes.data.agents);
    } catch (error) {
      console.error('Admin dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupAgentsByCompany = () => {
    const grouped = {};
    agents.forEach(agent => {
      if (!grouped[agent.insuranceName]) grouped[agent.insuranceName] = [];
      grouped[agent.insuranceName].push(agent);
    });
    return grouped;
  };

  const openReassignModal = (claim) => {
    const insuranceAgents = agents.filter(a => a.insuranceName === claim.insuranceName);
    setAvailableAgents(insuranceAgents);
    setSelectedClaimId(claim._id);
    setNewAgentId(claim.assignedAgent?._id || '');
    setModalVisible(true);
  };

  const handleReassign = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put(
        `https://claimit-backend-q4jj.onrender.com/api/claims/${selectedClaimId}/reassign`,
        { newAgentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setModalVisible(false);
      fetchAdminData();
    } catch (err) {
      console.error('Error reassigning agent:', err);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1D4ED8" />
      </View>
    );
  }

  const groupedAgents = groupAgentsByCompany();

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      <Text style={styles.header}>👨‍💼 Admin Dashboard</Text>

      <Text style={styles.sectionTitle}>📄 All Claims</Text>
      {claims.length === 0 ? (
        <Text style={styles.emptyText}>No claims available.</Text>
      ) : (
        claims.map((claim, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.cardTitle}>{claim.driverId?.name || 'Unknown Driver'}</Text>
            <Text style={styles.cardSubtitle}>Claim: {claim._id}</Text>
            <Text>Status: <Text style={{ color: statusColor(claim.status) }}>{claim.status}</Text></Text>
            <Text>Assigned Agent: {claim.assignedAgent?.name || 'None'} ({claim.assignedAgent?.email || 'N/A'})</Text>
            <TouchableOpacity style={styles.reassignButton} onPress={() => openReassignModal(claim)}>
              <Text style={styles.reassignText}>🔄 Reassign Agent</Text>
            </TouchableOpacity>
          </View>
        ))
      )}

      <Text style={styles.sectionTitle}>👥 Agents by Insurance</Text>
      {Object.keys(groupedAgents).length === 0 ? (
        <Text style={styles.emptyText}>No agents found.</Text>
      ) : (
        Object.entries(groupedAgents).map(([company, companyAgents]) => (
          <View key={company} style={styles.card}>
            <Text style={styles.cardTitle}>{company}</Text>
            {companyAgents.map(agent => (
              <Text key={agent._id} style={styles.cardText}>{agent.name} - {agent.email}</Text>
            ))}
          </View>
        ))
      )}

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reassign Agent</Text>
            <Picker
              selectedValue={newAgentId}
              style={{ height: 50, width: '100%' }}
              onValueChange={(itemValue) => setNewAgentId(itemValue)}
            >
              {availableAgents.map(agent => (
                <Picker.Item key={agent._id} label={`${agent.name} (${agent.email})`} value={agent._id} />
              ))}
            </Picker>
            <Pressable style={styles.modalButton} onPress={handleReassign}>
              <Text style={styles.modalButtonText}>Confirm</Text>
            </Pressable>
            <Pressable style={[styles.modalButton, { backgroundColor: '#94A3B8' }]} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const statusColor = (status) => {
  switch (status) {
    case 'approved': return '#10B981';
    case 'rejected': return '#EF4444';
    case 'pending': return '#FBBF24';
    default: return '#64748B';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0F172A',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  cardText: {
    fontSize: 14,
    color: '#475569',
    marginTop: 4,
  },
  reassignButton: {
    marginTop: 8,
    backgroundColor: '#E0F2FE',
    paddingVertical: 8,
    borderRadius: 6,
  },
  reassignText: {
    color: '#0284C7',
    textAlign: 'center',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#0F172A',
  },
  modalButton: {
    marginTop: 10,
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default AdminDashboard;
