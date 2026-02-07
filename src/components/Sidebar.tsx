import type { ActiveTab, DCType, DCStatus } from '../hooks/useMapSelection';
import { ALL_TYPES, ALL_STATUSES, MW_MIN, MW_MAX, YEAR_MIN, YEAR_MAX, YEAR_DEFAULT } from '../hooks/useMapSelection';
import type { CountrySummary, CompanySummary, Datacenter, SubmarineCable, LandingPoint, IXP } from '../types/datacenter';
import { typeColor, typeLabel, statusLabel, formatMW } from '../lib/dataUtils';
import SidebarCountryTab from './SidebarCountryTab';
import SidebarCompanyTab from './SidebarCompanyTab';
import SidebarDetailsTab from './SidebarDetailsTab';

interface Props {
  activeTab: ActiveTab;
  onSetTab: (tab: ActiveTab) => void;
  countries: CountrySummary[];
  companies: CompanySummary[];
  selectedCountryCode: string | null;
  selectedCompany: string | null;
  selectedDatacenter: Datacenter | undefined;
  selectedCable: SubmarineCable | undefined;
  selectedIxp: IXP | undefined;
  landingPoints: LandingPoint[];
  totalDCs: number;
  totalAll: number;
  activeTypes: Set<DCType>;
  activeStatuses: Set<DCStatus>;
  mwRange: [number, number];
  selectedYear: number;
  showPlanned: boolean;
  onToggleType: (t: DCType) => void;
  onToggleStatus: (s: DCStatus) => void;
  onSetMwRange: (range: [number, number]) => void;
  onSetYear: (year: number) => void;
  onToggleShowPlanned: () => void;
  onResetFilters: () => void;
  onSelectCountry: (code: string) => void;
  onSelectCompany: (company: string) => void;
  onSelectDatacenter: (id: string, countryCode: string, company: string) => void;
  onClearSelection: () => void;
}

const tabs: { key: ActiveTab; label: string }[] = [
  { key: 'countries', label: 'Countries' },
  { key: 'companies', label: 'Companies' },
  { key: 'details', label: 'Details' },
];

const statusColors: Record<DCStatus, string> = {
  operational: '#4ade80',
  under_construction: '#fbbf24',
  planned: '#94a3b8',
};

export default function Sidebar({
  activeTab,
  onSetTab,
  countries,
  companies,
  selectedCountryCode,
  selectedCompany,
  selectedDatacenter,
  selectedCable,
  selectedIxp,
  landingPoints,
  totalDCs,
  totalAll,
  activeTypes,
  activeStatuses,
  mwRange,
  selectedYear,
  showPlanned,
  onToggleType,
  onToggleStatus,
  onSetMwRange,
  onSetYear,
  onToggleShowPlanned,
  onResetFilters,
  onSelectCountry,
  onSelectCompany,
  onSelectDatacenter,
}: Props) {
  const isFiltered = totalDCs !== totalAll;
  const hasNonDefaultFilters =
    activeTypes.size !== ALL_TYPES.length ||
    activeStatuses.size !== ALL_STATUSES.length ||
    mwRange[0] !== MW_MIN ||
    mwRange[1] !== MW_MAX ||
    selectedYear !== YEAR_DEFAULT ||
    !showPlanned;

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">Datacenter World Map</h1>
        <div className="sidebar-subtitle">
          {isFiltered ? `${totalDCs} of ${totalAll}` : totalDCs} datacenters across {countries.length} countries
        </div>
      </div>

      <div className="sidebar-filters">
        <div className="filter-group year-slider-group">
          <div className="filter-label">
            Timeline: <span className="year-display">{selectedYear}</span>
          </div>
          <input
            type="range"
            className="year-slider"
            min={YEAR_MIN}
            max={YEAR_MAX}
            step={1}
            value={selectedYear}
            style={{ '--year-progress': `${((selectedYear - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)) * 100}%` } as React.CSSProperties}
            onChange={(e) => onSetYear(Number(e.target.value))}
          />
          <div className="year-slider-labels">
            <span>{YEAR_MIN}</span>
            <span>{YEAR_MAX}</span>
          </div>
          <label className="show-planned-label">
            <input
              type="checkbox"
              className="show-planned-checkbox"
              checked={showPlanned}
              onChange={onToggleShowPlanned}
            />
            Show planned
          </label>
        </div>

        <div className="filter-group">
          <div className="filter-label">Type</div>
          <div className="filter-chips">
            {ALL_TYPES.map((t) => {
              const active = activeTypes.has(t);
              return (
                <button
                  key={t}
                  className={`filter-chip ${active ? 'active' : ''}`}
                  style={{ '--chip-color': typeColor(t) } as React.CSSProperties}
                  onClick={() => onToggleType(t)}
                >
                  <span className="filter-chip-dot" style={{ background: typeColor(t) }} />
                  {typeLabel(t)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="filter-group">
          <div className="filter-label">Status</div>
          <div className="filter-chips">
            {ALL_STATUSES.map((s) => {
              const active = activeStatuses.has(s);
              return (
                <button
                  key={s}
                  className={`filter-chip ${active ? 'active' : ''}`}
                  style={{ '--chip-color': statusColors[s] } as React.CSSProperties}
                  onClick={() => onToggleStatus(s)}
                >
                  <span className="filter-chip-dot" style={{ background: statusColors[s] }} />
                  {statusLabel(s)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="filter-group">
          <div className="filter-label">
            Capacity: {formatMW(mwRange[0])} &ndash; {formatMW(mwRange[1])}
          </div>
          <div className="mw-slider-container">
            <input
              type="range"
              className="mw-slider"
              min={MW_MIN}
              max={MW_MAX}
              step={10}
              value={mwRange[0]}
              onChange={(e) => {
                const v = Number(e.target.value);
                onSetMwRange([Math.min(v, mwRange[1]), mwRange[1]]);
              }}
            />
            <input
              type="range"
              className="mw-slider"
              min={MW_MIN}
              max={MW_MAX}
              step={10}
              value={mwRange[1]}
              onChange={(e) => {
                const v = Number(e.target.value);
                onSetMwRange([mwRange[0], Math.max(v, mwRange[0])]);
              }}
            />
          </div>
        </div>

        {hasNonDefaultFilters && (
          <button className="reset-filters-btn" onClick={onResetFilters}>
            Reset Filters
          </button>
        )}
      </div>

      <div className="sidebar-tabs">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`sidebar-tab ${activeTab === t.key ? 'active' : ''}`}
            onClick={() => onSetTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="sidebar-content">
        {activeTab === 'countries' && (
          <SidebarCountryTab
            countries={countries}
            selectedCountryCode={selectedCountryCode}
            onSelectCountry={onSelectCountry}
            onSelectDatacenter={onSelectDatacenter}
          />
        )}
        {activeTab === 'companies' && (
          <SidebarCompanyTab
            companies={companies}
            selectedCompany={selectedCompany}
            onSelectCompany={onSelectCompany}
            onSelectDatacenter={onSelectDatacenter}
          />
        )}
        {activeTab === 'details' && (
          <SidebarDetailsTab
            datacenter={selectedDatacenter}
            cable={selectedCable}
            ixp={selectedIxp}
            landingPoints={landingPoints}
            onSelectCompany={onSelectCompany}
            onSelectCountry={onSelectCountry}
          />
        )}
      </div>
    </div>
  );
}
