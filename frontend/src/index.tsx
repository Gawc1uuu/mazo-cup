import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import AuthContextProvider from './context/AuthContext';
import GamesContextProvider from './context/GamesContext';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <AuthContextProvider>
      <GamesContextProvider>
        <App />
      </GamesContextProvider>
    </AuthContextProvider>
  </React.StrictMode >
);
