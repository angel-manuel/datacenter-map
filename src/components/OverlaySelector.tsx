import type { OverlayType } from '../types/datacenter';
import { ALL_OVERLAYS } from '../hooks/useMapSelection';

interface Props {
  activeOverlays: Set<OverlayType>;
  onToggleOverlay: (overlay: OverlayType) => void;
}

const overlayConfig: Record<OverlayType, { label: string; color: string }> = {
  datacenters: { label: 'Datacenters', color: '#3b82f6' },
  submarineCables: { label: 'Submarine Cables', color: '#06b6d4' },
  ixps: { label: 'Internet Exchanges', color: '#a855f7' },
  connections: { label: 'Connections', color: '#60a5fa' },
};

export default function OverlaySelector({ activeOverlays, onToggleOverlay }: Props) {
  return (
    <div className="overlay-selector">
      <div className="overlay-selector-title">Layers</div>
      {ALL_OVERLAYS.map((overlay) => {
        const { label, color } = overlayConfig[overlay];
        const active = activeOverlays.has(overlay);
        return (
          <label key={overlay} className={`overlay-option ${active ? 'active' : ''}`}>
            <input
              type="checkbox"
              checked={active}
              onChange={() => onToggleOverlay(overlay)}
              className="overlay-checkbox"
            />
            <span className="overlay-dot" style={{ background: color }} />
            <span className="overlay-label">{label}</span>
          </label>
        );
      })}
    </div>
  );
}
