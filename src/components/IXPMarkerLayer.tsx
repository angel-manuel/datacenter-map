import { useMemo } from 'react';
import { Marker, Tooltip } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import type { IXP } from '../types/datacenter';

interface Props {
  ixps: IXP[];
  selectedIxpId: string | null;
  onSelectIxp: (id: string) => void;
}

function ixpSize(participantCount: number): number {
  if (participantCount <= 0) return 8;
  return Math.round(8 + Math.log10(participantCount + 1) * 4);
}

function createIxpIcon(ixp: IXP, isSelected: boolean): L.DivIcon {
  const size = ixpSize(ixp.participant_count);
  const color = '#a855f7';
  return L.divIcon({
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div style="
      width:${size}px;
      height:${size}px;
      background:${color};
      border:${isSelected ? '2px solid #fff' : '1px solid rgba(168,85,247,0.8)'};
      opacity:${isSelected ? 1 : 0.85};
      box-shadow:0 0 ${isSelected ? 8 : 4}px ${color}80;
      transition:all 0.2s;
    "></div>`,
  });
}

export default function IXPMarkerLayer({ ixps, selectedIxpId, onSelectIxp }: Props) {
  const markers = useMemo(
    () =>
      ixps.map((ixp) => {
        const isSelected = ixp.id === selectedIxpId;
        return (
          <Marker
            key={ixp.id}
            position={[ixp.lat, ixp.lng]}
            icon={createIxpIcon(ixp, isSelected)}
            eventHandlers={{ click: () => onSelectIxp(ixp.id) }}
          >
            <Tooltip direction="top" offset={[0, -6]}>
              {ixp.name} ({ixp.participant_count} participants)
            </Tooltip>
          </Marker>
        );
      }),
    [ixps, selectedIxpId, onSelectIxp]
  );

  return (
    <MarkerClusterGroup
      chunkedLoading
      maxClusterRadius={35}
      spiderfyOnMaxZoom
      showCoverageOnHover={false}
      iconCreateFunction={(cluster: any) => {
        const count = cluster.getChildCount();
        const size = count > 50 ? 40 : count > 20 ? 34 : 26;
        return L.divIcon({
          html: `<div style="
            display:flex;align-items:center;justify-content:center;
            width:${size}px;height:${size}px;
            background:rgba(168,85,247,0.8);color:#fff;
            font-size:${size > 34 ? 12 : 10}px;font-weight:700;
            border:2px solid rgba(255,255,255,0.6);
            box-shadow:0 0 8px rgba(168,85,247,0.5);
          ">${count}</div>`,
          className: '',
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });
      }}
    >
      {markers}
    </MarkerClusterGroup>
  );
}
