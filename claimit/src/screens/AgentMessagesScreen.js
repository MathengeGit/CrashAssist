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
  const navigation = useNavigation();

  useEffect(() => {
    const fetchDrivers = async () => {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get('https://claimit-backend-q4jj.onrender.com/api/messages/drivers/list', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDrivers(res.data.drivers);
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
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default AgentMessagesScreen;

const styles = StyleSheet.create({
  container: { padding: 16, flex: 1, backgroundColor: '#fff' },
  search: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 10,
  },
  item: {
    padding: 15,
    backgroundColor: '#f8f8f8',
    marginBottom: 8,
    borderRadius: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
  },
});
