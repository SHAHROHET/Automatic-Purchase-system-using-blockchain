'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseFetchDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useFetchData<T>(
  url: string | null,
  initialData: T | null = null
): UseFetchDataResult<T> {
  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!url) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }
      const json = await res.json();
      setData(json.data !== undefined ? json.data : json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
