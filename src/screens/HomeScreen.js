import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, FlatList, Dimensions, ActivityIndicator, Linking, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { getBanners, getSubjects, getMarketplaceServices, supabase } from '../services/supabase';
import { getCurrentSession } from '../services/auth';

// Components
import QuickAccessCard from '../components/QuickAccessCard';
import SubjectCard from '../components/SubjectCard';
import WhatsAppBanner from '../components/WhatsAppBanner';

const { width } = Dimensions.get('window');

// Dummy Fallback Data
const fallbackSubjects = [
  { id: 'sub-1', title: 'Physics', icon: 'aperture-outline', color: '#8B5CF6' },
  { id: 'sub-2', title: 'Mathematics', icon: 'grid-outline', color: '#10B981' },
  { id: 'sub-3', title: 'Programming in C', icon: 'code-slash-outline', color: '#F97316' },
  { id: 'sub-4', title: 'Electrical Engg.', icon: 'flash-outline', color: '#F59E0B' },
  { id: 'sub-5', title: 'Communication', icon: 'chatbubble-ellipses-outline', color: '#3B82F6' },
];

const fallbackMarketplace = [
  { id: 'm-1', title: 'Custom College Assignments', price: '149', category: 'Assignments', badge: '⚡ 24h Delivery', color: '#3B82F6' },
  { id: 'm-2', title: 'Complete Lab Manual Solutions', price: '99', category: 'Lab Manuals', badge: '⭐ Verified', color: '#10B981' },
  { id: 'm-3', title: 'Final Year Minor / Major Projects', price: '499', category: 'Projects', badge: '🔥 Best Seller', color: '#F97316' },
];

const SectionHeader = ({ title, subtitle, showViewAll = false, onViewAll }) => (
  <View style={styles.sectionHeader}>
    <View>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
    </View>
    {showViewAll && (
      <TouchableOpacity onPress={onViewAll} style={styles.viewAllButton}>
        <Text style={styles.viewAll}>Explore All</Text>
        <Ionicons name="arrow-forward" size={14} color={COLORS.primary} style={{ marginLeft: 4 }} />
      </TouchableOpacity>
    )}
  </View>
);

