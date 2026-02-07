import { useMemo } from 'react';
import { useDatacenters } from '../hooks/useDatacenters';
import { useCountryGeo } from '../hooks/useCountryGeo';
import { useMapSelection } from '../hooks/useMapSelection';
import { useSubmarineCables } from '../hooks/useSubmarineCables';
import { useIXPs } from '../hooks/useIXPs';
import { buildCountrySummaries, buildCompanySummaries } from '../lib/dataUtils';
import type { Datacenter, MetroConnection } from '../types/datacenter';
import MapView from './MapView';
import Sidebar from './Sidebar';
import OverlaySelector from './OverlaySelector';

/** Build nearest-neighbor connections between DCs of the same owner */
function buildMetroConnections(datacenters: Datacenter[], maxTotal: number): MetroConnection[] {
  const byOwner = new Map<string, Datacenter[]>();
  for (const dc of datacenters) {
    const existing = byOwner.get(dc.owner);
    if (existing) existing.push(dc);
    else byOwner.set(dc.owner, [dc]);
  }

  const connections: MetroConnection[] = [];

  for (const [owner, dcs] of byOwner) {
    if (dcs.length < 2 || dcs.length > 10) continue;

    // Build nearest-neighbor spanning tree
    const connected = new Set<number>([0]);
    const edges: [number, number][] = [];

    while (connected.size < dcs.length) {
      let bestDist = Infinity;
      let bestFrom = 0;
      let bestTo = 0;

      for (const from of connected) {
        for (let to = 0; to < dcs.length; to++) {
          if (connected.has(to)) continue;
          const dlat = dcs[from].lat - dcs[to].lat;
          const dlng = dcs[from].lng - dcs[to].lng;
          const dist = dlat * dlat + dlng * dlng;
          if (dist < bestDist) {
            bestDist = dist;
            bestFrom = from;
            bestTo = to;
          }
        }
      }

      connected.add(bestTo);
      edges.push([bestFrom, bestTo]);
    }

    for (const [i, j] of edges) {
      connections.push({
        id: `${dcs[i].id}-${dcs[j].id}`,
        from: { lat: dcs[i].lat, lng: dcs[i].lng, label: dcs[i].name },
        to: { lat: dcs[j].lat, lng: dcs[j].lng, label: dcs[j].name },
        type: 'dc-to-dc',
        owner,
      });
    }

    if (connections.length >= maxTotal) break;
  }

  return connections.slice(0, maxTotal);
}

export default function MapApp() {
  const { datacenters, loading: dcLoading, error: dcError } = useDatacenters();
  const { geoData, loading: geoLoading } = useCountryGeo();
  const {
    state,
    selectCountry,
    selectCompany,
    selectDatacenter,
    selectCable,
    selectIxp,
    hoverCountry,
    clearSelection,
    setTab,
    toggleType,
    toggleStatus,
    toggleOverlay,
    setMwRange,
    setYear,
    toggleShowPlanned,
    resetFilters,
  } = useMapSelection();

  const cablesEnabled = state.activeOverlays.has('submarineCables');
  const ixpsEnabled = state.activeOverlays.has('ixps');

  const { meta: cableMeta, landingPoints, geoData: cableGeoData } = useSubmarineCables(cablesEnabled);
  const { ixps } = useIXPs(ixpsEnabled);

  const filteredDCs = useMemo(
    () => datacenters.filter((dc) =>
      state.activeTypes.has(dc.type) &&
      state.activeStatuses.has(dc.status) &&
      dc.capacity_mw >= state.mwRange[0] &&
      dc.capacity_mw <= state.mwRange[1] &&
      (dc.year_opened <= state.selectedYear || state.showPlanned)
    ),
    [datacenters, state.activeTypes, state.activeStatuses, state.mwRange, state.selectedYear, state.showPlanned]
  );

  const futureDCIds = useMemo(
    () => new Set(
      filteredDCs
        .filter((dc) => dc.year_opened > state.selectedYear)
        .map((dc) => dc.id)
    ),
    [filteredDCs, state.selectedYear]
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

  const selectedCable = useMemo(
    () => (state.selectedCableId ? cableMeta.find((c) => c.id === state.selectedCableId) : undefined),
    [state.selectedCableId, cableMeta]
  );

  const selectedIxp = useMemo(
    () => (state.selectedIxpId ? ixps.find((x) => x.id === state.selectedIxpId) : undefined),
    [state.selectedIxpId, ixps]
  );

  const metroConnections = useMemo(
    () => state.activeOverlays.has('connections') ? buildMetroConnections(filteredDCs, 500) : [],
    [filteredDCs, state.activeOverlays]
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
          futureDCIds={futureDCIds}
          geoData={geoData}
          countriesWithDCs={countriesWithDCs}
          selectedCountryCode={state.selectedCountryCode}
          selectedCompany={state.selectedCompany}
          selectedDatacenterId={state.selectedDatacenterId}
          selectedCableId={state.selectedCableId}
          selectedIxpId={state.selectedIxpId}
          hoveredCountryCode={state.hoveredCountryCode}
          activeOverlays={state.activeOverlays}
          cableGeoData={cableGeoData}
          cableMeta={cableMeta}
          landingPoints={landingPoints}
          ixps={ixps}
          metroConnections={metroConnections}
          onSelectCountry={selectCountry}
          onSelectCompany={selectCompany}
          onSelectDatacenter={selectDatacenter}
          onSelectCable={selectCable}
          onSelectIxp={selectIxp}
          onHoverCountry={hoverCountry}
          onClearSelection={clearSelection}
        />
        <OverlaySelector
          activeOverlays={state.activeOverlays}
          onToggleOverlay={toggleOverlay}
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
        selectedCable={selectedCable}
        selectedIxp={selectedIxp}
        landingPoints={landingPoints}
        totalDCs={filteredDCs.length}
        totalAll={datacenters.length}
        activeTypes={state.activeTypes}
        activeStatuses={state.activeStatuses}
        mwRange={state.mwRange}
        selectedYear={state.selectedYear}
        showPlanned={state.showPlanned}
        onToggleType={toggleType}
        onToggleStatus={toggleStatus}
        onSetMwRange={setMwRange}
        onSetYear={setYear}
        onToggleShowPlanned={toggleShowPlanned}
        onResetFilters={resetFilters}
        onSelectCountry={selectCountry}
        onSelectCompany={selectCompany}
        onSelectDatacenter={selectDatacenter}
        onClearSelection={clearSelection}
      />
    </div>
  );
}
