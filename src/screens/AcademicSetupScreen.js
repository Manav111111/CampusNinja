import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
  Modal,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBranches, getSemesters } from '../services/supabase';

const { width } = Dimensions.get('window');

// A helper component to draw a 4x4 dot grid (reused from Splash Screen style)
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

// Reusable component for the dropdown selector cards
const SelectorCard = ({ label, placeholder, icon, value, onPress }) => (
  <TouchableOpacity style={styles.selectorCard} activeOpacity={0.7} onPress={onPress}>
    <View style={styles.selectorIconBg}>
      <Ionicons name={icon} size={20} color="#EA580C" />
    </View>
    <View style={styles.selectorTextContainer}>
      <Text style={styles.selectorLabel}>{label}</Text>
      <Text style={styles.selectorPlaceholder}>{value || placeholder}</Text>
    </View>
    <Ionicons name="chevron-down" size={20} color="#4B5563" />
  </TouchableOpacity>
);

export default function AcademicSetupScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  
  const [branches, setBranches] = useState([]);
  const [semesters, setSemesters] = useState([]);
  
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(null);

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    if (selectedBranch) {
      fetchSemesters(selectedBranch.id);
      setSelectedSemester(null);
    } else {
      setSemesters([]);
    }
  }, [selectedBranch]);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const data = await getBranches();
      setBranches(data || []);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchSemesters = async (branchId) => {
    try {
      setLoading(true);
      const data = await getSemesters(branchId);
      setSemesters(data || []);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };
  
  // Hardcoded for UI demonstration based on the mockup
  const features = [
    { id: '1', label: 'Notes', icon: 'document-text-outline' },
    { id: '2', label: 'PYQs', icon: 'clipboard-outline' },
    { id: '3', label: 'Syllabus', icon: 'book-outline' },
    { id: '4', label: 'Video\nLectures', icon: 'play-outline' },
    { id: '5', label: 'Important\nQuestions', icon: 'star-outline' },
  ];

  const handleContinue = async () => {
    if (selectedBranch && selectedSemester) {
      try {
        await AsyncStorage.setItem('userBranchId', selectedBranch.id);
        await AsyncStorage.setItem('userBranchName', selectedBranch.name);
        await AsyncStorage.setItem('userSemesterId', selectedSemester.id);
        await AsyncStorage.setItem('userSemesterNumber', selectedSemester.number.toString());
      } catch (e) {
        console.log('Error saving data', e);
      }
    }
    navigation.replace('MainApp'); // Navigate to the Main App (Bottom Tabs)
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      
      {/* Background Decorations */}
      <View style={styles.circleTopLeft1} />
      <View style={styles.circleTopLeft2} />
      <View style={styles.circleBottomRight1} />
      <View style={styles.circleBottomRight2} />
      <DotGrid style={styles.dotsTopRight} />
      <DotGrid style={styles.dotsBottomLeft} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* CN Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoC} />
          <Text style={styles.logoN}>N</Text>
        </View>

        {/* Header Text */}
        <View style={styles.headerTextContainer}>
          <Text style={styles.titleLine1}>Let's Personalize</Text>
          <View style={styles.titleRow}>
            <Text style={styles.titleLine2}>Your </Text>
            <Text style={styles.titleHighlight}>Experience</Text>
          </View>
          <Text style={styles.subtitle}>
            Select your course, branch and semester to access the right study materials.
          </Text>
        </View>

        {/* Dropdown Selectors */}
        <View style={styles.selectorsContainer}>
          <SelectorCard 
            label="Course" 
            placeholder="B.Tech (Fixed)" 
            icon="school-outline" 
            value="B.Tech"
            onPress={() => {}} 
          />
          <SelectorCard 
            label="Branch" 
            placeholder={loading && !branches.length ? "Loading..." : "Select Branch"} 
            icon="business-outline" 
            value={selectedBranch ? selectedBranch.name : ''}
            onPress={() => { setModalType('branch'); setModalVisible(true); }} 
          />
          <SelectorCard 
            label="Semester" 
            placeholder={loading && !semesters.length && selectedBranch ? "Loading..." : "Select Semester"} 
            icon="calendar-outline" 
            value={selectedSemester ? `Semester ${selectedSemester.number}` : ''}
            onPress={() => { 
              if (selectedBranch) {
                setModalType('semester'); setModalVisible(true); 
              } else {
                alert('Please select a branch first');
              }
            }} 
          />
        </View>

        {/* Selection Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryTopRow}>
            <View style={styles.summaryIconBg}>
              <Ionicons name="school-outline" size={32} color="#EA580C" />
            </View>
            <View style={styles.summaryDetails}>
              <Text style={styles.summaryLabel}>Your Selection</Text>
              <Text style={styles.summaryTitle}>{selectedBranch ? `B.Tech ${selectedBranch.name}` : 'Not Selected'}</Text>
              <View style={styles.summaryPill}>
                <Text style={styles.summaryPillText}>{selectedSemester ? `Semester ${selectedSemester.number}` : 'No Semester'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.featuresLabel}>You will get:</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuresScroll}>
            {features.map((item) => (
              <View key={item.id} style={styles.featureBox}>
                <View style={styles.featureIconContainer}>
                  <Ionicons name={item.icon} size={24} color="#111827" />
                </View>
                <Text style={styles.featureText} numberOfLines={2} adjustsFontSizeToFit>{item.label}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue} activeOpacity={0.8}>
          <Text style={styles.continueButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.skipButton} onPress={handleContinue}>
          <Text style={styles.skipButtonText}>Skip For Now</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for Selection */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select {modalType === 'branch' ? 'Branch' : 'Semester'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={modalType === 'branch' ? branches : semesters}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.modalItem}
                  onPress={() => {
                    if (modalType === 'branch') setSelectedBranch(item);
                    else setSelectedSemester(item);
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.modalItemText}>
                    {modalType === 'branch' ? item.name : `Semester ${item.number}`}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    position: 'relative',
    overflow: 'hidden',
  },
  
  // Background Circles
  circleTopLeft1: {
    position: 'absolute',
    top: -width * 0.3,
    left: -width * 0.3,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: '#F9FAFB',
  },
  circleTopLeft2: {
    position: 'absolute',
    top: -width * 0.4,
    left: -width * 0.4,
    width: width * 1.1,
    height: width * 1.1,
    borderRadius: width * 0.55,
    borderWidth: 40,
    borderColor: '#F9FAFB',
  },
  circleBottomRight1: {
    position: 'absolute',
    bottom: -width * 0.3,
    right: -width * 0.3,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: '#F9FAFB',
  },
  circleBottomRight2: {
    position: 'absolute',
    bottom: -width * 0.4,
    right: -width * 0.4,
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
  dotsTopRight: {
    top: 40,
    right: 40,
  },
  dotsBottomLeft: {
    bottom: 40,
    left: 40,
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

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },

  // Logo
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 50,
    alignSelf: 'center',
    marginBottom: 24,
  },
  logoC: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 8,
    borderColor: '#FF6B00',
    borderRightColor: 'transparent',
    position: 'absolute',
    left: 0,
    transform: [{ rotate: '45deg' }]
  },
  logoN: {
    fontSize: 40,
    fontWeight: '900',
    color: '#222222',
    position: 'absolute',
    right: 4,
    top: -10,
    letterSpacing: -2,
  },

  // Header
  headerTextContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  titleLine1: {
    fontSize: 28,
    fontWeight: '900',
    color: '#111827',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleLine2: {
    fontSize: 28,
    fontWeight: '900',
    color: '#111827',
  },
  titleHighlight: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FF6B00',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 16,
    lineHeight: 20,
  },

  // Selectors
  selectorsContainer: {
    marginBottom: 24,
  },
  selectorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectorIconBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  selectorTextContainer: {
    flex: 1,
  },
  selectorLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  selectorPlaceholder: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },

  // Summary Card
  summaryCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  summaryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFEDD5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  summaryDetails: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 6,
  },
  summaryPill: {
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  summaryPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#EA580C',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  featuresLabel: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 12,
  },
  featuresScroll: {
    paddingBottom: 4,
  },
  featureBox: {
    alignItems: 'center',
    width: 64,
    marginRight: 12,
  },
  featureIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  featureText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    lineHeight: 14,
  },

  // Bottom Controls
  bottomContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: 'transparent',
  },
  continueButton: {
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
    marginBottom: 16,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalItemText: {
    fontSize: 16,
    color: '#4B5563',
  },
});
