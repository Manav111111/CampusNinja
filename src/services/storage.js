import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================
// CAMPUS NINJA — ASYNC STORAGE SERVICE
// Manages local persistence for academic setup and app state.
// No authentication. No user accounts.
// ============================================================

const STORAGE_KEYS = {
  ACADEMIC_SETUP: '@campus_ninja_academic_setup',
  ONBOARDING_COMPLETE: '@campus_ninja_onboarding',
  RECENT_SEARCHES: '@campus_ninja_recent_searches',
  FIRST_INSTALL_AT: '@campus_ninja_first_install_at',
};

// ============================================================
// ACADEMIC SETUP
// ============================================================

/**
 * Save academic setup to local storage.
 * @param {Object} setup - { course, branch, semester }
 */
export const saveAcademicSetup = async ({ course, branch, semester }) => {
  try {
    const setupData = JSON.stringify({ course, branch, semester });
    await AsyncStorage.setItem(STORAGE_KEYS.ACADEMIC_SETUP, setupData);
  } catch (error) {
    console.error('Error saving academic setup:', error);
    throw error;
  }
};

/**
 * Get academic setup from local storage.
 * @returns {Promise<Object|null>} { course, branch, semester } or null
 */
export const getAcademicSetup = async () => {
  try {
    const setupData = await AsyncStorage.getItem(STORAGE_KEYS.ACADEMIC_SETUP);
    return setupData ? JSON.parse(setupData) : null;
  } catch (error) {
    console.error('Error reading academic setup:', error);
    return null;
  }
};

/**
 * Clear academic setup from local storage.
 */
export const clearAcademicSetup = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.ACADEMIC_SETUP);
  } catch (error) {
    console.error('Error clearing academic setup:', error);
    throw error;
  }
};

/**
 * Check if academic setup has been completed.
 * @returns {Promise<boolean>}
 */
export const isSetupComplete = async () => {
  try {
    const setupData = await AsyncStorage.getItem(STORAGE_KEYS.ACADEMIC_SETUP);
    return setupData !== null;
  } catch (error) {
    console.error('Error checking setup status:', error);
    return false;
  }
};


// ============================================================
// ONBOARDING
// ============================================================

/**
 * Mark onboarding as completed.
 */
export const setOnboardingComplete = async () => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');
  } catch (error) {
    console.error('Error setting onboarding status:', error);
    throw error;
  }
};

/**
 * Check if onboarding has been completed.
 * @returns {Promise<boolean>}
 */
export const isOnboardingComplete = async () => {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
    return value === 'true';
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
};


// ============================================================
// RECENT SEARCHES
// ============================================================

/**
 * Get recent search queries from local storage.
 * @returns {Promise<Array<string>>} List of recent search strings
 */
export const getRecentSearches = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading recent searches:', error);
    return [];
  }
};

/**
 * Add a search query to recent searches (max 10, no duplicates).
 * @param {string} query - The search term
 */
export const addRecentSearch = async (query) => {
  try {
    const searches = await getRecentSearches();
    const filtered = searches.filter((s) => s !== query);
    const updated = [query, ...filtered].slice(0, 10);
    await AsyncStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving recent search:', error);
    throw error;
  }
};

/**
 * Clear all recent searches.
 */
export const clearRecentSearches = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.RECENT_SEARCHES);
  } catch (error) {
    console.error('Error clearing recent searches:', error);
    throw error;
  }
};


// ============================================================
// FULL RESET
// ============================================================

/**
 * Clear all app data from local storage.
 * Use for logout-like behavior or app reset.
 */
export const clearAllData = async () => {
  try {
    const allKeys = Object.values(STORAGE_KEYS);
    await AsyncStorage.multiRemove(allKeys);
  } catch (error) {
    console.error('Error clearing all data:', error);
    throw error;
  }
};

// ============================================================
// INSTALLATION TIMESTAMP
// ============================================================

/**
 * Get or initialize the installation timestamp of the app.
 * New users will only see notifications published on or after this timestamp.
 */
export const getInstallTimestamp = async () => {
  try {
    let timestamp = await AsyncStorage.getItem(STORAGE_KEYS.FIRST_INSTALL_AT);
    if (!timestamp) {
      // Check if this user was already an existing app user before this feature
      const onboarding = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
      const branchId = await AsyncStorage.getItem('userBranchId');
      if (onboarding || branchId) {
        // Existing user upgrading: give an early timestamp so existing notifications remain visible
        timestamp = '2024-01-01T00:00:00.000Z';
      } else {
        // Brand new installation today
        timestamp = new Date().toISOString();
      }
      await AsyncStorage.setItem(STORAGE_KEYS.FIRST_INSTALL_AT, timestamp);
    }
    return timestamp;
  } catch (err) {
    console.error('Error getting install timestamp:', err);
    return '2024-01-01T00:00:00.000Z';
  }
};
