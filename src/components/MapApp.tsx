import { useMemo } from 'react';
import { useDatacenters } from '../hooks/useDatacenters';
import { useCountryGeo } from '../hooks/useCountryGeo';
import { useMapSelection } from '../hooks/useMapSelection';
import { buildCountrySummaries, buildCompanySummaries } from '../lib/dataUtils';
import MapView from './MapView';
import Sidebar from './Sidebar';

export default function MapApp() {
  const { datacenters, loading: dcLoading, error: dcError } = useDatacenters();
  const { geoData, loading: geoLoading } = useCountryGeo();
  const {
    state,
    selectCountry,
    selectCompany,
    selectDatacenter,
    hoverCountry,
    clearSelection,
    setTab,
  } = useMapSelection();

  const countries = useMemo(() => buildCountrySummaries(datacenters), [datacenters]);
  const companies = useMemo(() => buildCompanySummaries(datacenters), [datacenters]);
  const countriesWithDCs = useMemo(
    () => new Set(datacenters.map((dc) => dc.country_code)),
    [datacenters]
  );

  const selectedDC = useMemo(
    () => (state.selectedDatacenterId ? datacenters.find((d) => d.id === state.selectedDatacenterId) : undefined),
    [state.selectedDatacenterId, datacenters]
  );

  if (dcLoading || geoLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <div>Loading datacenter data...</div>
      </div>
    );
  }

  if (dcError) {
    return (
      <div className="loading-screen">
        <div>Error loading data: {dcError}</div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <div className="map-container">
        <MapView
          datacenters={datacenters}
          geoData={geoData}
          countriesWithDCs={countriesWithDCs}
          selectedCountryCode={state.selectedCountryCode}
          selectedCompany={state.selectedCompany}
          selectedDatacenterId={state.selectedDatacenterId}
          hoveredCountryCode={state.hoveredCountryCode}
          onSelectCountry={selectCountry}
          onSelectCompany={selectCompany}
          onSelectDatacenter={selectDatacenter}
          onHoverCountry={hoverCountry}
          onClearSelection={clearSelection}
        />
      </div>
      <Sidebar
        activeTab={state.activeTab}
        onSetTab={setTab}
        countries={countries}
        companies={companies}
        selectedCountryCode={state.selectedCountryCode}
        selectedCompany={state.selectedCompany}
        selectedDatacenter={selectedDC}
        totalDCs={datacenters.length}
        onSelectCountry={selectCountry}
        onSelectCompany={selectCompany}
        onSelectDatacenter={selectDatacenter}
        onClearSelection={clearSelection}
      />
    </div>
  );
}
