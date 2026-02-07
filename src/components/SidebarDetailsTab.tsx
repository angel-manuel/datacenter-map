import type { Datacenter } from '../types/datacenter';
import { formatMW, typeColor, typeLabel, statusLabel } from '../lib/dataUtils';

interface Props {
  datacenter: Datacenter | undefined;
  onSelectCompany: (company: string) => void;
  onSelectCountry: (code: string) => void;
}

export default function SidebarDetailsTab({ datacenter, onSelectCompany, onSelectCountry }: Props) {
  if (!datacenter) {
    return (
      <div className="sidebar-empty">
        <div className="empty-icon">📍</div>
        <div>Click a datacenter on the map to see details</div>
      </div>
    );
  }

  return (
    <div className="details-panel">
      <h3 className="details-name">{datacenter.name}</h3>

      <div className="details-badges">
        <span
          className="type-badge"
          style={{ backgroundColor: typeColor(datacenter.type) }}
        >
          {typeLabel(datacenter.type)}
        </span>
        <span className={`status-badge status-${datacenter.status}`}>
          {statusLabel(datacenter.status)}
        </span>
      </div>

      <div className="details-grid">
        <div className="details-row">
          <span className="details-label">Owner</span>
          <span
            className="details-link"
            onClick={() => onSelectCompany(datacenter.owner)}
          >
            {datacenter.owner}
          </span>
        </div>
        <div className="details-row">
          <span className="details-label">Location</span>
          <span>
            {datacenter.city}
            {datacenter.state ? `, ${datacenter.state}` : ''}
          </span>
        </div>
        <div className="details-row">
          <span className="details-label">Country</span>
          <span
            className="details-link"
            onClick={() => onSelectCountry(datacenter.country_code)}
          >
            {datacenter.country}
          </span>
        </div>
        <div className="details-row">
          <span className="details-label">Capacity</span>
          <span>{formatMW(datacenter.capacity_mw)}</span>
        </div>
        <div className="details-row">
          <span className="details-label">Coordinates</span>
          <span>{datacenter.lat.toFixed(4)}, {datacenter.lng.toFixed(4)}</span>
        </div>
        {datacenter.notes && (
          <div className="details-row">
            <span className="details-label">Notes</span>
            <span>{datacenter.notes}</span>
          </div>
        )}
        <div className="details-row">
          <span className="details-label">Source</span>
          <span className="details-source">{datacenter.source}</span>
        </div>
      </div>
    </div>
  );
}
