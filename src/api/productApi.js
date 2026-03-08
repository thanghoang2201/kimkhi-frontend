import axios from "axios";
import { API_BASE_URL } from "../config";

export const getAllProducts = async () => {
  const response = await axios.get(`${API_BASE_URL}/san-pham/all`);
  return response.data;
};

export const getAllCategories = async () => {
  const response = await axios.get(`${API_BASE_URL}/danh-muc/all`);
  return response.data;
};

export const createOrder = async (orderData) => {
  const response = await axios.post(`${API_BASE_URL}/don-hang`, orderData);
  return response.data;
};