import { useState, useEffect } from 'react';
import * as topojson from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { FeatureCollection, Geometry } from 'geojson';

export interface CountryFeatureProperties {
  name: string;
  id: string; // numeric ISO ID from TopoJSON
}

export function useCountryGeo() {
  const [geoData, setGeoData] = useState<FeatureCollection<Geometry, CountryFeatureProperties> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/countries-110m.json')
      .then((res) => res.json())
      .then((topo: Topology) => {
        const countries = topojson.feature(
          topo,
          topo.objects.countries as GeometryCollection<CountryFeatureProperties>
        ) as FeatureCollection<Geometry, CountryFeatureProperties>;
        setGeoData(countries);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return { geoData, loading };
}
