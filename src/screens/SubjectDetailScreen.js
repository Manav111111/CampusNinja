import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  FlatList,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { getResources } from '../services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const tabs = [
  { id: 'notes', label: 'Notes', icon: 'document-text-outline' },
  { id: 'pyqs', label: 'PYQs', icon: 'layers-outline' },
  { id: 'videos', label: 'Videos', icon: 'play-circle-outline' },
  { id: 'syllabus', label: 'Syllabus', icon: 'newspaper-outline' },
  { id: 'important', label: 'Important Questions', icon: 'star-outline' },
  { id: 'ai', label: 'AI Resources', icon: 'sparkles-outline' },
];

export default function SubjectDetailScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { subject } = route.params || { 
    subject: { 
      title: 'Physics', 
      iconColor: '#2563EB', 
      bgColor: '#EFF6FF', 
      folderColor: '#DBEAFE' 
    } 
  };

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeTab, setActiveTab] = useState('notes');
  const [downloadedItems, setDownloadedItems] = useState({});
  const [downloadingItems, setDownloadingItems] = useState({});
  
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [branchName, setBranchName] = useState('B.Tech');
  const [semesterNum, setSemesterNum] = useState('');

  useEffect(() => {
    loadResources();
    loadAcademicInfo();
  }, [subject]);

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

  const loadResources = async () => {
    try {
      setLoading(true);
      if (subject?.id) {
        const data = await getResources(subject.id);
        const mappedData = (data || []).map(r => ({
           ...r,
           type: r.type ? r.type.toLowerCase() : 'notes',
           title: r.title,
           subtitle: r.description || 'Study Material',
           icon: r.icon_name || 'document-text',
           iconColor: '#2563EB',
           bgColor: '#EFF6FF',
        }));
        setResources(mappedData);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = resources.filter(res => res.type === activeTab);

  const handleShare = () => {
    Alert.alert('Share Subject', `Share resources for ${subject.title} with your classmates.`);
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleDownload = (itemId, itemTitle) => {
    if (downloadedItems[itemId]) {
      Alert.alert('File Downloaded', `"${itemTitle}" is already downloaded and available offline.`);
      return;
    }

    // Simulate download progress
    setDownloadingItems(prev => ({ ...prev, [itemId]: true }));
    setTimeout(() => {
      setDownloadingItems(prev => ({ ...prev, [itemId]: false }));
      setDownloadedItems(prev => ({ ...prev, [itemId]: true }));
      Alert.alert('Download Complete', `"${itemTitle}" has been saved to your downloads.`);
    }, 1500);
  };

  // Helper to render resource items
  const renderResourceCard = (item) => {
    const isDownloaded = downloadedItems[item.id];
    const isDownloading = downloadingItems[item.id];

    return (
      <TouchableOpacity 
        key={item.id} 
        style={styles.resourceCard}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: item.bgColor }]}>
          <Ionicons name={item.icon} size={24} color={item.iconColor} />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
        </View>

        <TouchableOpacity 
          style={styles.downloadButton}
          onPress={() => handleDownload(item.id, item.title)}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <Ionicons name="sync" size={22} color="#94A3B8" style={styles.spin} />
          ) : isDownloaded ? (
            <Ionicons name="checkmark-circle" size={22} color="#10B981" />
          ) : (
            <Ionicons name="download-outline" size={22} color="#2563EB" />
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

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
          <Text style={styles.headerTitle}>{subject.name || subject.title}</Text>
          <View style={styles.headerSubtitleContainer}>
            <Text style={styles.subtitleGray}>{branchName}</Text>
            <View style={styles.dotSeparator} />
            <Text style={styles.subtitleBlue}>{semesterNum || 'Semester'}</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={toggleBookmark}
          >
            <Ionicons 
              name={isBookmarked ? "bookmark" : "bookmark-outline"} 
              size={22} 
              color={isBookmarked ? "#2563EB" : "#111827"} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={handleShare}
          >
            <Ionicons name="share-social-outline" size={22} color="#111827" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Dynamic Hero Banner */}
        <View style={[styles.bannerContainer, { backgroundColor: subject.theme_color || subject.iconColor || '#2563EB' }]}>
          {/* Decorative Background Circles */}
          <View style={styles.bannerCircle1} />
          <View style={styles.bannerCircle2} />

          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>{subject.name || subject.title}</Text>
            <View style={styles.bannerBadge}>
              <Text style={styles.bannerBadgeText}>Semester 1</Text>
            </View>
            <Text style={styles.bannerDescription}>
              Everything you need for your {subject.name || subject.title} exam.
            </Text>

            <View style={styles.metaRow}>
              <View style={styles.metaCapsule}>
                <Ionicons name="document-text-outline" size={14} color="#FFFFFF" style={styles.metaIcon} />
                <Text style={styles.metaText}>{resources.length} Items Available</Text>
              </View>
              <View style={styles.metaCapsule}>
                <Ionicons name="time-outline" size={14} color="#FFFFFF" style={styles.metaIcon} />
                <Text style={styles.metaText}>Last Updated 2 Days Ago</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Tab Selection */}
        <View style={styles.tabsWrapper}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsScroll}
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[
                    styles.tabButton,
                    isActive ? styles.tabActive : styles.tabInactive
                  ]}
                  onPress={() => setActiveTab(tab.id)}
                >
                  <Ionicons 
                    name={tab.icon} 
                    size={16} 
                    color={isActive ? '#FFFFFF' : '#6B7280'} 
                    style={styles.tabIcon}
                  />
                  <Text style={[
                    styles.tabText,
                    isActive ? styles.tabTextActive : styles.tabTextInactive
                  ]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Conditional Content Section */}
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 }}>
            <ActivityIndicator size="large" color="#FF6B00" />
          </View>
        ) : filteredResources.length > 0 ? (
          <View style={styles.notesSection}>
            <Text style={styles.sectionHeader}>{tabs.find(t => t.id === activeTab)?.label} Resources</Text>
            <View style={styles.resourceList}>
              {filteredResources.map(renderResourceCard)}
            </View>
          </View>
        ) : (
          <View style={styles.emptyTabContainer}>
            <Ionicons name="folder-open-outline" size={64} color="#94A3B8" />
            <Text style={styles.emptyTabText}>No {tabs.find(t => t.id === activeTab)?.label} Available Yet</Text>
            <Text style={{ color: '#9CA3AF', marginTop: 8 }}>Check back later or explore other tabs.</Text>
          </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  subtitleGray: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  subtitleBlue: {
    fontSize: 12,
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  bannerContainer: {
    margin: 16,
    borderRadius: 20,
    padding: 20,
    height: 190,
    position: 'relative',
    overflow: 'hidden',
  },
  bannerCircle1: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -40,
    right: -30,
  },
  bannerCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    bottom: -80,
    right: -40,
  },
  bannerContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  bannerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  bannerBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  bannerBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bannerDescription: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
    maxWidth: '80%',
  },
  metaRow: {
    flexDirection: 'row',
    marginTop: 12,
    flexWrap: 'wrap',
  },
  metaCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 4,
  },
  metaIcon: {
    marginRight: 4,
  },
  metaText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  tabsWrapper: {
    marginBottom: 8,
  },
  tabsScroll: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  tabActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  tabInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  tabIcon: {
    marginRight: 6,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  tabTextInactive: {
    color: '#6B7280',
  },
  notesSection: {
    paddingHorizontal: 16,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 12,
  },
  resourceList: {
    marginBottom: 8,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  downloadButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTabContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTabText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 12,
    textAlign: 'center',
  },
  emptyTabSubtext: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 18,
  },
});
