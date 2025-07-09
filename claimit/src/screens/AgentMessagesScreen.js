import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// ✅ Import and extend dayjs
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const AgentMessagesScreen = () => {
  const [drivers, setDrivers] = useState([]);
  const [search, setSearch] = useState('');
  const [recentMessages, setRecentMessages] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await axios.get('https://claimit-backend-q4jj.onrender.com/api/messages/drivers/list', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDrivers(res.data.drivers);

        // Fetch recent messages
        const messagesObj = {};
        for (const driver of res.data.drivers) {
          try {
            const msgRes = await axios.get(
              `https://claimit-backend-q4jj.onrender.com/api/messages/${driver._id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            const msgs = msgRes.data.messages;
            if (msgs.length > 0) {
              messagesObj[driver._id] = {
                text: msgs[msgs.length - 1].text,
                time: msgs[msgs.length - 1].createdAt
              };
            }
          } catch (err) {
            console.warn(`⚠️ No messages for ${driver.name}`);
          }
        }
        setRecentMessages(messagesObj);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDrivers();
  }, []);

  const filtered = drivers.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ Updated time formatter using dayjs
  const formatTime = (dateString) => {
    if (!dateString) return '';
    return dayjs(dateString).fromNow();
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#4a6da7" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <Icon name="search" size={24} color="#4a6da7" />
      </View>

      <TextInput
        placeholder="Search drivers..."
        placeholderTextColor="#999"
        style={styles.search}
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() =>
              navigation.navigate('ChatScreen', {
                driverId: item._id,
                driverName: item.name,
              })
            }
          >
            <View style={styles.avatar}>
              <View style={styles.avatarCircle}>
                <Icon name="person" size={28} color="#64748B" />
              </View>
            </View>

            <View style={styles.messageContent}>
              <View style={styles.messageHeader}>
                <Text style={styles.name}>{item.name}</Text>
                {recentMessages[item._id]?.time && (
                  <Text style={styles.time}>
                    {formatTime(recentMessages[item._id].time)}
                  </Text>
                )}
              </View>
              <Text
                style={styles.preview}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {recentMessages[item._id]?.text || 'No messages yet'}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="people-outline" size={50} color="#ccc" />
            <Text style={styles.emptyText}>No drivers found</Text>
          </View>
        }
      />
    </View>
  );
};

export default AgentMessagesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  search: {
    padding: 12,
    paddingLeft: 40,
    margin: 16,
    borderRadius: 20,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  listContainer: {
    paddingHorizontal: 12,
  },
  item: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  avatar: {
    marginRight: 12,
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContent: {
    flex: 1,
    justifyContent: 'center',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  preview: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
});
