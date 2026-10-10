import { createContext, useContext, useState } from "react";
import { api, clearToken, getToken, setToken } from "./api.js";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [authed, setAuthed] = useState(Boolean(getToken()));

  async function authenticate(mode, email, password) {
    const result = mode === "register" ? await api.register(email, password) : await api.login(email, password);
    setToken(result.token);
    setAuthed(true);
  }

  function logout() {
    clearToken();
    setAuthed(false);
  }

  return <AuthContext.Provider value={{ authed, authenticate, logout }}>{children}</AuthContext.Provider>;
}
