import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';

const baseURL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api';

const api = axios.create({ baseURL });

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const status = error.response?.status;
    const silent = (error.config as { silent?: boolean } | undefined)?.silent;

    if (!silent && status && status >= 500) {
      toast.error('Something went wrong. Please try again.');
    } else if (!silent && status === 429) {
      toast.error('Too many requests — please slow down.');
    }

    return Promise.reject(error);
  },
);

export default api;
