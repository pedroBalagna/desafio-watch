import axios from "axios";

const VITE_API_URL = import.meta.env.VITE_API_URL;
const TOKEN_KEY = "authToken";

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData extends LoginData {
  name: string;
}

export const authService = {
  async login(data: LoginData) {
    try {
      const response = await axios.post(`${VITE_API_URL}/auth/login`, data);
      if (response.data.access_token) {
        localStorage.setItem(TOKEN_KEY, response.data.access_token);
      }
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        throw new Error("Email ou senha incorretos");
      }
      throw new Error("Erro ao fazer login. Tente novamente.");
    }
  },

  async register(data: RegisterData) {
    try {
      const response = await axios.post(`${VITE_API_URL}/auth/register`, data);
      if (response.data.access_token) {
        localStorage.setItem(TOKEN_KEY, response.data.access_token);
      }
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        throw new Error("Este email já está em uso");
      }
      throw new Error("Erro ao fazer registro. Tente novamente.");
    }
  },

  // Função para verificar se o usuário está autenticado
  isAuthenticated(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  // Função para fazer logout
  async logout() {
    localStorage.removeItem(TOKEN_KEY);
  },
};
