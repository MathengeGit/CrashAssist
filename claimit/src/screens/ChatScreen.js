import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';
import jwtDecode from 'jwt-decode';

const ChatScreen = () => {
  const { driverId, driverName } = useRoute().params;
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [userId, setUserId] = useState(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    const getUserId = async () => {
      const token = await AsyncStorage.getItem('token');
      const decoded = jwtDecode(token);
      setUserId(decoded.id); // or decoded._id depending on your token
    };

    const fetchMessages = async () => {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(`https://claimit-backend-q4jj.onrender.com/api/messages/${driverId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data.messages);
    };

    getUserId();
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Polling
    return () => clearInterval(interval);
  }, [driverId]);

  const sendMessage = async () => {
    if (!newMsg.trim()) return;
    const token = await AsyncStorage.getItem('token');

    await axios.post(
      'https://claimit-backend-q4jj.onrender.com/api/messages',
      { receiverId: driverId, text: newMsg },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setMessages((prev) => [
      ...prev,
      {
        senderId: userId,
        receiverId: driverId,
        text: newMsg,
        sentAt: new Date().toISOString(),
      },
    ]);
    setNewMsg('');
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderItem = ({ item }) => {
    const isMe = item.senderId === userId;
    return (
      <View style={[styles.msgContainer, isMe ? styles.right : styles.left]}>
        <Text style={[styles.msgText, isMe && styles.textWhite]}>{item.text}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>Chat with {driverName}</Text>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
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
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F8FAFC' },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#0F172A',
  },
  list: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  msgContainer: {
    maxWidth: '75%',
    padding: 10,
    borderRadius: 12,
    marginVertical: 4,
  },
  left: {
    alignSelf: 'flex-start',
    backgroundColor: '#E2E8F0',
  },
  right: {
    alignSelf: 'flex-end',
    backgroundColor: '#0F172A',
  },
  msgText: {
    fontSize: 14,
    color: '#1E293B',
  },
  textWhite: {
    color: '#FFF',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    borderTopColor: '#CBD5E1',
    borderTopWidth: 1,
    paddingTop: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 10,
  },
  sendBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendTxt: {
    color: '#FFF',
    fontWeight: '600',
  },
});
