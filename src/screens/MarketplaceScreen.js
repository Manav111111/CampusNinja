import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const filterChips = [
  { id: 'all', label: 'All' },
  { id: 'assignments', label: 'Assignments' },
  { id: 'projects', label: 'Projects' },
  { id: 'lab-manuals', label: 'Lab Manuals' },
  { id: 'eg-sheets', label: 'EG Sheets' },
  { id: 'development', label: 'Development' },
];

const services = [
  {
    id: '1',
    title: 'First Year Project',
    price: '₹299',
    subtitle: 'Ready-made\nacademic project.',
    icon: 'folder',
    iconColor: '#8B5CF6',
    bgColor: '#F3E8FF',
  },
  {
    id: '2',
    title: 'Assignment Help',
    price: '₹49',
    pricePrefix: 'Per assignment.',
    subtitle: 'Expert assistance\nfor assignments.',
    icon: 'pencil',
    iconColor: '#F97316',
    bgColor: '#FFEDD5',
  },
  {
    id: '3',
    title: 'Lab Manual Package',
    price: '₹99',
    subtitle: 'Complete\npractical file.',
    icon: 'flask',
    iconColor: '#10B981',
    bgColor: '#D1FAE5',
  },
  {
    id: '4',
    title: 'EG Sheet Bundle',
    price: '₹79',
    subtitle: 'Engineering\nGraphics sheets.',
    icon: 'compass',
    iconColor: '#EC4899',
    bgColor: '#FCE7F3',
  },
  {
    id: '5',
    title: 'Website Development',
    price: '₹999',
    pricePrefix: 'Starting',
    subtitle: 'Custom websites.',
    icon: 'globe',
    iconColor: '#3B82F6',
    bgColor: '#DBEAFE',
  },
  {
    id: '6',
    title: 'App Development',
    price: '₹1499',
    pricePrefix: 'Starting',
    subtitle: 'Custom Android apps.',
    icon: 'phone-portrait',
    iconColor: '#6366F1',
    bgColor: '#E0E7FF',
  },
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
  const [selectedFilter, setSelectedFilter] = useState('all');

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
        
        {/* Hero Banner */}
        <View style={styles.bannerContainer}>
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
          
          {/* Decorative shapes to represent the 3D graphic area */}
          <View style={styles.abstractShape1} />
          <View style={styles.abstractShape2} />
        </View>

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
        <View style={styles.servicesGrid}>
          {services.map((item) => (
            <TouchableOpacity key={item.id} style={styles.serviceCard} activeOpacity={0.8}>
              <View style={[styles.cardIconContainer, { backgroundColor: item.bgColor }]}>
                <Ionicons name={item.icon} size={28} color={item.iconColor} />
              </View>
              
              <Text style={styles.cardTitle} numberOfLines={2} adjustsFontSizeToFit>{item.title}</Text>
              
              <View style={styles.priceContainer}>
                {item.pricePrefix && item.pricePrefix !== 'Per assignment.' && (
                  <Text style={styles.pricePrefix}>{item.pricePrefix} </Text>
                )}
                <Text style={styles.cardPrice}>{item.price}</Text>
              </View>
              
              {item.pricePrefix === 'Per assignment.' && (
                <Text style={styles.cardSubtitleText}>{item.pricePrefix}</Text>
              )}
              {item.pricePrefix !== 'Per assignment.' && (
                <Text style={styles.cardSubtitleText}>{item.subtitle}</Text>
              )}

              <View style={{ flex: 1 }} />

              <TouchableOpacity style={styles.viewDetailsButton}>
                <Text style={styles.viewDetailsText}>View Details</Text>
                <Ionicons name="chevron-forward" size={14} color="#2563EB" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

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
    backgroundColor: '#F3F4F6',
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
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
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    lineHeight: 30,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 8,
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
    width: (width - 48) / 2, // 2 columns with 16 padding on edges and 16 between
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
    borderWidth: 1,
    borderColor: '#DBEAFE',
    backgroundColor: '#FFFFFF',
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
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
