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
  Linking
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { getMarketplaceServices, getBanners } from '../services/supabase';

const { width } = Dimensions.get('window');

const filterChips = [
  { id: 'all', label: 'All' },
  { id: 'assignments', label: 'Assignments' },
  { id: 'projects', label: 'Projects' },
  { id: 'lab-manuals', label: 'Lab Manuals' },
  { id: 'eg-sheets', label: 'EG Sheets' },
  { id: 'development', label: 'Development' },
];

const features = [
  {
    id: 'f1',
    title: 'Fast Delivery',
    subtitle: 'On-time delivery\nguaranteed.',
    icon: 'flash',
    iconColor: '#3B82F6',
    bgColor: '#DBEAFE',
  },
  {
    id: 'f2',
    title: 'Student Friendly\nPricing',
    subtitle: 'Affordable prices\nfor every student.',
    icon: 'pricetag',
    iconColor: '#10B981',
    bgColor: '#D1FAE5',
  },
  {
    id: 'f3',
    title: 'Verified\nResources',
    subtitle: 'High quality &\nverified content.',
    icon: 'checkmark-circle',
    iconColor: '#F97316',
    bgColor: '#FFEDD5',
  },
  {
    id: 'f4',
    title: 'WhatsApp\nSupport',
    subtitle: '24x7 support\nfor all students.',
    icon: 'logo-whatsapp',
    iconColor: '#8B5CF6',
    bgColor: '#F3E8FF',
  },
];

