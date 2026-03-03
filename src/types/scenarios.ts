import type { Attribute, User, MasterDataItem, Branch } from './index';
import type { MockJourney } from '../data/mockData';

export type ScenarioCategory =
  | 'Branch Access'
  | 'Data Isolation'
  | 'Hierarchy'
  | 'Cross-Branch'
  | 'Shared Entities'
  | 'Department Roles'
  | 'Reporting'
  | 'Default Behaviour'
  | 'External Users'
  | 'Bulk Operations'
  | 'Conflict Resolution';

export interface ScenarioExpectedOutcome {
  userId: string;
  userName: string;
  description: string;
  canSeeJourneys: number;
  canEditJourneys: number;
}

export interface ScenarioFixture {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  category: ScenarioCategory;
  priority: 'Must Have' | 'Supported';
  situation: string;
  howItWorks: string;
  keyInsight: string;
  masterDataItems: MasterDataItem[];
  branches: Branch[];
  attributes: Attribute[];
  users: User[];
  journeys: MockJourney[];
  highlightUsers: string[];
  expectedOutcomes: ScenarioExpectedOutcome[];
}
