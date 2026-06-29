// ============================================================
// NOTIFICATION SERVICE
// Core push notification logic for CampusNinja.
// Uses expo-notifications which wraps FCM on Android natively.
// ============================================================

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// ────────────────────────────────────────────────────────────────
// 1. ANDROID NOTIFICATION CHANNEL
// Android 8+ requires a channel for notifications to appear.
// We create one with high importance so notifications always
// show as heads-up banners with sound.
// ────────────────────────────────────────────────────────────────
export const setupNotificationChannel = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('campus-ninja-default', {
      name: 'CampusNinja Notifications',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6B00', // CampusNinja brand orange
      sound: 'default',
      enableVibrate: true,
      showBadge: true,
    });
    console.log('🔔 [Notifications] Android channel created: campus-ninja-default');
  }
};

// ────────────────────────────────────────────────────────────────
// 2. REGISTER FOR PUSH NOTIFICATIONS
// Requests permission from the user, then obtains the native
// FCM device token via Expo's push token API.
// Returns the Expo push token string or null on failure.
// ────────────────────────────────────────────────────────────────
export const registerForPushNotifications = async () => {
  // Push notifications only work on physical devices, not emulators
  if (!Device.isDevice) {
    console.warn('⚠️ [Notifications] Push notifications require a physical device');
    return null;
  }

  try {
    // Step 1: Check existing permission status
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Step 2: If not already granted, request permission
    if (existingStatus !== 'granted') {
      console.log('📋 [Notifications] Requesting notification permission...');
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // Step 3: If permission denied, bail out gracefully
    if (finalStatus !== 'granted') {
      console.warn('❌ [Notifications] Permission not granted. User declined notifications.');
      return null;
    }

    console.log('✅ [Notifications] Permission granted');

    // Step 4: Set up the Android notification channel before getting the token
    await setupNotificationChannel();

    // Step 5: Get the Expo push token (this wraps the native FCM token)
    // We need the projectId from app.json → extra.eas.projectId
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    
    if (!projectId) {
      console.error('❌ [Notifications] Missing EAS projectId in app.json');
      return null;
    }

    const tokenResponse = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    const expoPushToken = tokenResponse.data;
    console.log('🔑 [Notifications] Expo Push Token:', expoPushToken);

    // Step 6: Also get the native device push token (raw FCM token)
    // This is the token Firebase Admin SDK needs to send directly via FCM
    const nativeToken = await Notifications.getDevicePushTokenAsync();
    console.log('🔑 [Notifications] Native FCM Token:', nativeToken.data);

    return {
      expoPushToken,
      fcmToken: nativeToken.data,
      platform: Platform.OS,
    };
  } catch (error) {
    console.error('❌ [Notifications] Registration failed:', error);
    return null;
  }
};

// ────────────────────────────────────────────────────────────────
// 3. SAVE DEVICE TOKEN TO SUPABASE
// Upserts the FCM token into the `device_tokens` table.
// Uses ON CONFLICT (token) so re-registering the same device
// simply updates the timestamp and user_id.
// ────────────────────────────────────────────────────────────────
export const saveDeviceToken = async (userId, fcmToken, platform = 'android') => {
  if (!userId || !fcmToken) {
    console.warn('⚠️ [Notifications] Cannot save token: missing userId or fcmToken');
    return false;
  }

  try {
    const { error } = await supabase
      .from('device_tokens')
      .upsert(
        {
          user_id: userId,
          token: fcmToken,
          platform,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'token', // If this device already registered, update it
        }
      );

    if (error) {
      console.error('❌ [Notifications] Failed to save token to Supabase:', error.message);
      return false;
    }

    console.log('💾 [Notifications] Device token saved to Supabase for user:', userId);
    return true;
  } catch (error) {
    console.error('❌ [Notifications] saveDeviceToken exception:', error);
    return false;
  }
};

// ────────────────────────────────────────────────────────────────
// 4. REMOVE DEVICE TOKEN FROM SUPABASE
// Called on logout so the user stops receiving notifications
// on this device.
// ────────────────────────────────────────────────────────────────
export const removeDeviceToken = async (fcmToken) => {
  if (!fcmToken) return;

  try {
    const { error } = await supabase
      .from('device_tokens')
      .delete()
      .eq('token', fcmToken);

    if (error) {
      console.error('❌ [Notifications] Failed to remove token:', error.message);
    } else {
      console.log('🗑️ [Notifications] Device token removed from Supabase');
    }
  } catch (error) {
    console.error('❌ [Notifications] removeDeviceToken exception:', error);
  }
};

// ────────────────────────────────────────────────────────────────
// 5. HANDLE NOTIFICATION TAP (RESPONSE)
// When a user taps a notification, parse the payload data
// and navigate to the appropriate screen.
//
// Expected payload data format from admin panel:
// {
//   screen: "SubjectDetail" | "ServiceDetail" | "MyOrders" | "Notifications" | etc.,
//   params: { subject: {...}, service: {...}, orderId: "..." }
// }
// ────────────────────────────────────────────────────────────────
export const handleNotificationResponse = (response, navigationRef) => {
  try {
    const data = response.notification.request.content.data;
    console.log('👆 [Notifications] User tapped notification. Payload:', JSON.stringify(data));

    if (!navigationRef?.current) {
      console.warn('⚠️ [Notifications] Navigation ref not ready yet');
      return;
    }

    const nav = navigationRef.current;

    // Parse the screen name and params from the notification payload
    const screen = data?.screen;
    const params = data?.params ? (typeof data.params === 'string' ? JSON.parse(data.params) : data.params) : {};

    if (screen) {
      console.log(`🧭 [Notifications] Navigating to: ${screen}`, params);
      // Use navigate (not replace) so the user can go back
      nav.navigate(screen, params);
    } else {
      // Default: open the Notifications screen
      console.log('🧭 [Notifications] No screen specified, opening Notifications');
      nav.navigate('Notifications');
    }
  } catch (error) {
    console.error('❌ [Notifications] Error handling notification tap:', error);
  }
};
