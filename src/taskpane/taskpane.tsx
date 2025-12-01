import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '../App';
import { AuthProvider } from '../contexts/AuthContext';
import '../styles/app.css';

/* global Office */

Office.onReady((info) => {
  if (info.host === Office.HostType.Word) {
    const root = ReactDOM.createRoot(document.getElementById('root')!);
    root.render(
      <React.StrictMode>
        <AuthProvider>
          <App />
        </AuthProvider>
      </React.StrictMode>
    );
  }
});
