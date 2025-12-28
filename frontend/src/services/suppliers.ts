import axios from "axios";

const VITE_API_URL = `${import.meta.env.VITE_API_URL}/suppliers`;

export interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  cnpj?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const supplierService = {
  async getAllSuppliers() {
    const response = await axios.get(VITE_API_URL);
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
