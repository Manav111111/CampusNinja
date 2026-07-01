import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Image,
  Share
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Toast } from '../context/ToastContext';
import { COLORS } from '../constants/colors';
import { getResources } from '../services/supabase';

const tabs = [
  { id: 'syllabus', label: 'Syllabus', icon: 'newspaper-outline' },
  { id: 'notes', label: 'Notes', icon: 'document-text-outline' },
  { id: 'pyqs', label: 'PYQs', icon: 'layers-outline' },
  { id: 'videos', label: 'Videos', icon: 'play-circle-outline' },
  { id: 'important', label: 'Important Questions', icon: 'star-outline' },
  { id: 'ai', label: 'AI Resources', icon: 'sparkles-outline' },
];

export default function SubjectDetailScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { subject } = route.params || { 
    subject: { 
      title: 'Subject Details', 
      iconColor: '#2563EB', 
      bgColor: '#EFF6FF', 
      folderColor: '#DBEAFE' 
    } 
  };

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeTab, setActiveTab] = useState(route?.params?.initialTab || 'syllabus');
  const [downloadedItems, setDownloadedItems] = useState({});
  const [downloadingItems, setDownloadingItems] = useState({});
  const [savedResourceIds, setSavedResourceIds] = useState(new Set());
  
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [branchName, setBranchName] = useState('B.Tech');
  const [semesterNum, setSemesterNum] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadResources();
      loadSavedState();
    }, [subject?.id])
  );

  useEffect(() => {
    loadAcademicInfo();
  }, []);

  const loadSavedState = async () => {
    try {
      const stored = await AsyncStorage.getItem('saved_resources');
      if (stored) {
        const parsed = JSON.parse(stored);
        setSavedResourceIds(new Set(parsed.map(r => r.id)));
      }
    } catch (e) {
      console.log('Error loading saved resources:', e);
    }
  };

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

  const loadResources = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      if (subject?.id) {
        const data = await getResources(subject.id);
        const mappedData = (data || []).map(r => {
          let normType = r.type ? r.type.toString().trim().toLowerCase() : 'notes';
          if (normType === 'pyq') normType = 'pyqs';
          if (normType === 'video') normType = 'videos';
          if (normType === 'important_questions') normType = 'important';
          if (normType === 'ai_resources') normType = 'ai';

          const targetUrl = r.file_url || r.drive_url || r.youtube_url || r.external_url || '';

          let icon = 'document-text';
          let iconColor = '#2563EB';
          let bgColor = '#EFF6FF';
          if (normType === 'videos') {
            icon = 'play-circle';
            iconColor = '#EF4444';
            bgColor = '#FEE2E2';
          } else if (normType === 'pyqs') {
            icon = 'layers';
            iconColor = '#8B5CF6';
            bgColor = '#F3E8FF';
          } else if (normType === 'syllabus') {
            icon = 'newspaper';
            iconColor = '#10B981';
            bgColor = '#D1FAE5';
          } else if (normType === 'important') {
            icon = 'star';
            iconColor = '#F59E0B';
            bgColor = '#FEF3C7';
          } else if (normType === 'ai') {
            icon = 'sparkles';
            iconColor = '#EC4899';
            bgColor = '#FCE7F3';
          }

          return {
            ...r,
            type: normType,
            title: r.title,
            subtitle: r.description || `${normType.toUpperCase()} Material`,
            icon,
            iconColor,
            bgColor,
            targetUrl,
            subjectTitle: subject.name || subject.title,
          };
        });
        setResources(mappedData);

        // If active tab has 0 items and syllabus also has 0, auto-switch to first tab with items
        if (mappedData.length > 0) {
          const syllabusCount = mappedData.filter(r => r.type === 'syllabus').length;
          if (syllabusCount === 0 && activeTab === 'syllabus') {
            const firstAvailable = tabs.find(t => mappedData.some(r => r.type === t.id));
            if (firstAvailable) setActiveTab(firstAvailable.id);
          }
        }
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredResources = resources.filter(res => res.type === activeTab);

  const getTabCount = (tabId) => {
    return resources.filter(res => res.type === tabId).length;
  };

  const handleShareSubject = async () => {
    try {
      const subjectLabel = subject?.name || subject?.title || 'Study Material';
      await Share.share({
        message: `Check out ${subjectLabel} resources on CampusNinja!`,
      });
    } catch (e) {
      console.log('Error sharing subject:', e);
    }
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    Toast.show({
      type: !isBookmarked ? 'success' : 'info',
      title: !isBookmarked ? 'Subject bookmarked' : 'Subject removed',
      message: !isBookmarked ? 'Added to your bookmarks.' : 'Removed from your bookmarks.'
    });
  };

  const toggleSaveResource = async (item) => {
    try {
      const stored = await AsyncStorage.getItem('saved_resources');
      let currentSaved = stored ? JSON.parse(stored) : [];
      const exists = currentSaved.some(r => r.id === item.id);

      if (exists) {
        currentSaved = currentSaved.filter(r => r.id !== item.id);
        savedResourceIds.delete(item.id);
        setSavedResourceIds(new Set(savedResourceIds));
      } else {
        currentSaved.push({
          id: item.id,
          title: item.title,
          subtitle: item.subtitle,
          type: item.type,
          targetUrl: item.targetUrl,
          subjectTitle: subject.name || subject.title,
          icon: item.icon,
          iconColor: item.iconColor,
          bgColor: item.bgColor,
        });
        setSavedResourceIds(new Set([...savedResourceIds, item.id]));
      }

      await AsyncStorage.setItem('saved_resources', JSON.stringify(currentSaved));
    } catch (e) {
      console.log('Error toggling saved resource:', e);
    }
  };

  const extractYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleResourcePress = async (item) => {
    if (!item.targetUrl) {
      Toast.show({ type: 'warning', title: 'No Link Available', message: 'This resource does not have an attached file or URL.' });
      return;
    }
    try {
      if (item.type === 'videos' || item.storage_type === 'youtube' || item.youtube_url) {
        await Linking.openURL(item.targetUrl);
      } else {
        await WebBrowser.openBrowserAsync(item.targetUrl);
      }
    } catch (e) {
      Toast.show({ type: 'error', title: 'Error', message: 'Unable to open resource link.' });
    }
  };

  const handleShareResource = async (item) => {
    if (!item.targetUrl) {
      Toast.show({ type: 'warning', title: 'Share Error', message: 'No URL available to share for this resource.' });
      return;
    }
    try {
      const subjectLabel = subject?.name || subject?.title || 'Study Material';
      await Share.share({
        message: `${item.title || ''} (${subjectLabel}) study material from CampusNinja:\n${item.targetUrl}`,
        url: item.targetUrl,
      });
    } catch (e) {
      console.log('Error sharing resource:', e);
    }
  };

  const handleDownload = async (item) => {
    if (!item.targetUrl) {
      Toast.show({ type: 'warning', title: 'Download Error', message: 'No downloadable link available for this resource.' });
      return;
    }
    setDownloadingItems(prev => ({ ...prev, [item.id]: true }));
    try {
      let downloadUrl = item.targetUrl;
      const driveMatch = downloadUrl.match(/(?:\/file\/d\/|id=)([a-zA-Z0-9_-]+)/);
      if (driveMatch && driveMatch[1]) {
        downloadUrl = `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`;
      } else if (downloadUrl.includes('/storage/v1/object/public/') && !downloadUrl.includes('download=')) {
        const cleanTitle = (item.title || 'CampusNinja_Study_Material').replace(/[^a-zA-Z0-9._-]/g, '_');
        const filename = cleanTitle.toLowerCase().endsWith('.pdf') ? cleanTitle : `${cleanTitle}.pdf`;
        const separator = downloadUrl.includes('?') ? '&' : '?';
        downloadUrl = `${downloadUrl}${separator}download=${encodeURIComponent(filename)}`;
      }

      await Linking.openURL(downloadUrl);
      setDownloadedItems(prev => ({ ...prev, [item.id]: true }));
      Toast.show({
        type: 'success',
        title: 'Download Started',
        message: 'The file download has started directly to your phone storage (Downloads folder).'
      });
    } catch (e) {
      Toast.show({ type: 'error', title: 'Download Failed', message: 'Could not open download link.' });
    } finally {
      setDownloadingItems(prev => ({ ...prev, [item.id]: false }));
    }
  };

  const renderVideoCard = (item) => {
    const isSaved = savedResourceIds.has(item.id);
    const videoId = extractYouTubeId(item.targetUrl || item.youtube_url);
    const thumbUrl = item.thumbnail_url || (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null);

    return (
      <TouchableOpacity 
        key={item.id} 
        style={styles.videoCard}
        activeOpacity={0.8}
        onPress={() => handleResourcePress(item)}
      >
        <View style={styles.videoThumbnailContainer}>
          {thumbUrl ? (
            <Image source={{ uri: thumbUrl }} style={styles.videoThumbnail} resizeMode="cover" />
          ) : (
            <View style={[styles.videoThumbnailPlaceholder, { backgroundColor: '#1E293B' }]}>
              <Ionicons name="videocam" size={40} color="#64748B" />
            </View>
          )}
          
          <View style={styles.videoPlayOverlay}>
            <View style={styles.playButtonCircle}>
              <Ionicons name="play" size={26} color="#FFFFFF" style={{ marginLeft: 3 }} />
            </View>
          </View>

          <View style={styles.youtubeBadge}>
            <Ionicons name="logo-youtube" size={14} color="#EF4444" />
            <Text style={styles.youtubeBadgeText}>YouTube</Text>
          </View>
        </View>

        <View style={styles.videoContent}>
          <Text style={styles.videoTitle} numberOfLines={2}>{item.title}</Text>
          {item.subtitle ? <Text style={styles.videoSubtitle} numberOfLines={1}>{item.subtitle}</Text> : null}

          <View style={styles.videoActions}>
            <TouchableOpacity 
              style={styles.watchButton}
              onPress={() => handleResourcePress(item)}
            >
              <Ionicons name="play-circle" size={18} color="#FFFFFF" />
              <Text style={styles.watchButtonText}>Watch on YouTube</Text>
            </TouchableOpacity>

            <View style={styles.videoSecondaryActions}>
              <TouchableOpacity 
                style={styles.videoIconButton}
                onPress={() => handleShareResource(item)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="share-social-outline" size={20} color="#64748B" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.videoIconButton}
                onPress={() => toggleSaveResource(item)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name={isSaved ? "bookmark" : "bookmark-outline"} size={20} color={isSaved ? "#EC4899" : "#64748B"} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderResourceCard = (item) => {
    if (item.type === 'videos' || item.storage_type === 'youtube') {
      return renderVideoCard(item);
    }

    const isDownloaded = downloadedItems[item.id];
    const isDownloading = downloadingItems[item.id];
    const isSaved = savedResourceIds.has(item.id);

    return (
      <TouchableOpacity 
        key={item.id} 
        style={styles.resourceCard}
        activeOpacity={0.7}
        onPress={() => handleResourcePress(item)}
      >
        <View style={[styles.iconContainer, { backgroundColor: item.bgColor }]}>
          <Ionicons name={item.icon} size={24} color={item.iconColor} />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
          {item.file_size ? (
            <Text style={styles.metaSizeText}>{item.file_size} • {item.file_format || item.storage_type.replace('_', ' ')}</Text>
          ) : null}
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={styles.actionIconButton}
            onPress={() => handleShareResource(item)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="share-social-outline" size={20} color="#64748B" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionIconButton}
            onPress={() => toggleSaveResource(item)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name={isSaved ? "bookmark" : "bookmark-outline"} size={20} color={isSaved ? "#EC4899" : "#94A3B8"} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.downloadButton}
            onPress={() => handleDownload(item)}
            disabled={isDownloading}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {isDownloading ? (
              <ActivityIndicator size="small" color="#2563EB" />
            ) : isDownloaded ? (
              <Ionicons name="checkmark-circle" size={22} color="#10B981" />
            ) : (
              <Ionicons name="download-outline" size={22} color="#2563EB" />
            )}
          </TouchableOpacity>
        </View>
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
            onPress={handleShareSubject}
          >
            <Ionicons name="share-social-outline" size={22} color="#111827" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadResources(true)}
            colors={[COLORS.primary]}
          />
        }
      >
        
        {/* Dynamic Hero Banner */}
        <View style={[styles.bannerContainer, { backgroundColor: subject.theme_color || subject.iconColor || '#2563EB' }]}>
          {/* Decorative Background Circles */}
          <View style={styles.bannerCircle1} />
          <View style={styles.bannerCircle2} />

          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>{subject.name || subject.title}</Text>
            <View style={styles.bannerBadge}>
              <Text style={styles.bannerBadgeText}>{semesterNum || 'Semester'}</Text>
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
                <Ionicons name="bookmark" size={14} color="#FFFFFF" style={styles.metaIcon} />
                <Text style={styles.metaText}>{savedResourceIds.size} Saved</Text>
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
              const count = getTabCount(tab.id);
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
                    {tab.label} {count > 0 ? `(${count})` : ''}
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
  metaSizeText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 3,
    fontWeight: '500',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconButton: {
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 2,
  },
  downloadButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  videoThumbnailContainer: {
    width: '100%',
    height: 180,
    backgroundColor: '#0F172A',
    position: 'relative',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  videoThumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlayOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  playButtonCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(239, 68, 68, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  youtubeBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  youtubeBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  videoContent: {
    padding: 16,
  },
  videoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 21,
    marginBottom: 4,
  },
  videoSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 14,
  },
  videoActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  watchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  watchButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  videoSecondaryActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoIconButton: {
    padding: 8,
    marginLeft: 4,
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
