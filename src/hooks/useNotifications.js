// ============================================================
// useNotifications HOOK
// Reusable React hook that wires up the entire push notification
// lifecycle for CampusNinja. Drop it into App.js and forget.
//
// Responsibilities:
// 1. Register for push notifications on mount
// 2. Save FCM token to Supabase when user is authenticated
// 3. Listen for auth state changes (login → save, logout → remove)
// 4. Handle foreground notifications (show them as banners)
// 5. Handle notification taps (navigate to the right screen)
// 6. Handle token refreshes (auto-update Supabase)
// ============================================================

import { useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { supabase } from '../services/supabase';
import {
  registerForPushNotifications,
  saveDeviceToken,
  removeDeviceToken,
  handleNotificationResponse,
} from '../services/notifications';

/**
 * @param {object} navigationRef - React Navigation ref created via createRef()
 * @returns {{ expoPushToken: string|null, fcmToken: string|null, notification: object|null }}
 */
export default function useNotifications(navigationRef) {
  const [expoPushToken, setExpoPushToken] = useState(null);
  const [fcmToken, setFcmToken] = useState(null);
  const [notification, setNotification] = useState(null);

  // Refs to hold listener subscriptions so we can clean them up
  const notificationListener = useRef();
  const responseListener = useRef();
  const tokenRefreshListener = useRef();

  useEffect(() => {
    let isMounted = true;

    // ──────────────────────────────────────────────────────────
    // A. REGISTER & GET TOKENS
    // Called once on mount. Gets permission + tokens.
    // ──────────────────────────────────────────────────────────
    const initNotifications = async () => {
      const result = await registerForPushNotifications();
      
      if (result && isMounted) {
        setExpoPushToken(result.expoPushToken);
        setFcmToken(result.fcmToken);

        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (result.fcmToken) {
            await saveDeviceToken(session?.user?.id || null, result.fcmToken, result.platform);
          }
        } catch (error) {
          console.log('⚠️ [useNotifications] Could not check session on init:', error.message);
        }
      }
    };

    initNotifications();

    // ──────────────────────────────────────────────────────────
    // B. FOREGROUND NOTIFICATION LISTENER
    // Fires when a notification arrives while the app is open.
    // The notification is already displayed as a banner by the
    // handler in index.js — here we just capture it for state.
    // ──────────────────────────────────────────────────────────
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (receivedNotification) => {
        console.log('📬 [useNotifications] Foreground notification received:', 
          receivedNotification.request.content.title
        );
        if (isMounted) {
          setNotification(receivedNotification);
        }
      }
    );

    // ──────────────────────────────────────────────────────────
    // C. NOTIFICATION TAP LISTENER
    // Fires when user taps a notification (foreground, background,
    // or from the terminated state notification tray).
    // ──────────────────────────────────────────────────────────
    const processedResponseIds = new Set();

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const id = response?.notification?.request?.identifier;
        if (id && processedResponseIds.has(id)) return;
        if (id) processedResponseIds.add(id);

        console.log('👆 [useNotifications] Notification tapped');
        handleNotificationResponse(response, navigationRef);
      }
    );

    // ──────────────────────────────────────────────────────────
    // D. TOKEN REFRESH LISTENER
    // FCM may rotate the device token. When it does, we need to
    // update Supabase with the new token.
    // ──────────────────────────────────────────────────────────
    tokenRefreshListener.current = Notifications.addPushTokenListener(
      async (newToken) => {
        const rawToken = newToken?.data;
        if (!rawToken) return;
        console.log('🔄 [useNotifications] Push token refreshed:', rawToken);
        if (isMounted) {
          try {
            setFcmToken(rawToken);

            const { data: { session } } = await supabase.auth.getSession();
            await saveDeviceToken(session?.user?.id || null, rawToken, 'android');
          } catch (error) {
            console.log('⚠️ [useNotifications] Token refresh save failed:', error.message);
          }
        }
      }
    );

    // ──────────────────────────────────────────────────────────
    // E. AUTH STATE CHANGE LISTENER
    // When user logs in → save token
    // When user logs out → remove token
    // ──────────────────────────────────────────────────────────
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`🔐 [useNotifications] Auth event: ${event}`);

        if (event === 'SIGNED_IN' && session?.user?.id) {
          // User just logged in — save current device token
          // We need to get the current fcmToken from state or re-register
          const currentToken = fcmToken;
          if (currentToken) {
            await saveDeviceToken(session.user.id, currentToken, 'android');
          } else {
            // Token might not be set yet if auth happened before registration
            const result = await registerForPushNotifications();
            if (result) {
              if (isMounted) {
                setExpoPushToken(result.expoPushToken);
                setFcmToken(result.fcmToken);
              }
              await saveDeviceToken(session.user.id, result.fcmToken, result.platform);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          // User logged out — remove this device's token
          const currentToken = fcmToken;
          if (currentToken) {
            await removeDeviceToken(currentToken);
          }
        }
      }
    );

    // ──────────────────────────────────────────────────────────
    // F. HANDLE APP OPENED FROM TERMINATED STATE VIA NOTIFICATION
    // Check if the app was opened by tapping a notification
    // while it was completely killed.
    // ──────────────────────────────────────────────────────────
    Notifications.getLastNotificationResponseAsync().then((lastResponse) => {
      if (lastResponse && isMounted) {
        const id = lastResponse?.notification?.request?.identifier;
        if (id && processedResponseIds.has(id)) return;
        if (id) processedResponseIds.add(id);

        console.log('🚀 [useNotifications] App opened from killed state via notification');
        // Small delay to ensure navigation is ready
        setTimeout(() => {
          handleNotificationResponse(lastResponse, navigationRef);
        }, 1000);
      }
    });

    // ──────────────────────────────────────────────────────────
    // CLEANUP
    // ──────────────────────────────────────────────────────────
    return () => {
      isMounted = false;

      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
      if (tokenRefreshListener.current) {
        tokenRefreshListener.current.remove();
      }
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []); // Empty deps — runs once on mount

  return { expoPushToken, fcmToken, notification };
}
