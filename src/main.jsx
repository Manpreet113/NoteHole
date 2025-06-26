// main.jsx
// Entry point: renders the React app, sets up providers and global styles
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import {AuthContextProvider} from "./utils/AuthContext.jsx"
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Provide authentication context to the app */}
    <AuthContextProvider>
      {/* Enable client-side routing */}
      <BrowserRouter>
        <App />
        {/* Toast notifications (top-right) */}
        <Toaster position="top-right" reverseOrder={false} />
      </BrowserRouter>
    </AuthContextProvider>
  </React.StrictMode>
);