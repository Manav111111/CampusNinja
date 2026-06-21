import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import Screens
import SplashScreen from '../screens/SplashScreen';
import AuthCallbackScreen from '../screens/AuthCallbackScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import AcademicSetupScreen from '../screens/AcademicSetupScreen';
import BottomTabs from './BottomTabs';
import SearchScreen from '../screens/SearchScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SubjectDetailScreen from '../screens/SubjectDetailScreen';
import ServiceDetailScreen from '../screens/ServiceDetailScreen';
import OrderRequestScreen from '../screens/OrderRequestScreen';
import MyOrdersScreen from '../screens/MyOrdersScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Auth & Onboarding */}
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="AuthCallback" component={AuthCallbackScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="AcademicSetup" component={AcademicSetupScreen} />

      {/* Main Bottom Tabs */}
      <Stack.Screen name="MainApp" component={BottomTabs} />

      {/* Other Stack Screens */}
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="SubjectDetail" component={SubjectDetailScreen} />
      <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} />
      <Stack.Screen name="OrderRequest" component={OrderRequestScreen} />
      <Stack.Screen name="MyOrders" component={MyOrdersScreen} />
    </Stack.Navigator>
  );
}
