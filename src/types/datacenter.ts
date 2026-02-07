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
