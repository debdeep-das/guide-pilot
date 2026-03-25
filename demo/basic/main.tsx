import React from 'react';
import { createRoot } from 'react-dom/client';
import { GuidePilotProvider } from '../../src/index';
import '../../src/styles/guide-pilot.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <GuidePilotProvider>
    <App />
  </GuidePilotProvider>
);
