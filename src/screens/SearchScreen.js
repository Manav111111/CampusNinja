import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/colors';
import Header from '../components/Header';
import Button from '../components/Button';

export default function SearchScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Header 
        title="Search Screen" 
        onBackPress={() => navigation.goBack()}
      />
      <View style={styles.content}>
        <Text style={styles.title}>Search Screen</Text>
        <Text style={styles.subtitle}>Campus Ninja</Text>
        <Text style={styles.status}>Coming Soon</Text>
        
        
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  status: {
    fontSize: 16,
    color: COLORS.secondary,
    marginBottom: 20,
    textAlign: 'center',
  },
});
