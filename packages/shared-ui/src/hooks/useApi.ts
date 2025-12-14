import { useState, useCallback } from 'react';
import { apiClient } from '../utils/api';
import type { ApiError } from '../types';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

export const useApi = <T = any>() => {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (
    method: 'get' | 'post' | 'put' | 'delete',
    url: string,
    data?: any
  ) => {
    setState({ data: null, loading: true, error: null });

    try {
      const response = await apiClient[method](url, data);
      setState({ data: response.data, loading: false, error: null });
      return response.data;
    } catch (err: any) {
      const error: ApiError = {
        message: err.response?.data?.message || err.message || 'An error occurred',
        statusCode: err.response?.status || 500,
      };
      setState({ data: null, loading: false, error });
      throw error;
    }
  }, []);

  const get = useCallback((url: string) => execute('get', url), [execute]);
  const post = useCallback((url: string, data?: any) => execute('post', url, data), [execute]);
  const put = useCallback((url: string, data?: any) => execute('put', url, data), [execute]);
  const del = useCallback((url: string) => execute('delete', url), [execute]);

  return {
    ...state,
    get,
    post,
    put,
    delete: del,
  };
};
