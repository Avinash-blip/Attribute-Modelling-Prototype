import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Attribute, User, MasterDataItem, Branch } from '../types';
import type { ScenarioFixture } from '../types/scenarios';
import type { MockJourney } from '../data/mockData';
import { getScenarioById } from '../data/scenarioFixtures';

export type POCOnboardingScenario = 'central_onboarding' | 'branch_specific_onboarding';

export interface ScenarioState {
  scenario: ScenarioFixture;
  scenarioMasterDataItems: MasterDataItem[];
  scenarioBranches: Branch[];
  attributes: Attribute[];
  users: User[];
  journeys: MockJourney[];
  currentUser: User;
  pocOnboardingScenario: POCOnboardingScenario;
  setCurrentUser: (user: User) => void;
  setActiveDesk: (deskId: string) => void;
  addAttribute: (attr: Attribute) => void;
  updateAttribute: (attr: Attribute) => void;
  deleteAttribute: (id: string) => void;
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;
  addJourney: (journey: MockJourney) => void;
  setPocOnboardingScenario: (scenario: POCOnboardingScenario) => void;
}

const ScenarioContext = createContext<ScenarioState | null>(null);

const noop = () => {};
const noopWithArg = (_: unknown) => {};

export function ScenarioProvider({
  scenarioId,
  children,
}: {
  scenarioId: string;
  children: ReactNode;
}) {
  const fixture = getScenarioById(scenarioId);
  if (!fixture) throw new Error(`Scenario ${scenarioId} not found`);

  const firstUser = fixture.users[0];
  const highlightId = fixture.highlightUsers[0];
  const initialUser: User =
    (highlightId ? fixture.users.find((u) => u.id === highlightId) : undefined) ??
    firstUser ??
    ({
      id: '_placeholder',
      name: 'No user',
      email: '',
      legoActorType: 'branch_user',
      level: 'branch',
      branchId: fixture.branches[0]?.id,
      desks: [],
      activeDeskId: '',
    } as User);
  const [currentUser, setCurrentUser] = useState<User>(initialUser);

  const value: ScenarioState = {
    scenario: fixture,
    scenarioMasterDataItems: fixture.masterDataItems,
    scenarioBranches: fixture.branches,
    attributes: fixture.attributes,
    users: fixture.users,
    journeys: fixture.journeys,
    currentUser,
    pocOnboardingScenario: 'branch_specific_onboarding',
    setCurrentUser,
    setActiveDesk: (deskId: string) => setCurrentUser((prev) => ({ ...prev, activeDeskId: deskId })),
    addAttribute: noopWithArg,
    updateAttribute: noopWithArg,
    deleteAttribute: noop,
    addUser: noopWithArg,
    updateUser: noopWithArg,
    deleteUser: noop,
    addJourney: noopWithArg,
    setPocOnboardingScenario: noop,
  };

  return (
    <ScenarioContext.Provider value={value}>
      {children}
    </ScenarioContext.Provider>
  );
}

export function useScenarioContext(): ScenarioState {
  const ctx = useContext(ScenarioContext);
  if (!ctx) throw new Error('useScenarioContext must be used within ScenarioProvider');
  return ctx;
}
