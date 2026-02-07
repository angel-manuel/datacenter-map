import { useReducer, useCallback } from 'react';
import type { OverlayType } from '../types/datacenter';

export type ActiveTab = 'countries' | 'companies' | 'details';

export type DCType = 'ai' | 'cloud' | 'internal' | 'mixed';
export type DCStatus = 'operational' | 'under_construction' | 'planned';

export const ALL_TYPES: DCType[] = ['ai', 'cloud', 'internal', 'mixed'];
export const ALL_STATUSES: DCStatus[] = ['operational', 'under_construction', 'planned'];
export const ALL_OVERLAYS: OverlayType[] = ['datacenters', 'submarineCables', 'ixps', 'connections'];
export const DEFAULT_OVERLAYS: OverlayType[] = ['datacenters'];

export interface SelectionState {
  selectedCountryCode: string | null;
  selectedCompany: string | null;
  selectedDatacenterId: string | null;
  selectedCableId: string | null;
  selectedIxpId: string | null;
  activeTab: ActiveTab;
  hoveredCountryCode: string | null;
  activeTypes: Set<DCType>;
  activeStatuses: Set<DCStatus>;
  activeOverlays: Set<OverlayType>;
  mwRange: [number, number];
  selectedYear: number;
  showPlanned: boolean;
}

type Action =
  | { type: 'SELECT_COUNTRY'; code: string }
  | { type: 'SELECT_COMPANY'; company: string }
  | { type: 'SELECT_DATACENTER'; id: string; countryCode: string; company: string }
  | { type: 'SELECT_CABLE'; id: string }
  | { type: 'SELECT_IXP'; id: string }
  | { type: 'HOVER_COUNTRY'; code: string | null }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SET_TAB'; tab: ActiveTab }
  | { type: 'TOGGLE_TYPE'; dcType: DCType }
  | { type: 'TOGGLE_STATUS'; status: DCStatus }
  | { type: 'TOGGLE_OVERLAY'; overlay: OverlayType }
  | { type: 'SET_MW_RANGE'; range: [number, number] }
  | { type: 'SET_YEAR'; year: number }
  | { type: 'TOGGLE_SHOW_PLANNED' }
  | { type: 'RESET_FILTERS' };

export const MW_MIN = 0;
export const MW_MAX = 1000;

export const YEAR_MIN = 1998;
export const YEAR_MAX = 2030;
export const YEAR_DEFAULT = 2026;

const initialState: SelectionState = {
  selectedCountryCode: null,
  selectedCompany: null,
  selectedDatacenterId: null,
  selectedCableId: null,
  selectedIxpId: null,
  activeTab: 'countries',
  hoveredCountryCode: null,
  activeTypes: new Set(ALL_TYPES),
  activeStatuses: new Set(ALL_STATUSES),
  activeOverlays: new Set<OverlayType>(DEFAULT_OVERLAYS),
  mwRange: [MW_MIN, MW_MAX],
  selectedYear: YEAR_DEFAULT,
  showPlanned: true,
};

