import { initializeApp, getApps, getApp } from 'firebase/app';
import googleServices from '../../google-services.json';

// Parse configuration from google-services.json
const client = googleServices.client[0];
const projectInfo = googleServices.project_info;

const firebaseConfig = {
  apiKey: client.api_key[0].current_key,
  authDomain: `${projectInfo.project_id}.firebaseapp.com`,
  projectId: projectInfo.project_id,
  storageBucket: projectInfo.storage_bucket,
  messagingSenderId: projectInfo.project_number,
  appId: client.client_info.mobilesdk_app_id,
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Firebase Analytics via the JS SDK is NOT supported in React Native.
// The JS SDK requires browser APIs (IndexedDB, window) that don't exist in RN.
// For native analytics, use @react-native-firebase/analytics instead.
// We export null so that analytics.js gracefully falls back to console logging.
let analytics = null;

export { app, analytics };
