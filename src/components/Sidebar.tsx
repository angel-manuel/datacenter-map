import type { ActiveTab } from '../hooks/useMapSelection';
import type { CountrySummary, CompanySummary, Datacenter } from '../types/datacenter';
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
  totalDCs: number;
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

export default function Sidebar({
  activeTab,
  onSetTab,
  countries,
  companies,
  selectedCountryCode,
  selectedCompany,
  selectedDatacenter,
  totalDCs,
  onSelectCountry,
  onSelectCompany,
  onSelectDatacenter,
  onClearSelection,
}: Props) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">Datacenter World Map</h1>
        <div className="sidebar-subtitle">
          {totalDCs} datacenters across {countries.length} countries
        </div>
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
            onSelectCompany={onSelectCompany}
            onSelectCountry={onSelectCountry}
          />
        )}
      </div>

      <div className="sidebar-legend">
        <div className="legend-title">Type Legend</div>
        <div className="legend-items">
          <span className="legend-item"><span className="legend-dot" style={{ background: '#ef4444' }} /> AI</span>
          <span className="legend-item"><span className="legend-dot" style={{ background: '#3b82f6' }} /> Cloud</span>
          <span className="legend-item"><span className="legend-dot" style={{ background: '#22c55e' }} /> Internal</span>
          <span className="legend-item"><span className="legend-dot" style={{ background: '#f59e0b' }} /> Mixed</span>
        </div>
      </div>
    </div>
  );
}
