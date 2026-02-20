import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Attribute, User } from '../types';
import { DEFAULT_ATTRIBUTES, DEFAULT_USERS } from '../data/mockData';

export type POCOnboardingScenario = 'central_onboarding' | 'branch_specific_onboarding';

interface AppState {
  attributes: Attribute[];
  users: User[];
  currentUser: User;
  pocOnboardingScenario: POCOnboardingScenario;
  addAttribute: (attr: Attribute) => void;
  updateAttribute: (attr: Attribute) => void;
  deleteAttribute: (id: string) => void;
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;
  setCurrentUser: (user: User) => void;
  setPocOnboardingScenario: (scenario: POCOnboardingScenario) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [attributes, setAttributes] = useState<Attribute[]>(DEFAULT_ATTRIBUTES);
  const [users, setUsers] = useState<User[]>(DEFAULT_USERS);
  const [currentUser, setCurrentUser] = useState<User>(DEFAULT_USERS[0]);
  const [pocOnboardingScenario, setPocOnboardingScenario] =
    useState<POCOnboardingScenario>('central_onboarding');

  const addAttribute = useCallback((attr: Attribute) => {
    setAttributes((prev) => [...prev, attr]);
  }, []);

  const updateAttribute = useCallback((attr: Attribute) => {
    setAttributes((prev) => prev.map((a) => (a.id === attr.id ? attr : a)));
  }, []);

  const deleteAttribute = useCallback((id: string) => {
    setAttributes((prev) => prev.filter((a) => a.id !== id));
    setUsers((prev) =>
      prev.map((u) => ({
        ...u,
        assignedAttributes: u.assignedAttributes.filter((aid) => aid !== id),
      }))
    );
  }, []);

  const addUser = useCallback((user: User) => {
    setUsers((prev) => [...prev, user]);
  }, []);

  const updateUser = useCallback((user: User) => {
    setUsers((prev) => prev.map((u) => (u.id === user.id ? user : u)));
  }, []);

  const deleteUser = useCallback((id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }, []);

  return (
    <AppContext.Provider
      value={{
        attributes,
        users,
        currentUser,
        pocOnboardingScenario,
        addAttribute,
        updateAttribute,
        deleteAttribute,
        addUser,
        updateUser,
        deleteUser,
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
