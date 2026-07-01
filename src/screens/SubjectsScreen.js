import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  FlatList,
  ActivityIndicator,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { getSubjects, getAllSubjects } from '../services/supabase';
import { getSubjectVisualIdentity } from '../utils/subjectTheme';
import { fuzzyMatchItem } from '../utils/searchUtils';

const filterChips = [
  { id: 'all', label: 'All Subjects' },
  { id: 'theory', label: 'Theory' },
  { id: 'lab', label: 'Lab' },
];

const isValidUUID = (uuid) => {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return typeof uuid === 'string' && regex.test(uuid);
};

export default function SubjectsScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  
  const [subjects, setSubjects] = useState([]);
  const [globalSubjects, setGlobalSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [branchName, setBranchName] = useState('B.Tech');
  const [semesterNum, setSemesterNum] = useState('Semester');

  useEffect(() => {
    if (isFocused) {
      loadSubjects();
    }
  }, [isFocused]);

  useEffect(() => {
    const loadAcademicInfo = async () => {
      try {
        const bName = await AsyncStorage.getItem('userBranchName');
        const sNum = await AsyncStorage.getItem('userSemesterNumber');
        if (bName) setBranchName(`B.Tech ${bName}`);
        if (sNum) setSemesterNum(`Semester ${sNum}`);
      } catch (e) {
        console.log(e);
      }
    };
    loadAcademicInfo();
  }, []);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const bId = await AsyncStorage.getItem('userBranchId');
      const sId = await AsyncStorage.getItem('userSemesterId');
      
      if ((bId && !isValidUUID(bId)) || (sId && !isValidUUID(sId))) {
        await AsyncStorage.removeItem('userBranchId');
        await AsyncStorage.removeItem('userSemesterId');
        await AsyncStorage.removeItem('userBranchName');
        await AsyncStorage.removeItem('userSemesterNumber');
        navigation.replace('AcademicSetup');
        return;
      }
      
      const [localData, allData] = await Promise.all([
        (bId && sId && isValidUUID(bId) && isValidUUID(sId)) ? getSubjects(bId, sId) : Promise.resolve([]),
        getAllSubjects().catch(() => [])
      ]);

      setSubjects(localData || []);
      setGlobalSubjects(allData || []);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const poolToFilter = searchQuery.trim() ? [
    ...subjects,
    ...globalSubjects.filter(gs => !subjects.some(ls => ls.id === gs.id || (ls.name && gs.name && ls.name.trim().toLowerCase() === gs.name.trim().toLowerCase())))
  ] : subjects;

  const isLabSubject = (subject) => {
    const type = (subject.type || subject.subject_type || subject.category || '').toLowerCase();
    if (type === 'lab' || type === 'laboratory' || subject.is_lab === true) return true;
    if (type === 'theory') return false;
    
    const name = (subject.name || subject.title || '').toLowerCase();
    return /\b(lab|laboratory|practical|workshop)\b/i.test(name);
  };

  const filteredSubjects = poolToFilter.filter(subject => {
    const matchesSearch = fuzzyMatchItem(searchQuery, subject);
    if (!matchesSearch) return false;
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'theory') return !isLabSubject(subject);
    if (selectedFilter === 'lab') return isLabSubject(subject);
    return true;
  });

  const renderSubjectCard = ({ item }) => {
    const subjectTitle = item.title || item.name || 'Academic Subject';
    const theme = getSubjectVisualIdentity(subjectTitle);
    const counts = item.counts || { total: 0, notes: 0, pyqs: 0, videos: 0 };

    return (
      <TouchableOpacity 
        style={[styles.cardContainer, { backgroundColor: theme.bg, borderColor: theme.border }]}
        activeOpacity={0.88}
        onPress={() => navigation.navigate('SubjectDetail', { subject: item, initialTab: route?.params?.initialTab })}
      >
        <View style={styles.cardHeader}>
          {/* Left Monogram Badge */}
          <View style={styles.leftRow}>
            <View style={[styles.monogramBox, { backgroundColor: theme.primary }]}>
              <Text style={styles.monogramText}>{theme.initials}</Text>
            </View>
            <View style={styles.headerTextGroup}>
              <Text style={styles.subjectTitle} numberOfLines={2}>{subjectTitle}</Text>
              <Text style={styles.subjectMeta}>{branchName} • {semesterNum}</Text>
            </View>
          </View>

          {/* Right Action Circle */}
          <View style={[styles.actionCircle, { backgroundColor: '#FFFFFF', borderColor: theme.border }]}>
            <Ionicons name="arrow-forward" size={16} color={theme.primary} />
          </View>
        </View>

        {/* Resource Counts Footer Row */}
        <View style={[styles.resourceBar, { borderTopColor: theme.border }]}>
          <View style={styles.resourcePill}>
            <Ionicons name="document-text-outline" size={13} color={theme.primary} />
            <Text style={[styles.resourcePillText, { color: '#334155' }]}>
              Notes <Text style={{ fontWeight: '800', color: theme.primary }}>{counts.notes || 0}</Text>
            </Text>
          </View>

          <View style={styles.resourcePill}>
            <Ionicons name="bookmark-outline" size={13} color={theme.primary} />
            <Text style={[styles.resourcePillText, { color: '#334155' }]}>
              PYQs <Text style={{ fontWeight: '800', color: theme.primary }}>{counts.pyqs || 0}</Text>
            </Text>
          </View>

          <View style={styles.resourcePill}>
            <Ionicons name="play-circle-outline" size={14} color={theme.primary} />
            <Text style={[styles.resourcePillText, { color: '#334155' }]}>
              Videos <Text style={{ fontWeight: '800', color: theme.primary }}>{counts.videos || 0}</Text>
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Bar Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color="#1E293B" />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Course Subjects</Text>
          <Text style={styles.headerSubtitle}>{branchName} • {semesterNum}</Text>
        </View>

        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Ionicons name="notifications-outline" size={24} color="#1E293B" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#64748B" style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Search courses or materials..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips */}
      <View style={styles.filterWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
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

      {/* Subjects List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B00" />
          <Text style={styles.loadingText}>Loading Course Materials...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredSubjects}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.listContainer, { paddingBottom: Math.max(insets.bottom + 90, 120) }]}
          renderItem={renderSubjectCard}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBox}>
                <Ionicons name="library-outline" size={48} color="#CBD5E1" />
              </View>
              <Text style={styles.emptyTitle}>No Subjects Found</Text>
              <Text style={styles.emptySubtitle}>Try adjusting your search query or switching your active filter.</Text>
            </View>
          }
        />
      )}
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
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  notificationButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    marginHorizontal: 20,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    padding: 0,
  },
  filterWrapper: {
    marginTop: 14,
    marginBottom: 6,
  },
  filterScroll: {
    paddingHorizontal: 20,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1.5,
  },
  chipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  chipInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  chipTextInactive: {
    color: '#64748B',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  cardContainer: {
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1.5,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  monogramBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  monogramText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  headerTextGroup: {
    flex: 1,
  },
  subjectTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 22,
    marginBottom: 3,
  },
  subjectMeta: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  actionCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resourceBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14,
    borderTopWidth: 1,
  },
  resourcePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  resourcePillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 18,
  },
});
