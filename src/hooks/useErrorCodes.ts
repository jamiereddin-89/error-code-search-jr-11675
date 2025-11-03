import { useState, useEffect } from "react";

interface ErrorCode {
  code: string;
  meaning: string;
  solution: string;
}

export function useErrorCodes(routeName: string) {
  const [errorCodes, setErrorCodes] = useState<Record<string, ErrorCode>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const modules = import.meta.glob('../data/error-codes/*.json');

    async function loadErrorCodes() {
      if (!routeName) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const key = `../data/error-codes/${routeName}.json`;
        const loader = (modules as Record<string, () => Promise<any>>)[key];
        if (!loader) {
          throw new Error(`Could not find local error codes file for route: ${routeName}`);
        }
        const response = await loader();

        if (mounted) {
          setErrorCodes(response.default || {});
          setError(null);
        }
      } catch (err: any) {
        console.error("Error loading error codes:", err);
        if (mounted) {
          setError(err?.message ? `Failed to load error codes: ${err.message}` : "Failed to load error codes");
          setErrorCodes({});
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadErrorCodes();

    return () => {
      mounted = false;
    };
  }, [routeName]);

  return { errorCodes, loading, error };
}
