import axios from "axios";

const VITE_API_URL = import.meta.env.VITE_API_URL;

export interface Category {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const categoryService = {
  async getAllCategories() {
    const response = await axios.get(`${VITE_API_URL}/categories`);
    // Se retornar objeto paginado, extrair os dados
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    // Se retornar array diretamente
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  },
};
