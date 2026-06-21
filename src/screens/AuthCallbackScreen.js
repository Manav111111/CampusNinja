import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import * as Linking from 'expo-linking';
import { handleAuthCallback, getCurrentSession } from '../services/auth';

export default function AuthCallbackScreen({ navigation }) {
  useEffect(() => {
    let mounted = true;

    const finishLogin = async () => {
      try {
        const url = await Linking.getInitialURL();
        if (url) {
          await handleAuthCallback(url);
        }

        const session = await getCurrentSession();
        if (mounted) {
          navigation.replace('MainApp', { screen: session?.user ? 'Home' : 'Profile' });
        }
      } catch (error) {
        console.error('Auth callback screen failed:', error);
        if (mounted) navigation.replace('MainApp');
      }
    };

    finishLogin();

    return () => {
      mounted = false;
    };
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#EA580C" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
});
