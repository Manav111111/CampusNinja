import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  Dimensions,
  Image
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { setOnboardingComplete } from '../services/storage';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    titleLine1: 'Everything You Need',
    titleHighlight: 'For College',
    description: 'Access Notes, PYQs, Syllabus, Video Lectures and Important Questions in one place.',
    image: require('../../assets/image1.png'),
    icons: [
      { id: '1', label: 'Notes', icon: 'document-text-outline', color: '#EA580C', pos: { left: '5%', top: '35%' } },
      { id: '2', label: 'PYQs', icon: 'document-outline', color: '#EA580C', pos: { left: '30%', top: '10%' } },
      { id: '3', label: 'Videos', icon: 'play-circle-outline', color: '#EA580C', pos: { right: '5%', top: '35%' } },
      { id: '4', label: 'Syllabus', icon: 'book-outline', color: '#4B5563', pos: { left: '15%', top: '65%' } },
      { id: '5', label: 'Important\nQuestions', icon: 'star-outline', color: '#EA580C', pos: { right: '15%', top: '65%' } }
    ]
  },
  {
    id: '2',
    titleLine1: 'Build Skills',
    titleHighlight: 'Beyond College',
    description: 'Discover curated roadmaps for DSA, Web Development, AI, Data Science and placements.',
    image: require('../../assets/image2.png'),
    icons: [
      { id: '1', label: 'Web\nDevelopment', icon: 'globe-outline', color: '#EA580C', pos: { left: '10%', top: '35%' } },
      { id: '2', label: 'DSA', icon: 'code-slash-outline', color: '#EA580C', pos: { left: '40%', top: '10%' } },
      { id: '3', label: 'Gen AI', icon: 'hardware-chip-outline', color: '#EA580C', pos: { right: '10%', top: '35%' } },
      { id: '4', label: 'Agentic AI', icon: 'sparkles-outline', color: '#EA580C', pos: { left: '15%', top: '65%' } },
      { id: '5', label: 'Data Science', icon: 'stats-chart-outline', color: '#EA580C', pos: { right: '15%', top: '65%' } }
    ]
  },
  {
    id: '3',
    titleLine1: 'Join the',
    titleHighlight: 'Campus Ninja Community',
    description: 'Stay connected through YouTube, WhatsApp and student communities. Get guidance, updates and opportunities.',
    image: require('../../assets/image3.png'),
    icons: [
      { id: '1', label: 'Instagram', icon: 'logo-instagram', color: '#DB2777', pos: { left: '20%', top: '60%' } },
      { id: '2', label: 'YouTube', icon: 'logo-youtube', color: '#EF4444', pos: { left: '20%', top: '20%' } },
      { id: '3', label: 'WhatsApp', icon: 'logo-whatsapp', color: '#10B981', pos: { right: '20%', top: '20%' } },
      { id: '4', label: 'Community', icon: 'people-outline', color: '#EA580C', pos: { right: '20%', top: '60%' } }
    ]
  }
];

export default function OnboardingScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const slidesRef = useRef(null);

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollToNext = async () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      await setOnboardingComplete();
      navigation.replace('AcademicSetup');
    }
  };

  const renderItem = ({ item }) => {
    return (
      <View style={[styles.slideContainer, { width }]}>
        {/* Graphic Area */}
        <View style={styles.graphicContainer}>
          {/* Slide image in circle */}
          <View style={styles.imageCircleWrap}>
            <Image source={item.image} style={styles.centerGraphicImage} />
          </View>
          
          {/* Floating Icons */}
          {item.icons.map((iconItem) => (
            <View key={iconItem.id} style={[styles.floatingIconContainer, iconItem.pos]}>
              <View style={styles.iconBox}>
                <Ionicons name={iconItem.icon} size={24} color={iconItem.color} />
              </View>
              <Text style={styles.iconLabel} numberOfLines={2} adjustsFontSizeToFit>{iconItem.label}</Text>
            </View>
          ))}
          
          {/* Subtle dotted arc line representation */}
          <View style={styles.arcLine} />
        </View>

        {/* Text Area */}
        <View style={styles.textContainer}>
          <Text style={styles.titleLine1}>{item.titleLine1}</Text>
          <Text style={styles.titleHighlight}>{item.titleHighlight}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      
      {/* Fixed Logo Top Left */}
      <View style={styles.logoContainer}>
        <Image source={require('../../assets/logo.png')} style={styles.logoTopLeft} />
      </View>

      {/* FlatList for Slides */}
      <FlatList
        data={slides}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        ref={slidesRef}
      />

      {/* Bottom Controls */}
      <View style={styles.bottomContainer}>
        {/* Pagination Dots */}
        <View style={styles.paginationContainer}>
          {slides.map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.dot, 
                currentIndex === index ? styles.dotActive : styles.dotInactive
              ]} 
            />
          ))}
        </View>

        {/* Action Button */}
        <TouchableOpacity 
          style={styles.button} 
          activeOpacity={0.8}
          onPress={scrollToNext}
        >
          <Text style={styles.buttonText}>
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  logoContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  logoTopLeft: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
  },
  slideContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 80,
  },
  graphicContainer: {
    width: width,
    height: height * 0.45,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginTop: 20,
  },
  imageCircleWrap: {
    width: 260,
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerGraphicImage: {
    width: 240,
    height: 240,
    resizeMode: 'contain',
  },
  arcLine: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    top: '10%',
    zIndex: -1,
  },
  floatingIconContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
  },
  iconBox: {
    width: 50,
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 6,
  },
  iconLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
    textAlign: 'center',
  },
  textContainer: {
    paddingHorizontal: 32,
    alignItems: 'center',
    marginTop: 20,
  },
  titleLine1: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },
  titleHighlight: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FF6B00',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 10,
    backgroundColor: '#FFFFFF',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: '#FF6B00',
  },
  dotInactive: {
    width: 8,
    backgroundColor: '#D1D5DB',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#FF6B00',
    borderRadius: 12,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
});
