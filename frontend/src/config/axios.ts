import { authService } from "@/services/auth";
import axios from "axios";

// Configuração global do axios para adicionar token nas requisições
axios.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de resposta para tratar erros de autenticação
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Se receber 401 (Não autorizado), o token pode estar expirado
    if (error.response?.status === 401) {
      // Remove o token expirado
      authService.logout();

      // Redireciona para login apenas se não estiver já na página de login
      if (window.location.pathname !== "/" && window.location.pathname !== "/register") {
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);

export default axios;
