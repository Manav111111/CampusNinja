import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getSubjectVisualIdentity } from '../utils/subjectTheme';

export default function SubjectCard({ title, counts, subject }) {
  const subjectTitle = title || subject?.name || subject?.title || 'Subject';
  const theme = getSubjectVisualIdentity(subjectTitle);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg, borderColor: theme.border }]}>
      {/* Top Header: Monogram Badge */}
      <View style={styles.topRow}>
        <View style={[styles.initialsBadge, { backgroundColor: theme.primary }]}>
          <Text style={styles.initialsText}>{theme.initials}</Text>
        </View>
      </View>

      {/* Subject Title */}
      <Text style={styles.title} numberOfLines={2}>{subjectTitle}</Text>

      {/* Bottom Footer: Progress / Materials Info */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.primary }]}>
          Explore Courses
        </Text>
        <Ionicons name="arrow-forward" size={12} color={theme.primary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 14,
    width: 145,
    height: 140,
    marginRight: 14,
    borderWidth: 1.5,
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  initialsBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  initialsText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  countBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
  },
  countText: {
    fontSize: 11,
    fontWeight: '800',
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 18,
    marginVertical: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  footerText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
