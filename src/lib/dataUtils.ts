import type { Datacenter, CountrySummary, CompanySummary } from '../types/datacenter';

export function buildCountrySummaries(datacenters: Datacenter[]): CountrySummary[] {
  const map = new Map<string, CountrySummary>();

  for (const dc of datacenters) {
    const existing = map.get(dc.country_code);
    if (existing) {
      existing.count++;
      existing.total_mw += dc.capacity_mw;
      existing.datacenters.push(dc);
    } else {
      map.set(dc.country_code, {
        country: dc.country,
        country_code: dc.country_code,
        count: 1,
        total_mw: dc.capacity_mw,
        datacenters: [dc],
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}

export function buildCompanySummaries(datacenters: Datacenter[]): CompanySummary[] {
  const map = new Map<string, CompanySummary>();

  for (const dc of datacenters) {
    const existing = map.get(dc.owner);
    if (existing) {
      existing.count++;
      existing.total_mw += dc.capacity_mw;
      if (!existing.countries.includes(dc.country)) {
        existing.countries.push(dc.country);
      }
      existing.datacenters.push(dc);
    } else {
      map.set(dc.owner, {
        company: dc.owner,
        count: 1,
        total_mw: dc.capacity_mw,
        countries: [dc.country],
        datacenters: [dc],
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => b.total_mw - a.total_mw);
}

export function formatMW(mw: number): string {
  if (mw === 0) return 'N/A';
  if (mw >= 1000) return `${(mw / 1000).toFixed(1)} GW`;
  return `${Math.round(mw)} MW`;
}

export function typeColor(type: Datacenter['type']): string {
  switch (type) {
    case 'ai': return '#ef4444';
    case 'cloud': return '#3b82f6';
    case 'internal': return '#22c55e';
    case 'mixed': return '#f59e0b';
  }
}

export function typeLabel(type: Datacenter['type']): string {
  switch (type) {
    case 'ai': return 'AI';
    case 'cloud': return 'Cloud';
    case 'internal': return 'Internal';
    case 'mixed': return 'Mixed';
  }
}

export function statusLabel(status: Datacenter['status']): string {
  switch (status) {
    case 'operational': return 'Operational';
    case 'under_construction': return 'Under Construction';
    case 'planned': return 'Planned';
  }
}
