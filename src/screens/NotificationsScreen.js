import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  Platform,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/colors';
import { supabase } from '../services/supabase';

export default function NotificationsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState([]);
  const [readIds, setReadIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      // Get stored read IDs
      const storedReads = await AsyncStorage.getItem('readNotificationIds');
      const parsedReads = storedReads ? new Set(JSON.parse(storedReads)) : new Set();
      setReadIds(parsedReads);

      const branchId = await AsyncStorage.getItem('userBranchId');
      const semesterId = await AsyncStorage.getItem('userSemesterId');

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching notifications:', error.message);
      } else if (data) {
        // Filter notifications applicable to user
        const applicable = data.filter((item) => {
          const matchBranch = !item.target_branch_id || item.target_branch_id === branchId;
          const matchSemester = !item.target_semester_id || item.target_semester_id === semesterId;
          return matchBranch && matchSemester;
        });

        // Format for UI
        const formatted = applicable.map((item) => {
          const date = new Date(item.created_at);
          const timeAgo = formatTimeAgo(date);
          const isRead = parsedReads.has(item.id);

          return {
            id: item.id,
            title: item.title || 'Notification',
            message: item.message || '',
            time: timeAgo,
            unread: !isRead,
            icon: 'notifications',
            color: '#FF6B00',
            bg: '#FFF7ED',
            rawDate: date,
          };
        });

        setNotifications(formatted);
      }
    } catch (e) {
      console.error('Exception fetching notifications:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffSeconds = Math.floor((now - date) / 1000);
    if (diffSeconds < 60) return 'Just now';
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  const markAllAsRead = async () => {
    const allIds = notifications.map((n) => n.id);
    const newReads = new Set([...readIds, ...allIds]);
    setReadIds(newReads);
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    await AsyncStorage.setItem('readNotificationIds', JSON.stringify(Array.from(newReads)));
  };

  const handleNotificationPress = async (item) => {
    // Mark single as read
    const newReads = new Set(readIds).add(item.id);
    setReadIds(newReads);
    setNotifications((prev) => prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n)));
    await AsyncStorage.setItem('readNotificationIds', JSON.stringify(Array.from(newReads)));

    Alert.alert(item.title, item.message);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.card, item.unread && styles.unreadCard]} 
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.8}
    >
      <View style={[styles.iconBox, { backgroundColor: item.bg }]}>
        <Ionicons name={item.icon} size={22} color={item.color} />
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, item.unread && styles.unreadText]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.cardTime}>{item.time}</Text>
        </View>
        <Text style={styles.cardMessage} numberOfLines={2}>
          {item.message}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {notifications.length > 0 && (
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={styles.markReadText}>Mark Read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Notifications List */}
      {loading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={[styles.listPadding, { paddingBottom: Math.max(insets.bottom, 20) + 20 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchNotifications(true)}
              colors={[COLORS.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="notifications-off-outline" size={64} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No notifications yet.</Text>
              <Text style={styles.emptySub}>We'll notify you when updates arrive!</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    padding: 6,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  markReadText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tabItem: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 10,
  },
  activeTabItem: {
    backgroundColor: '#0F172A',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  listPadding: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  unreadCard: {
    backgroundColor: '#FFFaf0',
    borderColor: '#FFEDD5',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
    marginRight: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
    marginRight: 6,
  },
  unreadText: {
    color: '#0F172A',
    fontWeight: '800',
  },
  cardTime: {
    fontSize: 11,
    color: '#94A3B8',
  },
  cardMessage: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  deleteBtn: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#475569',
    marginTop: 16,
  },
  emptySub: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
