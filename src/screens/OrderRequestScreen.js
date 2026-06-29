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

const TOTAL_STEPS = 4;

const StepIndicator = ({ currentStep }) => (
  <View style={styles.stepIndicatorContainer}>
    {[1, 2, 3, 4].map((step) => (
      <View key={step} style={styles.stepRow}>
        <View style={[
          styles.stepCircle,
          currentStep >= step ? styles.stepCircleActive : styles.stepCircleInactive
        ]}>
          {currentStep > step ? (
            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
          ) : (
            <Text style={[
              styles.stepCircleText,
              currentStep >= step ? styles.stepCircleTextActive : styles.stepCircleTextInactive
            ]}>{step}</Text>
          )}
        </View>
        {step < TOTAL_STEPS && (
          <View style={[
            styles.stepLine,
            currentStep > step ? styles.stepLineActive : styles.stepLineInactive
          ]} />
        )}
      </View>
    ))}
  </View>
);

export default function OrderRequestScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { service } = route.params;

  const requiresUpload = service.requires_file_upload !== false;
  const stepLabels = [requiresUpload ? 'Upload' : 'Requirements', 'Login', 'Details', 'Confirm'];

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  // Step 1: Upload & Instructions
  const [selectedFile, setSelectedFile] = useState(null);
  const [instructions, setInstructions] = useState('');

  // Step 3: Contact Details
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
    if (currentStep === 2 && user) {
      setCurrentStep(3);
    }
  }, [currentStep, user]);

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
      Alert.alert('Error', 'Failed to pick document.');
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      // Step 1 validation: instructions required
      if (!instructions.trim()) {
        Alert.alert('Required', 'Please provide instructions for your order.');
        return;
      }
      // If user is already logged in, skip step 2
      if (user) {
        setCurrentStep(3);
      } else {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      // Should not happen if logged in, but just in case
      if (user) {
        setCurrentStep(3);
      } else {
        Alert.alert('Login Required', 'Please sign in with Google to continue.');
      }
    } else if (currentStep === 3) {
      // Validate contact details
      if (!name.trim() || !phone.trim() || !college.trim() || !address.trim()) {
        Alert.alert('Required', 'Please fill in all required fields.');
        return;
      }
      if (phone.trim().length < 10) {
        Alert.alert('Invalid Phone', 'Please enter a valid 10-digit phone number.');
        return;
      }
      setCurrentStep(4);
    }
  };

  const handleBack = () => {
    if (currentStep === 3 && user) {
      // Skip back to step 1 if user was already logged in
      setCurrentStep(1);
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
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
        Alert.alert('Login Required', 'Please sign in with Google to place your order.');
        setCurrentStep(2);
        return;
      }

      // Upload file if selected
      let fileUrl = null;
      if (selectedFile) {
        try {
          fileUrl = await uploadOrderFile(selectedFile.uri, selectedFile.name);
        } catch (uploadError) {
          console.error('File upload failed:', uploadError);
          // Continue without file — don't block the order
          Alert.alert('File Upload Issue', 'Your file could not be uploaded, but your order will still be placed.');
        }
      }

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

      Alert.alert(
        '🎉 Order Placed!',
        'Your order has been submitted successfully. Our team will contact you on WhatsApp shortly.\n\nPayment: Cash on Delivery',
        [{ text: 'Go to Home', onPress: () => navigation.navigate('MainApp') }]
      );

    } catch (error) {
      console.error('Order submission error:', error);
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      {requiresUpload ? (
        <>
          <Text style={styles.stepTitle}>Upload Your Questions</Text>
          <Text style={styles.stepSubtitle}>
            {service.upload_instructions || 'Upload a PDF or image of your assignment/questions'}
          </Text>

          <TouchableOpacity style={styles.uploadArea} onPress={pickDocument}>
            {selectedFile ? (
              <View style={styles.fileSelected}>
                <View style={styles.fileIconBg}>
                  <Ionicons name="document-text" size={28} color="#2563EB" />
                </View>
                <View style={styles.fileInfo}>
                  <Text style={styles.fileName} numberOfLines={1}>{selectedFile.name}</Text>
                  <Text style={styles.fileSize}>
                    {selectedFile.size ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'File selected'}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedFile(null)}>
                  <Ionicons name="close-circle" size={24} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.uploadPlaceholder}>
                <View style={styles.uploadIconBg}>
                  <Ionicons name="cloud-upload-outline" size={32} color="#2563EB" />
                </View>
                <Text style={styles.uploadText}>Tap to Upload PDF / Image</Text>
                <Text style={styles.uploadHint}>Supports PDF, JPG, PNG</Text>
              </View>
            )}
          </TouchableOpacity>

          <Text style={[styles.stepTitle, { marginTop: 24 }]}>Instructions *</Text>
          <Text style={styles.stepSubtitle}>How should the assignment be done?</Text>
        </>
      ) : (
        <>
          <Text style={styles.stepTitle}>Requirements & Instructions</Text>
          <Text style={styles.stepSubtitle}>
            {service.upload_instructions || 'Please describe what you need or provide your order instructions below.'}
          </Text>
        </>
      )}

      <TextInput
        style={styles.textArea}
        placeholder={
          requiresUpload
            ? "E.g., Handwritten, use black pen, include diagrams, deadline is 25th June..."
            : "Describe your requirements in detail..."
        }
        placeholderTextColor="#9CA3AF"
        multiline
        numberOfLines={6}
        textAlignVertical="top"
        value={instructions}
        onChangeText={setInstructions}
      />
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <View style={styles.loginContainer}>
        <View style={styles.loginIconBg}>
          <Ionicons name="shield-checkmark" size={48} color="#2563EB" />
        </View>
        <Text style={styles.loginTitle}>Sign in to Continue</Text>
        <Text style={styles.loginSubtitle}>
          Sign in with Google so we can securely track your order and contact you.
        </Text>
        <TouchableOpacity 
          style={styles.googleButton} 
          onPress={handleGoogleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#111827" />
          ) : (
            <>
              <Ionicons name="logo-google" size={20} color="#111827" style={{ marginRight: 10 }} />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Contact Details</Text>
      <Text style={styles.stepSubtitle}>We'll contact you on WhatsApp for updates</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Full Name *</Text>
        <TextInput style={styles.input} placeholder="Your name" value={name} onChangeText={setName} />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email Address</Text>
        <TextInput 
          style={[styles.input, user && styles.inputLocked]} 
          placeholder="Your email" 
          value={email} 
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!user}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>WhatsApp Number *</Text>
        <TextInput 
          style={styles.input} 
          placeholder="10-digit phone number" 
          value={phone} 
          onChangeText={setPhone}
          keyboardType="phone-pad"
          maxLength={10}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>College Name *</Text>
        <TextInput style={styles.input} placeholder="Your college" value={college} onChangeText={setCollege} />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Delivery Address *</Text>
        <TextInput 
          style={[styles.input, { minHeight: 70 }]} 
          placeholder="Where should we deliver?" 
          value={address} 
          onChangeText={setAddress}
          multiline
          textAlignVertical="top"
        />
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Order Summary</Text>

      <View style={styles.summaryCard}>
        {service.thumbnail_url ? (
          <Image source={{ uri: service.thumbnail_url }} style={styles.summaryImage} />
        ) : null}
        <Text style={styles.summaryServiceName}>{service.title}</Text>
        <Text style={styles.summaryPrice}>₹{service.price}</Text>
      </View>

      <View style={styles.summarySection}>
        <SummaryRow icon="person" label="Name" value={name} />
        <SummaryRow icon="call" label="Phone" value={phone} />
        <SummaryRow icon="mail" label="Email" value={email} />
        <SummaryRow icon="school" label="College" value={college} />
        <SummaryRow icon="location" label="Address" value={address} />
        {selectedFile && <SummaryRow icon="document-text" label="File" value={selectedFile.name} />}
        <SummaryRow icon="create" label="Instructions" value={instructions} />
      </View>

      <View style={styles.paymentCard}>
        <View style={styles.paymentHeader}>
          <Ionicons name="card-outline" size={20} color="#059669" />
          <Text style={styles.paymentTitle}>Payment Method</Text>
        </View>
        <View style={styles.codBadge}>
          <Ionicons name="cash-outline" size={20} color="#059669" style={{ marginRight: 8 }} />
          <View>
            <Text style={styles.codText}>Cash on Delivery</Text>
            <Text style={styles.codSubtext}>Pay when you receive your assignment</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {currentStep === 1 ? (requiresUpload ? 'Upload & Instructions' : 'Order Requirements') : 
             currentStep === 2 ? 'Sign In' :
             currentStep === 3 ? 'Your Details' : 'Confirm Order'}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Step Indicator */}
        <View style={styles.stepIndicatorWrapper}>
          <StepIndicator currentStep={currentStep} />
          <View style={styles.stepLabelsRow}>
            {stepLabels.map((label, i) => (
              <Text key={i} style={[
                styles.stepLabelText,
                currentStep >= i + 1 ? { color: '#2563EB' } : { color: '#9CA3AF' }
              ]}>{label}</Text>
            ))}
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </ScrollView>

        {/* Bottom Action Bar */}
        {currentStep !== 2 && (
          <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            {currentStep < 4 ? (
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
                    <Text style={styles.placeOrderText}>Place Order (COD)</Text>
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
    <Ionicons name={icon} size={16} color="#6B7280" style={{ marginRight: 8, marginTop: 2 }} />
    <View style={{ flex: 1 }}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue} numberOfLines={2}>{value || '—'}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  backButton: { padding: 8 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: 'bold', color: '#111827', textAlign: 'center' },
  stepIndicatorWrapper: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 },
  stepIndicatorContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  stepRow: { flexDirection: 'row', alignItems: 'center' },
  stepCircle: {
    width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center',
  },
  stepCircleActive: { backgroundColor: '#2563EB' },
  stepCircleInactive: { backgroundColor: '#E5E7EB' },
  stepCircleText: { fontSize: 12, fontWeight: 'bold' },
  stepCircleTextActive: { color: '#FFFFFF' },
  stepCircleTextInactive: { color: '#9CA3AF' },
  stepLine: { width: 40, height: 2, marginHorizontal: 4 },
  stepLineActive: { backgroundColor: '#2563EB' },
  stepLineInactive: { backgroundColor: '#E5E7EB' },
  stepLabelsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, paddingHorizontal: 4 },
  stepLabelText: { fontSize: 11, fontWeight: '500' },
  scrollContent: { paddingBottom: 40 },
  stepContent: { padding: 20 },
  stepTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  stepSubtitle: { fontSize: 13, color: '#6B7280', marginBottom: 16 },
  // Upload Area
  uploadArea: {
    borderWidth: 2, borderColor: '#E5E7EB', borderStyle: 'dashed', borderRadius: 16,
    padding: 20, backgroundColor: '#FAFAFA',
  },
  uploadPlaceholder: { alignItems: 'center', paddingVertical: 16 },
  uploadIconBg: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: '#DBEAFE',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  uploadText: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 4 },
  uploadHint: { fontSize: 12, color: '#9CA3AF' },
  fileSelected: { flexDirection: 'row', alignItems: 'center' },
  fileIconBg: {
    width: 48, height: 48, borderRadius: 12, backgroundColor: '#DBEAFE',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  fileInfo: { flex: 1 },
  fileName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  fileSize: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  // Text Area
  textArea: {
    backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 14, fontSize: 15, color: '#111827',
    minHeight: 130, textAlignVertical: 'top',
  },
  // Login
  loginContainer: { alignItems: 'center', paddingVertical: 40 },
  loginIconBg: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#DBEAFE',
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  loginTitle: { fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  loginSubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 32, paddingHorizontal: 20, lineHeight: 22 },
  googleButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12,
    paddingVertical: 14, paddingHorizontal: 32, width: '100%',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  googleButtonText: { fontSize: 16, fontWeight: '600', color: '#111827' },
  // Form Inputs
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 6 },
  input: {
    backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#111827',
  },
  inputLocked: { backgroundColor: '#F3F4F6', color: '#9CA3AF' },
  // Summary
  summaryCard: {
    backgroundColor: '#F9FAFB', borderRadius: 16, padding: 20, alignItems: 'center',
    marginBottom: 20, borderWidth: 1, borderColor: '#F3F4F6',
  },
  summaryImage: { width: 60, height: 60, borderRadius: 12, marginBottom: 12 },
  summaryServiceName: { fontSize: 18, fontWeight: 'bold', color: '#111827', textAlign: 'center', marginBottom: 4 },
  summaryPrice: { fontSize: 22, fontWeight: '900', color: '#2563EB' },
  summarySection: {
    backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#F3F4F6',
    padding: 16, marginBottom: 16,
  },
  summaryRow: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  summaryLabel: { fontSize: 11, color: '#9CA3AF', marginBottom: 2 },
  summaryValue: { fontSize: 14, color: '#111827' },
  // Payment
  paymentCard: {
    backgroundColor: '#ECFDF5', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#D1FAE5',
  },
  paymentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  paymentTitle: { fontSize: 15, fontWeight: 'bold', color: '#059669', marginLeft: 8 },
  codBadge: { flexDirection: 'row', alignItems: 'center' },
  codText: { fontSize: 15, fontWeight: '600', color: '#111827' },
  codSubtext: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  // Bottom Bar
  bottomBar: {
    backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingTop: 16,
    borderTopWidth: 1, borderTopColor: '#E5E7EB',
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 10,
  },
  nextButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#2563EB', paddingVertical: 14, borderRadius: 12,
  },
  nextButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginRight: 8 },
  placeOrderButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#059669', paddingVertical: 14, borderRadius: 12,
  },
  placeOrderText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginRight: 8 },
});
