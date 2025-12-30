import axios from "axios";

const VITE_API_URL = import.meta.env.VITE_API_URL;

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WarehouseInventory {
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  minStock: number;
}

export const warehouseService = {
  async getAllWarehouses(includeInactive = false) {
    const params = includeInactive ? { includeInactive: true } : {};
    const response = await axios.get(`${VITE_API_URL}/warehouses`, { params });
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  },

  async getWarehouseById(id: string) {
    const response = await axios.get(`${VITE_API_URL}/warehouses/${id}`);
    return response.data;
  },

  async getWarehouseInventory(id: string) {
    const response = await axios.get(`${VITE_API_URL}/warehouses/${id}/inventory`);
    return response.data;
  },

  async createWarehouse(data: Omit<Warehouse, "id" | "createdAt" | "updatedAt">) {
    const response = await axios.post(`${VITE_API_URL}/warehouses`, data);
    return response.data;
  },

  async updateWarehouse(id: string, data: Partial<Warehouse>) {
    const response = await axios.patch(`${VITE_API_URL}/warehouses/${id}`, data);
    return response.data;
  },

  async deleteWarehouse(id: string) {
    await axios.delete(`${VITE_API_URL}/warehouses/${id}`);
  },
};
