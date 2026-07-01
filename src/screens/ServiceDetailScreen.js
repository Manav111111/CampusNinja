import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity,
  Image,
  Dimensions,
  Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { getMarketplaceServices, getDeliverySettings } from '../services/supabase';
import { Toast } from '../context/ToastContext';

const { width } = Dimensions.get('window');

export default function ServiceDetailScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { service } = route.params;
  const { addToCart, getTotalItems } = useCart();

  const [relatedProducts, setRelatedProducts] = useState([]);
  const [deliveryInfo, setDeliveryInfo] = useState({ deliveryFee: 49, freeDeliveryThreshold: 499 });

  useEffect(() => {
    loadSupplementaryData();
  }, [service]);

  const loadSupplementaryData = async () => {
    try {
      const [allServices, settings] = await Promise.all([
        getMarketplaceServices().catch(() => []),
        getDeliverySettings().catch(() => ({ deliveryFee: 49, freeDeliveryThreshold: 499 }))
      ]);
      setDeliveryInfo(settings);
      
      // Filter related by same category or exclude current
      const related = (allServices || []).filter(item => item.id !== service.id).slice(0, 4);
      setRelatedProducts(related);
    } catch (e) {
      console.log('Error loading details supplementary data:', e);
    }
  };

  const handleAddToCart = () => {
    addToCart(service, 1);
    Toast.show({
      type: 'success',
      title: 'Added to Cart',
      message: `${service.title || service.name} added to your cart.`,
      actionText: 'View Cart',
      onAction: () => navigation.navigate('Cart'),
    });
  };

  const handleBuyNow = () => {
    addToCart(service, 1);
    navigation.navigate('Cart');
  };

  const price = service.price || service.original_price || 99;
  const cartItemCount = getTotalItems();

  // Parse what's included or default
  const whatsIncluded = service.whats_included || [
    'Complete verified solution / item',
    'Proper formatting & student guidelines followed',
    'Instant WhatsApp assistance & order support',
    'Quality review prior to delivery'
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      
      {/* Top Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle} numberOfLines={1}>Product Details</Text>

        <TouchableOpacity style={styles.cartButton} onPress={() => navigation.navigate('Cart')}>
          <Ionicons name="cart" size={22} color="#111827" />
          {cartItemCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom + 90, 120) }]}>
        
        {/* Large Product Hero Image */}
        <View style={styles.heroImageContainer}>
          {service.thumbnail_url || service.image ? (
            <Image source={{ uri: service.thumbnail_url || service.image }} style={styles.heroImage} />
          ) : (
            <View style={styles.heroPlaceholder}>
              <Ionicons name="cube-outline" size={80} color="#FF6B00" />
            </View>
          )}
          <View style={styles.inStockBadge}>
            <Text style={styles.inStockText}>✓ IN STOCK</Text>
          </View>
        </View>

        {/* Basic Details Box */}
        <View style={styles.detailsBox}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{service.category || 'Essential'}</Text>
          </View>

          <Text style={styles.productTitle}>{service.title || service.name}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceText}>₹{price}</Text>
            <Text style={styles.priceSubtext}>inclusive of all taxes</Text>
          </View>
        </View>

        {/* Delivery Information Banner */}
        <View style={styles.deliveryBanner}>
          <View style={styles.deliveryIconBox}>
            <Ionicons name="bicycle" size={24} color="#FF6B00" />
          </View>
          <View style={styles.deliveryTextContainer}>
            <Text style={styles.deliveryBannerTitle}>Quick Delivery Available</Text>
            <Text style={styles.deliveryBannerSubtitle}>
              Standard Delivery Fee: ₹{deliveryInfo.deliveryFee}. {'\n'}
              {deliveryInfo.freeDeliveryThreshold > 0 ? `FREE Delivery on orders above ₹${deliveryInfo.freeDeliveryThreshold}!` : ''}
            </Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Description</Text>
          <Text style={styles.descriptionText}>
            {service.description || "High quality academic resource meticulously curated for campus students. Perfectly adheres to university standards and ensures top academic results."}
          </Text>
        </View>

        {/* What's Included */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>What's Included</Text>
          {Array.isArray(whatsIncluded) ? whatsIncluded.map((point, index) => (
            <View key={index} style={styles.includedRow}>
              <Ionicons name="checkmark-circle" size={18} color="#10B981" style={styles.includedIcon} />
              <Text style={styles.includedText}>{point}</Text>
            </View>
          )) : (
            <Text style={styles.includedText}>{whatsIncluded}</Text>
          )}
        </View>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <View style={styles.relatedSection}>
            <Text style={styles.sectionHeading}>Related Student Essentials</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.relatedScroll}>
              {relatedProducts.map(rel => (
                <TouchableOpacity 
                  key={rel.id} 
                  style={styles.relatedCard}
                  activeOpacity={0.9}
                  onPress={() => navigation.push('ServiceDetail', { service: rel })}
                >
                  <View style={styles.relatedImageBox}>
                    {rel.thumbnail_url || rel.image ? (
                      <Image source={{ uri: rel.thumbnail_url || rel.image }} style={styles.relatedImage} />
                    ) : (
                      <Ionicons name="cube-outline" size={28} color="#FF6B00" />
                    )}
                  </View>
                  <Text style={styles.relatedTitle} numberOfLines={2}>{rel.title || rel.name}</Text>
                  <Text style={styles.relatedPrice}>₹{rel.price || rel.original_price || 99}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* Sticky Dual Action Bar */}
      <View style={[styles.stickyBottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity 
          style={styles.addToCartButton} 
          activeOpacity={0.85}
          onPress={handleAddToCart}
        >
          <Ionicons name="cart-outline" size={20} color="#111827" />
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.buyNowButton} 
          activeOpacity={0.85}
          onPress={handleBuyNow}
        >
          <Text style={styles.buyNowText}>Buy Now</Text>
          <Ionicons name="flash" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
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
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  iconButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  cartButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF6B00',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 16,
  },
  heroImageContainer: {
    width: '100%',
    height: width * 0.75,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF7ED',
  },
  inStockBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: '#111827',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  inStockText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  detailsBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  categoryBadgeText: {
    color: '#FF6B00',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  productTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
    lineHeight: 28,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FF6B00',
  },
  priceSubtext: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 8,
  },
  deliveryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  deliveryIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  deliveryTextContainer: {
    flex: 1,
  },
  deliveryBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9A3412',
    marginBottom: 2,
  },
  deliveryBannerSubtitle: {
    fontSize: 12,
    color: '#C2410C',
    lineHeight: 16,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
  },
  includedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  includedIcon: {
    marginRight: 10,
  },
  includedText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  relatedSection: {
    marginTop: 8,
    marginBottom: 20,
  },
  relatedScroll: {
    paddingTop: 4,
  },
  relatedCard: {
    width: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  relatedImageBox: {
    width: 120,
    height: 90,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  relatedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  relatedTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    height: 34,
  },
  relatedPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FF6B00',
  },
  stickyBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 12,
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 14,
    marginRight: 10,
  },
  addToCartText: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 6,
  },
  buyNowButton: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B00',
    paddingVertical: 14,
    borderRadius: 14,
  },
  buyNowText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginRight: 6,
  },
});
