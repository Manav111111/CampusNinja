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
  ActivityIndicator,
  Image,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBranches, getSemesters } from '../services/supabase';

const { width } = Dimensions.get('window');

// Premium Selector Card Component
const SelectorCard = ({ label, placeholder, icon, value, onPress, disabled }) => (
  <TouchableOpacity 
    style={[
      styles.selectorCard, 
      value ? styles.selectorCardActive : styles.selectorCardInactive,
      disabled && { opacity: 0.6 }
    ]} 
    activeOpacity={0.8} 
    onPress={onPress}
    disabled={disabled}
  >
    <View style={[styles.selectorIconBg, value && styles.selectorIconBgActive]}>
      <Ionicons name={icon} size={22} color={value ? '#FFFFFF' : '#FF6B00'} />
    </View>
    <View style={styles.selectorTextContainer}>
      <Text style={styles.selectorLabel}>{label}</Text>
      <Text style={[styles.selectorValue, !value && styles.selectorPlaceholder]}>
        {value || placeholder}
      </Text>
    </View>
    <View style={[styles.chevronWrap, value && styles.chevronWrapActive]}>
      <Ionicons name="chevron-down" size={18} color={value ? '#FF6B00' : '#94A3B8'} />
    </View>
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
    navigation.replace('MainApp');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      
      {/* Subtle Background Glows */}
      <View style={styles.topGlow} />
      <View style={styles.bottomGlow} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* App Logo */}
        <View style={styles.logoContainer}>
          <Image source={require('../../assets/logo.png')} style={styles.logoImage} />
        </View>

        {/* Header Text */}
        <View style={styles.headerTextContainer}>
          <View style={styles.badgeContainer}>
            <Ionicons name="sparkles" size={14} color="#FF6B00" style={{ marginRight: 6 }} />
            <Text style={styles.badgeText}>TAILORED FOR YOU</Text>
          </View>
          <Text style={styles.titleMain}>Let's Personalize</Text>
          <Text style={styles.titleHighlight}>Your Experience ✨</Text>
          <Text style={styles.subtitle}>
            Choose your academic curriculum to instantly unlock notes, past papers, and tailored roadmaps.
          </Text>
        </View>

        {/* Dropdown Selectors */}
        <View style={styles.selectorsContainer}>
          <SelectorCard 
            label="Academic Course" 
            placeholder="B.Tech (Bachelor of Technology)" 
            icon="school-outline" 
            value="B.Tech"
            onPress={() => {}} 
          />
          <SelectorCard 
            label="Engineering Branch" 
            placeholder={loading && !branches.length ? "Loading branches..." : "Select your branch"} 
            icon="business-outline" 
            value={selectedBranch ? selectedBranch.name : ''}
            onPress={() => { setModalType('branch'); setModalVisible(true); }} 
          />
          <SelectorCard 
            label="Current Semester" 
            placeholder={loading && !semesters.length && selectedBranch ? "Loading semesters..." : "Select your semester"} 
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

      </ScrollView>

      {/* Bottom Action Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={[
            styles.continueButton,
            (!selectedBranch || !selectedSemester) && styles.continueButtonDisabled
          ]} 
          onPress={handleContinue} 
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>Get Started</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Selection Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Select {modalType === 'branch' ? 'Branch' : 'Semester'}</Text>
                <Text style={styles.modalSubtitle}>Choose one option from below</Text>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={20} color="#4B5563" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={modalType === 'branch' ? branches : semesters}
              keyExtractor={item => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item }) => {
                const isSelected = modalType === 'branch' 
                  ? selectedBranch?.id === item.id 
                  : selectedSemester?.id === item.id;
                return (
                  <TouchableOpacity 
                    style={[styles.modalItem, isSelected && styles.modalItemSelected]}
                    activeOpacity={0.7}
                    onPress={() => {
                      if (modalType === 'branch') setSelectedBranch(item);
                      else setSelectedSemester(item);
                      setModalVisible(false);
                    }}
                  >
                    <View style={styles.modalItemLeft}>
                      <View style={[styles.modalItemIcon, isSelected && styles.modalItemIconSelected]}>
                        <Ionicons 
                          name={modalType === 'branch' ? 'git-branch-outline' : 'book-outline'} 
                          size={18} 
                          color={isSelected ? '#FFFFFF' : '#FF6B00'} 
                        />
                      </View>
                      <Text style={[styles.modalItemText, isSelected && styles.modalItemTextSelected]}>
                        {modalType === 'branch' ? item.name : `Semester ${item.number}`}
                      </Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={22} color="#FF6B00" />
                    )}
                  </TouchableOpacity>
                );
              }}
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
    backgroundColor: '#FAFAFB',
  },
  topGlow: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#FFF7ED',
    opacity: 0.8,
  },
  bottomGlow: {
    position: 'absolute',
    bottom: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#FEF2F2',
    opacity: 0.6,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  headerTextContainer: {
    alignItems: 'center',
    marginBottom: 36,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFEDD5',
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FF6B00',
    letterSpacing: 1,
  },
  titleMain: {
    fontSize: 30,
    fontWeight: '900',
    color: '#111827',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  titleHighlight: {
    fontSize: 30,
    fontWeight: '900',
    color: '#FF6B00',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  selectorsContainer: {
    gap: 16,
  },
  selectorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  selectorCardInactive: {
    borderColor: '#F1F5F9',
  },
  selectorCardActive: {
    borderColor: '#FF6B00',
    backgroundColor: '#FFFAF5',
  },
  selectorIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  selectorIconBgActive: {
    backgroundColor: '#FF6B00',
  },
  selectorTextContainer: {
    flex: 1,
  },
  selectorLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selectorValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  selectorPlaceholder: {
    color: '#64748B',
    fontWeight: '500',
  },
  chevronWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevronWrapActive: {
    backgroundColor: '#FFF7ED',
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  continueButton: {
    flexDirection: 'row',
    backgroundColor: '#FF6B00',
    borderRadius: 14,
    paddingVertical: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  continueButtonDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 24,
    maxHeight: '65%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  modalItemSelected: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FFEDD5',
  },
  modalItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalItemIconSelected: {
    backgroundColor: '#FF6B00',
  },
  modalItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
  },
  modalItemTextSelected: {
    color: '#0F172A',
    fontWeight: '700',
  },
});
