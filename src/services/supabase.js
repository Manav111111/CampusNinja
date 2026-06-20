import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================
// SUPABASE CLIENT INITIALIZATION
// ============================================================
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase environment variables. ' +
    'Ensure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set in .env'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

const isValidUUID = (uuid) => {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return typeof uuid === 'string' && regex.test(uuid);
};

// ============================================================
// ACADEMIC HIERARCHY
// ============================================================

export const getBranches = async () => {
  const { data, error } = await supabase
    .from('branches')
    .select('id, name')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching branches:', error);
    throw error;
  }
  return data;
};

export const getSemesters = async (branchId) => {
  if (!isValidUUID(branchId)) {
    console.warn(`getSemesters: invalid branchId UUID: "${branchId}"`);
    return [];
  }

  const { data, error } = await supabase
    .from('semesters')
    .select('id, number')
    .eq('branch_id', branchId)
    .eq('is_active', true)
    .order('number', { ascending: true });

  if (error) {
    console.error('Error fetching semesters:', error);
    throw error;
  }
  return data;
};

// ============================================================
// SUBJECTS
// ============================================================

/**
 * Fetch subjects filtered by academic setup.
 * @param {string} branchId  - UUID of branch
 * @param {string} semesterId - UUID of semester
 * @returns {Promise<Array>} List of subjects
 */
export const getSubjects = async (branchId, semesterId) => {
  if (!isValidUUID(branchId) || !isValidUUID(semesterId)) {
    console.warn(`getSubjects: invalid branchId or semesterId UUID: branchId="${branchId}", semesterId="${semesterId}"`);
    return [];
  }

  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .eq('branch_id', branchId)
    .eq('semester_id', semesterId)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching subjects:', error);
    throw error;
  }
  return data;
};

// ============================================================
// BANNERS
// ============================================================

export const getBanners = async () => {
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .eq('is_active', true)
    .order('priority', { ascending: false });

  if (error) {
    console.error('Error fetching banners:', error);
    throw error;
  }
  return data;
};


// ============================================================
// RESOURCES
// ============================================================

/**
 * Fetch all resources for a specific subject.
 * @param {string} subjectId - UUID of the subject
 * @returns {Promise<Array>} List of resources
 */
export const getResources = async (subjectId) => {
  if (!isValidUUID(subjectId)) {
    console.warn(`getResources: invalid subjectId UUID: "${subjectId}"`);
    return [];
  }

  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('subject_id', subjectId)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching resources:', error);
    throw error;
  }
  return data;
};

/**
 * Fetch resources filtered by type for a subject.
 * @param {string} subjectId - UUID of the subject
 * @param {string} type - notes | pyq | video | syllabus | important_questions | ai_resources
 * @returns {Promise<Array>} Filtered resources
 */
export const getResourcesByType = async (subjectId, type) => {
  if (!isValidUUID(subjectId)) {
    console.warn(`getResourcesByType: invalid subjectId UUID: "${subjectId}"`);
    return [];
  }

  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('subject_id', subjectId)
    .eq('type', type)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error(`Error fetching ${type} resources:`, error);
    throw error;
  }
  return data;
};

/**
 * Fetch popular resources across all subjects.
 * Used on the Home Screen.
 * @param {number} limit - Max items to return
 * @returns {Promise<Array>} Popular resources
 */
export const getPopularResources = async (limit = 10) => {
  const { data, error } = await supabase
    .from('resources')
    .select('*, subjects(name, short_name, theme_color)')
    .eq('is_popular', true)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching popular resources:', error);
    throw error;
  }
  return data;
};


// ============================================================
// SKILLS
// ============================================================

/**
 * Fetch all active skills.
 * @returns {Promise<Array>} List of skills
 */
export const getSkills = async () => {
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching skills:', error);
    throw error;
  }
  return data;
};

/**
 * Fetch all resources for a specific skill.
 * @param {string} skillId - UUID of the skill
 * @returns {Promise<Array>} List of skill resources
 */
export const getSkillResources = async (skillId) => {
  if (!isValidUUID(skillId)) {
    console.warn(`getSkillResources: invalid skillId UUID: "${skillId}"`);
    return [];
  }

  const { data, error } = await supabase
    .from('skill_resources')
    .select('*')
    .eq('skill_id', skillId)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching skill resources:', error);
    throw error;
  }
  return data;
};


