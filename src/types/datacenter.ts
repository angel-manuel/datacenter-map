export interface Datacenter {
  id: string;
  name: string;
  owner: string;
  capacity_mw: number;
  type: 'ai' | 'cloud' | 'internal' | 'mixed';
  lat: number;
  lng: number;
  city: string;
  state: string;
  country: string;
  country_code: string;
  status: 'operational' | 'under_construction' | 'planned';
  source: string;
  notes?: string;
  year_opened: number;
}

export interface CountrySummary {
  country: string;
  country_code: string;
  count: number;
  total_mw: number;
  datacenters: Datacenter[];
}

export interface CompanySummary {
  company: string;
  count: number;
  total_mw: number;
  countries: string[];
  datacenters: Datacenter[];
}

export type OverlayType = 'datacenters' | 'submarineCables' | 'ixps' | 'connections';

export interface SubmarineCable {
  id: string;
  name: string;
  color: string;
  rfs: string | null;
  length_km: number | null;
  owners: string[];
  landing_point_ids: string[];
}

export interface LandingPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  country_code: string;
}

export interface IXP {
  id: string;
  name: string;
  city: string;
  country_code: string;
  lat: number;
  lng: number;
  participant_count: number;
}

export interface MetroConnection {
  id: string;
  from: { lat: number; lng: number; label: string };
  to: { lat: number; lng: number; label: string };
  type: 'dc-to-dc' | 'dc-to-ixp';
  owner?: string;
}
