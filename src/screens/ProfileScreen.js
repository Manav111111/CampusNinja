import React, { useState, useEffect, useCallback } from 'react';
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
import { supabase, getSocialLinks } from '../services/supabase';
import { performGoogleLogin, handleLogout, getCurrentSession } from '../services/auth';
import { Toast } from '../context/ToastContext';

const { width } = Dimensions.get('window');

const MenuRow = ({ label, subtitle, icon, iconColor, iconBg, value, badge, onPress, isLast, isDestructive }) => (
  <TouchableOpacity
    style={[styles.menuRow, isLast && styles.menuRowLast]}
    onPress={onPress}
    activeOpacity={onPress ? 0.7 : 1}
  >
    <View style={styles.menuRowLeft}>
      <View style={[styles.menuIconBg, { backgroundColor: iconBg || (iconColor + '18') }]}>
        <Ionicons name={icon} size={20} color={iconColor || COLORS.primary} />
      </View>
      <View style={styles.menuTextCol}>
        <Text style={[styles.menuLabel, isDestructive && { color: '#EF4444' }]} numberOfLines={1}>
          {label}
        </Text>
        {subtitle ? <Text style={styles.menuSubtitle} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
    </View>
    <View style={styles.menuRowRight}>
      {badge ? (
        <View style={[styles.badgePill, { backgroundColor: iconColor + '15', borderColor: iconColor + '30' }]}>
          <Text style={[styles.badgePillText, { color: iconColor }]}>{badge}</Text>
        </View>
      ) : null}
      {value ? <Text style={styles.menuValue}>{value}</Text> : null}
      {onPress && <Ionicons name="chevron-forward" size={16} color="#94A3B8" style={{ marginLeft: 6 }} />}
    </View>
  </TouchableOpacity>
);

const SectionGroup = ({ title, subtitle, children }) => (
  <View style={styles.sectionGroupContainer}>
    <View style={styles.sectionHeaderRow}>
      {title ? <Text style={styles.sectionGroupTitle}>{title}</Text> : null}
      {subtitle ? <Text style={styles.sectionGroupSubtitle}>{subtitle}</Text> : null}
    </View>
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
  const [socialLinks, setSocialLinks] = useState([]);
  const [loadingLinks, setLoadingLinks] = useState(true);

  useEffect(() => {
    if (isFocused) {
      loadProfileData();
      loadLinks();
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

  const loadLinks = async () => {
    try {
      setLoadingLinks(true);
      const links = await getSocialLinks();
      setSocialLinks(links || []);
    } catch (err) {
      console.log('Error loading social links:', err);
    } finally {
      setLoadingLinks(false);
    }
  };

  const handleLogin = async () => {
    setLoadingAuth(true);
    try {
      const success = await performGoogleLogin();
      if (success) {
        Toast.show({ type: 'success', title: 'Welcome Back!', message: 'You have signed in successfully.' });
      }
    } catch (error) {
      Toast.show({ type: 'error', title: 'Sign In Failed', message: error.message || 'Could not sign in with Google.' });
    } finally {
      setLoadingAuth(false);
    }
  };

  const onSignOut = async () => {
    try {
      await handleLogout();
      Toast.show({ type: 'info', title: 'Signed Out', message: 'You have logged out of your academic account.' });
    } catch (error) {
      Toast.show({ type: 'error', title: 'Error', message: 'Failed to sign out.' });
    }
  };

  const openURL = (url) => {
    if (!url) return;
    Linking.openURL(url).catch(() => {
      Toast.show({ type: 'error', title: 'Link Error', message: 'Unable to open external app or browser.' });
    });
  };

  const getPlatformDetails = (platform) => {
    switch (platform) {
      case 'whatsapp':
        return { icon: 'logo-whatsapp', color: '#10B981', bg: '#D1FAE5' };
      case 'youtube':
        return { icon: 'logo-youtube', color: '#EF4444', bg: '#FEE2E2' };
      case 'instagram':
        return { icon: 'logo-instagram', color: '#E1306C', bg: '#FCE7F3' };
      default:
        return { icon: 'share-social', color: '#6366F1', bg: '#E0E7FF' };
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Academic Profile</Text>
          <Text style={styles.headerSubtext}>Personalize your campus setup & resources</Text>
        </View>
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
                {user ? (user.user_metadata?.full_name || 'Student') : 'Campus Student'}
              </Text>
              <Text style={styles.heroEmail} numberOfLines={1}>
                {user ? user.email : 'Sign in to cloud-sync study progress'}
              </Text>
              
              <View style={styles.statusBadge}>
                <Ionicons name="shield-checkmark" size={14} color="#059669" />
                <Text style={styles.statusBadgeText}>Verified College Hub Member</Text>
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
        <SectionGroup title="ACADEMIC SETUP" subtitle="Customizes your home feed">
          <MenuRow label="Course Degree" icon="school" iconColor="#3B82F6" value="B.Tech" onPress={() => navigation.navigate('AcademicSetup')} />
          <MenuRow label="Enrolled Branch" icon="business" iconColor="#F97316" value={branchName} onPress={() => navigation.navigate('AcademicSetup')} />
          <MenuRow label="Current Semester" icon="calendar" iconColor="#10B981" value={`Semester ${semesterNum}`} onPress={() => navigation.navigate('AcademicSetup')} />
          <MenuRow 
            label="Change Branch & Semester" 
            subtitle="Switch subject syllabus instantly"
            icon="swap-horizontal" 
            iconColor={COLORS.primary} 
            iconBg="#FFF7ED"
            onPress={() => navigation.navigate('AcademicSetup')}
            isLast 
          />
        </SectionGroup>

        {/* My Resources */}
        <SectionGroup title="STUDY MATERIAL & ORDERS">
          <MenuRow label="My Orders & Status" subtitle="Track marketplace & assignment orders" icon="cart" iconColor="#8B5CF6" onPress={() => navigation.navigate('MyOrders')} />
          <MenuRow label="Saved Notes & PYQs" subtitle="Quick offline bookmarked study files" icon="bookmark" iconColor="#EC4899" onPress={() => navigation.navigate('SavedResources')} isLast />
        </SectionGroup>

        {/* Dynamic Communities & Social Links */}
        <SectionGroup title="COMMUNITY NETWORKS" subtitle="Managed live from Admin Panel">
          {loadingLinks ? (
            <View style={{ padding: 24, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
          ) : socialLinks.length > 0 ? (
            socialLinks.map((item, idx) => {
              const platformStyle = getPlatformDetails(item.platform);
              return (
                <MenuRow
                  key={item.id || idx}
                  label={item.name}
                  subtitle={item.description || `Official ${item.platform.toUpperCase()} Hub`}
                  icon={platformStyle.icon}
                  iconColor={platformStyle.color}
                  iconBg={platformStyle.bg}
                  badge={item.subscriber_count}
                  onPress={() => openURL(item.url)}
                  isLast={idx === socialLinks.length - 1}
                />
              );
            })
          ) : (
            <>
              <MenuRow label="Campus WhatsApp Community" subtitle="Official student chat & placement alerts" icon="logo-whatsapp" iconColor="#10B981" badge="850+ Members" onPress={() => openURL('https://chat.whatsapp.com')} />
              <MenuRow label="Campus Ninja YouTube" subtitle="Placement preparation & lecture roadmaps" icon="logo-youtube" iconColor="#EF4444" badge="15.2K Subs" onPress={() => openURL('https://youtube.com')} />
              <MenuRow label="Campus Ninja Instagram" subtitle="Campus news, memes & event highlights" icon="logo-instagram" iconColor="#E1306C" badge="18.5K Followers" onPress={() => openURL('https://instagram.com')} isLast />
            </>
          )}
        </SectionGroup>

        {/* Support & Legal */}
        <SectionGroup title="HELP & LEGAL">
          <MenuRow label="Help Center & FAQs" icon="help-circle" iconColor="#6366F1" onPress={() => navigation.navigate('Support', { section: 'FAQ' })} />
          <MenuRow label="Privacy Policy" icon="shield-checkmark" iconColor="#64748B" onPress={() => navigation.navigate('Support', { section: 'Privacy' })} />
          <MenuRow label="Terms of Service" icon="document-text" iconColor="#64748B" onPress={() => navigation.navigate('Support', { section: 'Terms' })} />
          <MenuRow label="App Version" subtitle="Production Build" icon="information-circle" iconColor="#94A3B8" value="v2.4.0 (Latest)" isLast />
        </SectionGroup>

        {/* Logout */}
        {user && (
          <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
            <TouchableOpacity style={styles.logoutButton} onPress={onSignOut} activeOpacity={0.8}>
              <Ionicons name="log-out-outline" size={20} color="#EF4444" style={{ marginRight: 8 }} />
              <Text style={styles.logoutText}>Sign Out of Academic Account</Text>
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
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  headerSubtext: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
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
    marginTop: 8,
    marginBottom: 22,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2.5,
    borderColor: COLORS.primary,
    marginRight: 16,
  },
  avatarPlaceholder: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2.5,
    borderColor: '#FFEDD5',
  },
  heroDetails: {
    flex: 1,
  },
  heroName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 3,
  },
  heroEmail: {
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
    paddingVertical: 13,
    marginTop: 18,
  },
  googleButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  sectionGroupContainer: {
    marginHorizontal: 16,
    marginBottom: 22,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionGroupTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  sectionGroupSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  sectionGroupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
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
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuTextCol: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  menuRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgePillText: {
    fontSize: 11,
    fontWeight: '700',
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
    paddingVertical: 15,
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
