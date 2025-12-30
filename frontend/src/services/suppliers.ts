import axios from "axios";

const VITE_API_URL = import.meta.env.VITE_API_URL;

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

export interface CreateSupplierData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  cnpj?: string;
}

export interface UpdateSupplierData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  cnpj?: string;
  isActive?: boolean;
}

export const supplierService = {
  async getAllSuppliers(includeInactive = false) {
    const params = includeInactive ? { includeInactive: true } : {};
    const response = await axios.get(`${VITE_API_URL}/suppliers`, { params });
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  },

  async getSupplierById(id: string) {
    const response = await axios.get(`${VITE_API_URL}/suppliers/${id}`);
    return response.data;
  },

  async createSupplier(data: CreateSupplierData) {
    const response = await axios.post(`${VITE_API_URL}/suppliers`, data);
    return response.data;
  },

  async updateSupplier(id: string, data: UpdateSupplierData) {
    const response = await axios.patch(`${VITE_API_URL}/suppliers/${id}`, data);
    return response.data;
  },

  async deleteSupplier(id: string) {
    await axios.delete(`${VITE_API_URL}/suppliers/${id}`);
  },
};
