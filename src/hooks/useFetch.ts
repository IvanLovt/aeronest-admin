import { useState, useEffect } from "react";

interface UseFetchOptions<T> {
  url: string;
  enabled?: boolean;
  dependencies?: unknown[];
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useFetch<T = unknown>({
  url,
  enabled = true,
  dependencies = [],
  onSuccess,
  onError,
}: UseFetchOptions<T>): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        // Поддерживаем разные форматы ответа API
        const resultAny = result as Record<string, unknown>;
        const fetchedData: T =
          (resultAny.data as T) ||
          (resultAny.users as T) ||
          (resultAny.orders as T) ||
          (resultAny.addresses as T) ||
          (resultAny.stats as T) ||
          (result as T);
        setData(fetchedData);
        onSuccess?.(fetchedData);
      } else {
        const errorMessage = result.error || "Ошибка при загрузке данных";
        setError(errorMessage);
        onError?.(errorMessage);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Не удалось загрузить данные";
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, enabled, ...dependencies]);

  return { data, loading, error, refetch: fetchData };
}
