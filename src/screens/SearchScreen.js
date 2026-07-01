import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getAllSubjects, getMarketplaceServices, getSkills } from '../services/supabase';
import { fuzzyMatchItem } from '../utils/searchUtils';
import { getSubjectVisualIdentity } from '../utils/subjectTheme';

const fallbackSubjects = [
  { id: 'sub-1', title: 'Physics', icon: 'aperture-outline', color: '#8B5CF6' },
  { id: 'sub-2', title: 'Mathematics', icon: 'grid-outline', color: '#10B981' },
  { id: 'sub-3', title: 'Programming in C', icon: 'code-slash-outline', color: '#F97316' },
  { id: 'sub-4', title: 'Electrical Engg.', icon: 'flash-outline', color: '#F59E0B' },
  { id: 'sub-5', title: 'Communication', icon: 'chatbubble-ellipses-outline', color: '#3B82F6' },
  { id: 'sub-6', title: 'Data Structures & Algorithms', icon: 'git-network-outline', color: '#EF4444' },
  { id: 'sub-7', title: 'Operating Systems', icon: 'desktop-outline', color: '#10B981' },
  { id: 'sub-8', title: 'Environmental Science', icon: 'leaf-outline', color: '#2563EB' },
];

const fallbackMarketplace = [
  { id: 'm-1', title: 'Custom College Assignments', price: '149', category: 'Assignments', badge: '⚡ 24h Delivery', color: '#3B82F6', icon: 'document-text-outline', description: 'Handwritten or typed custom assignments delivered on time.' },
  { id: 'm-2', title: 'Complete Lab Manual Solutions', price: '99', category: 'Lab Manuals', badge: '⭐ Verified', color: '#10B981', icon: 'flask-outline', description: 'Accurate lab readings and complete experiment solutions.' },
  { id: 'm-3', title: 'Final Year Minor / Major Projects', price: '499', category: 'Projects', badge: '🔥 Best Seller', color: '#F97316', icon: 'laptop-outline', description: 'Ready to submit working source code, project report and PPT.' },
  { id: 'm-4', title: 'Engineering Graphics (EG) Sheets', price: '199', category: 'EG Sheets', badge: '📐 Neat Drawing', color: '#8B5CF6', icon: 'compass-outline', description: 'Neat A2/A3 drawing sheets drawn to perfection.' },
];

const fallbackSkillsList = [
  { id: 'sk-1', name: 'Data Structures & Algorithms', difficulty_level: 'intermediate', theme_color: '#8B5CF6', description: 'Placement Preparation' },
  { id: 'sk-2', name: 'Web Development', difficulty_level: 'beginner', theme_color: '#2563EB', description: 'Frontend • Backend • MERN' },
];

