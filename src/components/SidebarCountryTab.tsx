import type { CountrySummary, Datacenter } from '../types/datacenter';
import { formatMW, typeColor } from '../lib/dataUtils';

interface Props {
  countries: CountrySummary[];
  selectedCountryCode: string | null;
  onSelectCountry: (code: string) => void;
  onSelectDatacenter: (id: string, countryCode: string, company: string) => void;
}

export default function SidebarCountryTab({
  countries,
  selectedCountryCode,
  onSelectCountry,
  onSelectDatacenter,
}: Props) {
  return (
    <div className="sidebar-list">
      {countries.map((c) => {
        const isSelected = c.country_code === selectedCountryCode;
        return (
          <div key={c.country_code} className={`sidebar-item ${isSelected ? 'selected' : ''}`}>
            <div className="sidebar-item-header" onClick={() => onSelectCountry(c.country_code)}>
              <div className="sidebar-item-name">{c.country}</div>
              <div className="sidebar-item-stats">
                <span className="stat-badge">{c.count} DC{c.count !== 1 ? 's' : ''}</span>
                <span className="stat-mw">{formatMW(c.total_mw)}</span>
              </div>
            </div>
            {isSelected && (
              <div className="sidebar-item-expand">
                {c.datacenters.map((dc) => (
                  <div
                    key={dc.id}
                    className="sidebar-subitem"
                    onClick={() => onSelectDatacenter(dc.id, dc.country_code, dc.owner)}
                  >
                    <span
                      className="dot"
                      style={{ backgroundColor: typeColor(dc.type) }}
                    />
                    <span className="subitem-name">{dc.name}</span>
                    <span className="subitem-owner">{dc.owner}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
