import React, { useState, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  TouchableOpacity, 
  Alert,
  Linking
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/colors';
import { Toast } from '../context/ToastContext';

export default function SavedResourcesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [savedResources, setSavedResources] = useState([]);

  useFocusEffect(
    useCallback(() => {
      loadSavedResources();
    }, [])
  );

  const loadSavedResources = async () => {
    try {
      const stored = await AsyncStorage.getItem('saved_resources');
      if (stored) {
        setSavedResources(JSON.parse(stored));
      } else {
        setSavedResources([]);
      }
    } catch (e) {
      console.log('Error loading saved resources:', e);
    }
  };

  const removeSavedResource = async (id) => {
    try {
      const updated = savedResources.filter(r => r.id !== id);
      setSavedResources(updated);
      await AsyncStorage.setItem('saved_resources', JSON.stringify(updated));
    } catch (e) {
      console.log('Error removing saved resource:', e);
    }
  };

  const handleResourcePress = async (item) => {
    if (!item.targetUrl) {
      Toast.show({ type: 'warning', title: 'No Link Available', message: 'This resource does not have an attached link.' });
      return;
    }
    try {
      if (item.targetUrl.includes('youtube.com') || item.targetUrl.includes('youtu.be')) {
        await Linking.openURL(item.targetUrl);
      } else {
        await WebBrowser.openBrowserAsync(item.targetUrl);
      }
    } catch (e) {
      Toast.show({ type: 'error', title: 'Error', message: 'Unable to open resource link.' });
    }
  };

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity 
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => handleResourcePress(item)}
      >
        <View style={[styles.iconContainer, { backgroundColor: item.bgColor || '#EFF6FF' }]}>
          <Ionicons name={item.icon || 'document-text'} size={24} color={item.iconColor || '#2563EB'} />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.cardSubtitle} numberOfLines={1}>
            {item.subjectTitle ? `${item.subjectTitle} • ` : ''}{item.subtitle || 'Study Material'}
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => removeSavedResource(item.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
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
        
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Saved Resources</Text>
          <Text style={styles.headerSubtitle}>Quick access to your bookmarked study materials</Text>
        </View>
      </View>

      {savedResources.length > 0 ? (
        <FlatList
          data={savedResources}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={[styles.listContainer, { paddingBottom: Math.max(insets.bottom + 20, 40) }]}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="bookmark-outline" size={48} color="#EC4899" />
          </View>
          <Text style={styles.emptyTitle}>No Saved Resources Yet</Text>
          <Text style={styles.emptySubtitle}>
            Tap the bookmark icon on any Note or PYQ in a subject to save it here for quick review.
          </Text>
          <TouchableOpacity 
            style={styles.exploreButton}
            onPress={() => navigation.navigate('Subjects')}
          >
            <Text style={styles.exploreButtonText}>Explore Subjects</Text>
          </TouchableOpacity>
        </View>
      )}
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
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
    marginRight: 14,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FDF2F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: COLORS.primary || '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
