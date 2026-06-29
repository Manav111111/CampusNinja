import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import AppNavigator from './src/navigation/AppNavigator';
import { handleAuthCallback } from './src/services/auth';

const linking = {
  prefixes: [Linking.createURL('/'), Linking.createURL(''), 'campusninja://'],
  
  // Custom getInitialURL to intercept deep links BEFORE React Navigation consumes them and strips hash fragments
  async getInitialURL() {
    const url = await Linking.getInitialURL();
    if (url) {
      console.log('🔗 [Navigation] Initial URL intercepted:', url);
      try {
        await handleAuthCallback(url);
      } catch (error) {
        console.error('❌ [Navigation] Auth callback failed:', error);
      }
    }
    return url;
  },
  
  // Custom subscribe to intercept deep links during app runtime
  subscribe(listener) {
    const subscription = Linking.addEventListener('url', async ({ url }) => {
      console.log('🔗 [Navigation] Deep link intercepted:', url);
      try {
        await handleAuthCallback(url);
      } catch (error) {
        console.error('❌ [Navigation] Auth callback failed:', error);
      }
      listener(url);
    });

    return () => {
      subscription.remove();
    };
  },

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
      Support: 'support',
    },
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer linking={linking}>
        <AppNavigator />
        <StatusBar style="dark" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
