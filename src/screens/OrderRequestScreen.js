import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { supabase, createOrder, uploadOrderFile } from '../services/supabase';
import { performGoogleLogin, getCurrentSession } from '../services/auth';
import { useCart } from '../context/CartContext';

const StepIndicator = ({ steps, currentStepIndex }) => (
  <View style={styles.stepIndicatorContainer}>
    {steps.map((step, idx) => {
      const stepNum = idx + 1;
      const isActive = idx === currentStepIndex;
      const isCompleted = idx < currentStepIndex;
      return (
        <View key={step.id} style={styles.stepRow}>
          <View style={[
            styles.stepCircle,
            (isActive || isCompleted) ? styles.stepCircleActive : styles.stepCircleInactive
          ]}>
            {isCompleted ? (
              <Ionicons name="checkmark" size={14} color="#FFFFFF" />
            ) : (
              <Text style={[
                styles.stepCircleText,
                (isActive || isCompleted) ? styles.stepCircleTextActive : styles.stepCircleTextInactive
              ]}>{stepNum}</Text>
            )}
          </View>
          {idx < steps.length - 1 && (
            <View style={[
              styles.stepLine,
              idx < currentStepIndex ? styles.stepLineActive : styles.stepLineInactive
            ]} />
          )}
        </View>
      );
    })}
  </View>
);

