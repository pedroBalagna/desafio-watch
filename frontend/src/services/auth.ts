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

interface DecodedToken {
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

/**
 * Decodifica um token JWT sem verificar a assinatura
 * (apenas para verificar expiração no cliente)
 */
function decodeToken(token: string): DecodedToken | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Erro ao decodificar token:", error);
    return null;
  }
}

/**
 * Verifica se o token está expirado
 */
function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true; // Se não conseguir decodificar ou não tiver exp, considera expirado
  }

  // exp está em segundos, Date.now() está em milissegundos
  const expirationTime = decoded.exp * 1000;
  const currentTime = Date.now();

  // Considera expirado se faltar menos de 1 minuto
  return currentTime >= expirationTime - 60000;
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

  /**
   * Verifica se o usuário está autenticado e se o token não está expirado
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      return false;
    }

    // Verifica se o token está expirado
    if (isTokenExpired(token)) {
      // Remove o token expirado
      localStorage.removeItem(TOKEN_KEY);
      return false;
    }

    return true;
  },

  /**
   * Obtém o token atual
   */
  getToken(): string | null {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      return null;
    }

    // Verifica se está expirado antes de retornar
    if (isTokenExpired(token)) {
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }

    return token;
  },

  /**
   * Verifica se o token está expirado (sem remover)
   */
  isTokenExpired(): boolean {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      return true;
    }
    return isTokenExpired(token);
  },

  // Função para fazer logout
  async logout() {
    localStorage.removeItem(TOKEN_KEY);
  },
};
