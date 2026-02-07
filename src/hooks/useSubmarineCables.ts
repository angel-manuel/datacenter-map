import { useState, useEffect, useRef } from 'react';
import type { SubmarineCable, LandingPoint } from '../types/datacenter';
import type { FeatureCollection, Geometry } from 'geojson';

interface CableGeoProperties {
  id: string;
  name: string;
  color: string;
}

export function useSubmarineCables(enabled: boolean) {
  const [meta, setMeta] = useState<SubmarineCable[]>([]);
  const [landingPoints, setLandingPoints] = useState<LandingPoint[]>([]);
  const [geoData, setGeoData] = useState<FeatureCollection<Geometry, CableGeoProperties> | null>(null);
  const [loading, setLoading] = useState(false);
  const geoLoaded = useRef(false);

  // Always load lightweight metadata + landing points on first mount
  useEffect(() => {
    Promise.all([
      fetch('/data/submarine-cables-meta.json').then((r) => r.ok ? r.json() : []),
      fetch('/data/landing-points.json').then((r) => r.ok ? r.json() : { features: [] }),
    ]).then(([metaData, lpData]) => {
      setMeta(metaData);
      const points: LandingPoint[] = (lpData.features || []).map((f: any) => ({
        id: f.properties?.id || f.id,
        name: f.properties?.name || '',
        lat: f.geometry.coordinates[1],
        lng: f.geometry.coordinates[0],
        country_code: f.properties?.country_code || '',
      }));
      setLandingPoints(points);
    });
  }, []);

  // Lazily load heavy GeoJSON when enabled
  useEffect(() => {
    if (!enabled || geoLoaded.current) return;
    setLoading(true);
    fetch('/data/submarine-cables.json')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) {
          setGeoData(data);
          geoLoaded.current = true;
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [enabled]);

  return { meta, landingPoints, geoData, loading };
}
