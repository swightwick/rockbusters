// Google Analytics utility functions
// gtag is loaded globally via script tag in index.html

// Initialize Google Analytics
export const initGA = (measurementId) => {
  // Check if GA is already loaded
  if (typeof window.gtag === 'function') return;
  
  // Set the measurement ID
  window.gtag('config', measurementId, {
    send_page_view: true
  });
};

// Track page views
export const trackPageView = (path, title) => {
  if (typeof window.gtag !== 'function') return;
  
  window.gtag('config', process.env.REACT_APP_GA_MEASUREMENT_ID, {
    page_path: path,
    page_title: title,
  });
};

// Track custom events
export const trackEvent = (action, category = 'engagement', label, value) => {
  if (typeof window.gtag !== 'function') return;
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// Quiz-specific tracking functions
export const trackQuizStart = () => {
  trackEvent('quiz_start', 'game');
};

export const trackQuizComplete = (score, totalAttempts) => {
  trackEvent('quiz_complete', 'game', 'completion', score);
  trackEvent('quiz_attempts', 'game', 'total_attempts', totalAttempts);
};

export const trackQuestionAnswer = (questionNumber, isCorrect, attempts) => {
  trackEvent('question_answer', 'game', `question_${questionNumber}`, isCorrect ? 1 : 0);
  trackEvent('question_attempts', 'game', `question_${questionNumber}`, attempts);
};

export const trackQuestionSkip = (questionNumber) => {
  trackEvent('question_skip', 'game', `question_${questionNumber}`);
};

export const trackQuestionReveal = (questionNumber) => {
  trackEvent('question_reveal', 'game', `question_${questionNumber}`);
};

export const trackSoundToggle = (enabled) => {
  trackEvent('sound_toggle', 'settings', enabled ? 'enabled' : 'disabled');
};

export const trackQuizReset = () => {
  trackEvent('quiz_reset', 'game');
};

// Performance monitoring
export const trackPerformance = (metricName, value, unit = 'ms') => {
  if (typeof window.gtag !== 'function') return;
  
  window.gtag('event', 'timing_complete', {
    name: metricName,
    value: Math.round(value),
    event_category: 'performance',
  });
};

// Web Vitals tracking
export const trackWebVitals = (metric) => {
  if (typeof window.gtag !== 'function') return;
  
  const { name, value } = metric;
  
  window.gtag('event', name, {
    event_category: 'Web Vitals',
    event_label: name,
    value: Math.round(value),
    non_interaction: true,
  });
};

// Resource loading tracking
export const trackResourceLoad = (resourceType, loadTime, resourceSize) => {
  trackEvent('resource_load', 'performance', resourceType, Math.round(loadTime));
  if (resourceSize) {
    trackEvent('resource_size', 'performance', resourceType, Math.round(resourceSize / 1024)); // KB
  }
};