export default function MarketplaceScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [services, setServices] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isFocused) {
      loadData();
    }
  }, [isFocused]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [servicesData, bannersData] = await Promise.all([
        getMarketplaceServices(),
        getBanners('marketplace')
      ]);
      setServices(servicesData || []);
      setBanners(bannersData || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = selectedFilter === 'all' 
    ? services 
    : services.filter(s => s.category?.toLowerCase() === selectedFilter.replace('-', ' '));

  const handleBannerPress = (url) => {
    if (url) {
      Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Marketplace</Text>
          <Text style={styles.headerSubtitle}>Academic Resources & Services</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Search')}>
            <Ionicons name="search-outline" size={24} color="#111827" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="funnel-outline" size={24} color="#111827" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Dynamic Banners */}
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
                activeOpacity={0.9}
                onPress={() => handleBannerPress(item.button_url)}
              >
                {item.image_url ? (
                  <Image source={{ uri: item.image_url }} style={StyleSheet.absoluteFillObject} />
                ) : (
                  <View style={styles.bannerContent}>
                    <Text style={styles.bannerTitle}>{item.title}</Text>
                    <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
                    {item.button_text ? (
                      <View style={styles.bannerButton}>
                        <Text style={styles.bannerButtonText}>{item.button_text}</Text>
                        <Ionicons name="arrow-forward" size={14} color="#111827" />
                      </View>
                    ) : null}
                  </View>
                )}
              </TouchableOpacity>
            )}
          />
        ) : (
          <View style={[styles.bannerContainer, { width: width - 32, backgroundColor: '#F3F4F6' }]}>
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>Need help with assignments, projects or lab manuals?</Text>
              <Text style={styles.bannerSubtitle}>Get them delivered quickly.</Text>
              
              <View style={styles.badgesContainer}>
                <View style={styles.badge}>
                  <Ionicons name="shield-checkmark-outline" size={12} color="#1E40AF" style={styles.badgeIcon} />
                  <Text style={styles.badgeText}>Trusted by Thousands</Text>
                </View>
                <View style={styles.badge}>
                  <Ionicons name="flash-outline" size={12} color="#1E40AF" style={styles.badgeIcon} />
                  <Text style={styles.badgeText}>On-time Delivery</Text>
                </View>
              </View>
            </View>
            <View style={styles.abstractShape1} />
            <View style={styles.abstractShape2} />
          </View>
        )}

        {/* Filter Chips */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {filterChips.map((chip) => {
              const isActive = selectedFilter === chip.id;
              return (
                <TouchableOpacity
                  key={chip.id}
                  style={[
                    styles.chip,
                    isActive ? styles.chipActive : styles.chipInactive
                  ]}
                  onPress={() => setSelectedFilter(chip.id)}
                >
                  <Text style={[
                    styles.chipText,
                    isActive ? styles.chipTextActive : styles.chipTextInactive
                  ]}>
                    {chip.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Services Grid */}
        {loading ? (
          <ActivityIndicator size="large" color="#2563EB" style={{ marginVertical: 40 }} />
        ) : (
          <View style={styles.servicesGrid}>
            {filteredServices.length === 0 ? (
              <Text style={{ textAlign: 'center', width: '100%', color: '#6B7280', marginVertical: 20 }}>No services found for this category.</Text>
            ) : (
              filteredServices.map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.serviceCard} 
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('ServiceDetail', { service: item })}
                >
                  {item.thumbnail_url ? (
                    <Image source={{ uri: item.thumbnail_url }} style={styles.cardImage} />
                  ) : (
                    <View style={[styles.cardIconContainer, { backgroundColor: '#F3E8FF' }]}>
                      <Ionicons name="cart-outline" size={28} color="#8B5CF6" />
                    </View>
                  )}
                  
                  <Text style={styles.cardTitle} numberOfLines={2} adjustsFontSizeToFit>{item.title}</Text>
                  
                  <View style={styles.priceContainer}>
                    <Text style={styles.cardPrice}>₹{item.price}</Text>
                  </View>
                  
                  <Text style={styles.cardSubtitleText} numberOfLines={2}>{item.description || 'Professional academic service.'}</Text>
  
                  <View style={{ flex: 1 }} />
  
                  <TouchableOpacity style={styles.viewDetailsButton} onPress={() => navigation.navigate('ServiceDetail', { service: item })}>
                    <Text style={styles.viewDetailsText}>Buy Now</Text>
                    <Ionicons name="chevron-forward" size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* Why Choose Campus Ninja? */}
        <Text style={styles.sectionTitle}>Why Choose Campus Ninja?</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.featuresScroll}
        >
          {features.map((feature) => (
            <View key={feature.id} style={styles.featureCard}>
              <View style={[styles.featureIconContainer, { backgroundColor: feature.bgColor }]}>
                <Ionicons name={feature.icon} size={28} color={feature.iconColor} />
              </View>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureSubtitle}>{feature.subtitle}</Text>
            </View>
          ))}
        </ScrollView>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 6,
    marginLeft: 8,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  bannerContainer: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    backgroundColor: '#1E3A8A',
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
    height: 180,
  },
  abstractShape1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#E0E7FF',
    top: -50,
    right: -80,
    zIndex: 0,
  },
  abstractShape2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E0E7FF',
    bottom: -30,
    right: 40,
    zIndex: 0,
  },
  bannerContent: {
    position: 'relative',
    zIndex: 1,
    maxWidth: '85%',
    flex: 1,
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    lineHeight: 28,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: '#4B5563',
    marginTop: 8,
  },
  bannerButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  bannerButtonText: {
    color: '#111827',
    fontWeight: '600',
    fontSize: 12,
    marginRight: 4,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DBEAFE',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  badgeIcon: {
    marginRight: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E40AF',
  },
  filterContainer: {
    marginTop: 20,
    marginBottom: 16,
  },
  filterScroll: {
    paddingHorizontal: 16,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  chipInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  chipTextInactive: {
    color: '#4B5563',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  serviceCard: {
    width: (width - 48) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    alignItems: 'center',
  },
  cardIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 6,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  pricePrefix: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
  },
  cardPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  cardSubtitleText: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
    minHeight: 28,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#2563EB',
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 16,
    marginTop: 12,
    marginBottom: 16,
  },
  featuresScroll: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  featureCard: {
    width: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    alignItems: 'center',
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 6,
    minHeight: 34,
  },
  featureSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
});
