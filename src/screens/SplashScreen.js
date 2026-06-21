import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isOnboardingComplete } from '../services/storage';

const { width, height } = Dimensions.get('window');

// A helper component to draw a 4x4 dot grid
const DotGrid = ({ style }) => {
  const renderRow = (key) => (
    <View key={key} style={styles.dotRow}>
      <View style={styles.dot} />
      <View style={styles.dot} />
      <View style={styles.dot} />
      <View style={styles.dot} />
    </View>
  );

  return (
    <View style={[styles.dotGridContainer, style]}>
      {[0, 1, 2, 3].map(renderRow)}
    </View>
  );
};

export default function SplashScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    let mounted = true;

    const getNextRoute = async () => {
      const [onboardingComplete, branchId, semesterId] = await Promise.all([
        isOnboardingComplete(),
        AsyncStorage.getItem('userBranchId'),
        AsyncStorage.getItem('userSemesterId'),
      ]);

      if (branchId && semesterId) return 'MainApp';
      if (onboardingComplete) return 'AcademicSetup';
      return 'Onboarding';
    };

    const timer = setTimeout(() => {
      getNextRoute()
        .then((routeName) => {
          if (mounted) navigation.replace(routeName);
        })
        .catch((error) => {
          console.error('Failed to resolve startup route:', error);
          if (mounted) navigation.replace('Onboarding');
        });
    }, 2500);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [navigation]);

  return (
    <View style={styles.container}>
      
      {/* Background Decorations */}
      <View style={styles.circleTopRight1} />
      <View style={styles.circleTopRight2} />
      
      <View style={styles.circleBottomLeft1} />
      <View style={styles.circleBottomLeft2} />
      
      <DotGrid style={styles.dotsTopLeft} />
      <DotGrid style={styles.dotsBottomRight} />

      {/* Center Content */}
      <View style={styles.centerContent}>
        
        {/* CN Logo - Built with pure React Native Text overlapping */}
        <View style={styles.logoContainer}>
          <View style={styles.logoC} />
          <Text style={styles.logoN}>N</Text>
        </View>

        {/* Brand Name */}
        <View style={styles.brandNameContainer}>
          <Text style={styles.brandCampus}>Campus </Text>
          <Text style={styles.brandNinja}>Ninja</Text>
        </View>

        {/* Small orange divider */}
        <View style={styles.brandDivider} />

        {/* Taglines */}
        <Text style={styles.taglineMain}>Everything for College.</Text>
        
        <View style={styles.categoriesRow}>
          <Text style={styles.categoryText}>Notes</Text>
          <View style={styles.categoryDot} />
          <Text style={styles.categoryText}>PYQs</Text>
          <View style={styles.categoryDot} />
          <Text style={styles.categoryText}>Skills</Text>
          <View style={styles.categoryDot} />
          <Text style={styles.categoryText}>Community</Text>
        </View>

      </View>

      {/* Bottom Footer Section */}
      <View style={[styles.footerContainer, { paddingBottom: insets.bottom > 0 ? insets.bottom + 20 : 40 }]}>
        <View style={styles.footerItem}>
          <Ionicons name="book-outline" size={28} color="#FF6B00" />
          <Text style={styles.footerText}>Study.</Text>
        </View>
        
        <View style={styles.footerDivider} />
        
        <View style={styles.footerItem}>
          <Ionicons name="school-outline" size={32} color="#FF6B00" style={{marginTop: -4}} />
          <Text style={styles.footerText}>Learn.</Text>
        </View>
        
        <View style={styles.footerDivider} />
        
        <View style={styles.footerItem}>
          <Ionicons name="trending-up-outline" size={28} color="#FF6B00" />
          <Text style={styles.footerText}>Grow.</Text>
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  
  // Background Circles
  circleTopRight1: {
    position: 'absolute',
    top: -height * 0.1,
    right: -width * 0.2,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    borderWidth: 40,
    borderColor: '#F9FAFB',
  },
  circleTopRight2: {
    position: 'absolute',
    top: -height * 0.15,
    right: -width * 0.3,
    width: width * 1.1,
    height: width * 1.1,
    borderRadius: width * 0.55,
    borderWidth: 40,
    borderColor: '#F9FAFB',
  },
  circleBottomLeft1: {
    position: 'absolute',
    bottom: -height * 0.1,
    left: -width * 0.3,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: '#F9FAFB',
  },
  circleBottomLeft2: {
    position: 'absolute',
    bottom: -height * 0.2,
    left: -width * 0.4,
    width: width * 1.1,
    height: width * 1.1,
    borderRadius: width * 0.55,
    borderWidth: 40,
    borderColor: '#F9FAFB',
  },

  // Dot Grids
  dotGridContainer: {
    position: 'absolute',
    width: 60,
    height: 60,
    justifyContent: 'space-between',
  },
  dotsTopLeft: {
    top: 60,
    left: 40,
  },
  dotsBottomRight: {
    bottom: 120,
    right: 40,
  },
  dotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
  },

  // Center Content
  centerContent: {
    alignItems: 'center',
    marginTop: -80, // slightly elevate to balance bottom footer
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 160,
    height: 120,
    marginBottom: 20,
  },
  logoC: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 26,
    borderColor: '#FF6B00',
    borderRightColor: 'transparent',
    position: 'absolute',
    left: 0,
    transform: [{ rotate: '45deg' }]
  },
  logoN: {
    fontSize: 130,
    fontWeight: '900',
    color: '#222222',
    position: 'absolute',
    right: -10,
    top: -24,
    fontFamily: 'sans-serif', // Fallback font, uses system default
    letterSpacing: -10,
  },
  brandNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandCampus: {
    fontSize: 36,
    fontWeight: '900',
    color: '#222222',
    letterSpacing: -1,
  },
  brandNinja: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FF6B00',
    letterSpacing: -1,
  },
  brandDivider: {
    width: 32,
    height: 2,
    backgroundColor: '#FF6B00',
    marginBottom: 24,
  },
  taglineMain: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 16,
  },
  categoriesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  categoryDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FF6B00',
    marginHorizontal: 8,
  },

  // Footer Section
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  footerItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
  },
  footerDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
    marginTop: 8,
  },
});
