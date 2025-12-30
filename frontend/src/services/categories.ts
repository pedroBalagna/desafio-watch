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

export interface CreateCategoryData {
  name: string;
  description?: string;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export const categoryService = {
  async getAllCategories(includeInactive = false) {
    const params = includeInactive ? { includeInactive: true } : {};
    const response = await axios.get(`${VITE_API_URL}/categories`, { params });
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  },

  async getCategoryById(id: string) {
    const response = await axios.get(`${VITE_API_URL}/categories/${id}`);
    return response.data;
  },

  async createCategory(data: CreateCategoryData) {
    const response = await axios.post(`${VITE_API_URL}/categories`, data);
    return response.data;
  },

  async updateCategory(id: string, data: UpdateCategoryData) {
    const response = await axios.patch(`${VITE_API_URL}/categories/${id}`, data);
    return response.data;
  },

  async deleteCategory(id: string) {
    await axios.delete(`${VITE_API_URL}/categories/${id}`);
  },
};
