import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Attribute, User } from '../types';
import { DEFAULT_ATTRIBUTES, DEFAULT_USERS, MOCK_JOURNEYS } from '../data/mockData';
import type { MockJourney } from '../data/mockData';

export type POCOnboardingScenario = 'central_onboarding' | 'branch_specific_onboarding';

const STORAGE_KEYS = {
  scenarioData: 'abac_poc_scenario_data',
  scenario: 'abac_poc_scenario',
} as const;

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch { /* ignore parse errors, use fallback */ }
  return fallback;
}

function saveToStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* ignore quota errors in rare cases */ }
}

interface AppState {
  attributes: Attribute[];
  users: User[];
  journeys: MockJourney[];
  currentUser: User;
  pocOnboardingScenario: POCOnboardingScenario;
  addAttribute: (attr: Attribute) => void;
  updateAttribute: (attr: Attribute) => void;
  deleteAttribute: (id: string) => void;
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;
  addJourney: (journey: MockJourney) => void;
  setCurrentUser: (user: User) => void;
  setPocOnboardingScenario: (scenario: POCOnboardingScenario) => void;
}

const AppContext = createContext<AppState | null>(null);

interface ScenarioData {
  attributes: Attribute[];
  users: User[];
  journeys: MockJourney[];
  currentUser: User;
}

type ScenarioDataMap = Record<POCOnboardingScenario, ScenarioData>;

const clone = <T,>(data: T): T => JSON.parse(JSON.stringify(data)) as T;

const createDefaultScenarioData = (): ScenarioDataMap => {
  const seed = (): ScenarioData => ({
    attributes: clone(DEFAULT_ATTRIBUTES),
    users: clone(DEFAULT_USERS),
    journeys: clone(MOCK_JOURNEYS),
    currentUser: clone(DEFAULT_USERS[0]),
  });
  return {
    central_onboarding: seed(),
    branch_specific_onboarding: seed(),
  };
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [scenarioData, setScenarioData] = useState<ScenarioDataMap>(
    () => loadFromStorage(STORAGE_KEYS.scenarioData, createDefaultScenarioData()),
  );
  const [pocOnboardingScenario, setPocOnboardingScenario] = useState<POCOnboardingScenario>(
    () => loadFromStorage(STORAGE_KEYS.scenario, 'central_onboarding' as POCOnboardingScenario),
  );
  const activeData = scenarioData[pocOnboardingScenario] ?? createDefaultScenarioData().central_onboarding;
  const { attributes, users, journeys, currentUser } = activeData;

  useEffect(() => { saveToStorage(STORAGE_KEYS.scenarioData, scenarioData); }, [scenarioData]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.scenario, pocOnboardingScenario); }, [pocOnboardingScenario]);
  useEffect(() => {
    const userStillExists = users.some((user) => user.id === currentUser.id);
    if (userStillExists || users.length === 0) return;
    setScenarioData((prev) => ({
      ...prev,
      [pocOnboardingScenario]: {
        ...prev[pocOnboardingScenario],
        currentUser: prev[pocOnboardingScenario].users[0],
      },
    }));
  }, [users, currentUser, pocOnboardingScenario]);

  const addAttribute = useCallback((attr: Attribute) => {
    setScenarioData((prev) => ({
      ...prev,
      [pocOnboardingScenario]: {
        ...prev[pocOnboardingScenario],
        attributes: [...prev[pocOnboardingScenario].attributes, attr],
      },
    }));
  }, [pocOnboardingScenario]);

  const updateAttribute = useCallback((attr: Attribute) => {
    setScenarioData((prev) => ({
      ...prev,
      [pocOnboardingScenario]: {
        ...prev[pocOnboardingScenario],
        attributes: prev[pocOnboardingScenario].attributes.map((a) => (a.id === attr.id ? attr : a)),
      },
    }));
  }, [pocOnboardingScenario]);

  const deleteAttribute = useCallback((id: string) => {
    setScenarioData((prev) => ({
      ...prev,
      [pocOnboardingScenario]: {
        ...prev[pocOnboardingScenario],
        attributes: prev[pocOnboardingScenario].attributes.filter((a) => a.id !== id),
        users: prev[pocOnboardingScenario].users.map((u) => ({
          ...u,
          assignedAttributes: u.assignedAttributes.filter((aid) => aid !== id),
        })),
      },
    }));
  }, [pocOnboardingScenario]);

  const addUser = useCallback((user: User) => {
    setScenarioData((prev) => ({
      ...prev,
      [pocOnboardingScenario]: {
        ...prev[pocOnboardingScenario],
        users: [...prev[pocOnboardingScenario].users, user],
      },
    }));
  }, [pocOnboardingScenario]);

  const updateUser = useCallback((user: User) => {
    setScenarioData((prev) => ({
      ...prev,
      [pocOnboardingScenario]: {
        ...prev[pocOnboardingScenario],
        users: prev[pocOnboardingScenario].users.map((u) => (u.id === user.id ? user : u)),
      },
    }));
  }, [pocOnboardingScenario]);

  const deleteUser = useCallback((id: string) => {
    setScenarioData((prev) => ({
      ...prev,
      [pocOnboardingScenario]: {
        ...prev[pocOnboardingScenario],
        users: prev[pocOnboardingScenario].users.filter((u) => u.id !== id),
      },
    }));
  }, [pocOnboardingScenario]);

  const addJourney = useCallback((journey: MockJourney) => {
    setScenarioData((prev) => ({
      ...prev,
      [pocOnboardingScenario]: {
        ...prev[pocOnboardingScenario],
        journeys: [journey, ...prev[pocOnboardingScenario].journeys],
      },
    }));
  }, [pocOnboardingScenario]);

  const setCurrentUser = useCallback((user: User) => {
    setScenarioData((prev) => ({
      ...prev,
      [pocOnboardingScenario]: {
        ...prev[pocOnboardingScenario],
        currentUser: user,
      },
    }));
  }, [pocOnboardingScenario]);

  return (
    <AppContext.Provider
      value={{
        attributes,
        users,
        journeys,
        currentUser,
        pocOnboardingScenario,
        addAttribute,
        updateAttribute,
        deleteAttribute,
        addUser,
        updateUser,
        deleteUser,
        addJourney,
        setCurrentUser,
        setPocOnboardingScenario,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
