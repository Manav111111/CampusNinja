import React from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, Image, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

// Components
import QuickAccessCard from '../components/QuickAccessCard';
import SubjectCard from '../components/SubjectCard';
import RecentMaterialCard from '../components/RecentMaterialCard';
import WhatsAppBanner from '../components/WhatsAppBanner';

const { width } = Dimensions.get('window');

// Dummy Data
const subjects = [
  { id: '1', title: 'Physics', icon: 'aperture-outline', color: '#8B5CF6' },
  { id: '2', title: 'Mathematics', icon: 'grid-outline', color: '#10B981' },
  { id: '3', title: 'Programming in C', icon: 'code-slash-outline', color: '#F97316' },
  { id: '4', title: 'Electrical Engineering', icon: 'flash-outline', color: '#F59E0B' },
  { id: '5', title: 'Communication Skills', icon: 'chatbubble-ellipses-outline', color: '#3B82F6' },
];

const recentMaterials = [
  { id: '1', title: 'Physics Notes Updated', time: '2 hours ago', icon: 'document-text-outline', color: '#3B82F6' },
  { id: '2', title: '2024 PYQ Added', time: 'Yesterday', icon: 'document-outline', color: '#F97316' },
  { id: '3', title: 'Important Questions Uploaded', time: '2 days ago', icon: 'star-outline', color: '#10B981' },
];

const SectionHeader = ({ title, showViewAll = false }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {showViewAll && (
      <TouchableOpacity>
        <Text style={styles.viewAll}>View All</Text>
      </TouchableOpacity>
    )}
  </View>
);

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
             <Text style={{fontSize: 24, fontWeight: '900', color: COLORS.primary}}>CN</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
              <View style={styles.badge} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.avatarContainer}>
              {/* Fallback to person icon if image fails */}
              <Ionicons name="person-circle" size={36} color={COLORS.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Greeting Section */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingText}>Hello Manav 👋</Text>
          <View style={styles.subGreetingContainer}>
            <Text style={styles.subGreetingText}>B.Tech CSE</Text>
            <View style={styles.dotSeparator} />
            <Text style={styles.subGreetingText}>Semester 1</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={COLORS.secondary} style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search Notes, PYQs, Subjects..."
            placeholderTextColor={COLORS.secondary}
          />
          <TouchableOpacity>
            <Ionicons name="options-outline" size={20} color={COLORS.secondary} />
          </TouchableOpacity>
        </View>

        {/* Hero Banner */}
        <View style={styles.bannerContainer}>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>Semester Exam{"\n"}Preparation</Text>
            <Text style={styles.bannerSubtitle}>Access Notes, PYQs, Syllabus{"\n"}and Important Questions</Text>
            <TouchableOpacity style={styles.bannerButton}>
              <Text style={styles.bannerButtonText}>Explore Resources <Ionicons name="arrow-forward" size={14} /></Text>
            </TouchableOpacity>
          </View>
          <View style={styles.paginationDots}>
            <View style={[styles.dot, styles.activeDot]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>

        {/* Quick Study Access */}
        <SectionHeader title="Quick Study Access" />
        <View style={styles.quickAccessContainer}>
          <View style={styles.row}>
            <QuickAccessCard title="Notes" iconName="book-outline" iconColor="#3B82F6" />
            <QuickAccessCard title="PYQs" iconName="document-text-outline" iconColor="#F97316" />
          </View>
          <View style={styles.row}>
            <QuickAccessCard title="Syllabus" iconName="clipboard-outline" iconColor="#10B981" />
            <QuickAccessCard title="Video Lectures" iconName="play-circle-outline" iconColor="#8B5CF6" />
          </View>
          <View style={{ paddingHorizontal: 10 }}>
            <QuickAccessCard title="Important Questions" iconName="star-outline" iconColor="#F59E0B" fullWidth />
          </View>
        </View>

        {/* Semester Subjects */}
        <SectionHeader title="Semester Subjects" showViewAll />
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={subjects}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SubjectCard 
              title={item.title} 
              iconName={item.icon} 
              iconColor={item.color}
            />
          )}
          contentContainerStyle={styles.listPadding}
        />

        {/* Recent Study Material */}
        <SectionHeader title="Recent Study Material" />
        <View style={styles.recentMaterialContainer}>
          {recentMaterials.map((item) => (
            <RecentMaterialCard 
              key={item.id}
              title={item.title} 
              time={item.time} 
              iconName={item.icon} 
              iconColor={item.color} 
            />
          ))}
        </View>

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
  recentMaterialContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
  },
});
