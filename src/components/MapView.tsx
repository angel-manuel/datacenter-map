import { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import type { FeatureCollection, Geometry } from 'geojson';
import type { Datacenter } from '../types/datacenter';
import type { CountryFeatureProperties } from '../hooks/useCountryGeo';
import CountryLayer from './CountryLayer';
import DatacenterMarkers from './DatacenterMarkers';
import { numericToAlpha2Code } from '../lib/countryLookup';
import L from 'leaflet';

import 'leaflet/dist/leaflet.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';

interface Props {
  datacenters: Datacenter[];
  geoData: FeatureCollection<Geometry, CountryFeatureProperties> | null;
  countriesWithDCs: Set<string>;
  selectedCountryCode: string | null;
  selectedCompany: string | null;
  selectedDatacenterId: string | null;
  hoveredCountryCode: string | null;
  onSelectCountry: (code: string) => void;
  onSelectCompany: (company: string) => void;
  onSelectDatacenter: (id: string, countryCode: string, company: string) => void;
  onHoverCountry: (code: string | null) => void;
  onClearSelection: () => void;
}

function MapPanHandler({
  selectedDatacenterId,
  datacenters,
}: {
  selectedDatacenterId: string | null;
  datacenters: Datacenter[];
}) {
  const map = useMap();
  useEffect(() => {
    if (!selectedDatacenterId) return;
    const dc = datacenters.find((d) => d.id === selectedDatacenterId);
    if (dc) {
      map.flyTo([dc.lat, dc.lng], Math.max(map.getZoom(), 6), { duration: 0.8 });
    }
  }, [selectedDatacenterId, datacenters, map]);
  return null;
}

function CountryZoomHandler({
  selectedCountryCode,
  geoData,
}: {
  selectedCountryCode: string | null;
  geoData: FeatureCollection<Geometry, CountryFeatureProperties> | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (!selectedCountryCode || !geoData) return;
    const feature = geoData.features.find((f) => {
      const numId = f.properties?.id || f.id;
      return numericToAlpha2Code(String(numId)) === selectedCountryCode;
    });
    if (feature) {
      const bounds = L.geoJSON(feature).getBounds();
      if (bounds.isValid()) {
        map.flyToBounds(bounds, { padding: [40, 40], duration: 0.8 });
      }
    }
  }, [selectedCountryCode, geoData, map]);
  return null;
}

export default function MapView({
  datacenters,
  geoData,
  countriesWithDCs,
  selectedCountryCode,
  selectedCompany,
  selectedDatacenterId,
  hoveredCountryCode,
  onSelectCountry,
  onSelectCompany,
  onSelectDatacenter,
  onHoverCountry,
  onClearSelection,
}: Props) {
  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      minZoom={2}
      maxZoom={18}
      style={{ width: '100%', height: '100%', background: '#0f172a' }}
      worldCopyJump
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      {geoData && (
        <CountryLayer
          geoData={geoData}
          countriesWithDCs={countriesWithDCs}
          selectedCountryCode={selectedCountryCode}
          hoveredCountryCode={hoveredCountryCode}
          onSelectCountry={onSelectCountry}
          onHoverCountry={onHoverCountry}
        />
      )}

      <DatacenterMarkers
        datacenters={datacenters}
        selectedCountryCode={selectedCountryCode}
        selectedCompany={selectedCompany}
        selectedDatacenterId={selectedDatacenterId}
        onSelectDatacenter={onSelectDatacenter}
        onSelectCompany={onSelectCompany}
        onSelectCountry={onSelectCountry}
      />

      <MapPanHandler selectedDatacenterId={selectedDatacenterId} datacenters={datacenters} />
      {geoData && (
        <CountryZoomHandler selectedCountryCode={selectedCountryCode} geoData={geoData} />
      )}
    </MapContainer>
  );
}
