import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SubjectCard({ title, iconName, iconColor }) {
  const accent = iconColor || '#8B5CF6';
  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: accent + '18' }]}>
        <Ionicons name={iconName || 'book-outline'} size={26} color={accent} />
      </View>
      <Text style={styles.title} numberOfLines={2}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    width: 115,
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    height: 125,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    lineHeight: 18,
  },
});
