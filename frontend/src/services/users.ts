import axios from "axios";

const VITE_API_URL = import.meta.env.VITE_API_URL;

export interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  email: string;
  name: string;
  password: string;
  role?: string;
}

export interface UpdateUserData {
  email?: string;
  name?: string;
  password?: string;
  role?: string;
}

export const userService = {
  async getAllUsers() {
    const response = await axios.get(`${VITE_API_URL}/users`);
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  },

  async getUserById(id: string) {
    const response = await axios.get(`${VITE_API_URL}/users/${id}`);
    return response.data;
  },

  async createUser(data: CreateUserData) {
    const response = await axios.post(`${VITE_API_URL}/users`, data);
    return response.data;
  },

  async updateUser(id: string, data: UpdateUserData) {
    const response = await axios.patch(`${VITE_API_URL}/users/${id}`, data);
    return response.data;
  },

  async deleteUser(id: string) {
    await axios.delete(`${VITE_API_URL}/users/${id}`);
  },
};