export default function SearchScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState([
    'Physics', 'Assignments', 'Mathematics', 'Projects', 'Lab Manuals'
  ]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [allMarketplace, setAllMarketplace] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  const popularResources = [
    'Physics', 'Assignments', 'Mathematics PYQ', 'Lab Manual Solutions', 'C Programming', 'Major Projects'
  ];

  const categoryChips = [
    { id: '1', label: 'Notes', icon: 'book-outline', color: '#3B82F6' },
    { id: '2', label: 'PYQs', icon: 'document-text-outline', color: '#EA580C' },
    { id: '3', label: 'Subjects', icon: 'school-outline', color: '#10B981' },
    { id: '4', label: 'Assignments', icon: 'clipboard-outline', color: '#8B5CF6' },
    { id: '5', label: 'Projects', icon: 'laptop-outline', color: '#F59E0B' },
  ];

  useEffect(() => {
    loadSearchData();
  }, []);

  const loadSearchData = async () => {
    try {
      setLoading(true);
      const [subjectsData, marketData, skillsData] = await Promise.all([
        getAllSubjects().catch(() => []),
        getMarketplaceServices().catch(() => []),
        getSkills().catch(() => [])
      ]);
      setAllSubjects(subjectsData && subjectsData.length > 0 ? subjectsData : fallbackSubjects);
      setAllMarketplace(marketData && marketData.length > 0 ? marketData : fallbackMarketplace);
      setAllSkills(skillsData && skillsData.length > 0 ? skillsData : fallbackSkillsList);
    } catch (error) {
      console.log('Error loading search data:', error);
      setAllSubjects(fallbackSubjects);
      setAllMarketplace(fallbackMarketplace);
      setAllSkills(fallbackSkillsList);
    } finally {
      setLoading(false);
    }
  };

  const handleChipPress = (text) => {
    setSearchQuery(text);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  // Filter combined search results with fuzzy matching
  const query = searchQuery.trim();
  const matchedSubjects = query ? allSubjects.filter(sub => fuzzyMatchItem(query, sub)).map(sub => {
    const theme = getSubjectVisualIdentity(sub.title || sub.name);
    return {
      id: `sub_${sub.id}`,
      originalItem: sub,
      title: sub.title || sub.name,
      type: 'Academic Subject',
      actionText: 'View Subject',
      icon: 'book-outline',
      themeColor: theme.primary,
      bgColor: theme.bg,
      resultType: 'Subject'
    };
  }) : [];

  const matchedSkills = query ? allSkills.filter(sk => fuzzyMatchItem(query, sk)).map(sk => ({
    id: `skill_${sk.id}`,
    originalItem: sk,
    title: sk.name || sk.title,
    type: 'Career Skill Path',
    actionText: 'Explore Path',
    icon: sk.icon || 'briefcase-outline',
    themeColor: sk.theme_color || '#10B981',
    bgColor: (sk.theme_color || '#10B981') + '20',
    resultType: 'Skill'
  })) : [];

  const matchedMarketplace = query ? allMarketplace.filter(item => fuzzyMatchItem(query, item)).map(item => ({
    id: `market_${item.id}`,
    originalItem: item,
    title: item.title,
    type: item.category ? `Marketplace • ₹${item.price}` : `Marketplace Service • ₹${item.price}`,
    actionText: 'Order Now',
    icon: item.icon || 'cart-outline',
    themeColor: item.color || '#FF6B00',
    bgColor: (item.color || '#FF6B00') + '20',
    resultType: 'Marketplace'
  })) : [];

  const combinedResults = [...matchedSubjects, ...matchedSkills, ...matchedMarketplace];

  const handleResultPress = (result) => {
    if (result.resultType === 'Subject') {
      navigation.navigate('SubjectDetail', { subject: result.originalItem });
    } else if (result.resultType === 'Skill') {
      navigation.navigate('SkillDetail', { skill: result.originalItem });
    } else if (result.resultType === 'Marketplace') {
      navigation.navigate('ServiceDetail', { service: result.originalItem });
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBarWrapper}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#6B7280" />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search all subjects, PYQs, marketplace..."
            placeholderTextColor="#9CA3AF"
            autoFocus={true}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ) : (
            <Ionicons name="mic-outline" size={20} color="#FF6B00" />
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {loading ? (
          <ActivityIndicator size="large" color="#FF6B00" style={{ marginVertical: 40 }} />
        ) : query ? (
          /* Live Search Results */
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>
              Search Results ({combinedResults.length})
            </Text>
            
            {combinedResults.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={56} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>No matching results found</Text>
                <Text style={styles.emptySubtitle}>
                  We searched across all academic subjects and marketplace services for "{searchQuery}".
                </Text>
              </View>
            ) : (
              combinedResults.map((result) => (
                <TouchableOpacity 
                  key={result.id} 
                  style={styles.resultCard} 
                  activeOpacity={0.8}
                  onPress={() => handleResultPress(result)}
                >
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
              ))
            )}
          </View>
        ) : (
          /* Default Pre-Search State (No Static Suggested Results) */
          <>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Recent Searches</Text>
                  <TouchableOpacity onPress={clearRecentSearches}>
                    <Text style={styles.clearText}>Clear All</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.chipsContainer}>
                  {recentSearches.map((item, index) => (
                    <TouchableOpacity key={index} style={styles.chip} onPress={() => handleChipPress(item)}>
                      <Ionicons name="time-outline" size={16} color="#FF6B00" style={styles.chipIcon} />
                      <Text style={styles.chipText}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Popular Resources */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Popular Searches</Text>
              <View style={styles.chipsContainer}>
                {popularResources.map((item, index) => (
                  <TouchableOpacity key={index} style={styles.chip} onPress={() => handleChipPress(item)}>
                    <Ionicons name="trending-up-outline" size={16} color="#FF6B00" style={styles.chipIcon} />
                    <Text style={styles.chipText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Bottom Helper Banner */}
            <View style={styles.helperBanner}>
              <View style={styles.helperIconRow}>
                <View style={styles.magnifyingGlass}>
                  <Ionicons name="search-outline" size={26} color="#FF6B00" />
                </View>
                <View style={styles.helperLines}>
                  <View style={styles.helperLine1} />
                  <View style={styles.helperLine2} />
                </View>
              </View>
              <Text style={styles.helperTitle}>Search across all CampusNinja</Text>
              <Text style={styles.helperSubtitle}>Find any subject across all semesters or order custom assignments instantly</Text>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryChipsScroll}>
                {categoryChips.map((chip) => (
                  <TouchableOpacity key={chip.id} style={styles.categoryChip} onPress={() => handleChipPress(chip.label)}>
                    <Ionicons name={chip.icon} size={14} color={chip.color} style={styles.chipIcon} />
                    <Text style={styles.categoryChipText}>{chip.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </>
        )}

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
  searchBarWrapper: {
    paddingHorizontal: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FF6B00',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 6,
    marginBottom: 20,
    backgroundColor: '#FFFBEB',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    marginLeft: 10,
    marginRight: 10,
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
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
    fontSize: 17,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 12,
  },
  clearText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF6B00',
    marginBottom: 12,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#F8FAFC',
    marginBottom: 8,
    marginRight: 8,
  },
  chipIcon: {
    marginRight: 6,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  resultIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  resultSubtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  dotSeparator: {
    fontSize: 12,
    color: '#CBD5E1',
    marginHorizontal: 6,
  },
  resultAction: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  helperBanner: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  helperIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  magnifyingGlass: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#FF6B00',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginRight: 12,
  },
  helperLines: {
    justifyContent: 'center',
  },
  helperLine1: {
    width: 44,
    height: 5,
    backgroundColor: '#CBD5E1',
    borderRadius: 3,
    marginBottom: 6,
  },
  helperLine2: {
    width: 28,
    height: 5,
    backgroundColor: '#CBD5E1',
    borderRadius: 3,
  },
  helperTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 6,
  },
  helperSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  categoryChipsScroll: {
    paddingBottom: 4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
});
