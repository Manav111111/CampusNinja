import { registerRootComponent } from 'expo';
import * as Notifications from 'expo-notifications';

import App from './App';

// ============================================================
// GLOBAL NOTIFICATION HANDLER
// This MUST be registered at the top level (outside any component)
// so it runs even when the app is in the background or terminated.
//
// Controls how notifications are presented when they arrive:
// - shouldShowAlert: Show the notification banner even in foreground
// - shouldPlaySound: Play the default notification sound
// - shouldSetBadge: Update the app badge count
// ============================================================
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
