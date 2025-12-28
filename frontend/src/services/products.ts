import axios from "axios";

const VITE_API_URL = import.meta.env.VITE_API_URL;

export interface Category {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  cnpj?: string;
  isActive: boolean;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  barcode?: string;
  unitPrice: number | string; // Prisma Decimal é serializado como string
  costPrice: number | string; // Prisma Decimal é serializado como string
  minStock: number;
  maxStock?: number;
  currentStock: number;
  unit: string;
  isActive: boolean;
  imageUrl?: string;
  categoryId?: string;
  category?: Category;
  supplierId?: string;
  supplier?: Supplier;
  createdAt: string;
  updatedAt: string;
}

export const productService = {
  async getAllProducts() {
    const response = await axios.get(`${VITE_API_URL}/products`);
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

  async getProductById(id: string) {
    const response = await axios.get(`${VITE_API_URL}/products/${id}`);
    return response.data;
  },

  async createProduct(
    data: Omit<Product, "id" | "createdAt" | "updatedAt" | "category" | "supplier">
  ) {
    const response = await axios.post(`${VITE_API_URL}/products`, data);
    return response.data;
  },

  async updateProduct(id: string, data: Partial<Product>) {
    const response = await axios.patch(`${VITE_API_URL}/products/${id}`, data);
    return response.data;
  },

  async deleteProduct(id: string) {
    await axios.delete(`${VITE_API_URL}/products/${id}`);
  },
};
