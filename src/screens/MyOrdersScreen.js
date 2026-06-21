import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { supabase, getUserOrders } from '../services/supabase';
import { getCurrentSession } from '../services/auth';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#F59E0B', bg: '#FEF3C7', icon: 'time-outline' },
  contacted: { label: 'Contacted', color: '#3B82F6', bg: '#DBEAFE', icon: 'chatbubble-outline' },
  in_progress: { label: 'In Progress', color: '#8B5CF6', bg: '#F3E8FF', icon: 'construct-outline' },
  completed: { label: 'Completed', color: '#059669', bg: '#D1FAE5', icon: 'checkmark-circle-outline' },
  cancelled: { label: 'Cancelled', color: '#EF4444', bg: '#FEE2E2', icon: 'close-circle-outline' },
};

const OrderCard = ({ order }) => {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const product = order.products;
  const date = new Date(order.created_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <TouchableOpacity 
      style={styles.orderCard} 
      activeOpacity={0.8}
      onPress={() => setExpanded(!expanded)}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderTitle} numberOfLines={1}>
            {product?.title || 'Order'}
          </Text>
          <Text style={styles.orderDate}>{date}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <Ionicons name={status.icon} size={12} color={status.color} style={{ marginRight: 4 }} />
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>

      <View style={styles.orderPriceRow}>
        <Text style={styles.orderPrice}>₹{product?.price || order.requirement}</Text>
        <View style={styles.codTag}>
          <Ionicons name="cash-outline" size={12} color="#059669" />
          <Text style={styles.codTagText}>COD</Text>
        </View>
      </View>

      {expanded && (
        <View style={styles.expandedSection}>
          <View style={styles.divider} />
          
          {order.instructions ? (
            <View style={styles.detailRow}>
              <Ionicons name="create-outline" size={16} color="#6B7280" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Instructions</Text>
                <Text style={styles.detailValue}>{order.instructions}</Text>
              </View>
            </View>
          ) : null}

          {order.college_name ? (
            <View style={styles.detailRow}>
              <Ionicons name="school-outline" size={16} color="#6B7280" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>College</Text>
                <Text style={styles.detailValue}>{order.college_name}</Text>
              </View>
            </View>
          ) : null}

          {order.address ? (
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={16} color="#6B7280" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Delivery Address</Text>
                <Text style={styles.detailValue}>{order.address}</Text>
              </View>
            </View>
          ) : null}

          {order.file_url ? (
            <TouchableOpacity 
              style={styles.fileLink}
              onPress={() => Linking.openURL(order.file_url).catch(() => {})}
            >
              <Ionicons name="document-text" size={16} color="#2563EB" />
              <Text style={styles.fileLinkText}>View Uploaded File</Text>
              <Ionicons name="open-outline" size={14} color="#2563EB" />
            </TouchableOpacity>
          ) : null}
        </View>
      )}

      <View style={styles.expandHint}>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );
};

export default function MyOrdersScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    let mounted = true;

    getCurrentSession()
      .then((session) => {
        if (!mounted) return;
        setUserId(session?.user?.id || null);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to load auth session:', error);
        if (mounted) setLoading(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      setUserId(session?.user?.id || null);
      if (!session?.user) {
        setOrders([]);
        setLoading(false);
        setRefreshing(false);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isFocused && userId) {
      loadOrders();
    }
  }, [isFocused, userId]);

  const loadOrders = async () => {
    if (!userId) {
      setOrders([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getUserOrders(userId);
      setOrders(data || []);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 60 }} />
      ) : orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBg}>
            <Ionicons name="bag-outline" size={48} color="#9CA3AF" />
          </View>
          <Text style={styles.emptyTitle}>No Orders Yet</Text>
          <Text style={styles.emptySubtitle}>
            Your orders will appear here once you place one from the Marketplace.
          </Text>
          <TouchableOpacity 
            style={styles.browseButton}
            onPress={() => navigation.navigate('MainApp', { screen: 'Marketplace' })}
          >
            <Text style={styles.browseButtonText}>Browse Marketplace</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <OrderCard order={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8,
    paddingVertical: 12, backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  backButton: { padding: 8 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: 'bold', color: '#111827', textAlign: 'center' },
  listContent: { padding: 16 },
  // Order Card
  orderCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#F3F4F6',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderInfo: { flex: 1, marginRight: 12 },
  orderTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  orderDate: { fontSize: 12, color: '#9CA3AF' },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
  },
  statusText: { fontSize: 11, fontWeight: '600' },
  orderPriceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  orderPrice: { fontSize: 18, fontWeight: 'bold', color: '#2563EB', marginRight: 10 },
  codTag: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  codTagText: { fontSize: 10, fontWeight: '600', color: '#059669', marginLeft: 4 },
  // Expanded
  expandedSection: { marginTop: 12 },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginBottom: 12 },
  detailRow: { flexDirection: 'row', marginBottom: 12 },
  detailContent: { flex: 1, marginLeft: 10 },
  detailLabel: { fontSize: 11, color: '#9CA3AF', marginBottom: 2 },
  detailValue: { fontSize: 13, color: '#374151', lineHeight: 18 },
  fileLink: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF',
    padding: 12, borderRadius: 10,
  },
  fileLinkText: { flex: 1, fontSize: 13, fontWeight: '600', color: '#2563EB', marginLeft: 8 },
  expandHint: { alignItems: 'center', marginTop: 4 },
  // Empty State
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyIconBg: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#F3F4F6',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  browseButton: {
    backgroundColor: '#2563EB', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 12,
  },
  browseButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
});
