import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity,
  Image,
  Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';

const { width } = Dimensions.get('window');

// Reusable component for the side-by-side card lists
const GridListCard = ({ title, titleIcon, titleIconColor, items }) => (
  <View style={styles.gridCardContainer}>
    <View style={styles.gridCardHeader}>
      <Ionicons name={titleIcon} size={18} color={titleIconColor} style={styles.gridCardTitleIcon} />
      <Text style={styles.gridCardTitle} numberOfLines={1}>{title}</Text>
    </View>
    <View style={styles.gridCardBody}>
      {items.map((item, index) => (
        <TouchableOpacity key={index} style={styles.gridItemRow}>
          <View style={[styles.gridItemIconBg, { backgroundColor: item.bg }]}>
            <Ionicons name={item.icon} size={16} color={item.color} />
          </View>
          <Text style={styles.gridItemText} numberOfLines={1}>{item.label}</Text>
          <Ionicons name="chevron-forward" size={14} color="#9CA3AF" />
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

export default function ProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  
  const [branchName, setBranchName] = useState('Not Set');
  const [semesterNum, setSemesterNum] = useState('Not Set');

  useEffect(() => {
    if (isFocused) {
      loadProfileData();
    }
  }, [isFocused]);

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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <View style={styles.notificationBadge} />
            <Ionicons name="notifications-outline" size={24} color="#111827" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="settings-outline" size={24} color="#111827" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* User Info Hero Card */}
        <View style={styles.heroCard}>
          {/* Abstract decoration to simulate the graphic */}
          <View style={styles.heroDecorationCircle1} />
          <View style={styles.heroDecorationCircle2} />
          
          <View style={styles.heroProfileRow}>
            <Image 
              source={{ uri: 'https://i.pravatar.cc/150?img=11' }} 
              style={styles.avatar} 
            />
            <View style={styles.heroDetails}>
              <Text style={styles.heroName}>Manav Gupta</Text>
              <Text style={styles.heroCourse}>B.Tech {branchName}</Text>
              <Text style={styles.heroYear}>Semester {semesterNum}</Text>
              
              <View style={styles.activeBadge}>
                <Ionicons name="checkmark-circle-outline" size={14} color="#059669" style={styles.badgeIcon} />
                <Text style={styles.badgeText}>Academic Profile Active</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('AcademicSetup')}>
            <Ionicons name="pencil-outline" size={16} color="#FFFFFF" style={styles.editButtonIcon} />
            <Text style={styles.editButtonText}>Edit Academic Details</Text>
          </TouchableOpacity>
        </View>

        {/* Academic Information Section */}
        <View style={styles.sectionHeader}>
          <Ionicons name="school-outline" size={20} color="#FF6B00" style={styles.sectionHeaderIcon} />
          <Text style={styles.sectionTitle}>Academic Information</Text>
        </View>
        <View style={styles.infoCard}>
          <TouchableOpacity style={styles.infoRow}>
            <View style={styles.infoRowLeft}>
              <View style={[styles.infoIconBg, { backgroundColor: '#FFEDD5' }]}>
                <Ionicons name="book-outline" size={18} color="#EA580C" />
              </View>
              <Text style={styles.infoLabel}>Course</Text>
            </View>
            <View style={styles.infoRowRight}>
              <Text style={styles.infoValue}>B.Tech</Text>
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" style={styles.infoChevron} />
            </View>
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity style={styles.infoRow}>
            <View style={styles.infoRowLeft}>
              <View style={[styles.infoIconBg, { backgroundColor: '#FFEDD5' }]}>
                <Ionicons name="business-outline" size={18} color="#EA580C" />
              </View>
              <Text style={styles.infoLabel}>Branch</Text>
            </View>
            <View style={styles.infoRowRight}>
              <Text style={styles.infoValue}>{branchName}</Text>
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" style={styles.infoChevron} />
            </View>
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity style={styles.infoRow}>
            <View style={styles.infoRowLeft}>
              <View style={[styles.infoIconBg, { backgroundColor: '#FFEDD5' }]}>
                <Ionicons name="calendar-outline" size={18} color="#EA580C" />
              </View>
              <Text style={styles.infoLabel}>Semester</Text>
            </View>
            <View style={styles.infoRowRight}>
              <Text style={styles.infoValue}>Semester {semesterNum}</Text>
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" style={styles.infoChevron} />
            </View>
          </TouchableOpacity>
          
          <View style={styles.divider} />

          <TouchableOpacity style={styles.infoRowOrange} onPress={() => navigation.navigate('AcademicSetup')}>
            <View style={styles.infoRowLeft}>
              <View style={[styles.infoIconBg, { backgroundColor: '#FFF7ED' }]}>
                <Ionicons name="document-text-outline" size={18} color="#EA580C" />
              </View>
              <Text style={styles.infoLabelOrange}>Change Academic Setup</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#111827" />
          </TouchableOpacity>
        </View>

        {/* 2-Column Grid Layout */}
        <View style={styles.gridContainer}>
          {/* Row 1 */}
          <GridListCard 
            title="My Resources" 
            titleIcon="folder-outline" 
            titleIconColor="#EA580C"
            items={[
              { label: 'Downloaded Notes', icon: 'download-outline', color: '#8B5CF6', bg: '#F3E8FF' },
              { label: 'Saved Resources', icon: 'bookmark-outline', color: '#EF4444', bg: '#FEE2E2' },
              { label: 'Bookmarks', icon: 'bookmark-outline', color: '#F59E0B', bg: '#FEF3C7' },
              { label: 'Recent Downloads', icon: 'time-outline', color: '#3B82F6', bg: '#DBEAFE' },
            ]}
          />
          <GridListCard 
            title="Community" 
            titleIcon="people-outline" 
            titleIconColor="#EA580C"
            items={[
              { label: 'WhatsApp Community', icon: 'logo-whatsapp', color: '#10B981', bg: '#D1FAE5' },
              { label: 'YouTube Channel', icon: 'logo-youtube', color: '#EF4444', bg: '#FEE2E2' },
              { label: 'Instagram Page', icon: 'logo-instagram', color: '#DB2777', bg: '#FCE7F3' },
            ]}
          />
        </View>

        <View style={styles.gridContainer}>
          {/* Row 2 */}
          <GridListCard 
            title="Support" 
            titleIcon="headset-outline" 
            titleIconColor="#EA580C"
            items={[
              { label: 'Help Center', icon: 'help-circle-outline', color: '#3B82F6', bg: '#DBEAFE' },
              { label: 'Contact Support', icon: 'chatbubble-ellipses-outline', color: '#10B981', bg: '#D1FAE5' },
              { label: 'Report Issue', icon: 'warning-outline', color: '#EF4444', bg: '#FEE2E2' },
              { label: 'FAQs', icon: 'document-text-outline', color: '#8B5CF6', bg: '#F3E8FF' },
            ]}
          />
          <GridListCard 
            title="About Campus Ninja" 
            titleIcon="information-circle-outline" 
            titleIconColor="#EA580C"
            items={[
              { label: 'About Us', icon: 'people-outline', color: '#3B82F6', bg: '#DBEAFE' },
              { label: 'Privacy Policy', icon: 'shield-checkmark-outline', color: '#10B981', bg: '#D1FAE5' },
              { label: 'Terms & Conditions', icon: 'document-text-outline', color: '#EA580C', bg: '#FFEDD5' },
              { label: 'Version 1.0.0', icon: 'information-circle-outline', color: '#6B7280', bg: '#F3F4F6' },
            ]}
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={20} color="#EA580C" style={styles.logoutIcon} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EA580C',
    zIndex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroCard: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 20,
    backgroundColor: '#FFF7ED',
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  heroDecorationCircle1: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFEDD5',
    opacity: 0.7,
  },
  heroDecorationCircle2: {
    position: 'absolute',
    bottom: 20,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFEDD5',
    opacity: 0.5,
  },
  heroProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    zIndex: 1,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    marginRight: 16,
  },
  heroDetails: {
    flex: 1,
  },
  heroName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  heroCourse: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  heroYear: {
    fontSize: 13,
    color: '#EA580C',
    fontWeight: '500',
    marginTop: 2,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  badgeIcon: {
    marginRight: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#059669',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EA580C',
    borderRadius: 8,
    paddingVertical: 12,
    zIndex: 1,
  },
  editButtonIcon: {
    marginRight: 8,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionHeaderIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  infoRowOrange: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFaf0',
  },
  infoRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoLabel: {
    fontSize: 13,
    color: '#4B5563',
  },
  infoLabelOrange: {
    fontSize: 13,
    fontWeight: '500',
    color: '#EA580C',
  },
  infoRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  infoChevron: {
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 60, // Align with text start
  },
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 24,
  },
  gridCardContainer: {
    width: (width - 48) / 2, // Half width minus padding/margins
  },
  gridCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  gridCardTitleIcon: {
    marginRight: 6,
  },
  gridCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    flexShrink: 1,
  },
  gridCardBody: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    padding: 12,
    paddingBottom: 4,
  },
  gridItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  gridItemIconBg: {
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  gridItemText: {
    flex: 1,
    fontSize: 11,
    color: '#111827',
    marginRight: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 32,
    marginBottom: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EA580C',
    backgroundColor: '#FFFFFF',
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#EA580C',
  },
});
