import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { LandingPoint, SubmarineCable } from '../types/datacenter';

interface Props {
  landingPoints: LandingPoint[];
  cableMeta: SubmarineCable[];
  selectedCableId: string | null;
}

export default function LandingPointMarkers({ landingPoints, cableMeta, selectedCableId }: Props) {
  const map = useMap();
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    const group = L.layerGroup();

    // Find landing point IDs for the selected cable
    const highlightedLPIds = new Set<string>();
    if (selectedCableId) {
      const cable = cableMeta.find((c) => c.id === selectedCableId);
      if (cable) {
        cable.landing_point_ids.forEach((id) => highlightedLPIds.add(id));
      }
    }

    for (const lp of landingPoints) {
      const isHighlighted = highlightedLPIds.has(lp.id);
      const marker = L.circleMarker([lp.lat, lp.lng], {
        radius: isHighlighted ? 5 : 3,
        fillColor: '#06b6d4',
        fillOpacity: isHighlighted ? 1 : 0.7,
        color: isHighlighted ? '#fff' : '#06b6d4',
        weight: isHighlighted ? 1.5 : 0.5,
      });
      marker.bindTooltip(lp.name, {
        direction: 'top',
        offset: [0, -4],
        className: 'cable-tooltip',
      });
      group.addLayer(marker);
    }

    group.addTo(map);
    layerRef.current = group;

    return () => {
      map.removeLayer(group);
    };
  }, [landingPoints, cableMeta, selectedCableId, map]);

  return null;
}
