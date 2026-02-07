import type { CompanySummary } from '../types/datacenter';
import { formatMW, typeColor } from '../lib/dataUtils';

interface Props {
  companies: CompanySummary[];
  selectedCompany: string | null;
  onSelectCompany: (company: string) => void;
  onSelectDatacenter: (id: string, countryCode: string, company: string) => void;
}

export default function SidebarCompanyTab({
  companies,
  selectedCompany,
  onSelectCompany,
  onSelectDatacenter,
}: Props) {
  return (
    <div className="sidebar-list">
      {companies.map((c) => {
        const isSelected = c.company === selectedCompany;
        return (
          <div key={c.company} className={`sidebar-item ${isSelected ? 'selected' : ''}`}>
            <div className="sidebar-item-header" onClick={() => onSelectCompany(c.company)}>
              <div className="sidebar-item-name">{c.company}</div>
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
                    <span className="subitem-location">{dc.city}, {dc.country}</span>
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
