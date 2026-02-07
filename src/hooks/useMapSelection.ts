import { useReducer, useCallback } from 'react';

export type ActiveTab = 'countries' | 'companies' | 'details';

export interface SelectionState {
  selectedCountryCode: string | null;
  selectedCompany: string | null;
  selectedDatacenterId: string | null;
  activeTab: ActiveTab;
  hoveredCountryCode: string | null;
}

type Action =
  | { type: 'SELECT_COUNTRY'; code: string }
  | { type: 'SELECT_COMPANY'; company: string }
  | { type: 'SELECT_DATACENTER'; id: string; countryCode: string; company: string }
  | { type: 'HOVER_COUNTRY'; code: string | null }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SET_TAB'; tab: ActiveTab };

const initialState: SelectionState = {
  selectedCountryCode: null,
  selectedCompany: null,
  selectedDatacenterId: null,
  activeTab: 'countries',
  hoveredCountryCode: null,
};

function reducer(state: SelectionState, action: Action): SelectionState {
  switch (action.type) {
    case 'SELECT_COUNTRY':
      return {
        ...state,
        selectedCountryCode: action.code === state.selectedCountryCode ? null : action.code,
        selectedCompany: null,
        selectedDatacenterId: null,
        activeTab: 'countries',
        hoveredCountryCode: null,
      };
    case 'SELECT_COMPANY':
      return {
        ...state,
        selectedCompany: action.company === state.selectedCompany ? null : action.company,
        selectedCountryCode: null,
        selectedDatacenterId: null,
        activeTab: 'companies',
        hoveredCountryCode: null,
      };
    case 'SELECT_DATACENTER':
      return {
        ...state,
        selectedDatacenterId: action.id === state.selectedDatacenterId ? null : action.id,
        selectedCountryCode: action.countryCode,
        selectedCompany: action.company,
        activeTab: 'details',
        hoveredCountryCode: null,
      };
    case 'HOVER_COUNTRY':
      return { ...state, hoveredCountryCode: action.code };
    case 'CLEAR_SELECTION':
      return { ...initialState };
    case 'SET_TAB':
      return { ...state, activeTab: action.tab };
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

  return {
    state,
    selectCountry,
    selectCompany,
    selectDatacenter,
    hoverCountry,
    clearSelection,
    setTab,
  };
}
