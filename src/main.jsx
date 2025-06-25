import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import {AuthContextProvider} from "./utils/AuthContext.jsx"
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthContextProvider>
      <BrowserRouter>
        <App />
        <Toaster position="top-right" reverseOrder={false} />
      </BrowserRouter>
    </AuthContextProvider>
  </React.StrictMode>
);