const isValidUUID = (uuid) => {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return typeof uuid === 'string' && regex.test(uuid);
};

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  
  const [branchName, setBranchName] = useState('');
  const [semesterNum, setSemesterNum] = useState('');
  const [banners, setBanners] = useState([]);
  const [mySubjects, setMySubjects] = useState([]);
  const [marketplaceItems, setMarketplaceItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    if (isFocused) {
      loadHomeData();
    }
  }, [isFocused]);

  useEffect(() => {
    getCurrentSession()
      .then((session) => {
        if (session?.user?.user_metadata?.full_name) {
          setUserName(session.user.user_metadata.full_name.split(' ')[0]);
        }
      })
      .catch(() => {});

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user?.user_metadata?.full_name) {
        setUserName(session.user.user_metadata.full_name.split(' ')[0]);
      } else {
        setUserName('');
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      const bId = await AsyncStorage.getItem('userBranchId');
      const sId = await AsyncStorage.getItem('userSemesterId');
      const bName = await AsyncStorage.getItem('userBranchName');
      const sNum = await AsyncStorage.getItem('userSemesterNumber');
      
      if ((bId && !isValidUUID(bId)) || (sId && !isValidUUID(sId))) {
        await AsyncStorage.removeItem('userBranchId');
        await AsyncStorage.removeItem('userSemesterId');
        await AsyncStorage.removeItem('userBranchName');
        await AsyncStorage.removeItem('userSemesterNumber');
        navigation.replace('AcademicSetup');
        return;
      }

      if (bName) setBranchName(bName);
      if (sNum) setSemesterNum(sNum);

      const [bannersData, subjectsData, marketData] = await Promise.all([
        getBanners(),
        (bId && sId && isValidUUID(bId) && isValidUUID(sId)) 
          ? getSubjects(bId, sId) 
          : Promise.resolve([]),
        getMarketplaceServices()
      ]);

      setBanners(bannersData || []);
      setMySubjects(subjectsData || []);
      setMarketplaceItems(marketData || []);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const handleBannerPress = (url) => {
    if (url) {
      Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Top App Bar */}
        <View style={styles.header}>
          <View style={styles.brandContainer}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>⚡</Text>
            </View>
            <Text style={styles.brandTitle}>Campus<Text style={{ color: COLORS.primary }}>Ninja</Text></Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Notifications')}>
              <Ionicons name="notifications-outline" size={22} color="#1E293B" />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.avatarButton} onPress={() => navigation.navigate('Profile')}>
              <Ionicons name="person" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Greeting & Academic Capsule */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingText}>Hello, {userName || 'Ninja'} ✨</Text>
          <TouchableOpacity 
            style={styles.academicCapsule} 
            activeOpacity={0.8}
            onPress={() => navigation.navigate('AcademicSetup')}
          >
            <Ionicons name="school" size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
            <Text style={styles.capsuleText}>
              {branchName ? `B.Tech ${branchName}` : 'Select Branch'} • {semesterNum ? `Sem ${semesterNum}` : 'Sem'}
            </Text>
            <Ionicons name="chevron-down" size={14} color="#64748B" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

        {/* Floating Search Bar */}
        <TouchableOpacity style={styles.searchContainer} activeOpacity={0.9} onPress={() => navigation.navigate('Search')}>
          <Ionicons name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
          <Text style={styles.searchInput}>Search Notes, PYQs, Assignments...</Text>
          <View style={styles.searchFilterBadge}>
            <Ionicons name="options" size={16} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        {/* Hero Promo Banner */}
        {banners.length > 0 ? (
          <FlatList
            data={banners}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id || Math.random().toString()}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[styles.bannerContainer, { width: width - 32 }]}
                activeOpacity={0.9}
                onPress={() => handleBannerPress(item.button_url)}
              >
                {item.image_url ? (
                  <Image source={{ uri: item.image_url }} style={StyleSheet.absoluteFillObject} />
                ) : null}
                <View style={styles.bannerContent}>
                  <View style={styles.promoTag}>
                    <Text style={styles.promoTagText}>🔥 FEATURED</Text>
                  </View>
                  <Text style={styles.bannerTitle}>{item.title}</Text>
                  <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
                  {item.button_text ? (
                    <View style={styles.bannerButton}>
                      <Text style={styles.bannerButtonText}>{item.button_text}</Text>
                      <Ionicons name="arrow-forward" size={14} color="#1E293B" />
                    </View>
                  ) : null}
                </View>
              </TouchableOpacity>
            )}
          />
        ) : (
          <View style={[styles.bannerContainer, { width: width - 32 }]}>
            <View style={styles.decorativeCircle1} />
            <View style={styles.decorativeCircle2} />
            <View style={styles.bannerContent}>
              <View style={styles.promoTag}>
                <Text style={styles.promoTagText}>🚀 SEMESTER BOOST</Text>
              </View>
              <Text style={styles.bannerTitle}>Ace Your Exams With Top Rated Notes</Text>
              <Text style={styles.bannerSubtitle}>Curated PYQs, Syllabus & High-Yield Questions</Text>
              <TouchableOpacity style={styles.bannerButton} onPress={() => navigation.navigate('Subjects')}>
                <Text style={styles.bannerButtonText}>Explore Study Hub</Text>
                <Ionicons name="arrow-forward" size={14} color="#1E293B" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Quick Study Access (2x2 Grid, Removed Important Questions) */}
        <SectionHeader title="Quick Study Access" subtitle="Everything you need to prepare" />
        <View style={styles.quickAccessContainer}>
          <View style={styles.row}>
            <QuickAccessCard 
              title="Notes" 
              iconName="book" 
              iconColor="#3B82F6" 
              onPress={() => navigation.navigate('Subjects')}
            />
            <QuickAccessCard 
              title="PYQs" 
              iconName="document-text" 
              iconColor="#F97316" 
              onPress={() => navigation.navigate('Subjects')}
            />
          </View>
          <View style={styles.row}>
            <QuickAccessCard 
              title="Syllabus" 
              iconName="clipboard" 
              iconColor="#10B981" 
              onPress={() => navigation.navigate('Subjects')}
            />
            <QuickAccessCard 
              title="Video Lectures" 
              iconName="play-circle" 
              iconColor="#8B5CF6" 
              onPress={() => navigation.navigate('Subjects')}
            />
          </View>
        </View>

        {/* Semester Subjects & Exams */}
        <SectionHeader 
          title="Semester Subjects & Exams" 
          subtitle="Your enrolled course subjects & materials"
          showViewAll 
          onViewAll={() => navigation.navigate('Subjects')} 
        />
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 20 }} />
        ) : (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={mySubjects.length > 0 ? mySubjects : fallbackSubjects}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => navigation.navigate('SubjectDetail', { subject: item })} activeOpacity={0.8}>
                <SubjectCard 
                  title={item.title || item.name} 
                  iconName={item.icon || item.icon_name || 'book-outline'} 
                  iconColor={item.color || item.theme_color || '#8B5CF6'}
                />
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.listPadding}
          />
        )}

        {/* NEW SECTION: Academic Marketplace */}
        <SectionHeader 
          title="Academic Marketplace 🛍️" 
          subtitle="Instant help with assignments & lab work" 
          showViewAll 
          onViewAll={() => navigation.navigate('Marketplace')} 
        />
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={marketplaceItems.length > 0 ? marketplaceItems : fallbackMarketplace}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listPadding}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.marketplaceCard} 
              activeOpacity={0.9}
              onPress={() => marketplaceItems.length > 0 ? navigation.navigate('ServiceDetail', { service: item }) : navigation.navigate('Marketplace')}
            >
              <View style={styles.marketCardHeader}>
                <View style={[styles.marketCategoryBadge, { backgroundColor: (item.color || COLORS.primary) + '15' }]}>
                  <Text style={[styles.marketCategoryText, { color: item.color || COLORS.primary }]}>
                    {item.category || 'Academic Service'}
                  </Text>
                </View>
                <Text style={styles.marketPrice}>₹{item.price}</Text>
              </View>
              
              <Text style={styles.marketTitle} numberOfLines={2}>{item.title}</Text>
              
              <View style={styles.marketFooter}>
                <Text style={styles.marketBadgeText}>{item.badge || '⚡ Fast Delivery'}</Text>
                <View style={styles.buyButton}>
                  <Text style={styles.buyButtonText}>Order</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />

        {/* WhatsApp Banner */}
        <WhatsAppBanner />

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Premium light neutral grey background
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  logoText: {
    fontSize: 18,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#EF4444',
    borderRadius: 4,
    width: 8,
    height: 8,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFEDD5',
  },
  greetingSection: {
    paddingHorizontal: 16,
    marginTop: 6,
    marginBottom: 16,
  },
  greetingText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  academicCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  capsuleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 16,
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  searchFilterBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerContainer: {
    backgroundColor: '#0F172A',
    marginHorizontal: 16,
    borderRadius: 24,
    padding: 22,
    marginBottom: 26,
    height: 190,
    position: 'relative',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -50,
    right: 40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  bannerContent: {
    flex: 1,
    justifyContent: 'center',
    zIndex: 1,
  },
  promoTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  promoTagText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
    lineHeight: 26,
  },
  bannerSubtitle: {
    color: '#94A3B8',
    fontSize: 13,
    marginBottom: 16,
    fontWeight: '500',
  },
  bannerButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerButtonText: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 13,
    marginRight: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 2,
  },
  viewAll: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '700',
  },
  quickAccessContainer: {
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  listPadding: {
    paddingHorizontal: 16,
    marginBottom: 26,
  },
  marketplaceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    width: 230,
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  marketCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  marketCategoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  marketCategoryText: {
    fontSize: 11,
    fontWeight: '700',
  },
  marketPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  marketTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 20,
    marginBottom: 16,
  },
  marketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: 12,
  },
  marketBadgeText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  buyButton: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  buyButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
