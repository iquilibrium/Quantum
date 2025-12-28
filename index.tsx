import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ToastProvider from './components/ToastProvider'; // Importar ToastProvider

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ToastProvider /> {/* Envolver App com ToastProvider */}
    <App />
  </React.StrictMode>
);