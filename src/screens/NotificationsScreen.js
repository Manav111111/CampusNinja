import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  Platform,
  Alert 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

const INITIAL_NOTIFICATIONS = [
  {
    id: '1',
    title: '🎉 Welcome to Campus Ninja v1.0!',
    message: 'Your all-in-one academic companion is ready. Check out the new Marketplace for instant lab & assignment help.',
    time: '2 hours ago',
    type: 'system',
    unread: true,
    icon: 'rocket',
    color: '#3B82F6',
    bg: '#DBEAFE',
  },
  {
    id: '2',
    title: '⚡ Order #104 Confirmed',
    message: 'We have received your request for "Engineering Drawing Sheets". A ninja expert has been assigned.',
    time: '5 hours ago',
    type: 'order',
    unread: true,
    icon: 'cart',
    color: '#8B5CF6',
    bg: '#F3E8FF',
  },
  {
    id: '3',
    title: '📚 New PYQs Uploaded',
    message: 'Previous 5 year solved question papers for Semester 2 Applied Mathematics are now available.',
    time: '1 day ago',
    type: 'academic',
    unread: false,
    icon: 'document-text',
    color: '#F97316',
    bg: '#FFEDD5',
  },
  {
    id: '4',
    title: '🔥 Mid-Sem Exam Alert',
    message: 'Prepare faster with our concise 1-page revision formula notes. Best of luck for your exams!',
    time: '2 days ago',
    type: 'academic',
    unread: false,
    icon: 'flame',
    color: '#EF4444',
    bg: '#FEE2E2',
  },
  {
    id: '5',
    title: '🎁 WhatsApp Community Invite',
    message: 'Join 5,000+ engineers from your campus on WhatsApp for daily job alerts, notes & doubts discussion.',
    time: '3 days ago',
    type: 'system',
    unread: false,
    icon: 'logo-whatsapp',
    color: '#10B981',
    bg: '#D1FAE5',
  },
];

export default function NotificationsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState('All'); // All, Orders, Academic

  const filteredNotifications = notifications.filter((item) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Orders') return item.type === 'order';
    if (activeTab === 'Academic') return item.type === 'academic';
    return true;
  });

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleNotificationPress = (item) => {
    // Mark as read
    setNotifications((prev) => prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n)));
    
    // Navigate based on type
    if (item.type === 'order') {
      navigation.navigate('MyOrders');
    } else if (item.type === 'academic') {
      navigation.navigate('Subjects');
    } else {
      Alert.alert(item.title, item.message);
    }
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

      <TouchableOpacity 
        style={styles.deleteBtn} 
        onPress={() => deleteNotification(item.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="close-circle-outline" size={20} color="#94A3B8" />
      </TouchableOpacity>
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
        <TouchableOpacity onPress={markAllAsRead}>
          <Text style={styles.markReadText}>Mark Read</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabBar}>
        {['All', 'Orders', 'Academic'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabItem, activeTab === tab && styles.activeTabItem]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Notifications List */}
      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={64} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No Notifications Here</Text>
            <Text style={styles.emptySub}>You are all caught up!</Text>
          </View>
        }
      />
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
});