function reducer(state: SelectionState, action: Action): SelectionState {
  switch (action.type) {
    case 'SELECT_COUNTRY':
      return {
        ...state,
        selectedCountryCode: action.code === state.selectedCountryCode ? null : action.code,
        selectedCompany: null,
        selectedDatacenterId: null,
        selectedCableId: null,
        selectedIxpId: null,
        activeTab: 'countries',
        hoveredCountryCode: null,
      };
    case 'SELECT_COMPANY':
      return {
        ...state,
        selectedCompany: action.company === state.selectedCompany ? null : action.company,
        selectedCountryCode: null,
        selectedDatacenterId: null,
        selectedCableId: null,
        selectedIxpId: null,
        activeTab: 'companies',
        hoveredCountryCode: null,
      };
    case 'SELECT_DATACENTER':
      return {
        ...state,
        selectedDatacenterId: action.id === state.selectedDatacenterId ? null : action.id,
        selectedCountryCode: action.countryCode,
        selectedCompany: action.company,
        selectedCableId: null,
        selectedIxpId: null,
        activeTab: 'details',
        hoveredCountryCode: null,
      };
    case 'SELECT_CABLE':
      return {
        ...state,
        selectedCableId: action.id === state.selectedCableId ? null : action.id,
        selectedDatacenterId: null,
        selectedIxpId: null,
        activeTab: 'details',
        hoveredCountryCode: null,
      };
    case 'SELECT_IXP':
      return {
        ...state,
        selectedIxpId: action.id === state.selectedIxpId ? null : action.id,
        selectedDatacenterId: null,
        selectedCableId: null,
        activeTab: 'details',
        hoveredCountryCode: null,
      };
    case 'HOVER_COUNTRY':
      return { ...state, hoveredCountryCode: action.code };
    case 'CLEAR_SELECTION':
      return { ...initialState, activeOverlays: state.activeOverlays };
    case 'SET_TAB':
      return { ...state, activeTab: action.tab };
    case 'TOGGLE_TYPE': {
      const next = new Set(state.activeTypes);
      if (next.has(action.dcType)) {
        if (next.size > 1) next.delete(action.dcType);
      } else {
        next.add(action.dcType);
      }
      return { ...state, activeTypes: next };
    }
    case 'TOGGLE_STATUS': {
      const next = new Set(state.activeStatuses);
      if (next.has(action.status)) {
        if (next.size > 1) next.delete(action.status);
      } else {
        next.add(action.status);
      }
      return { ...state, activeStatuses: next };
    }
    case 'TOGGLE_OVERLAY': {
      const next = new Set(state.activeOverlays);
      if (next.has(action.overlay)) {
        next.delete(action.overlay);
      } else {
        next.add(action.overlay);
      }
      return { ...state, activeOverlays: next };
    }
    case 'SET_MW_RANGE':
      return { ...state, mwRange: action.range };
    case 'SET_YEAR':
      return { ...state, selectedYear: action.year };
    case 'TOGGLE_SHOW_PLANNED':
      return { ...state, showPlanned: !state.showPlanned };
    case 'RESET_FILTERS':
      return {
        ...state,
        activeTypes: new Set(ALL_TYPES),
        activeStatuses: new Set(ALL_STATUSES),
        mwRange: [MW_MIN, MW_MAX],
        selectedYear: YEAR_DEFAULT,
        showPlanned: true,
      };
    default:
      return state;
  }
}

export function useMapSelection() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const selectCountry = useCallback((code: string) => {
    dispatch({ type: 'SELECT_COUNTRY', code });
  }, []);

  const selectCompany = useCallback((company: string) => {
    dispatch({ type: 'SELECT_COMPANY', company });
  }, []);

  const selectDatacenter = useCallback((id: string, countryCode: string, company: string) => {
    dispatch({ type: 'SELECT_DATACENTER', id, countryCode, company });
  }, []);

  const hoverCountry = useCallback((code: string | null) => {
    dispatch({ type: 'HOVER_COUNTRY', code });
  }, []);

  const clearSelection = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTION' });
  }, []);

  const setTab = useCallback((tab: ActiveTab) => {
    dispatch({ type: 'SET_TAB', tab });
  }, []);

  const toggleType = useCallback((dcType: DCType) => {
    dispatch({ type: 'TOGGLE_TYPE', dcType });
  }, []);

  const toggleStatus = useCallback((status: DCStatus) => {
    dispatch({ type: 'TOGGLE_STATUS', status });
  }, []);

  const setMwRange = useCallback((range: [number, number]) => {
    dispatch({ type: 'SET_MW_RANGE', range });
  }, []);

  const setYear = useCallback((year: number) => {
    dispatch({ type: 'SET_YEAR', year });
  }, []);

  const toggleShowPlanned = useCallback(() => {
    dispatch({ type: 'TOGGLE_SHOW_PLANNED' });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: 'RESET_FILTERS' });
  }, []);

  const toggleOverlay = useCallback((overlay: OverlayType) => {
    dispatch({ type: 'TOGGLE_OVERLAY', overlay });
  }, []);

  const selectCable = useCallback((id: string) => {
    dispatch({ type: 'SELECT_CABLE', id });
  }, []);

  const selectIxp = useCallback((id: string) => {
    dispatch({ type: 'SELECT_IXP', id });
  }, []);

  return {
    state,
    selectCountry,
    selectCompany,
    selectDatacenter,
    selectCable,
    selectIxp,
    hoverCountry,
    clearSelection,
    setTab,
    toggleType,
    toggleStatus,
    toggleOverlay,
    setMwRange,
    setYear,
    toggleShowPlanned,
    resetFilters,
  };
}
