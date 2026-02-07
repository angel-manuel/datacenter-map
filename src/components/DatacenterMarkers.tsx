import { useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import type { Datacenter } from '../types/datacenter';
import { typeColor } from '../lib/dataUtils';
import DatacenterPopup from './DatacenterPopup';

interface Props {
  datacenters: Datacenter[];
  selectedCountryCode: string | null;
  selectedCompany: string | null;
  selectedDatacenterId: string | null;
  onSelectDatacenter: (id: string, countryCode: string, company: string) => void;
  onSelectCompany: (company: string) => void;
  onSelectCountry: (code: string) => void;
}

function createIcon(dc: Datacenter, isHighlighted: boolean, hasSelection: boolean): L.DivIcon {
  const color = typeColor(dc.type);
  const size = isHighlighted ? 14 : 10;
  const opacity = hasSelection && !isHighlighted ? 0.35 : 1;
  const border = isHighlighted ? `2px solid #fff` : `1.5px solid rgba(255,255,255,0.5)`;

  return L.divIcon({
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div style="
      width:${size}px;
      height:${size}px;
      border-radius:50%;
      background:${color};
      border:${border};
      opacity:${opacity};
      box-shadow:0 0 ${isHighlighted ? 8 : 4}px ${color}80;
      transition: all 0.2s;
    "></div>`,
  });
}

export default function DatacenterMarkers({
  datacenters,
  selectedCountryCode,
  selectedCompany,
  selectedDatacenterId,
  onSelectDatacenter,
  onSelectCompany,
  onSelectCountry,
}: Props) {
  const hasSelection = selectedCountryCode != null || selectedCompany != null || selectedDatacenterId != null;

  const markers = useMemo(
    () =>
      datacenters.map((dc) => {
        const isHighlighted =
          dc.id === selectedDatacenterId ||
          (selectedCompany != null && dc.owner === selectedCompany) ||
          (selectedCountryCode != null && dc.country_code === selectedCountryCode);

        return (
          <Marker
            key={dc.id}
            position={[dc.lat, dc.lng]}
            icon={createIcon(dc, isHighlighted, hasSelection)}
            eventHandlers={{
              click: () => onSelectDatacenter(dc.id, dc.country_code, dc.owner),
            }}
          >
            <Popup>
              <DatacenterPopup
                dc={dc}
                onSelectCompany={onSelectCompany}
                onSelectCountry={onSelectCountry}
              />
            </Popup>
          </Marker>
        );
      }),
    [datacenters, selectedCountryCode, selectedCompany, selectedDatacenterId, hasSelection, onSelectDatacenter, onSelectCompany, onSelectCountry]
  );

  return (
    <MarkerClusterGroup
      chunkedLoading
      maxClusterRadius={40}
      spiderfyOnMaxZoom
      showCoverageOnHover={false}
      iconCreateFunction={(cluster: any) => {
        const count = cluster.getChildCount();
        const size = count > 50 ? 44 : count > 20 ? 36 : 28;
        return L.divIcon({
          html: `<div style="
            display:flex;align-items:center;justify-content:center;
            width:${size}px;height:${size}px;border-radius:50%;
            background:rgba(59,130,246,0.8);color:#fff;
            font-size:${size > 36 ? 13 : 11}px;font-weight:700;
            border:2px solid rgba(255,255,255,0.6);
            box-shadow:0 0 10px rgba(59,130,246,0.5);
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
