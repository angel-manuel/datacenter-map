import { useState, useEffect } from 'react';
import type { Datacenter } from '../types/datacenter';

export function useDatacenters() {
  const [datacenters, setDatacenters] = useState<Datacenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/data/datacenters.json')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: Datacenter[]) => {
        setDatacenters(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { datacenters, loading, error };
}
