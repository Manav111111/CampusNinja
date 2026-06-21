import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
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

// Initialize Analytics conditionally (may not be supported in all Expo native environments without plugins)
let analytics = null;
isSupported()
  .then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  })
  .catch((err) => {
    console.log("Firebase Analytics not supported in this environment:", err.message);
  });

export { app, analytics };
