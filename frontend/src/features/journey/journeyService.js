import axios from 'axios';

export async function fetchRoute(pnr) {
  const response = await axios.get(`/api/journey/${pnr}/route`);
  return response.data;
}
