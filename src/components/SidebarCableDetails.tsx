import type { SubmarineCable, LandingPoint } from '../types/datacenter';

interface Props {
  cable: SubmarineCable;
  landingPoints: LandingPoint[];
}

export default function SidebarCableDetails({ cable, landingPoints }: Props) {
  const cableLPs = landingPoints.filter((lp) => cable.landing_point_ids.includes(lp.id));

  return (
    <div className="details-panel">
      <h3 className="details-name">{cable.name}</h3>

      <div className="details-badges">
        <span className="type-badge" style={{ backgroundColor: cable.color || '#06b6d4' }}>
          Submarine Cable
        </span>
      </div>

      <div className="details-grid">
        {cable.owners.length > 0 && (
          <div className="details-row">
            <span className="details-label">Owners</span>
            <span>{cable.owners.join(', ')}</span>
          </div>
        )}
        {cable.rfs && (
          <div className="details-row">
            <span className="details-label">Ready for Service</span>
            <span>{cable.rfs}</span>
          </div>
        )}
        {cable.length_km && (
          <div className="details-row">
            <span className="details-label">Length</span>
            <span>{cable.length_km.toLocaleString()} km</span>
          </div>
        )}
        {cableLPs.length > 0 && (
          <div className="details-row">
            <span className="details-label">Landing Points ({cableLPs.length})</span>
            <div className="cable-landing-points">
              {cableLPs.map((lp) => (
                <span key={lp.id} className="landing-point-tag">
                  {lp.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
