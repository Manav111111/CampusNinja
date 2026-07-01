import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity,
  Dimensions,
  Image,
  ActivityIndicator,
  FlatList,
  Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { getMarketplaceServices, getBanners } from '../services/supabase';
import { useCart } from '../context/CartContext';
import { Toast } from '../context/ToastContext';

const { width } = Dimensions.get('window');

const filterChips = [
  { id: 'all', label: 'All' },
  { id: 'assignments', label: 'Assignments' },
  { id: 'projects', label: 'Projects' },
  { id: 'lab-manuals', label: 'Lab Manuals' },
  { id: 'drafting-kits', label: 'Drafting Kits' },
  { id: 'eg-sheets', label: 'EG Sheets' },
  { id: 'notes', label: 'Notes' },
  { id: 'calculators', label: 'Calculators' },
];

export default function MarketplaceScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const { addToCart, getTotalItems } = useCart();
  
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [services, setServices] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState({});

  useEffect(() => {
    if (isFocused) {
      loadData();
    }
  }, [isFocused]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [servicesData, bannersData] = await Promise.all([
        getMarketplaceServices().catch(() => []),
        getBanners('marketplace').catch(() => [])
      ]);
      setServices(servicesData || []);
      setBanners(bannersData || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (id) => {
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddToCart = (item) => {
    addToCart(item, 1);
    Toast.show({
      type: 'success',
      title: 'Added to Cart',
      message: `${item.title || item.name} added to your cart.`,
      actionText: 'View Cart',
      onAction: () => navigation.navigate('Cart'),
    });
  };

  const filteredServices = selectedFilter === 'all' 
    ? services 
    : services.filter(s => {
        const cat = (s.category || '').toLowerCase();
        const target = selectedFilter.replace('-', ' ');
        return cat.includes(target) || target.includes(cat);
      });

  const cartItemCount = getTotalItems();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Campus Store</Text>
          <Text style={styles.headerSubtitle}>Student Essentials & Academic Support</Text>
        </View>
        
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Search')}>
            <Ionicons name="search-outline" size={22} color="#111827" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.cartButton} onPress={() => navigation.navigate('Cart')}>
            <Ionicons name="cart" size={22} color="#111827" />
            {cartItemCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom + 90, 120) }]}>
        
        {/* Banner Section */}
        {banners.length > 0 ? (
          <FlatList
            data={banners}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[styles.bannerContainer, { width: width - 32 }]}
                activeOpacity={0.95}
                onPress={() => item.button_url && navigation.navigate('ServiceDetail', { service: item })}
              >
                {item.image_url ? (
                  <Image source={{ uri: item.image_url }} style={StyleSheet.absoluteFillObject} />
                ) : (
                  <View style={styles.bannerContent}>
                    <Text style={styles.bannerTitle}>{item.title}</Text>
                    <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
                    <View style={styles.bannerButton}>
                      <Text style={styles.bannerButtonText}>{item.button_text || 'Explore Now'}</Text>
                      <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            )}
          />
        ) : (
          <View style={[styles.heroBanner, { width: width - 32 }]}>
            <View style={styles.heroTextContent}>
              <View style={styles.heroTag}>
                <Text style={styles.heroTagText}>⚡ INSTANT STUDENT SUPPORT</Text>
              </View>
              <Text style={styles.heroTitle}>All Academic Essentials Delivered</Text>
              <Text style={styles.heroSubtitle}>Lab Manuals, Projects, EG Sheets & High Quality Notes</Text>
            </View>
            <Ionicons name="cube" size={80} color="#FFF7ED" style={styles.heroIcon} />
          </View>
        )}

        {/* Categories Chips */}
        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {filterChips.map((chip) => {
              const isActive = selectedFilter === chip.id;
              return (
                <TouchableOpacity
                  key={chip.id}
                  style={[styles.chip, isActive ? styles.chipActive : styles.chipInactive]}
                  onPress={() => setSelectedFilter(chip.id)}
                >
                  <Text style={[styles.chipText, isActive ? styles.chipTextActive : styles.chipTextInactive]}>
                    {chip.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Product Grid */}
        {loading ? (
          <ActivityIndicator size="large" color="#FF6B00" style={{ marginVertical: 60 }} />
        ) : (
          <View style={styles.productsGrid}>
            {filteredServices.length === 0 ? (
              <View style={styles.emptyGrid}>
                <Ionicons name="bag-handle-outline" size={48} color="#D1D5DB" />
                <Text style={styles.emptyGridTitle}>No items found</Text>
                <Text style={styles.emptyGridSubtitle}>Check back soon for new additions in this category.</Text>
              </View>
            ) : (
              filteredServices.map((item) => {
                const isFav = favorites[item.id];
                const price = item.price || item.original_price || 99;
                return (
                  <TouchableOpacity 
                    key={item.id} 
                    style={styles.productCard} 
                    activeOpacity={0.9}
                    onPress={() => navigation.navigate('ServiceDetail', { service: item })}
                  >
                    {/* Thumbnail box */}
                    <View style={styles.imageBox}>
                      {item.thumbnail_url || item.image ? (
                        <Image source={{ uri: item.thumbnail_url || item.image }} style={styles.productImage} />
                      ) : (
                        <View style={styles.placeholderImage}>
                          <Ionicons name="cube-outline" size={40} color="#FF6B00" />
                        </View>
                      )}
                      
                      {/* Heart Button */}
                      <TouchableOpacity 
                        style={styles.heartButton} 
                        onPress={() => toggleFavorite(item.id)}
                      >
                        <Ionicons 
                          name={isFav ? "heart" : "heart-outline"} 
                          size={18} 
                          color={isFav ? "#EF4444" : "#6B7280"} 
                        />
                      </TouchableOpacity>

                      {/* Stock Badge */}
                      <View style={styles.stockBadge}>
                        <Text style={styles.stockText}>IN STOCK</Text>
                      </View>
                    </View>

                    {/* Content */}
                    <View style={styles.cardContent}>
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryBadgeText}>{item.category || 'Essential'}</Text>
                      </View>

                      <Text style={styles.productName} numberOfLines={2}>{item.title || item.name}</Text>

                      <View style={styles.priceRow}>
                        <Text style={styles.productPrice}>₹{price}</Text>
                        
                        <TouchableOpacity 
                          style={styles.addCartBtn}
                          onPress={() => handleAddToCart(item)}
                        >
                          <Ionicons name="add" size={18} color="#FFFFFF" />
                          <Text style={styles.addCartText}>ADD</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}
      </ScrollView>
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
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    marginRight: 10,
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
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  bannerContainer: {
    height: 150,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#111827',
    marginBottom: 20,
  },
  bannerContent: {
    padding: 20,
    justifyContent: 'center',
    flex: 1,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: '#D1D5DB',
    marginBottom: 14,
  },
  bannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B00',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  bannerButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginRight: 4,
  },
  heroBanner: {
    height: 150,
    borderRadius: 20,
    backgroundColor: '#FF6B00',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    overflow: 'hidden',
  },
  heroTextContent: {
    flex: 1,
    zIndex: 2,
  },
  heroTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  heroTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 12,
    color: '#FFF7ED',
  },
  heroIcon: {
    position: 'absolute',
    right: -10,
    bottom: -15,
    opacity: 0.25,
  },
  filterSection: {
    marginBottom: 18,
  },
  filterScroll: {
    paddingRight: 16,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: '#111827',
  },
  chipInactive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  chipTextInactive: {
    color: '#4B5563',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: (width - 44) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  imageBox: {
    width: '100%',
    height: 130,
    backgroundColor: '#F9FAFB',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF7ED',
  },
  heartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  stockBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(17, 24, 39, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  stockText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  cardContent: {
    padding: 12,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 6,
  },
  categoryBadgeText: {
    color: '#FF6B00',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
    height: 38,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  addCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B00',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addCartText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 2,
  },
  emptyGrid: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyGridTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginTop: 12,
  },
  emptyGridSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
});
