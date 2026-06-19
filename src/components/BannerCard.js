import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';

export default function BannerCard({ title, subtitle, buttonText, backgroundColor }) {
  return (
    <View style={[styles.container, { backgroundColor: backgroundColor || '#1E1B4B' }]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>{buttonText} →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 300,
    height: 160,
    borderRadius: 16,
    padding: 20,
    marginRight: 16,
    justifyContent: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#E0E7FF',
    fontSize: 14,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#111827',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
