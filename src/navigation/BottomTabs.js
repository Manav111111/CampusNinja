import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

// Import Screens for Tabs
import HomeScreen from '../screens/HomeScreen';
import SubjectsScreen from '../screens/SubjectsScreen';
import SkillsScreen from '../screens/SkillsScreen';
import MarketplaceScreen from '../screens/MarketplaceScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.secondary,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Subjects') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Skills') {
            iconName = focused ? 'rocket' : 'rocket-outline';
          } else if (route.name === 'Marketplace') {
            iconName = focused ? 'bag' : 'bag-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={24} color={color} />;
        },
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          // Automatically handle safe area by removing hardcoded height,
          // but give it a nice minimum height and padding for Android
          minHeight: Platform.OS === 'android' ? 65 : 85,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'android' ? 10 : 25,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          paddingBottom: 4,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Subjects" component={SubjectsScreen} />
      <Tab.Screen name="Skills" component={SkillsScreen} />
      <Tab.Screen name="Marketplace" component={MarketplaceScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
