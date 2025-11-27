import { createContext } from 'react';

const AuthContext = createContext({
  auth: { token: null, user: null },
  setAuth: () => {},
  logout: () => {},
});

export default AuthContext;
