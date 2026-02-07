import { useState, useEffect, useRef } from 'react';
import type { IXP } from '../types/datacenter';

export function useIXPs(enabled: boolean) {
  const [ixps, setIxps] = useState<IXP[]>([]);
  const [loading, setLoading] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    if (!enabled || loaded.current) return;
    setLoading(true);
    fetch('/data/ixps.json')
      .then((r) => r.ok ? r.json() : [])
      .then((data: IXP[]) => {
        setIxps(data);
        loaded.current = true;
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [enabled]);

  return { ixps, loading };
}
