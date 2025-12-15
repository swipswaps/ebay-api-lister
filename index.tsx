import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './frontend/src/App';
import './frontend/src/index.css';

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("Root element not found");
}