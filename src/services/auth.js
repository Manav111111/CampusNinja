import * as AuthSession from 'expo-auth-session';
import * as Linking from 'expo-linking';
import { supabase } from './supabase';
import { Toast } from '../context/ToastContext';

// ── Helpers ──────────────────────────────────────────────────────

export const getOAuthRedirectUrl = () => {
  return 'campusninja://auth/callback';
};

export const getCurrentSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
};

// ── Handle the OAuth callback URL ───────────────────────────────

let lastHandledUrl = null;

export const handleAuthCallback = async (url) => {
  if (!url || url === lastHandledUrl) return false;

  const [base, fragment = ''] = url.split('#');
  const query = base.includes('?') ? base.split('?')[1] : '';
  const combined = [query, fragment].filter(Boolean).join('&');
  const params = new URLSearchParams(combined);

  const oauthError = params.get('error_description') || params.get('error');
  if (oauthError) throw new Error(oauthError);

  const accessToken  = params.get('access_token');
  const refreshToken = params.get('refresh_token');

  if (!accessToken && !refreshToken) return false;

  lastHandledUrl = url;

  try {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) throw error;
    console.log('✅ OAuth session set from tokens');
    return true;
  } catch (err) {
    lastHandledUrl = null;
    throw err;
  }
};

// ── Google Login ─────────────────────────────────────────────────

export const performGoogleLogin = async () => {
  try {
    const returnUrl = getOAuthRedirectUrl();

    console.log('=== Google Login Debug ===');
    console.log('Return URL:', returnUrl);

    // 1. Get the OAuth URL from Supabase
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: returnUrl,
        skipBrowserRedirect: true,
      },
    });

    if (error) throw error;
    if (!data.url) throw new Error('No URL returned from Supabase OAuth');

    console.log('Opening System Browser for OAuth…');

    // 2. Use Linking.openURL instead of WebBrowser.
    // Expo Go on Android has a known bug where WebBrowser's internal 
    // RedirectUriReceiver gets pre-empted by the main Expo app intent filter.
    // This causes WebBrowser to incorrectly return 'dismiss' and drop the URL.
    // Linking.openURL natively passes the deep link back to the OS, which our
    // App.js listener will now correctly catch since we fixed the React Navigation conflict!
    await Linking.openURL(data.url);

    // The resolution happens asynchronously via App.js linking listener.
    return false;
  } catch (error) {
    console.error('Google Login Error:', error);
    Toast.show({ type: 'error', title: 'Login Failed', message: error.message || 'An unknown error occurred' });
    return false;
  }
};

// ── Logout ──────────────────────────────────────────────────────

export const handleLogout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    lastHandledUrl = null; 
  } catch (error) {
    console.error('Logout error', error);
    Toast.show({ type: 'error', title: 'Logout Failed', message: error.message });
  }
};
