import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface UseFetchWithAuthOptions<T> {
  url: string;
  enabled?: boolean;
  dependencies?: any[];
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  dataKey?: string; // Ключ для извлечения данных из ответа (например, 'addresses', 'orders')
}

interface UseFetchWithAuthResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useFetchWithAuth<T = any>({
  url,
  enabled = true,
  dependencies = [],
  onSuccess,
  onError,
  dataKey,
}: UseFetchWithAuthOptions<T>): UseFetchWithAuthResult<T> {
  const { data: session } = useSession();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!enabled || !session?.user?.id) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, enabled, session?.user?.id, ...dependencies]);

  return { data, loading, error, refetch: fetchData };
}

