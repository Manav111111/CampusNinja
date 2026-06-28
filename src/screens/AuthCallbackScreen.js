import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import * as Linking from 'expo-linking';
import { handleAuthCallback, getCurrentSession } from '../services/auth';

export default function AuthCallbackScreen({ navigation }) {
  useEffect(() => {
    let mounted = true;

    const finishLogin = async () => {
      try {
        // Try to process the initial URL (cold-start case)
        const url = await Linking.getInitialURL();
        if (url) {
          console.log('AuthCallbackScreen: processing URL:', url);
          await handleAuthCallback(url);
        }

        // Give a small delay for the session to propagate
        await new Promise((resolve) => setTimeout(resolve, 500));

        const session = await getCurrentSession();
        console.log('AuthCallbackScreen: session found:', Boolean(session?.user));

        if (mounted) {
          if (session?.user) {
            navigation.replace('MainApp', { screen: 'Home' });
          } else {
            navigation.replace('MainApp', { screen: 'Profile' });
          }
        }
      } catch (error) {
        console.error('AuthCallbackScreen failed:', error);
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
      <Text style={styles.text}>{"Completing login..."}</Text>
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
  text: {
    marginTop: 16,
    fontSize: 14,
    color: '#6B7280',
  },
});
