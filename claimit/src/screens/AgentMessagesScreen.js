import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const AgentMessagesScreen = () => {
  const [drivers, setDrivers] = useState([]);
  const [search, setSearch] = useState('');
  const [recentMessages, setRecentMessages] = useState({});
  const navigation = useNavigation();

  useEffect(() => {
    const fetchDrivers = async () => {
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
            messagesObj[driver._id] = msgs[msgs.length - 1].text;
          }
        } catch (err) {
          console.warn(`⚠️ No messages for ${driver.name}`);
        }
      }
      setRecentMessages(messagesObj);
    };
    fetchDrivers();
  }, []);

  const filtered = drivers.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search driver..."
        style={styles.search}
        value={search}
        onChangeText={setSearch}
      />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
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
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.preview}>
              {recentMessages[item._id] || 'No messages yet'}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default AgentMessagesScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    backgroundColor: '#fff',
  },
  search: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: '#f8fafc',
    fontSize: 16,
  },
  item: {
    padding: 15,
    backgroundColor: '#f1f5f9',
    marginBottom: 12,
    borderRadius: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  preview: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
});
