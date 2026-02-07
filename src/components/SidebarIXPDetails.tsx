import type { IXP } from '../types/datacenter';

interface Props {
  ixp: IXP;
}

export default function SidebarIXPDetails({ ixp }: Props) {
  return (
    <div className="details-panel">
      <h3 className="details-name">{ixp.name}</h3>

      <div className="details-badges">
        <span className="type-badge" style={{ backgroundColor: '#a855f7' }}>
          Internet Exchange
        </span>
      </div>

      <div className="details-grid">
        <div className="details-row">
          <span className="details-label">City</span>
          <span>{ixp.city}</span>
        </div>
        <div className="details-row">
          <span className="details-label">Country</span>
          <span>{ixp.country_code}</span>
        </div>
        <div className="details-row">
          <span className="details-label">Participants</span>
          <span>{ixp.participant_count}</span>
        </div>
        <div className="details-row">
          <span className="details-label">Coordinates</span>
          <span>{ixp.lat.toFixed(4)}, {ixp.lng.toFixed(4)}</span>
        </div>
      </div>
    </div>
  );
}
