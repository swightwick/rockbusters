import { trackWebVitals } from './utils/analytics';

const reportWebVitals = onPerfEntry => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
      
      // Track web vitals to Google Analytics
      getCLS(trackWebVitals);
      getFID(trackWebVitals);
      getFCP(trackWebVitals);
      getLCP(trackWebVitals);
      getTTFB(trackWebVitals);
    });
  }
};

export default reportWebVitals;
