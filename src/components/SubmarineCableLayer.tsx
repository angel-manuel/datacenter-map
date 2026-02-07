import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { FeatureCollection } from 'geojson';

interface Props {
  geoData: FeatureCollection;
  selectedCableId: string | null;
  onSelectCable: (id: string) => void;
}

export default function SubmarineCableLayer({ geoData, selectedCableId, onSelectCable }: Props) {
  const map = useMap();
  const layerRef = useRef<L.GeoJSON | null>(null);

  useEffect(() => {
    const layer = L.geoJSON(geoData, {
      style: (feature) => {
        const id = feature?.properties?.id || feature?.id;
        const color = feature?.properties?.color || '#06b6d4';
        const isSelected = String(id) === selectedCableId;
        return {
          color,
          weight: isSelected ? 3 : 1.5,
          opacity: isSelected ? 1 : 0.6,
        };
      },
      onEachFeature: (feature, featureLayer) => {
        const name = feature.properties?.name || 'Cable';
        featureLayer.bindTooltip(name, {
          sticky: true,
          className: 'cable-tooltip',
          direction: 'top',
          offset: [0, -6],
        });
        featureLayer.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          const id = feature.properties?.id || feature.id;
          if (id) onSelectCable(String(id));
        });
      },
    });

    layer.addTo(map);
    layerRef.current = layer;

    return () => {
      map.removeLayer(layer);
    };
  }, [geoData, selectedCableId, map, onSelectCable]);

  return null;
}
