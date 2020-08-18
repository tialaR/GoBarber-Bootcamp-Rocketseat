import React from 'react';
import { AuthProvider } from './auth';
import { ToastProvider } from './toast';

// Componente global de providres (contexto)
const AppProvider: React.FC = ({ children }) => (
  <AuthProvider>
    <ToastProvider>{children}</ToastProvider>
  </AuthProvider>
);

export default AppProvider;
