import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';

export default function MarketplaceCard({ title, description, price, iconName, iconColor }) {
  return (
    <TouchableOpacity style={styles.container}>
      <View style={styles.headerRow}>
        <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
          <Ionicons name={iconName} size={20} color={iconColor} />
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>
      <Text style={styles.description} numberOfLines={2}>{description}</Text>
      <Text style={styles.price}>₹{price}</Text>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>View Details</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    width: 160,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  description: {
    fontSize: 12,
    color: COLORS.secondary,
    marginBottom: 12,
    height: 34,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 12,
  },
  button: {
    borderWidth: 1,
    borderColor: '#A78BFA', // Light purple tone for outline
    borderRadius: 20,
    paddingVertical: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#6D28D9', // Purple text matching the image styling
    fontSize: 12,
    fontWeight: '600',
  },
});
