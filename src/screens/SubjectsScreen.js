import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  FlatList,
  ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { getSubjects } from '../services/supabase';
import { COLORS } from '../constants/colors';

// Custom Folder Icon Component
const FolderIcon = ({ iconName, iconColor, folderColor, textIcon }) => {
  return (
    <View style={styles.folderContainer}>
      {/* Folder Tab */}
      <View style={[styles.folderTab, { backgroundColor: folderColor }]} />
      {/* Folder Body */}
      <View style={[styles.folderBody, { backgroundColor: folderColor }]}>
        {textIcon ? (
          <Text style={[styles.textIconStyle, { color: iconColor }]}>{textIcon}</Text>
        ) : (
          <Ionicons name={iconName} size={22} color={iconColor} />
        )}
      </View>
    </View>
  );
};

const filterChips = [
  { id: 'all', label: 'All', icon: 'grid-outline' },
  { id: 'theory', label: 'Theory', icon: 'book-outline' },
  { id: 'practical', label: 'Practical', icon: 'flask-outline' },
  { id: 'important', label: 'Important', icon: 'star-outline' },
  { id: 'pinned', label: 'Pinned', icon: 'pin-outline' },
];

const isValidUUID = (uuid) => {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return typeof uuid === 'string' && regex.test(uuid);
};

export default function SubjectsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [branchName, setBranchName] = useState('B.Tech');
  const [semesterNum, setSemesterNum] = useState('');

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
      
      // If legacy ID is detected (i.e. not a valid UUID), clear and redirect to AcademicSetup
      if ((bId && !isValidUUID(bId)) || (sId && !isValidUUID(sId))) {
        await AsyncStorage.removeItem('userBranchId');
        await AsyncStorage.removeItem('userSemesterId');
        await AsyncStorage.removeItem('userBranchName');
        await AsyncStorage.removeItem('userSemesterNumber');
        navigation.replace('AcademicSetup');
        return;
      }
      
      if (bId && sId && isValidUUID(bId) && isValidUUID(sId)) {
        const data = await getSubjects(bId, sId);
        setSubjects(data || []);
      } else {
        setSubjects([]);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  // Handle Filtering
  const filteredSubjects = subjects.filter(subject => {
    const title = subject.title || subject.name || '';
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedFilter === 'all') return matchesSearch;
    
    const filterTypeMap = {
      theory: 'Theory',
      practical: 'Practical',
      important: 'Important',
      pinned: 'Pinned'
    };
    
    const requiredType = filterTypeMap[selectedFilter];
    return matchesSearch && (subject.types || []).includes(requiredType);
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Subjects</Text>
          <View style={styles.headerSubtitleContainer}>
            <Text style={styles.subtitleGray}>{branchName}</Text>
            <View style={styles.dotSeparator} />
            <Text style={styles.subtitleBlue}>{semesterNum || 'Semester'}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Ionicons name="notifications-outline" size={24} color="#111827" />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#94A3B8" style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Search Subjects..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
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
                <Ionicons 
                  name={chip.icon} 
                  size={16} 
                  color={isActive ? '#FFFFFF' : '#6B7280'} 
                  style={styles.chipIcon}
                />
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
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
          data={filteredSubjects}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.listContainer, { paddingBottom: Math.max(insets.bottom + 80, 110) }]}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.subjectCard, { backgroundColor: item.bgColor || '#F8FAFC' }]}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('SubjectDetail', { subject: item })}
            >
              <FolderIcon 
                iconName={item.icon || 'book-outline'} 
                iconColor={item.iconColor || '#2563EB'} 
                folderColor={item.folderColor || '#DBEAFE'}
                textIcon={item.textIcon}
              />
              
              <View style={styles.subjectTextContainer}>
                <Text style={styles.subjectTitle}>{item.title || item.name}</Text>
                <Text style={styles.subjectSubtitle}>{item.subtitle || 'Semester Material'}</Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color="#111827" style={styles.chevron} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyText}>No subjects match your search or filter</Text>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  subtitleGray: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  subtitleBlue: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '600',
  },
  dotSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#94A3B8',
    marginHorizontal: 6,
  },
  notificationButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    marginHorizontal: 16,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    padding: 0, // Reset default Android padding
  },
  filterWrapper: {
    marginTop: 16,
    marginBottom: 8,
  },
  filterScroll: {
    paddingHorizontal: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  chipInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  chipIcon: {
    marginRight: 6,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  chipTextInactive: {
    color: '#6B7280',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  subjectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  folderContainer: {
    width: 58,
    height: 46,
    position: 'relative',
    marginRight: 16,
  },
  folderTab: {
    width: 22,
    height: 8,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    position: 'absolute',
    top: 0,
    left: 4,
  },
  folderBody: {
    width: 58,
    height: 38,
    borderRadius: 8,
    position: 'absolute',
    bottom: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textIconStyle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subjectTextContainer: {
    flex: 1,
  },
  subjectTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  subjectSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  chevron: {
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
});
