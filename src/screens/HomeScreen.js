import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, FlatList, Dimensions, ActivityIndicator, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { getBanners, getSubjects, supabase } from '../services/supabase';
import { getCurrentSession } from '../services/auth';

// Components
import QuickAccessCard from '../components/QuickAccessCard';
import SubjectCard from '../components/SubjectCard';
import WhatsAppBanner from '../components/WhatsAppBanner';

const { width } = Dimensions.get('window');

// Dummy Data
const subjects = [
  { id: '00000000-0000-0000-0000-000000000001', title: 'Physics', icon: 'aperture-outline', color: '#8B5CF6' },
  { id: '00000000-0000-0000-0000-000000000002', title: 'Mathematics', icon: 'grid-outline', color: '#10B981' },
  { id: '00000000-0000-0000-0000-000000000003', title: 'Programming in C', icon: 'code-slash-outline', color: '#F97316' },
  { id: '00000000-0000-0000-0000-000000000004', title: 'Electrical Engineering', icon: 'flash-outline', color: '#F59E0B' },
  { id: '00000000-0000-0000-0000-000000000005', title: 'Communication Skills', icon: 'chatbubble-ellipses-outline', color: '#3B82F6' },
];


const SectionHeader = ({ title, showViewAll = false, onViewAll }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {showViewAll && (
      <TouchableOpacity onPress={onViewAll}>
        <Text style={styles.viewAll}>View All</Text>
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
      
      // If legacy ID is detected (i.e. not a valid UUID), clear and redirect to AcademicSetup
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

      const [bannersData, subjectsData] = await Promise.all([
        getBanners(),
        (bId && sId && isValidUUID(bId) && isValidUUID(sId)) 
          ? getSubjects(bId, sId) 
          : Promise.resolve([])
      ]);

      setBanners(bannersData || []);
      setMySubjects(subjectsData || []);
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
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
             <Text style={{fontSize: 24, fontWeight: '900', color: COLORS.primary}}>CN</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Notifications')}>
              <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
              <View style={styles.badge} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.avatarContainer} onPress={() => navigation.navigate('Profile')}>
              {/* Fallback to person icon if image fails */}
              <Ionicons name="person-circle" size={36} color={COLORS.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Greeting Section */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingText}>Hello {userName || 'Student'} 👋</Text>
          <View style={styles.subGreetingContainer}>
            <Text style={styles.subGreetingText}>{branchName ? `B.Tech ${branchName}` : 'No Branch Selected'}</Text>
            <View style={styles.dotSeparator} />
            <Text style={styles.subGreetingText}>{semesterNum ? `Semester ${semesterNum}` : 'No Semester'}</Text>
          </View>
        </View>

        {/* Search Bar */}
        <TouchableOpacity style={styles.searchContainer} onPress={() => navigation.navigate('Search')}>
          <Ionicons name="search-outline" size={20} color={COLORS.secondary} style={styles.searchIcon} />
          <Text style={[styles.searchInput, { color: COLORS.secondary }]}>Search Notes, PYQs, Subjects...</Text>
          <Ionicons name="options-outline" size={20} color={COLORS.secondary} />
        </TouchableOpacity>

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
                ) : null}
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
              </TouchableOpacity>
            )}
          />
        ) : (
          <View style={[styles.bannerContainer, { width: width - 32 }]}>
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>Semester Exam{"\n"}Preparation</Text>
              <Text style={styles.bannerSubtitle}>Access Notes, PYQs, Syllabus{"\n"}and Important Questions</Text>
              <TouchableOpacity style={styles.bannerButton}>
                <Text style={styles.bannerButtonText}>Explore Resources</Text>
                <Ionicons name="arrow-forward" size={14} color="#111827" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Quick Study Access */}
        <SectionHeader title="Quick Study Access" />
        <View style={styles.quickAccessContainer}>
          <View style={styles.row}>
            <QuickAccessCard 
              title="Notes" 
              iconName="book-outline" 
              iconColor="#3B82F6" 
              onPress={() => navigation.navigate('Subjects')}
            />
            <QuickAccessCard 
              title="PYQs" 
              iconName="document-text-outline" 
              iconColor="#F97316" 
              onPress={() => navigation.navigate('Subjects')}
            />
          </View>
          <View style={styles.row}>
            <QuickAccessCard 
              title="Syllabus" 
              iconName="clipboard-outline" 
              iconColor="#10B981" 
              onPress={() => navigation.navigate('Subjects')}
            />
            <QuickAccessCard 
              title="Video Lectures" 
              iconName="play-circle-outline" 
              iconColor="#8B5CF6" 
              onPress={() => navigation.navigate('Subjects')}
            />
          </View>
          <View style={{ paddingHorizontal: 10 }}>
            <QuickAccessCard 
              title="Important Questions" 
              iconName="star-outline" 
              iconColor="#F59E0B" 
              fullWidth 
              onPress={() => navigation.navigate('Subjects')}
            />
          </View>
        </View>

        {/* Semester Subjects */}
        <SectionHeader title="Semester Subjects" showViewAll onViewAll={() => navigation.navigate('Subjects')} />
        {loading ? (
          <ActivityIndicator size="small" color="#FF6B00" style={{ marginVertical: 20 }} />
        ) : (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={mySubjects.length > 0 ? mySubjects : subjects} // fallback to dummy data
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => navigation.navigate('SubjectDetail', { subject: item })}>
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


        {/* WhatsApp Banner */}
        <WhatsAppBanner />

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logoContainer: {
    justifyContent: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginRight: 16,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    width: 8,
    height: 8,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  greetingSection: {
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  subGreetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subGreetingText: {
    fontSize: 14,
    color: COLORS.secondary,
  },
  dotSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginHorizontal: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  bannerContainer: {
    backgroundColor: '#1E3A8A', // Dark blue
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    height: 180,
    position: 'relative',
    overflow: 'hidden',
  },
  bannerContent: {
    flex: 1,
    justifyContent: 'center',
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bannerSubtitle: {
    color: '#E0E7FF',
    fontSize: 12,
    marginBottom: 16,
    lineHeight: 18,
  },
  bannerButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerButtonText: {
    color: '#111827',
    fontWeight: '600',
    fontSize: 12,
    marginRight: 4,
  },
  paginationDots: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  viewAll: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
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
    marginBottom: 24,
  },
});
