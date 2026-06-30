import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity,
  Dimensions,
  Image,
  FlatList,
  Linking
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { getBanners, getSkills } from '../services/supabase';

const { width } = Dimensions.get('window');

const fallbackSkills = [
  {
    id: '1',
    name: 'Data Structures & Algorithms',
    difficulty_level: 'intermediate',
    theme_color: '#8B5CF6',
    icon: 'hardware-chip-outline',
    description: 'Placement Preparation • Problem Solving',
  },
  {
    id: '2',
    name: 'Web Development',
    difficulty_level: 'beginner',
    theme_color: '#2563EB',
    icon: 'laptop-outline',
    description: 'Frontend • Backend • MERN Stack',
  },
  {
    id: '3',
    name: 'Generative AI',
    difficulty_level: 'advanced',
    theme_color: '#10B981',
    icon: 'logo-android',
    description: 'Prompt Engineering • LLMs',
  },
  {
    id: '4',
    name: 'Agentic AI',
    difficulty_level: 'advanced',
    theme_color: '#F59E0B',
    icon: 'settings-outline',
    description: 'AI Agents • Workflows • Automation',
  },
  {
    id: '5',
    name: 'Data Science',
    difficulty_level: 'intermediate',
    theme_color: '#D97706',
    icon: 'bar-chart-outline',
    description: 'Python • Machine Learning • Deep Learning',
  },
  {
    id: '6',
    name: 'Cloud Computing',
    difficulty_level: 'intermediate',
    theme_color: '#06B6D4',
    icon: 'cloud-outline',
    description: 'AWS • DevOps • Deployment',
  },
  {
    id: '7',
    name: 'UI/UX Design',
    difficulty_level: 'beginner',
    theme_color: '#DB2777',
    icon: 'color-palette-outline',
    description: 'Design Systems • Figma',
  },
];

export default function SkillsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const [banners, setBanners] = useState([]);
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    if (isFocused) {
      loadData();
    }
  }, [isFocused]);

  const loadData = async () => {
    try {
      const [bannersData, skillsData] = await Promise.all([
        getBanners('skills').catch(() => []),
        getSkills().catch(() => [])
      ]);
      setBanners(bannersData || []);
      setSkills(skillsData && skillsData.length > 0 ? skillsData : fallbackSkills);
    } catch (error) {
      console.error(error);
      setSkills(fallbackSkills);
    }
  };

  const handleBannerPress = (url) => {
    if (url) {
      Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
    }
  };

  const getSkillIcon = (skill, index) => {
    if (skill.icon) return skill.icon;
    const icons = ['hardware-chip-outline', 'laptop-outline', 'logo-android', 'settings-outline', 'bar-chart-outline', 'cloud-outline', 'color-palette-outline'];
    return icons[index % icons.length];
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Skills</Text>
          <Text style={styles.headerSubtitle}>Explore Career Paths</Text>
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={() => navigation.navigate('Search')}>
          <Ionicons name="search-outline" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom + 80, 110) }]}>
        
        {/* Dynamic Banners */}
        {banners.length > 0 ? (
          <FlatList
            data={banners}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[styles.bannerContainer, { width: width - 32 }]}
                activeOpacity={0.9}
                onPress={() => handleBannerPress(item.button_url)}
              >
                {item.image_url ? (
                  <Image source={{ uri: item.image_url }} style={StyleSheet.absoluteFillObject} />
                ) : (
                  <View style={styles.bannerContent}>
                    <Text style={styles.bannerTitle}>{item.title}</Text>
                    <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
                    {item.button_text ? (
                      <View style={styles.bannerButton}>
                        <Text style={styles.bannerButtonText}>{item.button_text}</Text>
                        <Ionicons name="arrow-forward" size={14} color="#111827" />
                      </View>
                    ) : null}
                  </View>
                )}
              </TouchableOpacity>
            )}
          />
        ) : (
          <View style={[styles.bannerContainer, { width: width - 32 }]}>
            <View style={styles.bannerCircle1} />
            <View style={styles.bannerCircle2} />
            <View style={styles.bannerCircle3} />
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>Build Skills That Get You{"\n"}Internships & Placements</Text>
              <Text style={styles.bannerDescription}>
                Explore curated roadmaps, notes,{"\n"}projects and resources.
              </Text>
            </View>
          </View>
        )}

        {/* Section Title */}
        <Text style={styles.sectionTitle}>Learning Paths</Text>

        {/* Learning Paths List */}
        <View style={styles.listContainer}>
          {skills.map((item, index) => {
            const themeColor = item.theme_color || '#8B5CF6';
            const iconName = getSkillIcon(item, index);
            return (
              <TouchableOpacity 
                key={item.id || index.toString()} 
                style={styles.pathCard}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('SkillDetail', { skill: item })}
              >
                <View style={[styles.iconContainer, { backgroundColor: themeColor + '20' }]}>
                  <Ionicons name={iconName} size={24} color={themeColor} />
                </View>
                
                <View style={styles.textContainer}>
                  <Text style={styles.cardTitle}>{item.name || item.title}</Text>
                  <Text style={styles.cardSubtitle}>{item.description || item.subtitle || `${item.difficulty_level || 'General'} Level Path`}</Text>
                </View>

                <Ionicons name="chevron-forward" size={20} color={themeColor} style={styles.chevron} />
              </TouchableOpacity>
            );
          })}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  searchButton: {
    padding: 8,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  bannerContainer: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 24,
    borderRadius: 16,
    backgroundColor: '#E0E7FF',
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
    height: 180,
  },
  bannerCircle1: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    top: -50,
    right: -100,
  },
  bannerCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(79, 70, 229, 0.05)',
    bottom: -50,
    left: -40,
  },
  bannerCircle3: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    top: 40,
    right: 40,
  },
  bannerContent: {
    position: 'relative',
    zIndex: 1,
    maxWidth: '85%',
    flex: 1,
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    lineHeight: 28,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: '#4B5563',
    marginTop: 8,
  },
  bannerDescription: {
    fontSize: 13,
    color: '#374151',
    marginTop: 12,
    lineHeight: 20,
  },
  bannerButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  bannerButtonText: {
    color: '#111827',
    fontWeight: '600',
    fontSize: 12,
    marginRight: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 16,
    marginBottom: 16,
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  pathCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  chevron: {
    marginLeft: 8,
  },
});
