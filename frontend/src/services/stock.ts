import axios from "axios";

const VITE_API_URL = import.meta.env.VITE_API_URL;

export type MovementType = "IN" | "OUT" | "ADJUST" | "TRANSFER" | "RETURN" | "DAMAGE";

export interface StockMovement {
  id: string;
  type: MovementType;
  quantity: number;
  unitPrice?: number | string;
  totalPrice?: number | string;
  reference?: string;
  notes?: string;
  productId: string;
  product?: {
    id: string;
    name: string;
    sku: string;
  };
  warehouseId: string;
  warehouse?: {
    id: string;
    name: string;
  };
  toWarehouseId?: string;
  toWarehouse?: {
    id: string;
    name: string;
  };
  userId: string;
  user?: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export interface StockDashboard {
  summary: {
    totalProducts: number;
    activeProducts: number;
    lowStockProducts: number;
    outOfStockProducts: number;
    totalWarehouses: number;
  };
  movementsByType: Record<string, number>;
  recentMovements: StockMovement[];
}

export interface MovementFilters {
  productId?: string;
  warehouseId?: string;
  type?: MovementType;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface CreateMovementData {
  type: MovementType;
  productId: string;
  warehouseId: string;
  quantity: number;
  unitPrice?: number;
  reference?: string;
  notes?: string;
}

export interface TransferData {
  productId: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  quantity: number;
  reference?: string;
  notes?: string;
}

export interface AdjustData {
  productId: string;
  warehouseId: string;
  newQuantity: number;
  reason?: string;
  reference?: string;
}

export const stockService = {
  async getDashboard(): Promise<StockDashboard> {
    const response = await axios.get(`${VITE_API_URL}/stock/dashboard`);
    return response.data;
  },

  async getMovements(filters?: MovementFilters) {
    const response = await axios.get(`${VITE_API_URL}/stock/movements`, { params: filters });
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      return response.data;
    }
    if (Array.isArray(response.data)) {
      return { data: response.data, total: response.data.length };
    }
    return { data: [], total: 0 };
  },

  async getMovementById(id: string) {
    const response = await axios.get(`${VITE_API_URL}/stock/movements/${id}`);
    return response.data;
  },

  async createMovement(data: CreateMovementData) {
    const response = await axios.post(`${VITE_API_URL}/stock/movement`, data);
    return response.data;
  },

  async transferStock(data: TransferData) {
    const response = await axios.post(`${VITE_API_URL}/stock/transfer`, data);
    return response.data;
  },

  async adjustStock(data: AdjustData) {
    const response = await axios.post(`${VITE_API_URL}/stock/adjust`, data);
    return response.data;
  },
};
