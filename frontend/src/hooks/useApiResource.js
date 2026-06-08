import { useCallback, useEffect, useRef, useState } from "react";

export function useApiResource(api, endpoint, fallback) {
  const fallbackRef = useRef(fallback);
  const [data, setData] = useState(fallback);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(Boolean(endpoint));

  const load = useCallback(async () => {
    if (!endpoint) {
      setData(fallbackRef.current);
      setError("");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.get(endpoint);
      setData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load data");
    } finally {
      setLoading(false);
    }
  }, [api, endpoint]);

  useEffect(() => {
    const id = setTimeout(load, 0);
    return () => clearTimeout(id);
  }, [load]);

  return { data, error, loading, reload: load, setData };
}
