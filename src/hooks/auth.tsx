// Hook de Contexto para mostrar/prover os dados do usuário logado na aplicação
import React, { createContext, useCallback, useContext, useState } from 'react';
import api from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  avatar_url: string;
}

interface AuthState {
  token: string;
  user: User;
}

interface SignInCredentials {
  email: string;
  password: string;
}

interface AuthContextData {
  user: User;
  signIn(creditials: SignInCredentials): Promise<void>;
  signOut(): void;
  updateUser(data: User): void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

const AuthProvider: React.FC = ({ children }) => {
  /* Buscando variavel inicial (caso o usuário já esteja logado)
      baseada no que está armazenado no localStorage.
      -> Lógica executada qdo o usuário da refresh na pagina, etc..
      -> A sessão não é perdida.
  */
  const [data, setData] = useState<AuthState>(() => {
    const token = localStorage.getItem('@GoBarber:token');
    const user = localStorage.getItem('@GoBarber:user');

    if (token && user) {
      api.defaults.headers.authorization = `Bearer ${token}`;

      return { token, user: JSON.parse(user) };
    }

    return {} as AuthState;
  });

  // Login
  const signIn = useCallback(async ({ email, password }) => {
    // Criando sessão de usuário no back-end
    const response = await api.post('sessions', {
      email,
      password,
    });

    const { token, user } = response.data;

    // Salvando no localStorage:
    localStorage.setItem('@GoBarber:token', token);
    localStorage.setItem('@GoBarber:user', JSON.stringify(user));

    /* Definindo como padrão para todas as requisições da aplicação um cabeçalho com o nome
       Authorization contendo o valor do token */
    api.defaults.headers.authorization = `Bearer ${token}`;

    setData({ token, user });
  }, []);

  // Logout
  const signOut = useCallback(() => {
    // Removendo do localStorage:
    localStorage.removeItem('@GoBarber:token');
    localStorage.removeItem('@GoBarber:user');

    // Removendo da variável:
    setData({} as AuthState);
  }, []);

  // Atualiza os dados do usuário (o token continua o mesmo)
  const updateUser = useCallback(
    (user: User) => {
      localStorage.setItem('@GoBarber:user', JSON.stringify(user));

      setData({
        token: data.token,
        user,
      });
    },
    [setData, data.token],
  );

  return (
    <AuthContext.Provider
      value={{ user: data.user, signIn, signOut, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Criando hook de autenticação
function useAuth(): AuthContextData {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export { AuthProvider, useAuth };
