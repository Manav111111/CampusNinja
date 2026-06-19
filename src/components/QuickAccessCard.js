import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

export default function QuickAccessCard({ title, iconName, iconColor, fullWidth }) {
  return (
    <TouchableOpacity style={[styles.container, fullWidth && styles.fullWidth]}>
      <View style={[styles.iconContainer, { backgroundColor: iconColor }]} >
        <Ionicons name={iconName} size={24} color="#FFFFFF" />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Ionicons name="chevron-forward" size={16} color={COLORS.secondary} style={styles.chevron} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 12,
    flex: 1,
    marginHorizontal: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  fullWidth: {
    flex: undefined,
    width: '100%',
    marginHorizontal: 0,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  chevron: {
    marginLeft: 8,
  },
});
