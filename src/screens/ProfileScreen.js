import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Dimensions, 
  ActivityIndicator,
  Platform,
  Linking
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { supabase } from '../services/supabase';
import { performGoogleLogin, handleLogout, getCurrentSession } from '../services/auth';

const { width } = Dimensions.get('window');

const MenuRow = ({ label, icon, iconColor, iconBg, value, onPress, isLast, isDestructive }) => (
  <TouchableOpacity
    style={[styles.menuRow, isLast && styles.menuRowLast]}
    onPress={onPress}
    activeOpacity={onPress ? 0.7 : 1}
  >
    <View style={styles.menuRowLeft}>
      <View style={[styles.menuIconBg, { backgroundColor: iconBg || (iconColor + '18') }]}>
        <Ionicons name={icon} size={18} color={iconColor || COLORS.primary} />
      </View>
      <Text style={[styles.menuLabel, isDestructive && { color: '#EF4444' }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
    <View style={styles.menuRowRight}>
      {value ? <Text style={styles.menuValue}>{value}</Text> : null}
      {onPress && <Ionicons name="chevron-forward" size={16} color="#94A3B8" style={{ marginLeft: 6 }} />}
    </View>
  </TouchableOpacity>
);

const SectionGroup = ({ title, children }) => (
  <View style={styles.sectionGroupContainer}>
    {title ? <Text style={styles.sectionGroupTitle}>{title}</Text> : null}
    <View style={styles.sectionGroupCard}>
      {children}
    </View>
  </View>
);

export default function ProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  const [branchName, setBranchName] = useState('Not Set');
  const [semesterNum, setSemesterNum] = useState('Not Set');
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(false);

  useEffect(() => {
    if (isFocused) {
      loadProfileData();
    }
  }, [isFocused]);

  useEffect(() => {
    let mounted = true;

    getCurrentSession()
      .then((session) => {
        if (mounted) setUser(session?.user || null);
      })
      .catch((error) => console.error('Failed to load auth session:', error));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const loadProfileData = async () => {
    try {
      const bName = await AsyncStorage.getItem('userBranchName');
      const sNum = await AsyncStorage.getItem('userSemesterNumber');
      if (bName) setBranchName(bName);
      if (sNum) setSemesterNum(sNum);
    } catch (e) {
      console.log(e);
    }
  };

  const handleLogin = async () => {
    setLoadingAuth(true);
    try {
      await performGoogleLogin();
    } finally {
      setLoadingAuth(false);
    }
  };

  const openURL = (url) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      
      {/* Top Header matching HomeScreen */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={22} color="#1E293B" />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom + 80, 110) }]}>
        
        {/* Hero User Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroRow}>
            {user && user.user_metadata?.avatar_url ? (
              <Image source={{ uri: user.user_metadata.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={38} color={COLORS.primary} />
              </View>
            )}

            <View style={styles.heroDetails}>
              <Text style={styles.heroName} numberOfLines={1}>
                {user ? (user.user_metadata?.full_name || 'Student') : 'Guest Student'}
              </Text>
              <Text style={styles.heroSubtext} numberOfLines={1}>
                {user ? user.email : 'Login to sync resources & orders'}
              </Text>
              
              <View style={styles.statusBadge}>
                <Ionicons name="shield-checkmark" size={14} color="#059669" />
                <Text style={styles.statusBadgeText}>Verified Academic Profile</Text>
              </View>
            </View>
          </View>

          {!user && (
            <TouchableOpacity style={styles.googleButton} onPress={handleLogin} disabled={loadingAuth} activeOpacity={0.8}>
              {loadingAuth ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="logo-google" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.googleButtonText}>Sign In with Google</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Academic Information */}
        <SectionGroup title="ACADEMIC INFORMATION">
          <MenuRow label="Course Degree" icon="school" iconColor="#3B82F6" value="B.Tech" onPress={() => navigation.navigate('AcademicSetup')} />
          <MenuRow label="Enrolled Branch" icon="business" iconColor="#F97316" value={branchName} onPress={() => navigation.navigate('AcademicSetup')} />
          <MenuRow label="Current Semester" icon="calendar" iconColor="#10B981" value={`Semester ${semesterNum}`} onPress={() => navigation.navigate('AcademicSetup')} />
          <MenuRow 
            label="Change Academic Setup" 
            icon="create" 
            iconColor={COLORS.primary} 
            iconBg="#FFF7ED"
            onPress={() => navigation.navigate('AcademicSetup')}
            isLast 
          />
        </SectionGroup>

        {/* My Resources */}
        <SectionGroup title="MY RESOURCES & ORDERS">
          <MenuRow label="My Orders" icon="cart" iconColor="#8B5CF6" onPress={() => navigation.navigate('MyOrders')} />
          <MenuRow label="Saved Notes & PYQs" icon="bookmark" iconColor="#EC4899" onPress={() => navigation.navigate('SavedResources')} isLast />
        </SectionGroup>

        {/* Community & Support */}
        <SectionGroup title="COMMUNITY & SUPPORT">
          <MenuRow label="Join WhatsApp Community" icon="logo-whatsapp" iconColor="#10B981" onPress={() => openURL('https://chat.whatsapp.com')} />
          <MenuRow label="Subscribe on YouTube" icon="logo-youtube" iconColor="#EF4444" onPress={() => openURL('https://youtube.com')} />
          <MenuRow label="Follow on Instagram" icon="logo-instagram" iconColor="#E1306C" onPress={() => openURL('https://instagram.com')} />
          <MenuRow label="Help & FAQs" icon="help-circle" iconColor="#6366F1" onPress={() => navigation.navigate('Support', { section: 'FAQ' })} isLast />
        </SectionGroup>

        {/* About App */}
        <SectionGroup title="ABOUT CAMPUS NINJA">
          <MenuRow label="Privacy Policy" icon="shield" iconColor="#64748B" onPress={() => navigation.navigate('Support', { section: 'Privacy' })} />
          <MenuRow label="Terms of Service" icon="document-text" iconColor="#64748B" onPress={() => navigation.navigate('Support', { section: 'Terms' })} />
          <MenuRow label="App Version" icon="information-circle" iconColor="#94A3B8" value="v1.0.0" isLast />
        </SectionGroup>

        {/* Logout */}
        {user && (
          <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
              <Ionicons name="log-out-outline" size={20} color="#EF4444" style={{ marginRight: 8 }} />
              <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Matching HomeScreen
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: {
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
  scrollContent: {
    paddingBottom: 40,
  },
  heroCard: {
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 20,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginRight: 16,
  },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#FFEDD5',
  },
  heroDetails: {
    flex: 1,
  },
  heroName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  heroSubtext: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 10,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
    marginLeft: 6,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 14,
    paddingVertical: 12,
    marginTop: 18,
  },
  googleButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  sectionGroupContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  sectionGroupTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 8,
    letterSpacing: 0.8,
    paddingLeft: 4,
  },
  sectionGroupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
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
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  menuRowLast: {
    borderBottomWidth: 0,
  },
  menuRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  menuRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    marginBottom: 20,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#EF4444',
  },
});
