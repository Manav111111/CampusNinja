import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { getSocialLinks } from '../services/supabase';

export default function WhatsAppBanner() {
  const [waLink, setWaLink] = useState('https://chat.whatsapp.com');

  useEffect(() => {
    getSocialLinks('whatsapp').then((links) => {
      if (links && links.length > 0) {
        setWaLink(links[0].url);
      }
    }).catch(() => {});
  }, []);

  const handlePress = () => {
    Linking.openURL(waLink).catch(() => {});
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="logo-whatsapp" size={32} color="#FFFFFF" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Join Campus Ninja WhatsApp Community</Text>
        <Text style={styles.subtitle}>Get important updates, notes, PYQs and more.</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={handlePress} activeOpacity={0.8}>
        <Text style={styles.buttonText}>Join Now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    marginHorizontal: 16,
    marginBottom: 24,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.secondary,
  },
  button: {
    backgroundColor: '#16A34A',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
});