export default function OrderRequestScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { service, isCartCheckout, cartItems = [], subtotal = 0, deliveryFee = 0, grandTotal = 0 } = route.params || {};
  const { clearCart } = useCart();

  // Determine if any product strictly requires image/file upload based on admin setting
  const requiresUpload = isCartCheckout
    ? cartItems.some(item => Boolean(item.product.requires_file_upload))
    : Boolean(service?.requires_file_upload);

  // Define steps dynamically
  const steps = requiresUpload 
    ? [
        { id: 'upload', label: 'Guidelines & Upload' },
        { id: 'details', label: 'Delivery Info' },
        { id: 'confirm', label: 'Order Summary' }
      ]
    : [
        { id: 'details', label: 'Delivery Info' },
        { id: 'confirm', label: 'Order Summary' }
      ];

  const [activeStepId, setActiveStepId] = useState(steps[0].id);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  // Form States
  const [selectedFile, setSelectedFile] = useState(null);
  const [instructions, setInstructions] = useState('');

  // Contact Details
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [college, setCollege] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    let mounted = true;

    const applyUser = (authUser) => {
      if (!mounted) return;
      setUser(authUser || null);
      if (authUser) {
        setName(authUser.user_metadata?.full_name || '');
        setEmail(authUser.email || '');
      }
    };

    getCurrentSession()
      .then((session) => applyUser(session?.user || null))
      .catch((error) => console.error('Failed to load auth session:', error));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      applyUser(session?.user || null);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (activeStepId === 'login' && user) {
      if (requiresUpload) {
        setActiveStepId('details');
      } else {
        setActiveStepId('confirm');
      }
    }
  }, [activeStepId, user, requiresUpload]);

  const currentStepIndex = steps.findIndex(s => s.id === activeStepId);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
      }
    } catch (error) {
      console.error('Document picker error:', error);
      Alert.alert('Error', 'Failed to pick document or image.');
    }
  };

  const handleNext = () => {
    if (activeStepId === 'upload') {
      if (!selectedFile) {
        Alert.alert('Upload Required', 'Please upload your product image or assignment document before continuing.');
        return;
      }
      if (!instructions.trim()) {
        Alert.alert('Instructions Required', 'Please enter instructions or details for your uploaded file.');
        return;
      }
      if (!user) {
        setActiveStepId('login');
      } else {
        setActiveStepId('details');
      }
    } else if (activeStepId === 'details') {
      if (!name.trim() || !phone.trim() || !college.trim() || !address.trim()) {
        Alert.alert('Required Fields', 'Please fill in Name, WhatsApp Number, College, and Delivery Address.');
        return;
      }
      if (phone.trim().length < 10) {
        Alert.alert('Invalid Phone', 'Please enter a valid 10-digit WhatsApp number.');
        return;
      }
      if (!user) {
        setActiveStepId('login');
      } else {
        setActiveStepId('confirm');
      }
    } else if (activeStepId === 'login') {
      if (!user) {
        Alert.alert('Sign In Required', 'Please sign in with Google to proceed.');
      }
    }
  };

  const handleBack = () => {
    if (activeStepId === 'login') {
      setActiveStepId(requiresUpload ? 'upload' : 'details');
    } else if (activeStepId === 'confirm') {
      setActiveStepId('details');
    } else if (activeStepId === 'details') {
      if (requiresUpload) {
        setActiveStepId('upload');
      } else {
        navigation.goBack();
      }
    } else {
      navigation.goBack();
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await performGoogleLogin();
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);

      const session = await getCurrentSession();
      const currentUser = user || session?.user;
      if (!currentUser) {
        Alert.alert('Sign In Required', 'Please sign in with Google to place your order.');
        setActiveStepId('login');
        return;
      }

      let fileUrl = null;
      if (selectedFile) {
        try {
          fileUrl = await uploadOrderFile(selectedFile.uri, selectedFile.name);
        } catch (uploadError) {
          console.error('File upload failed:', uploadError);
          Alert.alert('Upload Warning', 'File could not be uploaded, but your order will still be submitted.');
        }
      }

      if (isCartCheckout && cartItems.length > 0) {
        // Create an order entry for each cart item
        for (const item of cartItems) {
          const itemReq = `[Cart Order - Qty: ${item.quantity}] ${instructions || ''}`.trim();
          await createOrder({
            product_id: item.product.id,
            user_id: currentUser.id,
            customer_name: name,
            customer_phone: phone,
            customer_email: email,
            requirement: itemReq,
            college_name: college,
            address: address,
            payment_method: 'cod',
            file_url: fileUrl,
            instructions: itemReq,
          });
        }
        clearCart();
      } else if (service) {
        await createOrder({
          product_id: service.id,
          user_id: currentUser.id,
          customer_name: name,
          customer_phone: phone,
          customer_email: email,
          requirement: instructions,
          college_name: college,
          address: address,
          payment_method: 'cod',
          file_url: fileUrl,
          instructions: instructions,
        });
      }

      Alert.alert(
        '🎉 Order Placed Successfully!',
        'We have received your order request. A CampusNinja coordinator will reach out to you on WhatsApp shortly.\n\nPayment Method: Cash on Delivery',
        [{ text: 'Go to Home', onPress: () => navigation.navigate('MainApp') }]
      );

    } catch (error) {
      console.error('Order submission error:', error);
      Alert.alert('Order Error', 'Failed to submit order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepUpload = () => (
    <View style={styles.stepContent}>
      <View style={styles.guidelinesHeader}>
        <Ionicons name="document-text-outline" size={24} color="#2563EB" />
        <Text style={styles.guidelinesTitle}>Product Images & Custom Guidelines</Text>
      </View>
      <Text style={styles.guidelinesSubtitle}>
        This item requires custom details or reference images (e.g., assignment syllabus, project diagrams, or drawing specifications).
      </Text>

      <TouchableOpacity style={styles.uploadBox} onPress={pickDocument}>
        <Ionicons name="cloud-upload-outline" size={40} color="#2563EB" />
        <Text style={styles.uploadTitle}>
          {selectedFile ? selectedFile.name : 'Select PDF or Reference Image'}
        </Text>
        <Text style={styles.uploadSubtitle}>
          {selectedFile ? 'Tap to change file' : 'Support PDF, JPG, PNG files'}
        </Text>
      </TouchableOpacity>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Specific Custom Instructions *</Text>
        <TextInput 
          style={[styles.input, { minHeight: 100 }]} 
          placeholder="Mention syllabus topics, required pages, word limits, diagram requirements..." 
          value={instructions} 
          onChangeText={setInstructions}
          multiline
          textAlignVertical="top"
        />
      </View>
    </View>
  );

  const renderStepDetails = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Delivery & Contact Information</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Full Name *</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Enter your student name" 
          value={name} 
          onChangeText={setName} 
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>WhatsApp Phone Number *</Text>
        <TextInput 
          style={styles.input} 
          placeholder="10-digit mobile number" 
          keyboardType="phone-pad"
          maxLength={10}
          value={phone} 
          onChangeText={setPhone} 
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>College Name *</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g., LNCT, VIT, IIT" 
          value={college} 
          onChangeText={setCollege} 
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Delivery Address / Hostel Room *</Text>
        <TextInput 
          style={[styles.input, { minHeight: 64 }]} 
          placeholder="Hostel Name, Room Number, or Residential Address" 
          value={address} 
          onChangeText={setAddress}
          multiline
          textAlignVertical="top"
        />
      </View>

      {!requiresUpload && (
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Additional Instructions (Optional)</Text>
          <TextInput 
            style={[styles.input, { minHeight: 80 }]} 
            placeholder="Any specific delivery instructions or preferences..." 
            value={instructions} 
            onChangeText={setInstructions}
            multiline
            textAlignVertical="top"
          />
        </View>
      )}
    </View>
  );

  const renderStepLogin = () => (
    <View style={styles.stepContent}>
      <View style={styles.loginContainer}>
        <View style={styles.loginIconBg}>
          <Ionicons name="shield-checkmark" size={48} color="#FF6B00" />
        </View>
        <Text style={styles.loginTitle}>Sign in to Place Order</Text>
        <Text style={styles.loginSubtitle}>
          Secure Google Sign-In ensures you can track your order status and receive direct WhatsApp updates.
        </Text>
        <TouchableOpacity 
          style={styles.googleButton} 
          onPress={handleGoogleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="logo-google" size={20} color="#FFFFFF" style={{ marginRight: 10 }} />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStepConfirm = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Order Summary</Text>

      {isCartCheckout ? (
        <View style={styles.summaryCard}>
          <Text style={styles.cartItemsHeading}>Items in Cart ({cartItems.length})</Text>
          {cartItems.map((item, index) => (
            <View key={item.product.id || index} style={styles.cartItemRow}>
              <Text style={styles.cartItemTitle} numberOfLines={1}>
                {item.quantity}x {item.product.title || item.product.name}
              </Text>
              <Text style={styles.cartItemPrice}>
                ₹{(item.product.price || item.product.original_price || 0) * item.quantity}
              </Text>
            </View>
          ))}
          <View style={styles.billDivider} />
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Item Subtotal</Text>
            <Text style={styles.billValue}>₹{subtotal}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery Fee</Text>
            <Text style={[styles.billValue, deliveryFee === 0 && { color: '#10B981' }]}>
              {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
            </Text>
          </View>
          <View style={styles.billDivider} />
          <View style={styles.billRow}>
            <Text style={styles.billTotalLabel}>Grand Total</Text>
            <Text style={styles.billTotalValue}>₹{grandTotal}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.summaryCard}>
          {service?.thumbnail_url ? (
            <Image source={{ uri: service.thumbnail_url }} style={styles.summaryImage} />
          ) : null}
          <Text style={styles.summaryServiceName}>{service?.title || service?.name}</Text>
          <Text style={styles.summaryPrice}>₹{service?.price || service?.original_price}</Text>
        </View>
      )}

      <View style={styles.summarySection}>
        <SummaryRow icon="person" label="Name" value={name} />
        <SummaryRow icon="call" label="WhatsApp" value={phone} />
        <SummaryRow icon="mail" label="Email" value={email} />
        <SummaryRow icon="school" label="College" value={college} />
        <SummaryRow icon="location" label="Address" value={address} />
        {selectedFile && <SummaryRow icon="document-text" label="Uploaded File" value={selectedFile.name} />}
        {instructions ? <SummaryRow icon="create" label={requiresUpload ? "Instructions" : "Additional Instructions"} value={instructions} /> : null}
      </View>

      <View style={styles.paymentCard}>
        <View style={styles.paymentHeader}>
          <Ionicons name="shield-checkmark" size={20} color="#059669" />
          <Text style={styles.paymentTitle}>Payment Method</Text>
        </View>
        <View style={styles.codBadge}>
          <Ionicons name="cash-outline" size={22} color="#059669" style={{ marginRight: 10 }} />
          <View>
            <Text style={styles.codText}>Cash on Delivery (COD)</Text>
            <Text style={styles.codSubtext}>Pay securely upon delivery or fulfillment</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {activeStepId === 'login' ? 'Sign In' :
             activeStepId === 'upload' ? 'Upload & Guidelines' :
             activeStepId === 'details' ? 'Delivery Information' : 'Review & Confirm'}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Step Indicator (Hidden only on login step) */}
        {activeStepId !== 'login' && (
          <View style={styles.stepIndicatorWrapper}>
            <StepIndicator steps={steps} currentStepIndex={currentStepIndex} />
            <View style={styles.stepLabelsRow}>
              {steps.map((s, idx) => (
                <Text key={s.id} style={[
                  styles.stepLabelText,
                  idx === currentStepIndex ? { color: '#FF6B00', fontWeight: '700' } : { color: '#9CA3AF' }
                ]}>{s.label}</Text>
              ))}
            </View>
          </View>
        )}

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {activeStepId === 'upload' && renderStepUpload()}
          {activeStepId === 'details' && renderStepDetails()}
          {activeStepId === 'login' && renderStepLogin()}
          {activeStepId === 'confirm' && renderStepConfirm()}
        </ScrollView>

        {/* Bottom Action Bar */}
        {activeStepId !== 'login' && (
          <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            {activeStepId !== 'confirm' ? (
              <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <Text style={styles.nextButtonText}>Continue</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[styles.placeOrderButton, loading && { opacity: 0.7 }]} 
                onPress={handlePlaceOrder}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.placeOrderText}>
                      {isCartCheckout ? `Place Order (₹${grandTotal})` : 'Place Order'}
                    </Text>
                    <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const SummaryRow = ({ icon, label, value }) => (
  <View style={styles.summaryRow}>
    <Ionicons name={icon} size={18} color="#6B7280" style={{ marginRight: 10 }} />
    <Text style={styles.summaryLabel}>{label}:</Text>
    <Text style={styles.summaryValue}>{value || 'Not provided'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  stepIndicatorWrapper: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#FF6B00',
  },
  stepCircleInactive: {
    backgroundColor: '#E5E7EB',
  },
  stepCircleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  stepCircleTextActive: {
    color: '#FFFFFF',
  },
  stepCircleTextInactive: {
    color: '#6B7280',
  },
  stepLine: {
    width: 50,
    height: 2,
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: '#FF6B00',
  },
  stepLineInactive: {
    backgroundColor: '#E5E7EB',
  },
  stepLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  stepLabelText: {
    fontSize: 11,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
  },
  guidelinesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  guidelinesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E40AF',
    marginLeft: 8,
  },
  guidelinesSubtitle: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 16,
  },
  uploadBox: {
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    marginBottom: 20,
  },
  uploadTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E40AF',
    marginTop: 12,
    textAlign: 'center',
  },
  uploadSubtitle: {
    fontSize: 12,
    color: '#60A5FA',
    marginTop: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
  },
  loginContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  loginIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  loginTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B00',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cartItemsHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  cartItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cartItemTitle: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    marginRight: 10,
  },
  cartItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  billDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 10,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  billLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  billValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  billTotalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  billTotalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FF6B00',
  },
  summaryImage: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    marginBottom: 12,
  },
  summaryServiceName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  summaryPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FF6B00',
    marginTop: 4,
  },
  summarySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
    width: 90,
  },
  summaryValue: {
    fontSize: 13,
    color: '#111827',
    flex: 1,
  },
  paymentCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 16,
    padding: 16,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#065F46',
    marginLeft: 6,
  },
  codBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  codText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#047857',
  },
  codSubtext: {
    fontSize: 12,
    color: '#065F46',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B00',
    paddingVertical: 14,
    borderRadius: 14,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  placeOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 14,
  },
  placeOrderText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginRight: 8,
  },
});
