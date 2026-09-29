import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject({
      status: error.response?.status,
      message,
      data: error.response?.data,
    });
  }
);

/**
 * Create a zero-knowledge encrypted note
 */
export const createSecret = async (payload) => {
  const response = await api.post('/secrets', payload);
  return response.data;
};

/**
 * Check status/metadata of a note without revealing or burning
 */
export const getSecretStatus = async (id) => {
  const response = await api.get(`/secrets/${id}/status`);
  return response.data;
};

/**
 * Atomically reveal payload and trigger self-destruction
 */
export const revealSecret = async (id) => {
  const response = await api.post(`/secrets/${id}/reveal`);
  return response.data;
};

/**
 * Sender manual destruction
 */
export const deleteSecret = async (id, token) => {
  const response = await api.delete(`/secrets/${id}`, {
    headers: {
      'x-sender-token': token,
    },
  });
  return response.data;
};
