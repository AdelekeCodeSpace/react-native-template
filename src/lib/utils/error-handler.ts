import { isAxiosError, type AxiosError } from 'axios';
import { notifyError } from './toast';
import type { ApiErrorResponse } from '~/types/api';

export function isApiUnreachableError(error: AxiosError): boolean {
  if (error.response) return false;
  if (error.code === 'ERR_CANCELED') return false;
  if (error.code === 'ERR_NETWORK') return true;
  if (error.code === 'ECONNABORTED') return true;
  if (error.message === 'Network Error') return true;
  return false;
}

export const handleApiError = (
  error: unknown,
  customHandlers?: Record<number, () => void>
) => {
  if (!isAxiosError(error)) {
    if (typeof error === 'string') {
      notifyError({ message: error });
    } else {
      notifyError({ message: 'An unexpected error occurred. Please try again.' });
    }
    return;
  }

  if (isApiUnreachableError(error)) {
    notifyError({
      message: 'The service is currently unavailable. Please check back later.',
    });
    return;
  }

  const status = error.response?.status;
  const errorData = error.response?.data as ApiErrorResponse;

  if (status && customHandlers?.[status]) {
    customHandlers[status]();
    return;
  }

  switch (status) {
    case 400:
      notifyError({
        message:
          errorData?.message || 'Bad request. Please check your input and try again.',
      });
      break;
    case 401:
      notifyError({
        message: errorData?.detail || errorData?.message || 'Unauthorized access',
      });
      break;
    case 403:
      notifyError({
        message:
          errorData?.message || 'Access forbidden. Please check your permissions.',
      });
      break;
    case 404:
      notifyError({ message: errorData?.message || 'Resource not found.' });
      break;
    case 500:
      notifyError({ message: 'Internal server error. Please try again later.' });
      break;
    default:
      notifyError({
        message:
          errorData?.message || 'An unexpected error occurred. Please try again.',
      });
  }
};
