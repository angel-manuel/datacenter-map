import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { FeatureCollection, Geometry } from 'geojson';
import type { CountryFeatureProperties } from '../hooks/useCountryGeo';
import { numericToAlpha2Code } from '../lib/countryLookup';

interface Props {
  geoData: FeatureCollection<Geometry, CountryFeatureProperties>;
  countriesWithDCs: Set<string>;
  selectedCountryCode: string | null;
  hoveredCountryCode: string | null;
  onSelectCountry: (code: string) => void;
  onHoverCountry: (code: string | null) => void;
}

function getStyle(
  alpha2: string | undefined,
  countriesWithDCs: Set<string>,
  selectedCode: string | null,
  hoveredCode: string | null
): L.PathOptions {
  const hasDC = alpha2 ? countriesWithDCs.has(alpha2) : false;
  const isSelected = alpha2 != null && alpha2 === selectedCode;
  const isHovered = alpha2 != null && alpha2 === hoveredCode;

  if (isSelected) {
    return {
      fillColor: '#3b82f6',
      fillOpacity: 0.4,
      color: '#60a5fa',
      weight: 2,
    };
  }
  if (isHovered && hasDC) {
    return {
      fillColor: '#3b82f6',
      fillOpacity: 0.2,
      color: '#475569',
      weight: 1,
    };
  }
  if (hasDC) {
    return {
      fillColor: '#3b82f6',
      fillOpacity: 0.08,
      color: '#334155',
      weight: 1,
    };
  }
  return {
    fillColor: 'transparent',
    fillOpacity: 0,
    color: 'transparent',
    weight: 0,
  };
}

export default function CountryLayer({
  geoData,
  countriesWithDCs,
  selectedCountryCode,
  hoveredCountryCode,
  onSelectCountry,
  onHoverCountry,
}: Props) {
  const map = useMap();
  const layerRef = useRef<L.GeoJSON | null>(null);

  // Create the GeoJSON layer once
  useEffect(() => {
    const layer = L.geoJSON(geoData, {
      style: (feature) => {
        const numId = feature?.properties?.id || feature?.id;
        const alpha2 = numericToAlpha2Code(String(numId));
        return getStyle(alpha2, countriesWithDCs, selectedCountryCode, hoveredCountryCode);
      },
      onEachFeature: (_feature, featureLayer) => {
        featureLayer.on({
          click: (e) => {
            L.DomEvent.stopPropagation(e);
            const numId = (e.target as any).feature?.properties?.id || (e.target as any).feature?.id;
            const alpha2 = numericToAlpha2Code(String(numId));
            if (alpha2) onSelectCountry(alpha2);
          },
          mouseover: (e) => {
            const numId = (e.target as any).feature?.properties?.id || (e.target as any).feature?.id;
            const alpha2 = numericToAlpha2Code(String(numId));
            if (alpha2) onHoverCountry(alpha2);
          },
          mouseout: () => {
            onHoverCountry(null);
          },
        });
      },
    });

    layer.addTo(map);
    layerRef.current = layer;

    return () => {
      map.removeLayer(layer);
    };
    // Only recreate when geoData or countriesWithDCs change (rare)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geoData, countriesWithDCs, map]);

  // Update styles reactively without recreating the layer
  useEffect(() => {
    if (!layerRef.current) return;
    layerRef.current.eachLayer((layer: any) => {
      const numId = layer.feature?.properties?.id || layer.feature?.id;
      const alpha2 = numericToAlpha2Code(String(numId));
      const style = getStyle(alpha2, countriesWithDCs, selectedCountryCode, hoveredCountryCode);
      layer.setStyle(style);
    });
  }, [selectedCountryCode, hoveredCountryCode, countriesWithDCs]);

  return null;
}
