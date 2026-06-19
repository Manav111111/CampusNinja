import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  FlatList,
  Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

// Helper to define subject-specific resource content dynamically
const getSubjectResources = (subjectName) => {
  const defaultResources = {
    complete: [
      { id: 'c1', title: `Complete ${subjectName} Notes`, subtitle: 'Full Semester Notes', icon: 'document-text', iconColor: '#2563EB', bgColor: '#EFF6FF' },
      { id: 'c2', title: 'Important Notes', subtitle: 'Most Exam-Relevant Topics', icon: 'star', iconColor: '#F59E0B', bgColor: '#FEF3C7' },
      { id: 'c3', title: 'Formula Sheet', subtitle: 'Quick Revision Material', icon: 'flash', iconColor: '#10B981', bgColor: '#D1FAE5' },
    ],
    units: [
      { id: 'u1', title: 'Unit 1 Notes', subtitle: 'Introduction & Foundations', icon: 'document-text', iconColor: '#8B5CF6', bgColor: '#F5F3FF' },
      { id: 'u2', title: 'Unit 2 Notes', subtitle: 'Core Concepts & Theories', icon: 'document-text', iconColor: '#8B5CF6', bgColor: '#F5F3FF' },
      { id: 'u3', title: 'Unit 3 Notes', subtitle: 'Advanced Applications', icon: 'document-text', iconColor: '#8B5CF6', bgColor: '#F5F3FF' },
      { id: 'u4', title: 'Unit 4 Notes', subtitle: 'Practical Integration', icon: 'document-text', iconColor: '#8B5CF6', bgColor: '#F5F3FF' },
      { id: 'u5', title: 'Unit 5 Notes', subtitle: 'Review & Case Studies', icon: 'document-text', iconColor: '#8B5CF6', bgColor: '#F5F3FF' },
    ]
  };

  const subjectData = {
    'Physics': {
      complete: [
        { id: 'c1', title: 'Complete Physics Notes', subtitle: 'Full Semester Notes', icon: 'document-text', iconColor: '#2563EB', bgColor: '#EFF6FF' },
        { id: 'c2', title: 'Important Notes', subtitle: 'Most Exam-Relevant Topics', icon: 'star', iconColor: '#F59E0B', bgColor: '#FEF3C7' },
        { id: 'c3', title: 'Formula Sheet', subtitle: 'Quick Revision Material', icon: 'flash', iconColor: '#10B981', bgColor: '#D1FAE5' },
      ],
      units: [
        { id: 'u1', title: 'Unit 1 Notes', subtitle: 'Units and Measurements', icon: 'document-text', iconColor: '#8B5CF6', bgColor: '#F5F3FF' },
        { id: 'u2', title: 'Unit 2 Notes', subtitle: 'Kinematics', icon: 'document-text', iconColor: '#8B5CF6', bgColor: '#F5F3FF' },
        { id: 'u3', title: 'Unit 3 Notes', subtitle: 'Laws of Motion', icon: 'document-text', iconColor: '#8B5CF6', bgColor: '#F5F3FF' },
        { id: 'u4', title: 'Unit 4 Notes', subtitle: 'Work, Power and Energy', icon: 'document-text', iconColor: '#8B5CF6', bgColor: '#F5F3FF' },
        { id: 'u5', title: 'Unit 5 Notes', subtitle: 'Rotational Motion', icon: 'document-text', iconColor: '#8B5CF6', bgColor: '#F5F3FF' },
      ]
    },
    'Mathematics': {
      complete: [
        { id: 'c1', title: 'Complete Mathematics Notes', subtitle: 'Full Semester Notes', icon: 'document-text', iconColor: '#2563EB', bgColor: '#EFF6FF' },
        { id: 'c2', title: 'Important Formula Book', subtitle: 'All Semester Formulas', icon: 'star', iconColor: '#F59E0B', bgColor: '#FEF3C7' },
        { id: 'c3', title: 'Syllabus & Blueprint', subtitle: 'Exam Weightage & Topics', icon: 'flash', iconColor: '#10B981', bgColor: '#D1FAE5' },
      ],
      units: [
        { id: 'u1', title: 'Unit 1 Notes', subtitle: 'Matrices & Linear Algebra', icon: 'document-text', iconColor: '#8B5CF6', bgColor: '#F5F3FF' },
        { id: 'u2', title: 'Unit 2 Notes', subtitle: 'Differential Calculus', icon: 'document-text', iconColor: '#8B5CF6', bgColor: '#F5F3FF' },
        { id: 'u3', title: 'Unit 3 Notes', subtitle: 'Integral Calculus', icon: 'document-text', iconColor: '#8B5CF6', bgColor: '#F5F3FF' },
        { id: 'u4', title: 'Unit 4 Notes', subtitle: 'Numerical Methods', icon: 'document-text', iconColor: '#8B5CF6', bgColor: '#F5F3FF' },
        { id: 'u5', title: 'Unit 5 Notes', subtitle: 'Probability & Statistics', icon: 'document-text', iconColor: '#8B5CF6', bgColor: '#F5F3FF' },
      ]
    },
    'Programming in C': {
      complete: [
        { id: 'c1', title: 'Complete C Programming Notes', subtitle: 'Full Semester Notes', icon: 'document-text', iconColor: '#2563EB', bgColor: '#EFF6FF' },
        { id: 'c2', title: 'Lab Manual & Code Files', subtitle: 'Solved Program Exercises', icon: 'star', iconColor: '#F59E0B', bgColor: '#FEF3C7' },
        { id: 'c3', title: 'C Quick Cheatsheet', subtitle: 'Syntax & Standard Functions', icon: 'flash', iconColor: '#10B981', bgColor: '#D1FAE5' },
      ],
      units: [
        { id: 'u1', title: 'Unit 1 Notes', subtitle: 'Introduction & Basic Datatypes', icon: 'document-text', iconColor: '#8B5CF6', bgColor: '#F5F3FF' },
        { id: 'u2', title: 'Unit 2 Notes', subtitle: 'Control Statements & Loops', icon: 'document-text', iconColor: '#8B5CF6', bgColor: '#F5F3FF' },
        { id: 'u3', title: 'Unit 3 Notes', subtitle: 'Arrays and Functions', icon: 'document-text', iconColor: '#8B5CF6', bgColor: '#F5F3FF' },
        { id: 'u4', title: 'Unit 4 Notes', subtitle: 'Pointers & Memory Allocation', icon: 'document-text', iconColor: '#8B5CF6', bgColor: '#F5F3FF' },
        { id: 'u5', title: 'Unit 5 Notes', subtitle: 'Structures, Unions & Files', icon: 'document-text', iconColor: '#8B5CF6', bgColor: '#F5F3FF' },
      ]
    },
    'Electrical Engineering': {
      complete: [
        { id: 'c1', title: 'Complete Electrical Notes', subtitle: 'Full Semester Notes', icon: 'document-text', iconColor: '#2563EB', bgColor: '#EFF6FF' },
        { id: 'c2', title: 'Solved Numerical Problems', subtitle: 'Step-by-step math guide', icon: 'star', iconColor: '#F59E0B', bgColor: '#FEF3C7' },
        { id: 'c3', title: 'Lab Experiments Booklet', subtitle: 'Diagrams & Readings', icon: 'flash', iconColor: '#10B981', bgColor: '#D1FAE5' },
      ],
      units: [
        { id: 'u1', title: 'Unit 1 Notes', subtitle: 'DC Circuits & Theorems', icon: 'document-text', iconColor: '#8B5CF6', bgColor: '#F5F3FF' },
        { id: 'u2', title: 'Unit 2 Notes', subtitle: 'AC Fundamentals', icon: 'document-text', iconColor: '#8B5CF6', bgColor: '#F5F3FF' },
        { id: 'u3', title: 'Unit 3 Notes', subtitle: 'Transformers', icon: 'document-text', iconColor: '#8B5CF6', bgColor: '#F5F3FF' },
        { id: 'u4', title: 'Unit 4 Notes', subtitle: 'Electrical Machines', icon: 'document-text', iconColor: '#8B5CF6', bgColor: '#F5F3FF' },
        { id: 'u5', title: 'Unit 5 Notes', subtitle: 'Basic Semiconductor Devices', icon: 'document-text', iconColor: '#8B5CF6', bgColor: '#F5F3FF' },
      ]
    },
    'Communication Skills': {
      complete: [
        { id: 'c1', title: 'Complete Communication Notes', subtitle: 'Full Semester Notes', icon: 'document-text', iconColor: '#2563EB', bgColor: '#EFF6FF' },
        { id: 'c2', title: 'Grammar & Vocabulary Guide', subtitle: 'Essential Rules & Words', icon: 'star', iconColor: '#F59E0B', bgColor: '#FEF3C7' },
        { id: 'c3', title: 'Professional Writing PPTs', subtitle: 'Emails, Letters & Reports', icon: 'flash', iconColor: '#10B981', bgColor: '#D1FAE5' },
      ],
      units: [
        { id: 'u1', title: 'Unit 1 Notes', subtitle: 'Basics of Communication', icon: 'document-text', iconColor: '#8B5CF6', bgColor: '#F5F3FF' },
        { id: 'u2', title: 'Unit 2 Notes', subtitle: 'Vocabulary & Sentence Building', icon: 'document-text', iconColor: '#8B5CF6', bgColor: '#F5F3FF' },
        { id: 'u3', title: 'Unit 3 Notes', subtitle: 'Reading & Writing Skills', icon: 'document-text', iconColor: '#8B5CF6', bgColor: '#F5F3FF' },
        { id: 'u4', title: 'Unit 4 Notes', subtitle: 'Verbal & Non-Verbal Skills', icon: 'document-text', iconColor: '#8B5CF6', bgColor: '#F5F3FF' },
        { id: 'u5', title: 'Unit 5 Notes', subtitle: 'Professional Correspondence', icon: 'document-text', iconColor: '#8B5CF6', bgColor: '#F5F3FF' },
      ]
    }
  };

  return subjectData[subjectName] || defaultResources;
};

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

  const resources = getSubjectResources(subject.title);

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
          <Text style={styles.headerTitle}>{subject.title}</Text>
          <View style={styles.headerSubtitleContainer}>
            <Text style={styles.subtitleGray}>B.Tech CSE</Text>
            <View style={styles.dotSeparator} />
            <Text style={styles.subtitleBlue}>Semester 1</Text>
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
        <View style={[styles.bannerContainer, { backgroundColor: subject.iconColor }]}>
          {/* Decorative Background Circles */}
          <View style={styles.bannerCircle1} />
          <View style={styles.bannerCircle2} />

          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>{subject.title}</Text>
            <View style={styles.bannerBadge}>
              <Text style={styles.bannerBadgeText}>Semester 1</Text>
            </View>
            <Text style={styles.bannerDescription}>
              Everything you need for your {subject.title} exam.
            </Text>

            <View style={styles.metaRow}>
              <View style={styles.metaCapsule}>
                <Ionicons name="document-text-outline" size={14} color="#FFFFFF" style={styles.metaIcon} />
                <Text style={styles.metaText}>8 Notes Available</Text>
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
        {activeTab === 'notes' ? (
          <View style={styles.notesSection}>
            {/* Complete Resources */}
            <Text style={styles.sectionHeader}>Complete Resources</Text>
            <View style={styles.resourceList}>
              {resources.complete.map(renderResourceCard)}
            </View>

            {/* Unit Wise Notes */}
            <Text style={styles.sectionHeader}>Unit Wise Notes</Text>
            <View style={styles.resourceList}>
              {resources.units.map(renderResourceCard)}
            </View>
          </View>
        ) : (
          <View style={styles.emptyTabContainer}>
            <Ionicons name="folder-open-outline" size={64} color="#94A3B8" />
            <Text style={styles.emptyTabText}>{activeTab.toUpperCase()} Category Coming Soon</Text>
            <Text style={styles.emptyTabSubtext}>We are currently aggregating premium resources for this subject.</Text>
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
