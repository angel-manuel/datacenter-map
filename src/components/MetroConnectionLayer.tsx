import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { MetroConnection } from '../types/datacenter';

interface Props {
  connections: MetroConnection[];
}

export default function MetroConnectionLayer({ connections }: Props) {
  const map = useMap();
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    const group = L.layerGroup();

    for (const conn of connections) {
      const color = conn.type === 'dc-to-dc' ? '#60a5fa' : '#c084fc';
      const line = L.polyline(
        [[conn.from.lat, conn.from.lng], [conn.to.lat, conn.to.lng]],
        {
          color,
          weight: 1,
          opacity: 0.4,
          dashArray: '4 6',
        }
      );
      line.bindTooltip(`${conn.from.label} → ${conn.to.label}`, {
        sticky: true,
        direction: 'top',
        className: 'cable-tooltip',
      });
      group.addLayer(line);
    }

    group.addTo(map);
    layerRef.current = group;

    return () => {
      map.removeLayer(group);
    };
  }, [connections, map]);

  return null;
}
