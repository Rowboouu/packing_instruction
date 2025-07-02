import Axios, { AxiosError } from 'axios';
import { toast } from 'sonner';

export const api = Axios.create({
  baseURL: '/api',
  withCredentials: true,
});

interface ErrorResponse {
  message?: string;
}

const handleResponseError = (
  error: AxiosError<ErrorResponse>,
  source: string,
) => {
  const res = error.response;

  if (res && res.status >= 400) {
    let message = res.data?.message || error.message;

    if (res.status === 413) {
      message = 'The test server has a 1MB limit for uploads.';
    }

    toast.error(`${source.toLocaleUpperCase()} - ${res.statusText}`, {
      description: message,
      closeButton: true,
    });
  }
  return Promise.reject(error);
};

api.interceptors.response.use(
  (response) => response,
  (error) => handleResponseError(error, 'api'),
);
