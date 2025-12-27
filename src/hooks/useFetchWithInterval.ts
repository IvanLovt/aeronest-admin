import { useState, useEffect } from "react";

interface UseFetchWithIntervalOptions<T> {
  url: string;
  interval?: number; // Интервал в миллисекундах
  enabled?: boolean;
  dependencies?: any[];
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  dataKey?: string;
}

interface UseFetchWithIntervalResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useFetchWithInterval<T = any>({
  url,
  interval = 30000, // По умолчанию 30 секунд
  enabled = true,
  dependencies = [],
  onSuccess,
  onError,
  dataKey,
}: UseFetchWithIntervalOptions<T>): UseFetchWithIntervalResult<T> {
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
        const fetchedData = dataKey
          ? result[dataKey]
          : result.data ||
            result.users ||
            result.orders ||
            result.addresses ||
            result.stats ||
            result.confirmedCount ||
            result;
        setData(fetchedData || null);
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

    if (interval > 0) {
      const intervalId = setInterval(fetchData, interval);
      return () => clearInterval(intervalId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, enabled, interval, ...dependencies]);

  return { data, loading, error, refetch: fetchData };
}

