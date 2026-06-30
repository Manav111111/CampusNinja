import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  RefreshControl,
  Linking
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSkillResources } from '../services/supabase';

const tabs = [
  { id: 'roadmap', label: 'Roadmap', icon: 'map-outline' },
  { id: 'notes', label: 'Notes', icon: 'document-text-outline' },
  { id: 'playlist', label: 'Playlists', icon: 'play-circle-outline' },
  { id: 'project', label: 'Projects', icon: 'code-slash-outline' },
  { id: 'article', label: 'Articles', icon: 'reader-outline' },
  { id: 'resource', label: 'Resources', icon: 'folder-open-outline' },
];

export default function SkillDetailScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { skill } = route.params || { 
    skill: { 
      name: 'Skill Details', 
      difficulty_level: 'beginner',
      theme_color: '#8B5CF6'
    } 
  };

  const [activeTab, setActiveTab] = useState(route?.params?.initialTab || 'roadmap');
  const [downloadedItems, setDownloadedItems] = useState({});
  const [downloadingItems, setDownloadingItems] = useState({});
  const [savedResourceIds, setSavedResourceIds] = useState(new Set());
  
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadSkillData();
      loadSavedState();
    }, [skill])
  );

  const loadSavedState = async () => {
    try {
      const stored = await AsyncStorage.getItem('saved_resources');
      if (stored) {
        const parsed = JSON.parse(stored);
        const ids = new Set(parsed.map(item => item.id));
        setSavedResourceIds(ids);
      }
    } catch (e) {
      console.log('Error loading saved resources state:', e);
    }
  };

  const loadSkillData = async () => {
    if (!skill?.id) {
      setLoading(false);
      return;
    }
    try {
      const data = await getSkillResources(skill.id);
      if (data) {
        const mappedData = data.map(r => {
          let normType = (r.type || 'resource').toLowerCase();
          const targetUrl = r.file_url || r.drive_url || r.youtube_url || r.external_url || '';

          let icon = 'document-text';
          let iconColor = '#8B5CF6';
          let bgColor = '#F3E8FF';
          
          if (normType === 'playlist' || normType === 'video') {
            normType = 'playlist';
            icon = 'play-circle';
            iconColor = '#EF4444';
            bgColor = '#FEE2E2';
          } else if (normType === 'roadmap') {
            icon = 'map';
            iconColor = '#10B981';
            bgColor = '#D1FAE5';
          } else if (normType === 'project') {
            icon = 'code-slash';
            iconColor = '#F59E0B';
            bgColor = '#FEF3C7';
          } else if (normType === 'article') {
            icon = 'reader';
            iconColor = '#3B82F6';
            bgColor = '#DBEAFE';
          } else if (normType === 'notes') {
            icon = 'document-text';
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
            subjectTitle: skill.name || skill.title,
          };
        });
        setResources(mappedData);

        if (mappedData.length > 0) {
          const activeTabCount = mappedData.filter(r => r.type === activeTab).length;
          if (activeTabCount === 0) {
            const firstAvailable = tabs.find(t => mappedData.some(r => r.type === t.id));
            if (firstAvailable) setActiveTab(firstAvailable.id);
          }
        }
      }
    } catch (e) {
      console.log('Error loading skill resources:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredResources = resources.filter(res => res.type === activeTab);

  const getTabCount = (tabId) => {
    return resources.filter(res => res.type === tabId).length;
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
          subjectTitle: skill.name || skill.title,
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

  const handleResourcePress = async (item) => {
    if (!item.targetUrl) {
      Alert.alert('No Link Available', 'This skill resource does not have an attached file or URL.');
      return;
    }
    try {
      if (item.storage_type === 'youtube' || item.youtube_url) {
        await Linking.openURL(item.targetUrl);
      } else {
        await WebBrowser.openBrowserAsync(item.targetUrl);
      }
    } catch (e) {
      Alert.alert('Error', 'Unable to open resource link.');
    }
  };

  const handleDownload = async (item) => {
    if (!item.targetUrl) {
      Alert.alert('Download Error', 'No downloadable link available for this resource.');
      return;
    }
    setDownloadingItems(prev => ({ ...prev, [item.id]: true }));
    try {
      await Linking.openURL(item.targetUrl);
      setDownloadedItems(prev => ({ ...prev, [item.id]: true }));
    } catch (e) {
      Alert.alert('Download Failed', 'Could not open download link.');
    } finally {
      setDownloadingItems(prev => ({ ...prev, [item.id]: false }));
    }
  };

  const renderResourceCard = (item) => {
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
        </View>

        <View style={styles.cardActions}>
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
              <ActivityIndicator size="small" color="#8B5CF6" />
            ) : isDownloaded ? (
              <Ionicons name="checkmark-circle" size={22} color="#10B981" />
            ) : (
              <Ionicons name="cloud-download-outline" size={22} color="#64748B" />
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const themeColor = skill?.theme_color || '#8B5CF6';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Skill Path Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={() => {
              setRefreshing(true);
              loadSkillData();
            }} 
          />
        }
      >
        {/* Banner */}
        <View style={[styles.bannerCard, { backgroundColor: themeColor + '15', borderColor: themeColor + '30' }]}>
          <View style={[styles.folderIconLarge, { backgroundColor: themeColor + '25' }]}>
            <Ionicons name="briefcase-outline" size={32} color={themeColor} />
          </View>
          
          <Text style={styles.subjectName}>{skill.name || skill.title}</Text>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: themeColor + '20' }]}>
              <Text style={[styles.badgeText, { color: themeColor }]}>
                🎯 {skill.difficulty_level ? skill.difficulty_level.toUpperCase() : 'ALL LEVELS'}
              </Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>📚 {resources.length} Resources</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.tabsContainer}
          contentContainerStyle={styles.tabsContent}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const count = getTabCount(tab.id);
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tab, isActive && [styles.activeTab, { backgroundColor: themeColor }]]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Ionicons 
                  name={tab.icon} 
                  size={16} 
                  color={isActive ? '#FFFFFF' : '#64748B'} 
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                  {tab.label} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Resources List */}
        <View style={[styles.resourcesSection, { paddingBottom: Math.max(insets.bottom + 40, 60) }]}>
          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={themeColor} />
            </View>
          ) : filteredResources.length > 0 ? (
            filteredResources.map(item => renderResourceCard(item))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="folder-open-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No resources yet</Text>
              <Text style={styles.emptySubtitle}>
                We are preparing {tabs.find(t => t.id === activeTab)?.label.toLowerCase()} for this skill path.
              </Text>
            </View>
          )}
        </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    textAlign: 'center',
  },
  bannerCard: {
    margin: 16,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  folderIconLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  subjectName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  badge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  tabsContainer: {
    maxHeight: 52,
    marginBottom: 16,
  },
  tabsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeTab: {
    borderColor: 'transparent',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  resourcesSection: {
    paddingHorizontal: 16,
    gap: 12,
  },
  loaderContainer: {
    padding: 40,
    alignItems: 'center',
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 3,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionIconButton: {
    padding: 4,
  },
  downloadButton: {
    padding: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
});
