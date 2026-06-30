import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Alert 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { getDeliverySettings } from '../services/supabase';

export default function CartScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { cartItems, updateQuantity, removeFromCart, getSubtotal } = useCart();
  const [deliverySettings, setDeliverySettings] = useState({ deliveryFee: 49, freeDeliveryThreshold: 499 });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const settings = await getDeliverySettings();
    setDeliverySettings(settings);
  };

  const subtotal = getSubtotal();
  const isFreeDelivery = deliverySettings.freeDeliveryThreshold > 0 && subtotal >= deliverySettings.freeDeliveryThreshold;
  const deliveryFee = subtotal === 0 ? 0 : (isFreeDelivery ? 0 : deliverySettings.deliveryFee);
  const grandTotal = subtotal + deliveryFee;

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Cart Empty', 'Please add items to your cart before proceeding.');
      return;
    }
    // Pass cart items summary to OrderRequestScreen
    navigation.navigate('OrderRequest', { 
      isCartCheckout: true,
      cartItems,
      subtotal,
      deliveryFee,
      grandTotal
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Shopping Cart</Text>
        <View style={{ width: 40 }} />
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBox}>
            <Ionicons name="cart-outline" size={64} color="#D1D5DB" />
          </View>
          <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
          <Text style={styles.emptySubtitle}>Explore student essentials and add items to your cart!</Text>
          <TouchableOpacity 
            style={styles.exploreButton}
            onPress={() => navigation.navigate('MainApp', { screen: 'Marketplace' })}
          >
            <Text style={styles.exploreButtonText}>Browse Marketplace</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Delivery threshold notice */}
            {deliverySettings.freeDeliveryThreshold > 0 && (
              <View style={[styles.deliveryNotice, isFreeDelivery ? styles.deliveryNoticeSuccess : styles.deliveryNoticeInfo]}>
                <Ionicons 
                  name={isFreeDelivery ? "checkmark-circle" : "sparkles"} 
                  size={20} 
                  color={isFreeDelivery ? "#10B981" : "#FF6B00"} 
                />
                <Text style={[styles.deliveryNoticeText, { color: isFreeDelivery ? "#065F46" : "#9A3412" }]}>
                  {isFreeDelivery 
                    ? "Yay! You unlocked FREE Delivery on this order." 
                    : `Add items worth ₹${deliverySettings.freeDeliveryThreshold - subtotal} more for FREE delivery.`
                  }
                </Text>
              </View>
            )}

            {/* Cart Items List */}
            <View style={styles.itemsList}>
              {cartItems.map(item => {
                const product = item.product;
                const price = parseFloat(product.price || product.original_price || 0);
                return (
                  <View key={product.id} style={styles.itemCard}>
                    {product.thumbnail_url || product.image ? (
                      <Image source={{ uri: product.thumbnail_url || product.image }} style={styles.itemImage} />
                    ) : (
                      <View style={styles.itemImagePlaceholder}>
                        <Ionicons name="cube-outline" size={32} color="#FF6B00" />
                      </View>
                    )}

                    <View style={styles.itemDetails}>
                      <Text style={styles.itemTitle} numberOfLines={2}>{product.title || product.name}</Text>
                      <Text style={styles.itemCategory}>{product.category || 'Essential'}</Text>
                      <Text style={styles.itemPrice}>₹{price}</Text>
                    </View>

                    <View style={styles.itemActions}>
                      <TouchableOpacity 
                        style={styles.deleteButton} 
                        onPress={() => removeFromCart(product.id)}
                      >
                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                      </TouchableOpacity>

                      <View style={styles.qtyContainer}>
                        <TouchableOpacity 
                          style={styles.qtyBtn} 
                          onPress={() => updateQuantity(product.id, -1)}
                        >
                          <Ionicons name="remove" size={16} color="#111827" />
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>{item.quantity}</Text>
                        <TouchableOpacity 
                          style={styles.qtyBtn} 
                          onPress={() => updateQuantity(product.id, 1)}
                        >
                          <Ionicons name="add" size={16} color="#111827" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Price Summary Section */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Bill Details</Text>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Item Subtotal</Text>
                <Text style={styles.summaryValue}>₹{subtotal}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery Fee</Text>
                {isFreeDelivery ? (
                  <Text style={[styles.summaryValue, { color: '#10B981', fontWeight: 'bold' }]}>FREE</Text>
                ) : (
                  <Text style={styles.summaryValue}>₹{deliveryFee}</Text>
                )}
              </View>

              <View style={styles.divider} />

              <View style={styles.summaryRow}>
                <Text style={styles.grandTotalLabel}>Grand Total</Text>
                <Text style={styles.grandTotalValue}>₹{grandTotal}</Text>
              </View>
            </View>
          </ScrollView>

          {/* Sticky Bottom Bar */}
          <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <View>
              <Text style={styles.bottomTotalLabel}>Total to Pay</Text>
              <Text style={styles.bottomTotalAmount}>₹{grandTotal}</Text>
            </View>
            <TouchableOpacity style={styles.checkoutButton} onPress={handleProceedToCheckout}>
              <Text style={styles.checkoutText}>Proceed to Checkout</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
  },
  deliveryNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  deliveryNoticeInfo: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FFEDD5',
  },
  deliveryNoticeSuccess: {
    backgroundColor: '#ECFDF5',
    borderColor: '#D1FAE5',
  },
  deliveryNoticeText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  itemsList: {
    marginBottom: 16,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    alignItems: 'center',
  },
  itemImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  itemImagePlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FF6B00',
  },
  itemActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 72,
  },
  deleteButton: {
    padding: 4,
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  qtyBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  qtyText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    marginHorizontal: 8,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    my: 10,
    marginVertical: 10,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FF6B00',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10,
  },
  bottomTotalLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  bottomTotalAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B00',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  checkoutText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginRight: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIconBox: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  exploreButton: {
    backgroundColor: '#111827',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
