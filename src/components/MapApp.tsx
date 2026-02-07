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
    toggleType,
    toggleStatus,
    setMwRange,
    resetFilters,
  } = useMapSelection();

  const filteredDCs = useMemo(
    () => datacenters.filter((dc) =>
      state.activeTypes.has(dc.type) &&
      state.activeStatuses.has(dc.status) &&
      dc.capacity_mw >= state.mwRange[0] &&
      dc.capacity_mw <= state.mwRange[1]
    ),
    [datacenters, state.activeTypes, state.activeStatuses, state.mwRange]
  );

  const countries = useMemo(() => buildCountrySummaries(filteredDCs), [filteredDCs]);
  const companies = useMemo(() => buildCompanySummaries(filteredDCs), [filteredDCs]);
  const countriesWithDCs = useMemo(
    () => new Set(filteredDCs.map((dc) => dc.country_code)),
    [filteredDCs]
  );

  const selectedDC = useMemo(
    () => (state.selectedDatacenterId ? filteredDCs.find((d) => d.id === state.selectedDatacenterId) : undefined),
    [state.selectedDatacenterId, filteredDCs]
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
          datacenters={filteredDCs}
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
        totalDCs={filteredDCs.length}
        totalAll={datacenters.length}
        activeTypes={state.activeTypes}
        activeStatuses={state.activeStatuses}
        mwRange={state.mwRange}
        onToggleType={toggleType}
        onToggleStatus={toggleStatus}
        onSetMwRange={setMwRange}
        onResetFilters={resetFilters}
        onSelectCountry={selectCountry}
        onSelectCompany={selectCompany}
        onSelectDatacenter={selectDatacenter}
        onClearSelection={clearSelection}
      />
    </div>
  );
}
