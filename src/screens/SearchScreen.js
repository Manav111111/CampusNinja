import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function SearchScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const recentSearches = [
    'Physics Notes', 'Mathematics PYQ', 'Programming in C',
    'Web Development', 'DSA'
  ];

  const popularResources = [
    'Important Questions', 'Complete Physics Notes', '2024 PYQs',
    'Semester Syllabus', 'Formula Sheets', 'Video Lectures'
  ];

  const suggestedResults = [
    {
      id: '1',
      title: 'Physics',
      type: 'Subject',
      actionText: 'Semester 1',
      icon: 'book-outline',
      themeColor: '#EA580C',
      bgColor: '#FFEDD5',
    },
    {
      id: '2',
      title: 'Complete Physics Notes',
      type: 'PDF Resource',
      actionText: 'Open PDF',
      icon: 'document-text-outline',
      themeColor: '#EF4444',
      bgColor: '#FEE2E2',
    },
    {
      id: '3',
      title: 'Physics 2024 PYQ',
      type: 'Question Paper',
      actionText: 'Open Resource',
      icon: 'document-text-outline',
      themeColor: '#EA580C',
      bgColor: '#FFFBEB',
    },
    {
      id: '4',
      title: 'Physics Complete Playlist',
      type: 'YouTube Playlist',
      actionText: 'Open Playlist',
      icon: 'play-outline',
      themeColor: '#7C3AED',
      bgColor: '#F3E8FF',
    },
    {
      id: '5',
      title: 'Web Development',
      type: 'Learning Path',
      actionText: 'Open Path',
      icon: 'school-outline',
      themeColor: '#10B981',
      bgColor: '#D1FAE5',
    },
  ];

  const categoryChips = [
    { id: '1', label: 'Notes', icon: 'book-outline', color: '#3B82F6' },
    { id: '2', label: 'PYQs', icon: 'document-text-outline', color: '#EA580C' },
    { id: '3', label: 'Subjects', icon: 'school-outline', color: '#10B981' },
    { id: '4', label: 'Video Lectures', icon: 'play-outline', color: '#8B5CF6' },
    { id: '5', label: 'Skills', icon: 'star-outline', color: '#F59E0B' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#6B7280" />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search notes, PYQs, subjects, videos, skills..."
            placeholderTextColor="#9CA3AF"
            autoFocus={true}
          />
          <TouchableOpacity>
            <Ionicons name="mic-outline" size={20} color="#EA580C" />
          </TouchableOpacity>
        </View>

        {/* Recent Searches */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Searches</Text>
            <TouchableOpacity>
              <Text style={styles.clearText}>Clear All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.chipsContainer}>
            {recentSearches.map((item, index) => (
              <TouchableOpacity key={index} style={styles.chip}>
                <Ionicons name="time-outline" size={16} color="#EA580C" style={styles.chipIcon} />
                <Text style={styles.chipText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Popular Resources */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Popular Resources</Text>
          <View style={styles.chipsContainer}>
            {popularResources.map((item, index) => (
              <TouchableOpacity key={index} style={styles.chip}>
                <Ionicons name="trending-up-outline" size={16} color="#EA580C" style={styles.chipIcon} />
                <Text style={styles.chipText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Suggested Results */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Suggested Results</Text>
          {suggestedResults.map((result) => (
            <TouchableOpacity key={result.id} style={styles.resultCard} activeOpacity={0.7}>
              <View style={[styles.resultIconBox, { backgroundColor: result.bgColor }]}>
                <Ionicons name={result.icon} size={24} color={result.themeColor} />
              </View>
              <View style={styles.resultContent}>
                <Text style={styles.resultTitle}>{result.title}</Text>
                <View style={styles.resultSubtitleContainer}>
                  <Text style={styles.resultType}>{result.type}</Text>
                  <Text style={styles.dotSeparator}>•</Text>
                  <Text style={[styles.resultAction, { color: result.themeColor }]}>{result.actionText}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom Helper Banner */}
        <View style={styles.helperBanner}>
          <View style={styles.helperIconRow}>
            <View style={styles.magnifyingGlass}>
              <Ionicons name="search-outline" size={24} color="#EA580C" />
            </View>
            <View style={styles.helperLines}>
              <View style={styles.helperLine1} />
              <View style={styles.helperLine2} />
            </View>
          </View>
          <Text style={styles.helperTitle}>Search anything related to your semester</Text>
          <Text style={styles.helperSubtitle}>Find notes, PYQs, subjects, videos and skills</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryChipsScroll}>
            {categoryChips.map((chip) => (
              <TouchableOpacity key={chip.id} style={styles.categoryChip}>
                <Ionicons name={chip.icon} size={14} color={chip.color} style={styles.chipIcon} />
                <Text style={styles.categoryChipText}>{chip.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    marginLeft: 10,
    marginRight: 10,
  },
  sectionContainer: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  clearText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EA580C',
    marginBottom: 12, // match alignment
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10, // RN 0.71+ supports gap
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
    marginRight: 10,
  },
  chipIcon: {
    marginRight: 6,
  },
  chipText: {
    fontSize: 13,
    color: '#374151',
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  resultIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  resultSubtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultType: {
    fontSize: 12,
    color: '#6B7280',
  },
  dotSeparator: {
    fontSize: 12,
    color: '#D1D5DB',
    marginHorizontal: 6,
  },
  resultAction: {
    fontSize: 12,
    fontWeight: '500',
  },
  helperBanner: {
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  helperIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  magnifyingGlass: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#EA580C',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginRight: 12,
  },
  helperLines: {
    justifyContent: 'center',
  },
  helperLine1: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 6,
  },
  helperLine2: {
    width: 24,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  helperTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 6,
  },
  helperSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  categoryChipsScroll: {
    paddingBottom: 4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
  },
});
