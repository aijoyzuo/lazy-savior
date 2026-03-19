import React from 'react';
import { createRoot } from 'react-dom/client';
import './assets/index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';

const container = document.getElementById('root');
if (!container) throw new Error('Root element #root not found'); // TS 保險
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <BrowserRouter basename="/myapp">
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
