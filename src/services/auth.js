import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Alert } from 'react-native';
import { supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

let pendingOAuthRequest = null;
let lastHandledCallbackUrl = null;

export const getOAuthRedirectUrl = () => (
  Linking.createURL('auth/callback')
);

const getUrlParams = (url) => {
  const [withoutFragment, fragment = ''] = url.split('#');
  const query = withoutFragment.includes('?') ? withoutFragment.split('?')[1] : '';
  return new URLSearchParams([query, fragment].filter(Boolean).join('&'));
};

export const getCurrentSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
};

export const handleAuthCallback = async (url) => {
  if (!url || url === lastHandledCallbackUrl) return false;

  const params = getUrlParams(url);
  const error = params.get('error_description') || params.get('error');
  if (error) throw new Error(error);

  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  const code = params.get('code');

  if (!accessToken && !refreshToken && !code) {
    return false;
  }

  lastHandledCallbackUrl = url;

  if (accessToken && refreshToken) {
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (sessionError) throw sessionError;
    const session = await getCurrentSession();
    console.log('OAuth session stored from tokens:', Boolean(session?.user));
    return true;
  }

  if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) throw exchangeError;
    const session = await getCurrentSession();
    console.log('OAuth session exchanged from code:', Boolean(session?.user));
    return true;
  }

  return false;
};

const performGoogleLoginInternal = async () => {
  try {
    const redirectTo = getOAuthRedirectUrl();

    console.log('=== Google Login Debug ===');
    console.log('Redirect URL:', redirectTo);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });

    if (error) throw error;
    if (!data.url) throw new Error('No URL returned from Supabase OAuth');
    console.log('Supabase OAuth URL created:', data.url.includes('redirect_to='));

    console.log('Opening browser for OAuth...');

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    console.log('Browser result type:', result.type);

    if (result.type === 'success') {
      console.log('Callback URL received:', result.url);

      const didCreateSession = await handleAuthCallback(result.url);
      if (didCreateSession) {
        console.log('Login successful!');
        return true;
      }

      console.log('No OAuth tokens or auth code found in callback URL');
    } else if (result.type === 'cancel' || result.type === 'dismiss') {
      console.log('User cancelled login');
    }

    return false;
  } catch (error) {
    console.error('Google Login Error:', error);
    Alert.alert('Login Failed', error.message || 'An unknown error occurred');
    return false;
  }
};

export const performGoogleLogin = async () => {
  if (pendingOAuthRequest) {
    return pendingOAuthRequest;
  }

  pendingOAuthRequest = performGoogleLoginInternal();

  try {
    return await pendingOAuthRequest;
  } finally {
    pendingOAuthRequest = null;
  }
};

export const handleLogout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Logout error', error);
    Alert.alert('Logout Failed', error.message);
  }
};
