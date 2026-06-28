import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity,
  Image,
  Dimensions,
  Linking
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

const { width } = Dimensions.get('window');

export default function ServiceDetailScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { service } = route.params;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{service.title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Thumbnail / Hero Image */}
        {service.thumbnail_url ? (
          <Image source={{ uri: service.thumbnail_url }} style={styles.heroImage} />
        ) : (
          <View style={styles.heroPlaceholder}>
            <Ionicons name="cart-outline" size={64} color="#8B5CF6" />
          </View>
        )}

        <View style={styles.contentPadding}>
          {/* Title & Price */}
          <View style={styles.titleRow}>
            <Text style={styles.serviceTitle}>{service.title}</Text>
            <Text style={styles.servicePrice}>₹{service.price}</Text>
          </View>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{service.category || 'Service'}</Text>
          </View>

          {/* Description */}
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>
            {service.description || "Get premium academic assistance for your college requirements. We offer high quality, verified solutions."}
          </Text>

          {/* Demo Assignment Preview */}
          {service.drive_link ? (
            <TouchableOpacity 
              style={styles.demoCard}
              onPress={() => Linking.openURL(service.drive_link).catch(() => {})}
            >
              <View style={styles.demoIconContainer}>
                <Ionicons name="document-text" size={24} color="#EA580C" />
              </View>
              <View style={styles.demoTextContainer}>
                <Text style={styles.demoTitle}>Demo Preview</Text>
                <Text style={styles.demoSubtitle}>Tap to view a sample of our work</Text>
              </View>
              <Ionicons name="open-outline" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ) : null}

          {/* How It Works */}
          <Text style={styles.sectionTitle}>How It Works</Text>
          <View style={styles.stepsContainer}>
            <View style={styles.stepRow}>
              <View style={styles.stepNumberContainer}>
                <Text style={styles.stepNumber}>1</Text>
              </View>
              <View style={styles.stepTextContainer}>
                <Text style={styles.stepTitle}>Submit Your Requirement</Text>
                <Text style={styles.stepDescription}>Fill out the order form with your exact needs.</Text>
              </View>
            </View>
            
            <View style={styles.stepConnector} />
            
            <View style={styles.stepRow}>
              <View style={styles.stepNumberContainer}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <View style={styles.stepTextContainer}>
                <Text style={styles.stepTitle}>We Contact You</Text>
                <Text style={styles.stepDescription}>Our team will review your order and reach out.</Text>
              </View>
            </View>
            
            <View style={styles.stepConnector} />
            
            <View style={styles.stepRow}>
              <View style={styles.stepNumberContainer}>
                <Text style={styles.stepNumber}>3</Text>
              </View>
              <View style={styles.stepTextContainer}>
                <Text style={styles.stepTitle}>Get It Delivered</Text>
                <Text style={styles.stepDescription}>Receive high-quality work within the deadline.</Text>
              </View>
            </View>
          </View>
          
        </View>
      </ScrollView>

      {/* Floating Buy Now Button */}
      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.totalLabel}>Total Price</Text>
          <Text style={styles.totalPrice}>₹{service.price}</Text>
        </View>
        <TouchableOpacity 
          style={styles.buyButton}
          onPress={() => navigation.navigate('OrderRequest', { service })}
        >
          <Text style={styles.buyButtonText}>Buy Now</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: 100, // Space for floating button
  },
  heroImage: {
    width: width,
    height: 220,
    resizeMode: 'cover',
  },
  heroPlaceholder: {
    width: width,
    height: 220,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentPadding: {
    padding: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  serviceTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginRight: 16,
  },
  servicePrice: {
    fontSize: 24,
    fontWeight: '900',
    color: '#2563EB',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 24,
  },
  categoryText: {
    color: '#1E40AF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 24,
  },
  demoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  demoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFEDD5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  demoTextContainer: {
    flex: 1,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9A3412',
    marginBottom: 4,
  },
  demoSubtitle: {
    fontSize: 13,
    color: '#C2410C',
  },
  stepsContainer: {
    marginTop: 8,
  },
  stepRow: {
    flexDirection: 'row',
  },
  stepNumberContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    zIndex: 2,
  },
  stepNumber: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  stepTextContainer: {
    flex: 1,
    paddingBottom: 24,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  stepConnector: {
    position: 'absolute',
    top: 32,
    left: 15,
    width: 2,
    height: '100%',
    backgroundColor: '#E5E7EB',
    zIndex: 1,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    // shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10,
  },
  priceContainer: {
    justifyContent: 'center',
  },
  totalLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  buyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
});
