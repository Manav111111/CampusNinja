import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import AppNavigator from './src/navigation/AppNavigator';
import { handleAuthCallback } from './src/services/auth';

const linking = {
  prefixes: [Linking.createURL('/'), 'campusninja://'],
  config: {
    screens: {
      Splash: 'splash',
      AuthCallback: 'auth/callback',
      Onboarding: 'onboarding',
      AcademicSetup: 'academic-setup',
      MainApp: '',
      Search: 'search',
      Notifications: 'notifications',
      SubjectDetail: 'subjects/:subjectId',
      ServiceDetail: 'services/:serviceId',
      OrderRequest: 'orders/new',
      MyOrders: 'orders',
    },
  },
};

export default function App() {
  useEffect(() => {
    const processUrl = async (url) => {
      try {
        await handleAuthCallback(url);
      } catch (error) {
        console.error('OAuth callback handling failed:', error);
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) processUrl(url);
    });

    const subscription = Linking.addEventListener('url', ({ url }) => {
      processUrl(url);
    });

    return () => subscription.remove();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer linking={linking}>
        <AppNavigator />
        <StatusBar style="dark" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
