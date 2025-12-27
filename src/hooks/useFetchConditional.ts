import { useState, useEffect } from "react";

interface UseFetchConditionalOptions<T> {
  url: string;
  condition: boolean; // Условие для выполнения запроса
  dependencies?: unknown[];
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  dataKey?: string;
  onConditionFalse?: () => void; // Вызывается, когда condition = false
}

interface UseFetchConditionalResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useFetchConditional<T = any>({
  url,
  condition,
  dependencies = [],
  onSuccess,
  onError,
  dataKey,
  onConditionFalse,
}: UseFetchConditionalOptions<T>): UseFetchConditionalResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!condition) {
      setLoading(false);
      onConditionFalse?.();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        // Поддерживаем разные форматы ответа API
        const fetchedData: T = dataKey
          ? (result[dataKey] as T)
          : (result.data as T) ||
            (result.users as T) ||
            (result.orders as T) ||
            (result.addresses as T) ||
            (result.stats as T) ||
            (result as T);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, condition, ...dependencies]);

  return { data, loading, error, refetch: fetchData };
}
