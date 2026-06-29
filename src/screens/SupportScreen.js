import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Platform,
  Linking 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

const FAQS = [
  {
    q: 'How do I download semester notes & PYQs?',
    a: 'Go to the Subjects tab or select your subject from the Home Screen. Tap on any Note or PYQ item to view or download it directly to your device.'
  },
  {
    q: 'How does the Academic Marketplace work?',
    a: 'You can request instant assignment, drawing sheet, or lab manual help. Once you place an order, a verified Campus Ninja expert completes it within the promised delivery timeframe.'
  },
  {
    q: 'How do I change my semester or branch?',
    a: 'Navigate to Profile > Change Academic Setup. You can update your university, course degree, branch, and semester at any time.'
  },
  {
    q: 'Are the PYQs solved and verified?',
    a: 'Yes! All previous year question papers come with comprehensive solutions verified by top engineering faculty and rankers.'
  }
];

export default function SupportScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const initialSection = route.params?.section || 'FAQ'; // FAQ, Privacy, Terms
  const [activeSection, setActiveSection] = useState(initialSection);
  const [openFaq, setOpenFaq] = useState(0);

  const contactSupport = () => {
    Linking.openURL('mailto:support@campusninja.com?subject=Need%20Help%20with%20Campus%20Ninja').catch(() => {});
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {[
          { key: 'FAQ', label: 'FAQs & Help' },
          { key: 'Privacy', label: 'Privacy Policy' },
          { key: 'Terms', label: 'Terms of Use' }
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabItem, activeSection === tab.key && styles.activeTabItem]}
            onPress={() => setActiveSection(tab.key)}
          >
            <Text style={[styles.tabText, activeSection === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {activeSection === 'FAQ' && (
          <>
            <View style={styles.helpHero}>
              <Ionicons name="headset" size={40} color={COLORS.primary} />
              <Text style={styles.helpHeroTitle}>How can we help you today?</Text>
              <Text style={styles.helpHeroSub}>Browse common questions below or reach out to our team.</Text>
              <TouchableOpacity style={styles.contactBtn} onPress={contactSupport}>
                <Ionicons name="mail" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.contactBtnText}>Email Support Team</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionHeading}>FREQUENTLY ASKED QUESTIONS</Text>
            {FAQS.map((faq, idx) => (
              <TouchableOpacity 
                key={idx} 
                style={styles.faqCard}
                onPress={() => setOpenFaq(openFaq === idx ? null : idx)}
                activeOpacity={0.8}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQ}>{faq.q}</Text>
                  <Ionicons name={openFaq === idx ? "chevron-up" : "chevron-down"} size={20} color="#64748B" />
                </View>
                {openFaq === idx && (
                  <Text style={styles.faqA}>{faq.a}</Text>
                )}
              </TouchableOpacity>
            ))}
          </>
        )}

        {activeSection === 'Privacy' && (
          <View style={styles.docCard}>
            <Text style={styles.docTitle}>Privacy Policy</Text>
            <Text style={styles.docDate}>Last Updated: June 2026</Text>
            <Text style={styles.docText}>
              At Campus Ninja, protecting your personal data is our top priority. This Privacy Policy outlines how we collect, use, and safeguard your information when you use our mobile application and academic services.{"\n\n"}
              1. Information We Collect: We collect information you provide directly to us during setup, such as your university name, branch, semester, name, and email address.{"\n\n"}
              2. Use of Information: Your academic preferences are used solely to curate relevant syllabus, notes, PYQs, and marketplace items tailored to your specific coursework.{"\n\n"}
              3. Data Security: We implement industry-standard security measures, including Supabase encryption, to ensure your login credentials and order histories remain strictly confidential.
            </Text>
          </View>
        )}

        {activeSection === 'Terms' && (
          <View style={styles.docCard}>
            <Text style={styles.docTitle}>Terms & Conditions</Text>
            <Text style={styles.docDate}>Last Updated: June 2026</Text>
            <Text style={styles.docText}>
              By accessing and using Campus Ninja, you agree to comply with the following terms of service:{"\n\n"}
              1. Academic Integrity: Study materials, notes, and previous year question papers provided on this app are intended for supplementary review and educational assistance.{"\n\n"}
              2. Marketplace Orders: Service orders placed for lab help or assignment reference materials must be reviewed by the student. Delivery timelines are estimates based on ninja expert availability.{"\n\n"}
              3. User Conduct: Users must treat community channels and mentors with respect. Any misuse or redistribution of copyrighted materials is prohibited.
            </Text>
          </View>
        )}
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tabItem: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 10,
  },
  activeTabItem: {
    backgroundColor: '#0F172A',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  helpHero: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Platform.select({
      ios: { shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12 },
      android: { elevation: 2 },
    }),
  },
  helpHeroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 12,
    textAlign: 'center',
  },
  helpHeroSub: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 20,
  },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  contactBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 12,
    letterSpacing: 0.8,
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQ: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
    marginRight: 12,
  },
  faqA: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 12,
    lineHeight: 22,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: 12,
  },
  docCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  docTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  docDate: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
    marginBottom: 16,
  },
  docText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 24,
  },
});