// ============================================================
// MARKETPLACE
// ============================================================

/**
 * Fetch all active marketplace services.
 * @returns {Promise<Array>} List of services
 */
export const getMarketplaceServices = async () => {
  const { data, error } = await supabase
    .from('marketplace_services')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching marketplace services:', error);
    throw error;
  }
  return data;
};

/**
 * Submit a new marketplace order.
 * @param {Object} orderData - { service_id, customer_name, customer_phone, customer_email, requirement }
 * @returns {Promise<Object>} Created order
 */
export const createOrder = async (orderData) => {
  if (!isValidUUID(orderData?.service_id)) {
    throw new Error(`createOrder: invalid service_id UUID: "${orderData?.service_id}"`);
  }

  const { data, error } = await supabase
    .from('orders')
    .insert([{
      service_id: orderData.service_id,
      customer_name: orderData.customer_name,
      customer_phone: orderData.customer_phone,
      customer_email: orderData.customer_email,
      requirement: orderData.requirement,
      status: 'pending',
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating order:', error);
    throw error;
  }
  return data;
};


// ============================================================
// COMMUNITY
// ============================================================

/**
 * Fetch all active community links.
 * @returns {Promise<Array>} List of community links
 */
export const getCommunityLinks = async () => {
  const { data, error } = await supabase
    .from('community_links')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching community links:', error);
    throw error;
  }
  return data;
};


// ============================================================
// SETTINGS
// ============================================================

/**
 * Fetch all app settings as a key-value map.
 * @returns {Promise<Object>} Settings object { key: value, ... }
 */
export const getAppSettings = async () => {
  const { data, error } = await supabase
    .from('settings')
    .select('key, value');

  if (error) {
    console.error('Error fetching settings:', error);
    throw error;
  }

  // Transform array into a key-value object
  const settingsMap = {};
  data.forEach((row) => {
    settingsMap[row.key] = row.value;
  });
  return settingsMap;
};


// ============================================================
// SEARCH
// ============================================================

/**
 * Cross-table search across subjects, resources, skills, and marketplace services.
 * Returns unified results tagged with their source table.
 * @param {string} query - Search term
 * @returns {Promise<Object>} { subjects, resources, skills, services }
 */
export const searchAll = async (query) => {
  const searchTerm = `%${query}%`;

  const [subjectsRes, resourcesRes, skillsRes, servicesRes] = await Promise.all([
    supabase
      .from('subjects')
      .select('id, name, short_name, course, branch, semester, icon_name, theme_color')
      .ilike('name', searchTerm)
      .eq('is_active', true)
      .limit(10),

    supabase
      .from('resources')
      .select('id, title, type, storage_type, file_url, drive_url, youtube_url, subjects(name, short_name)')
      .ilike('title', searchTerm)
      .eq('is_active', true)
      .limit(10),

    supabase
      .from('skills')
      .select('id, name, icon_name, theme_color, difficulty_level')
      .ilike('name', searchTerm)
      .eq('is_active', true)
      .limit(10),

    supabase
      .from('marketplace_services')
      .select('id, name, icon_name, theme_color, price')
      .ilike('name', searchTerm)
      .eq('is_active', true)
      .limit(10),
  ]);

  // Log any errors but don't throw — partial results are acceptable
  if (subjectsRes.error) console.error('Search subjects error:', subjectsRes.error);
  if (resourcesRes.error) console.error('Search resources error:', resourcesRes.error);
  if (skillsRes.error) console.error('Search skills error:', skillsRes.error);
  if (servicesRes.error) console.error('Search services error:', servicesRes.error);

  return {
    subjects: (subjectsRes.data || []).map(item => ({ ...item, _source: 'subject' })),
    resources: (resourcesRes.data || []).map(item => ({ ...item, _source: 'resource' })),
    skills: (skillsRes.data || []).map(item => ({ ...item, _source: 'skill' })),
    services: (servicesRes.data || []).map(item => ({ ...item, _source: 'service' })),
  };
};


// ============================================================
// STORAGE HELPERS
// ============================================================

/**
 * Get the public URL for a file stored in Supabase Storage.
 * @param {string} path - File path inside the 'resources' bucket
 * @returns {string} Public URL
 */
export const getStorageUrl = (path) => {
  const { data } = supabase.storage.from('resources').getPublicUrl(path);
  return data.publicUrl;
};
