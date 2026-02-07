import type { Datacenter } from '../types/datacenter';
import { formatMW, typeColor, typeLabel, statusLabel } from '../lib/dataUtils';

interface Props {
  dc: Datacenter;
  onSelectCompany: (company: string) => void;
  onSelectCountry: (code: string) => void;
}

export default function DatacenterPopup({ dc, onSelectCompany, onSelectCountry }: Props) {
  return (
    <div style={{ minWidth: 220, fontFamily: 'system-ui, sans-serif', fontSize: 13 }}>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{dc.name}</div>
      <div style={{ marginBottom: 4 }}>
        <span style={{ color: '#94a3b8' }}>Owner: </span>
        <span
          style={{ color: '#60a5fa', cursor: 'pointer', textDecoration: 'underline' }}
          onClick={(e) => { e.stopPropagation(); onSelectCompany(dc.owner); }}
        >
          {dc.owner}
        </span>
      </div>
      <div style={{ marginBottom: 4 }}>
        <span style={{ color: '#94a3b8' }}>Location: </span>
        {dc.city}{dc.state ? `, ${dc.state}` : ''},{' '}
        <span
          style={{ color: '#60a5fa', cursor: 'pointer', textDecoration: 'underline' }}
          onClick={(e) => { e.stopPropagation(); onSelectCountry(dc.country_code); }}
        >
          {dc.country}
        </span>
      </div>
      <div style={{ marginBottom: 4 }}>
        <span style={{ color: '#94a3b8' }}>Capacity: </span>
        {formatMW(dc.capacity_mw)}
      </div>
      <div style={{ marginBottom: 4 }}>
        <span style={{ color: '#94a3b8' }}>Year: </span>
        {dc.year_opened}
      </div>
      <div style={{ marginBottom: 4 }}>
        <span
          style={{
            display: 'inline-block',
            padding: '1px 6px',
            borderRadius: 3,
            backgroundColor: typeColor(dc.type),
            color: '#fff',
            fontSize: 11,
            fontWeight: 600,
            marginRight: 6,
          }}
        >
          {typeLabel(dc.type)}
        </span>
        <span style={{ color: '#94a3b8', fontSize: 12 }}>{statusLabel(dc.status)}</span>
      </div>
      {dc.notes && (
        <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 4 }}>{dc.notes}</div>
      )}
    </div>
  );
}
