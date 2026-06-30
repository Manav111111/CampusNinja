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
  const { service } = route.params;

  // Determine if product strictly requires image/file upload based on admin setting
  const requiresUpload = Boolean(service.requires_file_upload);

  // Define steps dynamically
  // If requiresUpload is true: Step 1: Guidelines & Upload, Step 2: Delivery Info, Step 3: Order Summary
  // If requiresUpload is false: Step 1: Delivery Info, Step 2: Order Summary
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

  // When user logs in during login step, auto advance to appropriate step
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
      // Mandatory image/file upload validation when require product images is ON
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
      // Validate delivery info
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
        <Ionicons name="information-circle" size={24} color="#2563EB" />
        <Text style={styles.guidelinesTitle}>Product Upload Guidelines</Text>
      </View>
      <Text style={styles.stepSubtitle}>
        {service.upload_instructions || 'Please upload clearly legible images or PDF documents required for this custom order.'}
      </Text>

      <TouchableOpacity style={styles.uploadArea} onPress={pickDocument} activeOpacity={0.8}>
        {selectedFile ? (
          <View style={styles.fileSelected}>
            <View style={styles.fileIconBg}>
              <Ionicons name="image" size={28} color="#2563EB" />
            </View>
            <View style={styles.fileInfo}>
              <Text style={styles.fileName} numberOfLines={1}>{selectedFile.name}</Text>
              <Text style={styles.fileSize}>
                {selectedFile.size ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'File selected'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedFile(null)} style={{ padding: 6 }}>
              <Ionicons name="close-circle" size={24} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.uploadPlaceholder}>
            <View style={styles.uploadIconBg}>
              <Ionicons name="cloud-upload-outline" size={32} color="#2563EB" />
            </View>
            <Text style={styles.uploadText}>Tap to Upload Required Image / PDF</Text>
            <Text style={styles.uploadHint}>Mandatory for this custom product</Text>
          </View>
        )}
      </TouchableOpacity>

      <Text style={[styles.stepTitle, { marginTop: 24 }]}>Instructions & Notes *</Text>
      <Text style={styles.stepSubtitle}>Provide exact instructions for formatting, deadline, or specifications</Text>

      <TextInput
        style={styles.textArea}
        placeholder="E.g., Please make sure diagram labels are clear, use black pen..."
        placeholderTextColor="#9CA3AF"
        multiline
        numberOfLines={5}
        textAlignVertical="top"
        value={instructions}
        onChangeText={setInstructions}
      />
    </View>
  );

  const renderStepDetails = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Delivery Information</Text>
      <Text style={styles.stepSubtitle}>Where should we deliver your order or reach you?</Text>

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
          placeholder="10-digit mobile number" 
          value={phone} 
          onChangeText={setPhone}
          keyboardType="phone-pad"
          maxLength={10}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>College Name *</Text>
        <TextInput style={styles.input} placeholder="Your college or campus" value={college} onChangeText={setCollege} />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Delivery Address / Hostel Room *</Text>
        <TextInput 
          style={[styles.input, { minHeight: 64 }]} 
          placeholder="Hostel, Room Number, or Residential Address" 
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
            placeholder="Any specific delivery instructions or notes..." 
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
          <Ionicons name="shield-checkmark" size={48} color="#2563EB" />
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

  const renderStepConfirm = () => (
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
                  idx === currentStepIndex ? { color: '#2563EB', fontWeight: '700' } : { color: '#9CA3AF' }
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

        {/* Bottom Action Bar with Android Safe Area Inset Protection */}
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
  stepIndicatorWrapper: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 12, backgroundColor: '#FAFAFA', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  stepIndicatorContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  stepRow: { flexDirection: 'row', alignItems: 'center' },
  stepCircle: {
    width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center',
  },
  stepCircleActive: { backgroundColor: '#2563EB' },
  stepCircleInactive: { backgroundColor: '#E5E7EB' },
  stepCircleText: { fontSize: 12, fontWeight: 'bold' },
  stepCircleTextActive: { color: '#FFFFFF' },
  stepCircleTextInactive: { color: '#6B7280' },
  stepLine: { width: 50, height: 2, marginHorizontal: 6 },
  stepLineActive: { backgroundColor: '#2563EB' },
  stepLineInactive: { backgroundColor: '#E5E7EB' },
  stepLabelsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 8 },
  stepLabelText: { fontSize: 12, fontWeight: '500' },
  scrollContent: { paddingBottom: 60 },
  stepContent: { padding: 20 },
  guidelinesHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  guidelinesTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  stepTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  stepSubtitle: { fontSize: 13, color: '#6B7280', marginBottom: 16, lineHeight: 20 },
  uploadArea: {
    borderWidth: 2, borderColor: '#3B82F6', borderStyle: 'dashed', borderRadius: 16,
    padding: 24, backgroundColor: '#EFF6FF',
  },
  uploadPlaceholder: { alignItems: 'center', paddingVertical: 12 },
  uploadIconBg: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: '#DBEAFE',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  uploadText: { fontSize: 15, fontWeight: '700', color: '#1E40AF', marginBottom: 4 },
  uploadHint: { fontSize: 12, color: '#60A5FA', fontWeight: '500' },
  fileSelected: { flexDirection: 'row', alignItems: 'center' },
  fileIconBg: {
    width: 48, height: 48, borderRadius: 12, backgroundColor: '#DBEAFE',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  fileInfo: { flex: 1 },
  fileName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  fileSize: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  textArea: {
    backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 14, fontSize: 15, color: '#111827',
    minHeight: 110, textAlignVertical: 'top',
  },
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
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: {
    backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#111827',
  },
  inputLocked: { backgroundColor: '#F3F4F6', color: '#6B7280' },
  summaryCard: {
    backgroundColor: '#F9FAFB', borderRadius: 16, padding: 20, alignItems: 'center',
    marginBottom: 20, borderWidth: 1, borderColor: '#F3F4F6',
  },
  summaryImage: { width: 64, height: 64, borderRadius: 12, marginBottom: 12 },
  summaryServiceName: { fontSize: 18, fontWeight: 'bold', color: '#111827', textAlign: 'center', marginBottom: 4 },
  summaryPrice: { fontSize: 24, fontWeight: '900', color: '#2563EB' },
  summarySection: {
    backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#F3F4F6',
    padding: 16, marginBottom: 16,
  },
  summaryRow: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  summaryLabel: { fontSize: 11, color: '#9CA3AF', marginBottom: 2 },
  summaryValue: { fontSize: 14, color: '#111827', fontWeight: '500' },
  paymentCard: {
    backgroundColor: '#ECFDF5', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#A7F3D0',
  },
  paymentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  paymentTitle: { fontSize: 15, fontWeight: 'bold', color: '#059669', marginLeft: 8 },
  codBadge: { flexDirection: 'row', alignItems: 'center' },
  codText: { fontSize: 15, fontWeight: '700', color: '#065F46' },
  codSubtext: { fontSize: 12, color: '#047857', marginTop: 2 },
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
