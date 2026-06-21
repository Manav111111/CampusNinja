import { logEvent } from 'firebase/analytics';
import { analytics } from './firebase';

/**
 * Reusable event tracking function
 * @param {string} eventName 
 * @param {object} params 
 */
export const trackEvent = (eventName, params = {}) => {
  if (analytics) {
    logEvent(analytics, eventName, params);
  } else {
    // Fallback if analytics is not supported/initialized in this environment
    console.log(`[Analytics Event Tracked (Console)] ${eventName}`, params);
  }
};

export const trackAppOpen = () => {
  trackEvent('app_open');
};

export const trackSubjectOpen = (subjectName) => {
  trackEvent('subject_open', { subject_name: subjectName });
};

export const trackResourceOpen = (resourceTitle, resourceType) => {
  trackEvent('resource_open', { resource_title: resourceTitle, resource_type: resourceType });
};

export const trackPDFDownload = (pdfTitle) => {
  trackEvent('pdf_download', { pdf_title: pdfTitle });
};

export const trackSkillOpen = (skillName) => {
  trackEvent('skill_open', { skill_name: skillName });
};

export const trackMarketplaceClick = (serviceName) => {
  trackEvent('marketplace_click', { service_name: serviceName });
};

export const trackOrderCreated = () => {
  trackEvent('order_created');
};
