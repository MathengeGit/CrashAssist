import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  useColorScheme
} from 'react-native';
import axios from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import dayjs from 'dayjs';

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  useEffect(() => {
    const fetchAndMarkNotifications = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await axios.get('/api/notifications', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setNotifications(res.data.notifications);

        // Mark all as read
        await axios.post('/api/notifications/mark-read', {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.error('❌ Error fetching notifications:', err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAndMarkNotifications();
  }, []);

  const renderItem = ({ item }) => {
    const iconName = item.type === 'message' ? 'message' : 'info';
    const iconColor = item.type === 'message' ? '#3B82F6' : '#10B981';

    return (
      <View style={[styles.notificationCard, isDarkMode && styles.darkCard]}>
        <Icon name={iconName} size={22} color={iconColor} />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={[styles.notificationText, isDarkMode && styles.darkText]}>
            {item.message}
          </Text>
          <Text style={[styles.timestamp, isDarkMode && styles.darkSub]}>
            {dayjs(item.createdAt).fromNow()}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkBackground]}>
      <Text style={[styles.title, isDarkMode && styles.darkText]}>🔔 Notifications</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 20 }} />
      ) : notifications.length === 0 ? (
        <Text style={[styles.noNotifications, isDarkMode && styles.darkSub]}>
          You have no notifications.
        </Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </SafeAreaView>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F3F4F6',
  },
  darkBackground: {
    backgroundColor: '#0F172A',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1E293B',
  },
  darkText: {
    color: '#F8FAFC',
  },
  darkSub: {
    color: '#94A3B8',
  },
  noNotifications: {
    marginTop: 40,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
  },
  darkCard: {
    backgroundColor: '#1E293B',
  },
  notificationText: {
    fontSize: 15,
    color: '#1E293B',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#6B7280',
  },
});
