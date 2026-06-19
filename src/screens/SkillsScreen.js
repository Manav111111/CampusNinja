import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

const learningPaths = [
  {
    id: '1',
    title: 'Data Structures & Algorithms',
    subtitle: 'Placement Preparation • Problem Solving',
    icon: 'hardware-chip-outline',
    iconColor: '#8B5CF6',
    bgColor: '#F3E8FF',
  },
  {
    id: '2',
    title: 'Web Development',
    subtitle: 'Frontend • Backend • MERN Stack',
    icon: 'laptop-outline',
    iconColor: '#2563EB',
    bgColor: '#DBEAFE',
  },
  {
    id: '3',
    title: 'Generative AI',
    subtitle: 'Prompt Engineering • LLMs',
    icon: 'logo-android',
    iconColor: '#10B981',
    bgColor: '#D1FAE5',
  },
  {
    id: '4',
    title: 'Agentic AI',
    subtitle: 'AI Agents • Workflows • Automation',
    icon: 'settings-outline',
    iconColor: '#F59E0B',
    bgColor: '#FEF3C7',
  },
  {
    id: '5',
    title: 'Data Science',
    subtitle: 'Python • Machine Learning • Deep Learning',
    icon: 'bar-chart-outline',
    iconColor: '#D97706',
    bgColor: '#FFEDD5',
  },
  {
    id: '6',
    title: 'Cloud Computing',
    subtitle: 'AWS • DevOps • Deployment',
    icon: 'cloud-outline',
    iconColor: '#06B6D4',
    bgColor: '#CFFAFE',
  },
  {
    id: '7',
    title: 'UI/UX Design',
    subtitle: 'Design Systems • Figma',
    icon: 'color-palette-outline',
    iconColor: '#DB2777',
    bgColor: '#FCE7F3',
  },
];

export default function SkillsScreen({ navigation }) {
  const insets = useSafeAreaInsets();

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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Hero Banner */}
        <View style={styles.bannerContainer}>
          {/* Decorative Abstract Background Circles */}
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

        {/* Section Title */}
        <Text style={styles.sectionTitle}>Learning Paths</Text>

        {/* Learning Paths List */}
        <View style={styles.listContainer}>
          {learningPaths.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.pathCard}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: item.bgColor }]}>
                <Ionicons name={item.icon} size={24} color={item.iconColor} />
              </View>
              
              <View style={styles.textContainer}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color="#2563EB" style={styles.chevron} />
            </TouchableOpacity>
          ))}
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
    minHeight: 180,
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
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    lineHeight: 28,
  },
  bannerDescription: {
    fontSize: 13,
    color: '#374151',
    marginTop: 12,
    lineHeight: 20,
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
