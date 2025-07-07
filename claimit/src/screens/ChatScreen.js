import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, useNavigation } from '@react-navigation/native';
import jwtDecode from 'jwt-decode';
import Icon from 'react-native-vector-icons/MaterialIcons';
import dayjs from 'dayjs';

const ChatScreen = () => {
  const { driverId, driverName } = useRoute().params;
  const navigation = useNavigation();
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('You');
  const flatListRef = useRef(null);

  useEffect(() => {
    navigation.setOptions({ title: driverName });

    const getUserInfo = async () => {
      const token = await AsyncStorage.getItem('token');
      const decoded = jwtDecode(token);
      setUserId(decoded.id);
      setUserName(decoded.name || 'You');
    };

    const fetchMessages = async () => {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(
        `https://claimit-backend-q4jj.onrender.com/api/messages/${driverId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(res.data.messages);
    };

    getUserInfo();
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
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

  const formatTime = (dateString) => dayjs(dateString).format('HH:mm');

  const renderItem = ({ item, index }) => {
    const isMe = item.senderId === userId;
    const prevSender = index > 0 ? messages[index - 1].senderId : null;
    const nextSender = index < messages.length - 1 ? messages[index + 1].senderId : null;
    const showHeader = !isMe && item.senderId !== prevSender;
    const isLastInGroup = item.senderId !== nextSender;

    return (
      <View style={[styles.messageWrapper, isMe ? styles.myMessageWrapper : styles.theirMessageWrapper]}>
        {!isMe && showHeader && (
          <View style={styles.senderHeader}>
            <Image
              source={{ uri: 'https://via.placeholder.com/40' }}
              style={styles.avatar}
            />
            <Text style={styles.senderName}>{driverName}</Text>
          </View>
        )}

        <View style={[
          styles.messageContainer,
          isMe ? styles.myMessage : styles.theirMessage,
          isLastInGroup && (isMe ? styles.myLastMessage : styles.theirLastMessage)
        ]}>
          <Text style={[styles.messageText, isMe && styles.myMessageText]}>{item.text}</Text>
          <Text style={[styles.timeStamp, isMe ? styles.myTimeStamp : styles.theirTimeStamp]}>
            {formatTime(item.sentAt)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        <View style={styles.inputContainer}>
          <TextInput
            value={newMsg}
            onChangeText={setNewMsg}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            style={styles.input}
            multiline
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
            <Icon name="send" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  messageWrapper: {
    marginBottom: 8,
  },
  myMessageWrapper: {
    alignItems: 'flex-end',
  },
  theirMessageWrapper: {
    alignItems: 'flex-start',
  },
  senderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4a6da7',
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  myMessage: {
    backgroundColor: '#2c3e50',
    borderTopRightRadius: 4,
  },
  theirMessage: {
    backgroundColor: '#e9ebee',
    borderTopLeftRadius: 4,
  },
  myLastMessage: {
    borderBottomRightRadius: 16,
  },
  theirLastMessage: {
    borderBottomLeftRadius: 16,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#fff',
    fontWeight: '500',
  },
  timeStamp: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  myTimeStamp: {
    color: 'rgba(255,255,255,0.7)',
  },
  theirTimeStamp: {
    color: '#999',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 32 : 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eaeaea',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f2f5',
    borderRadius: 20,
    fontSize: 15,
    color: '#1a1a1a',
    marginBottom: 25,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4a6da7',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    marginBottom: 25,
  },
});
