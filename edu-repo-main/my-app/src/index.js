import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './App.css';
import './i18n';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Unregister old PWA Service Worker to ensure fresh builds load immediately
serviceWorkerRegistration.unregister();

reportWebVitals();
