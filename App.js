import React, { createRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import AppNavigator from './src/navigation/AppNavigator';
import { handleAuthCallback } from './src/services/auth';
import useNotifications from './src/hooks/useNotifications';
import { CartProvider } from './src/context/CartContext';
import { ToastProvider } from './src/context/ToastContext';

// ============================================================
// NAVIGATION REF
// Exported so the notification service can navigate from outside
// React component tree (e.g., when app opens from terminated state).
// ============================================================
export const navigationRef = createRef();

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
      Cart: 'cart',
      SubjectDetail: 'subjects/:subjectId',
      ServiceDetail: 'services/:serviceId',
      OrderRequest: 'orders/new',
      MyOrders: 'orders',
      Support: 'support',
    },
  },
};

// ============================================================
// INNER APP COMPONENT
// Wraps the navigator and initializes notifications.
// Must be inside NavigationContainer so the navigationRef is bound.
// ============================================================
function AppInner() {
  // Initialize the push notification system.
  // This hook handles: permission, token registration, foreground display,
  // tap navigation, token refresh, and auth-aware token save/remove.
  const { expoPushToken, fcmToken } = useNotifications(navigationRef);

  return <AppNavigator />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <CartProvider>
        <ToastProvider>
          <NavigationContainer ref={navigationRef} linking={linking}>
            <AppInner />
            <StatusBar style="dark" />
          </NavigationContainer>
        </ToastProvider>
      </CartProvider>
    </SafeAreaProvider>
  );
}
