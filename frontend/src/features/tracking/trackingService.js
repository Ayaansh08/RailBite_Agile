import axios from 'axios';

export async function fetchOrder(orderId) {
  const response = await axios.get(`/api/orders/${orderId}`);
  return response.data;
}
