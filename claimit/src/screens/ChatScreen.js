import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';

const ChatScreen = () => {
  const { driverId, driverName } = useRoute().params;
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(`https://metal-seals-like.loca.lt/api/messages/${driverId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data.messages);
    };
    fetchMessages();
  }, []);

  const sendMessage = async () => {
    const token = await AsyncStorage.getItem('token');
    await axios.post(
      'https://metal-seals-like.loca.lt/api/messages',
      { receiverId: driverId, text: newMsg },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setMessages([...messages, { text: newMsg, senderId: 'me' }]);
    setNewMsg('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{driverName}</Text>
      <FlatList
        data={messages}
        keyExtractor={(item, idx) => idx.toString()}
        renderItem={({ item }) => (
          <Text style={[styles.msg, item.senderId === 'me' && styles.me]}>
            {item.text}
          </Text>
        )}
        style={styles.list}
      />
      <View style={styles.inputRow}>
        <TextInput
          value={newMsg}
          onChangeText={setNewMsg}
          placeholder="Type a message"
          style={styles.input}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
          <Text style={styles.sendTxt}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  list: { flex: 1 },
  msg: {
    padding: 10,
    marginVertical: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  me: {
    backgroundColor: '#0f172a',
    color: 'white',
    alignSelf: 'flex-end',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 10,
  },
  sendBtn: {
    marginLeft: 8,
    backgroundColor: '#0f172a',
    padding: 10,
    borderRadius: 8,
  },
  sendTxt: { color: '#fff', fontWeight: '600' },
});
