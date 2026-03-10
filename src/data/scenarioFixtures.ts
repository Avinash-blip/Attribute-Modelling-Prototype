import type { ScenarioFixture } from '../types/scenarios';
import type {
  Attribute,
  User,
  MasterDataItem,
  Branch,
  MasterDataTypeRestriction,
} from '../types';
import { MASTER_DATA_TYPE_KEYS } from '../types';
import type { MockJourney } from './mockData';

const emptyFieldMapping = { selectedFields: [] };
const created = '2026-02-01T10:00:00Z';

function buildTypeRestrictionsFromIds(
  selectedItemIds: string[],
  masterDataItems: MasterDataItem[]
): Record<string, MasterDataTypeRestriction> {
  const byType = new Map<string, string[]>();
  for (const key of MASTER_DATA_TYPE_KEYS) byType.set(key, []);
  const itemMap = new Map(masterDataItems.map((i) => [i.id, i]));
  for (const id of selectedItemIds) {
    const item = itemMap.get(id);
    if (item && byType.has(item.type)) byType.get(item.type)!.push(id);
  }
  const out: Record<string, MasterDataTypeRestriction> = {};
  for (const key of MASTER_DATA_TYPE_KEYS) {
    const ids = byType.get(key) ?? [];
    out[key] = ids.length > 0 ? { mode: 'specific', selectedItemIds: ids } : { mode: 'all', selectedItemIds: [] };
  }
  return out;
}

function attr(
  id: string,
  label: string,
  scope: 'company' | 'branch',
  selectedItemIds: string[],
  selectedBranches: string[] | 'ALL',
  masterDataItems: MasterDataItem[]
): Attribute {
  return {
    id,
    label,
    scope,
    createdBy: 'System',
    createdByUserId: 'sys',
    createdByActorType: 'company_admin',
    createdAt: created,
    masterDataMapping: {
      onboardingType: scope === 'company' ? 'company' : 'branch',
      selectedBranches,
      typeRestrictions: buildTypeRestrictionsFromIds(selectedItemIds, masterDataItems),
    },
    fieldMapping: emptyFieldMapping,
    assignedUsers: [],
  };
}

// --- Scenario 1: One Person, Two Branches, Different Permissions ---
const sc1Branches: Branch[] = [
  { id: 'sc1-br-south', name: 'Chennai (South)', code: 'CHE' },
  { id: 'sc1-br-west', name: 'Ahmedabad (West)', code: 'AHM' },
];

const sc1MasterData: MasterDataItem[] = [
  { id: 'sc1-md-r1', name: 'Chennai → Bengaluru (NH44)', type: 'routes', branch: 'sc1-br-south', onboardedAt: 'branch' },
  { id: 'sc1-md-r2', name: 'Chennai → Coimbatore', type: 'routes', branch: 'sc1-br-south', onboardedAt: 'branch' },
  { id: 'sc1-md-r3', name: 'Ahmedabad → Mumbai (NH48)', type: 'routes', branch: 'sc1-br-west', onboardedAt: 'branch' },
  { id: 'sc1-md-r4', name: 'Ahmedabad → Rajkot (NH27)', type: 'routes', branch: 'sc1-br-west', onboardedAt: 'branch' },
  { id: 'sc1-md-v1', name: 'Tata 407 (9MT)', type: 'vehicle_type_master', branch: 'sc1-br-south', onboardedAt: 'branch' },
  { id: 'sc1-md-v2', name: 'Ashok Leyland 14MT', type: 'vehicle_type_master', branch: 'sc1-br-south', onboardedAt: 'branch' },
  { id: 'sc1-md-v3', name: '9MT Eicher', type: 'vehicle_type_master', branch: 'sc1-br-west', onboardedAt: 'branch' },
  { id: 'sc1-md-v4', name: '25MT Trailer', type: 'vehicle_type_master', branch: 'sc1-br-west', onboardedAt: 'branch' },
  { id: 'sc1-md-m1', name: '12 MT Surf Excel (FMCG)', type: 'material_master', branch: 'sc1-br-south', onboardedAt: 'branch' },
  { id: 'sc1-md-m2', name: '8 MT Clinic Plus (FMCG)', type: 'material_master', branch: 'sc1-br-south', onboardedAt: 'branch' },
  { id: 'sc1-md-m3', name: '11 MT Nirma Detergent (FMCG)', type: 'material_master', branch: 'sc1-br-west', onboardedAt: 'branch' },
  { id: 'sc1-md-m4', name: '6 MT Parle Biscuits (FMCG)', type: 'material_master', branch: 'sc1-br-west', onboardedAt: 'branch' },
  { id: 'sc1-md-t1', name: 'Sri Balaji Roadlines', type: 'transporter_master', branch: 'sc1-br-south', onboardedAt: 'branch' },
  { id: 'sc1-md-t2', name: 'Southern Express', type: 'transporter_master', branch: 'sc1-br-south', onboardedAt: 'branch' },
  { id: 'sc1-md-t3', name: 'Western Cargo Movers', type: 'transporter_master', branch: 'sc1-br-west', onboardedAt: 'branch' },
  { id: 'sc1-md-t4', name: 'Gujarat Freight', type: 'transporter_master', branch: 'sc1-br-west', onboardedAt: 'branch' },
];

const sc1SouthIds = ['sc1-md-r1', 'sc1-md-r2', 'sc1-md-v1', 'sc1-md-v2', 'sc1-md-m1', 'sc1-md-m2', 'sc1-md-t1', 'sc1-md-t2'];
const sc1WestIds = ['sc1-md-r3', 'sc1-md-r4', 'sc1-md-v3', 'sc1-md-v4', 'sc1-md-m3', 'sc1-md-m4', 'sc1-md-t3', 'sc1-md-t4'];

const sc1Attributes: Attribute[] = [
  attr('sc1-attr-south', 'South Ops (Full CRUD)', 'branch', sc1SouthIds, ['sc1-br-south'], sc1MasterData),
  attr('sc1-attr-west', 'West Monitor (Read-Only)', 'branch', sc1WestIds, ['sc1-br-west'], sc1MasterData),
];

const sc1Users: User[] = [
  { id: 'sc1-user-ramesh', name: 'Ramesh', email: 'ramesh@company.com', legoActorType: 'company_user', level: 'company', desks: [{ id: 'sc1-desk-south-ops', name: 'South Operations', roleId: 'role-ops-manager', attributeIds: ['sc1-attr-south'] }, { id: 'sc1-desk-west-monitor', name: 'West Monitoring', roleId: 'role-supervisor', attributeIds: ['sc1-attr-west'] }], activeDeskId: 'sc1-desk-south-ops' },
  { id: 'sc1-user-south', name: 'South Ops User', email: 'south@company.com', legoActorType: 'branch_user', level: 'branch', branchId: 'sc1-br-south', desks: [{ id: 'sc1-desk-south-only', name: 'South Ops', roleId: 'role-ops-manager', attributeIds: ['sc1-attr-south'] }], activeDeskId: 'sc1-desk-south-only' },
  { id: 'sc1-user-west', name: 'West Ops User', email: 'west@company.com', legoActorType: 'branch_user', level: 'branch', branchId: 'sc1-br-west', desks: [{ id: 'sc1-desk-west-only', name: 'West Monitor', roleId: 'role-finance', attributeIds: ['sc1-attr-west'] }], activeDeskId: 'sc1-desk-west-only' },
];

const sc1Journeys: MockJourney[] = [
  { id: 'sc1-jrn-001', branchId: 'sc1-br-south', from: 'Chennai', to: 'Bengaluru', routeItemId: 'sc1-md-r1', vehicleNumber: 'TN07AB1234', vehicleType: 'Tata 407 (9MT)', vehicleTypeItemId: 'sc1-md-v1', materialItemId: 'sc1-md-m1', transporterItemId: 'sc1-md-t1', sim: true, gps: true, phone: '9876543210', slaStatus: 'On Time', eta: '06:00 pm', alert: null, alertTime: null, attribute: 'sc1-attr-south' },
  { id: 'sc1-jrn-002', branchId: 'sc1-br-south', from: 'Chennai', to: 'Coimbatore', routeItemId: 'sc1-md-r2', vehicleNumber: 'TN07CD5678', vehicleType: 'Ashok Leyland 14MT', vehicleTypeItemId: 'sc1-md-v2', materialItemId: 'sc1-md-m2', transporterItemId: 'sc1-md-t2', sim: true, gps: false, phone: '9123456789', slaStatus: 'On Time', eta: '04:00 pm', alert: null, alertTime: null, attribute: 'sc1-attr-south' },
  { id: 'sc1-jrn-003', branchId: 'sc1-br-south', from: 'Bengaluru', to: 'Chennai', routeItemId: 'sc1-md-r1', vehicleNumber: 'KA01EF9012', vehicleType: 'Tata 407 (9MT)', vehicleTypeItemId: 'sc1-md-v1', materialItemId: 'sc1-md-m1', transporterItemId: 'sc1-md-t1', sim: false, gps: true, phone: '9988776655', slaStatus: 'At Risk', eta: '08:00 pm', alert: 'Delay', alertTime: '1 hr ago', attribute: 'sc1-attr-south' },
  { id: 'sc1-jrn-004', branchId: 'sc1-br-south', from: 'Coimbatore', to: 'Bengaluru', routeItemId: 'sc1-md-r2', vehicleNumber: 'TN09GH3456', vehicleType: 'Ashok Leyland 14MT', vehicleTypeItemId: 'sc1-md-v2', materialItemId: 'sc1-md-m2', transporterItemId: 'sc1-md-t2', sim: true, gps: true, phone: '9871234560', slaStatus: 'On Time', eta: '02:00 pm', alert: null, alertTime: null, attribute: 'sc1-attr-south' },
  { id: 'sc1-jrn-005', branchId: 'sc1-br-west', from: 'Ahmedabad', to: 'Mumbai', routeItemId: 'sc1-md-r3', vehicleNumber: 'GJ01CD5678', vehicleType: '9MT Eicher', vehicleTypeItemId: 'sc1-md-v3', materialItemId: 'sc1-md-m3', transporterItemId: 'sc1-md-t3', sim: true, gps: true, phone: '9567890123', slaStatus: 'On Time', eta: '06:30 pm', alert: null, alertTime: null, attribute: 'sc1-attr-west' },
  { id: 'sc1-jrn-006', branchId: 'sc1-br-west', from: 'Ahmedabad', to: 'Rajkot', routeItemId: 'sc1-md-r4', vehicleNumber: 'GJ03IJ7890', vehicleType: '25MT Trailer', vehicleTypeItemId: 'sc1-md-v4', materialItemId: 'sc1-md-m4', transporterItemId: 'sc1-md-t4', sim: false, gps: true, phone: '9345678901', slaStatus: 'Delayed', eta: '05:00 pm', alert: 'Route deviation', alertTime: '30 min ago', attribute: 'sc1-attr-west' },
  { id: 'sc1-jrn-007', branchId: 'sc1-br-west', from: 'Mumbai', to: 'Ahmedabad', routeItemId: 'sc1-md-r3', vehicleNumber: 'MH02KL2345', vehicleType: '9MT Eicher', vehicleTypeItemId: 'sc1-md-v3', materialItemId: 'sc1-md-m3', transporterItemId: 'sc1-md-t3', sim: true, gps: true, phone: '9009876543', slaStatus: 'On Time', eta: '09:00 pm', alert: null, alertTime: null, attribute: 'sc1-attr-west' },
  { id: 'sc1-jrn-008', branchId: 'sc1-br-west', from: 'Rajkot', to: 'Ahmedabad', routeItemId: 'sc1-md-r4', vehicleNumber: 'GJ06MN6789', vehicleType: '25MT Trailer', vehicleTypeItemId: 'sc1-md-v4', materialItemId: 'sc1-md-m4', transporterItemId: 'sc1-md-t4', sim: true, gps: false, phone: '9876543210', slaStatus: 'At Risk', eta: '07:00 pm', alert: null, alertTime: null, attribute: 'sc1-attr-west' },
];

const scenario1: ScenarioFixture = {
  id: 'scenario-1',
  number: 1,
  title: 'One Person, Two Branches, Different Permissions',
  subtitle: 'Same user has full access in one branch, view-only in another. Switch desks to change context.',
  category: 'Branch Access',
  priority: 'Must Have',
  situation: 'A regional controller works across two branches with different roles — active operations in one, monitoring only in the other.',
  howItWorks: 'Two attributes are created: one with full CRUD for South branch items, one with read-only for West branch items. The user is assigned both.',
  keyInsight: 'One person can have different permission levels in different branches via multiple attribute assignments.',
  masterDataItems: sc1MasterData,
  branches: sc1Branches,
  attributes: sc1Attributes,
  users: sc1Users,
  journeys: sc1Journeys,
  highlightUsers: ['sc1-user-ramesh', 'sc1-user-south', 'sc1-user-west'],
  expectedOutcomes: [
    { userId: 'sc1-user-ramesh', userName: 'Ramesh', description: 'Sees all 8 journeys; can edit 4 South, Edit disabled on 4 West', canSeeJourneys: 8, canEditJourneys: 4 },
    { userId: 'sc1-user-south', userName: 'South Ops User', description: 'Sees and can edit 4 South journeys only', canSeeJourneys: 4, canEditJourneys: 4 },
    { userId: 'sc1-user-west', userName: 'West Ops User', description: 'Sees 4 West journeys; Edit disabled (read-only)', canSeeJourneys: 4, canEditJourneys: 0 },
  ],
};

// --- Scenario 2: Two Teams in Same Branch, Separate Data ---
const sc2Branches: Branch[] = [{ id: 'sc2-br-mum', name: 'Mumbai HQ', code: 'MUM' }];

const sc2MasterData: MasterDataItem[] = [
  { id: 'sc2-md-r1', name: 'Mumbai → Pune (Expressway)', type: 'routes', branch: 'sc2-br-mum', onboardedAt: 'branch' },
  { id: 'sc2-md-r2', name: 'Mumbai → Nashik (NH3)', type: 'routes', branch: 'sc2-br-mum', onboardedAt: 'branch' },
  { id: 'sc2-md-v1', name: 'MH-04 9MT Eicher', type: 'vehicle_type_master', branch: 'sc2-br-mum', onboardedAt: 'branch' },
  { id: 'sc2-md-v2', name: 'MH-04 25MT Trailer', type: 'vehicle_type_master', branch: 'sc2-br-mum', onboardedAt: 'branch' },
  { id: 'sc2-md-m1', name: '7 MT Maggi Noodles (FMCG)', type: 'material_master', branch: 'sc2-br-mum', onboardedAt: 'branch' },
  { id: 'sc2-md-m2', name: '5 MT Surf Excel (FMCG)', type: 'material_master', branch: 'sc2-br-mum', onboardedAt: 'branch' },
  { id: 'sc2-md-m3', name: '22 MT UltraTech Cement', type: 'material_master', branch: 'sc2-br-mum', onboardedAt: 'branch' },
  { id: 'sc2-md-m4', name: '18 MT ACC Cement', type: 'material_master', branch: 'sc2-br-mum', onboardedAt: 'branch' },
  { id: 'sc2-md-t1', name: 'Shreeji Transport Co.', type: 'transporter_master', branch: 'sc2-br-mum', onboardedAt: 'branch' },
  { id: 'sc2-md-t2', name: 'Navneet Roadways', type: 'transporter_master', branch: 'sc2-br-mum', onboardedAt: 'branch' },
];

const sc2SharedIds = ['sc2-md-r1', 'sc2-md-r2', 'sc2-md-v1', 'sc2-md-v2', 'sc2-md-t1', 'sc2-md-t2'];
const sc2FmcgIds = [...sc2SharedIds, 'sc2-md-m1', 'sc2-md-m2'];
const sc2CementIds = [...sc2SharedIds, 'sc2-md-m3', 'sc2-md-m4'];

const sc2Attributes: Attribute[] = [
  attr('sc2-attr-fmcg', 'FMCG Team', 'branch', sc2FmcgIds, ['sc2-br-mum'], sc2MasterData),
  attr('sc2-attr-cement', 'Cement Team', 'branch', sc2CementIds, ['sc2-br-mum'], sc2MasterData),
];

const sc2Users: User[] = [
  { id: 'sc2-user-pooja', name: 'Pooja', email: 'pooja@company.com', legoActorType: 'branch_user', level: 'branch', branchId: 'sc2-br-mum', desks: [{ id: 'sc2-desk-fmcg', name: 'FMCG Ops', roleId: 'role-ops-manager', attributeIds: ['sc2-attr-fmcg'] }], activeDeskId: 'sc2-desk-fmcg' },
  { id: 'sc2-user-vikrant', name: 'Vikrant', email: 'vikrant@company.com', legoActorType: 'branch_user', level: 'branch', branchId: 'sc2-br-mum', desks: [{ id: 'sc2-desk-cement', name: 'Cement Ops', roleId: 'role-ops-manager', attributeIds: ['sc2-attr-cement'] }], activeDeskId: 'sc2-desk-cement' },
];

const sc2Journeys: MockJourney[] = [
  { id: 'sc2-jrn-001', branchId: 'sc2-br-mum', from: 'Mumbai', to: 'Pune', routeItemId: 'sc2-md-r1', vehicleNumber: 'MH04EF3344', vehicleType: 'MH-04 9MT Eicher', vehicleTypeItemId: 'sc2-md-v1', materialItemId: 'sc2-md-m1', transporterItemId: 'sc2-md-t1', sim: true, gps: true, phone: '9876543210', slaStatus: 'On Time', eta: '04:00 pm', alert: null, alertTime: null, attribute: 'sc2-attr-fmcg' },
  { id: 'sc2-jrn-002', branchId: 'sc2-br-mum', from: 'Pune', to: 'Mumbai', routeItemId: 'sc2-md-r1', vehicleNumber: 'MH04GH7788', vehicleType: 'MH-04 25MT Trailer', vehicleTypeItemId: 'sc2-md-v2', materialItemId: 'sc2-md-m2', transporterItemId: 'sc2-md-t1', sim: true, gps: false, phone: '9123456789', slaStatus: 'On Time', eta: '06:00 pm', alert: null, alertTime: null, attribute: 'sc2-attr-fmcg' },
  { id: 'sc2-jrn-003', branchId: 'sc2-br-mum', from: 'Mumbai', to: 'Nashik', routeItemId: 'sc2-md-r2', vehicleNumber: 'MH04EF3344', vehicleType: 'MH-04 9MT Eicher', vehicleTypeItemId: 'sc2-md-v1', materialItemId: 'sc2-md-m1', transporterItemId: 'sc2-md-t2', sim: false, gps: true, phone: '9988776655', slaStatus: 'At Risk', eta: '08:00 pm', alert: 'Delay', alertTime: '1 hr ago', attribute: 'sc2-attr-fmcg' },
  { id: 'sc2-jrn-004', branchId: 'sc2-br-mum', from: 'Nashik', to: 'Mumbai', routeItemId: 'sc2-md-r2', vehicleNumber: 'MH04GH7788', vehicleType: 'MH-04 25MT Trailer', vehicleTypeItemId: 'sc2-md-v2', materialItemId: 'sc2-md-m2', transporterItemId: 'sc2-md-t2', sim: true, gps: true, phone: '9871234560', slaStatus: 'On Time', eta: '02:00 pm', alert: null, alertTime: null, attribute: 'sc2-attr-fmcg' },
  { id: 'sc2-jrn-005', branchId: 'sc2-br-mum', from: 'Mumbai', to: 'Pune', routeItemId: 'sc2-md-r1', vehicleNumber: 'MH04IJ9012', vehicleType: 'MH-04 9MT Eicher', vehicleTypeItemId: 'sc2-md-v1', materialItemId: 'sc2-md-m3', transporterItemId: 'sc2-md-t1', sim: true, gps: true, phone: '9567890123', slaStatus: 'On Time', eta: '05:00 pm', alert: null, alertTime: null, attribute: 'sc2-attr-cement' },
  { id: 'sc2-jrn-006', branchId: 'sc2-br-mum', from: 'Mumbai', to: 'Nashik', routeItemId: 'sc2-md-r2', vehicleNumber: 'MH04KL3456', vehicleType: 'MH-04 25MT Trailer', vehicleTypeItemId: 'sc2-md-v2', materialItemId: 'sc2-md-m4', transporterItemId: 'sc2-md-t2', sim: true, gps: true, phone: '9345678901', slaStatus: 'Delayed', eta: '07:00 pm', alert: 'Breakdown', alertTime: '30 min ago', attribute: 'sc2-attr-cement' },
  { id: 'sc2-jrn-007', branchId: 'sc2-br-mum', from: 'Pune', to: 'Nashik', routeItemId: 'sc2-md-r1', vehicleNumber: 'MH04EF3344', vehicleType: 'MH-04 9MT Eicher', vehicleTypeItemId: 'sc2-md-v1', materialItemId: 'sc2-md-m3', transporterItemId: 'sc2-md-t1', sim: false, gps: true, phone: '9009876543', slaStatus: 'On Time', eta: '09:00 pm', alert: null, alertTime: null, attribute: 'sc2-attr-cement' },
  { id: 'sc2-jrn-008', branchId: 'sc2-br-mum', from: 'Nashik', to: 'Pune', routeItemId: 'sc2-md-r2', vehicleNumber: 'MH04GH7788', vehicleType: 'MH-04 25MT Trailer', vehicleTypeItemId: 'sc2-md-v2', materialItemId: 'sc2-md-m4', transporterItemId: 'sc2-md-t2', sim: true, gps: false, phone: '9876543210', slaStatus: 'At Risk', eta: '11:00 pm', alert: null, alertTime: null, attribute: 'sc2-attr-cement' },
];

const scenario2: ScenarioFixture = {
  id: 'scenario-2',
  number: 2,
  title: 'Two Teams in Same Branch, Separate Data',
  subtitle: 'Two teams in one office see only their own shipments',
  category: 'Data Isolation',
  priority: 'Must Have',
  situation: 'Two teams in the same branch handle different goods. Each team must only see their own journeys; shared vehicles do not leak data.',
  howItWorks: 'Two attributes share routes and vehicles but differ on materials (FMCG vs Cement). Journey visibility is determined by material permission.',
  keyInsight: 'Data isolation is by attribute scope — shared master data does not grant cross-team visibility.',
  masterDataItems: sc2MasterData,
  branches: sc2Branches,
  attributes: sc2Attributes,
  users: sc2Users,
  journeys: sc2Journeys,
  highlightUsers: ['sc2-user-pooja', 'sc2-user-vikrant'],
  expectedOutcomes: [
    { userId: 'sc2-user-pooja', userName: 'Pooja', description: 'Sees only 4 FMCG journeys', canSeeJourneys: 4, canEditJourneys: 4 },
    { userId: 'sc2-user-vikrant', userName: 'Vikrant', description: 'Sees only 4 Cement journeys', canSeeJourneys: 4, canEditJourneys: 4 },
  ],
};

// --- Scenario 25: Internal Stock Transfer (Cross-Branch Indent) ---
const sc25Branches: Branch[] = [
  { id: 'sc25-br-nashik', name: 'Diageo Nashik Distillery', code: 'NSK' },
  { id: 'sc25-br-aurangabad', name: 'Diageo Aurangabad Warehouse', code: 'AUR' },
];

const sc25AurAllIds = [
  'sc25-rt-aur-1', 'sc25-rt-aur-2', 'sc25-rt-aur-3',
  'sc25-vt-aur-1', 'sc25-vt-aur-2', 'sc25-vt-aur-3',
  'sc25-mt-aur-1', 'sc25-mt-aur-2', 'sc25-mt-aur-3',
  'sc25-tp-aur-1', 'sc25-tp-aur-2',
];
const sc25NskTransferIds = ['sc25-rt-aur-1', 'sc25-vt-aur-1', 'sc25-vt-aur-2', 'sc25-mt-aur-1', 'sc25-mt-aur-2', 'sc25-tp-aur-1'];
const sc25NskAllIds = ['sc25-rt-nsk-1', 'sc25-rt-nsk-2', 'sc25-vt-nsk-1', 'sc25-mt-nsk-1', 'sc25-tp-nsk-1'];

const sc25MasterData: MasterDataItem[] = [
  { id: 'sc25-rt-aur-1', name: 'Aurangabad → Nashik (NH222)', type: 'routes', branch: 'sc25-br-aurangabad', onboardedAt: 'branch' },
  { id: 'sc25-rt-aur-2', name: 'Aurangabad → Pune (NH60)', type: 'routes', branch: 'sc25-br-aurangabad', onboardedAt: 'branch' },
  { id: 'sc25-rt-aur-3', name: 'Aurangabad → Mumbai (NH753)', type: 'routes', branch: 'sc25-br-aurangabad', onboardedAt: 'branch' },
  { id: 'sc25-vt-aur-1', name: '14MT Ashok Leyland (Covered)', type: 'vehicle_type_master', branch: 'sc25-br-aurangabad', onboardedAt: 'branch' },
  { id: 'sc25-vt-aur-2', name: '20MT Trailer (Open)', type: 'vehicle_type_master', branch: 'sc25-br-aurangabad', onboardedAt: 'branch' },
  { id: 'sc25-vt-aur-3', name: '9MT Tata 407', type: 'vehicle_type_master', branch: 'sc25-br-aurangabad', onboardedAt: 'branch' },
  { id: 'sc25-mt-aur-1', name: 'Barley Malt (Raw Material)', type: 'material_master', branch: 'sc25-br-aurangabad', onboardedAt: 'branch' },
  { id: 'sc25-mt-aur-2', name: 'Glass Bottles (Packaging)', type: 'material_master', branch: 'sc25-br-aurangabad', onboardedAt: 'branch' },
  { id: 'sc25-mt-aur-3', name: 'Corrugated Cartons', type: 'material_master', branch: 'sc25-br-aurangabad', onboardedAt: 'branch' },
  { id: 'sc25-tp-aur-1', name: 'Deccan Express Logistics', type: 'transporter_master', branch: 'sc25-br-aurangabad', onboardedAt: 'branch' },
  { id: 'sc25-tp-aur-2', name: 'Sahyadri Transport Co.', type: 'transporter_master', branch: 'sc25-br-aurangabad', onboardedAt: 'branch' },
  { id: 'sc25-rt-nsk-1', name: 'Nashik → Mumbai (NH3)', type: 'routes', branch: 'sc25-br-nashik', onboardedAt: 'branch' },
  { id: 'sc25-rt-nsk-2', name: 'Nashik → Pune (NH60)', type: 'routes', branch: 'sc25-br-nashik', onboardedAt: 'branch' },
  { id: 'sc25-vt-nsk-1', name: '14MT Ashok Leyland (Covered)', type: 'vehicle_type_master', branch: 'sc25-br-nashik', onboardedAt: 'branch' },
  { id: 'sc25-mt-nsk-1', name: 'Blended Whiskey (Finished Goods)', type: 'material_master', branch: 'sc25-br-nashik', onboardedAt: 'branch' },
  { id: 'sc25-tp-nsk-1', name: 'Western Cargo Movers', type: 'transporter_master', branch: 'sc25-br-nashik', onboardedAt: 'branch' },
];

const sc25Attributes: Attribute[] = [
  { ...attr('sc25-attr-nsk-transfer', 'Nashik Stock Transfer Access', 'company', sc25NskTransferIds, ['sc25-br-aurangabad'], sc25MasterData), description: 'Selective access to Aurangabad warehouse data for stock transfer indents to Nashik' },
  { ...attr('sc25-attr-aur-ops', 'Aurangabad Warehouse Ops', 'branch', sc25AurAllIds, ['sc25-br-aurangabad'], sc25MasterData), description: 'Full access to all Aurangabad warehouse master data' },
  { ...attr('sc25-attr-nsk-ops', 'Nashik Distillery Ops', 'branch', sc25NskAllIds, ['sc25-br-nashik'], sc25MasterData), description: 'Full access to all Nashik distillery master data' },
];

const sc25Users: User[] = [
  { id: 'sc25-user-nsk-ops', name: 'Amit (Nashik Distillery Ops)', email: 'amit@diageo.com', legoActorType: 'branch_user', level: 'branch', branchId: 'sc25-br-nashik', desks: [{ id: 'sc25-desk-nsk-transfer', name: 'Nashik Ops + Transfer', roleId: 'role-ops-manager', attributeIds: ['sc25-attr-nsk-transfer', 'sc25-attr-nsk-ops'] }], activeDeskId: 'sc25-desk-nsk-transfer' },
  { id: 'sc25-user-aur-ops', name: 'Sneha (Aurangabad Warehouse Ops)', email: 'sneha@diageo.com', legoActorType: 'branch_user', level: 'branch', branchId: 'sc25-br-aurangabad', desks: [{ id: 'sc25-desk-aur-ops', name: 'Aurangabad Warehouse', roleId: 'role-supervisor', attributeIds: ['sc25-attr-aur-ops'] }], activeDeskId: 'sc25-desk-aur-ops' },
  { id: 'sc25-user-aur-mgr', name: 'Deepak (Aurangabad Warehouse Manager)', email: 'deepak@diageo.com', legoActorType: 'branch_user', level: 'branch', branchId: 'sc25-br-aurangabad', desks: [{ id: 'sc25-desk-aur-mgr', name: 'Aurangabad Warehouse', roleId: 'role-supervisor', attributeIds: ['sc25-attr-aur-ops'] }], activeDeskId: 'sc25-desk-aur-mgr' },
];

const sc25Journeys: MockJourney[] = [
  { id: 'sc25-jrn-001', branchId: 'sc25-br-aurangabad', from: 'Aurangabad', to: 'Nashik', routeItemId: 'sc25-rt-aur-1', vehicleNumber: 'MH-20-AB-4521', vehicleType: '14MT Ashok Leyland (Covered)', vehicleTypeItemId: 'sc25-vt-aur-1', materialItemId: 'sc25-mt-aur-1', transporterItemId: 'sc25-tp-aur-1', sim: true, gps: true, phone: '9876543210', slaStatus: 'On Time', eta: '05:30 pm', alert: null, alertTime: null, attribute: 'sc25-attr-nsk-transfer' },
  { id: 'sc25-jrn-002', branchId: 'sc25-br-aurangabad', from: 'Aurangabad', to: 'Nashik', routeItemId: 'sc25-rt-aur-1', vehicleNumber: 'MH-20-CD-7834', vehicleType: '20MT Trailer (Open)', vehicleTypeItemId: 'sc25-vt-aur-2', materialItemId: 'sc25-mt-aur-2', transporterItemId: 'sc25-tp-aur-1', sim: true, gps: false, phone: '9123456789', slaStatus: 'At Risk', eta: '06:45 pm', alert: null, alertTime: null, attribute: 'sc25-attr-nsk-transfer' },
  { id: 'sc25-jrn-003', branchId: 'sc25-br-aurangabad', from: 'Aurangabad', to: 'Nashik', routeItemId: 'sc25-rt-aur-1', vehicleNumber: 'MH-20-EF-2198', vehicleType: '14MT Ashok Leyland (Covered)', vehicleTypeItemId: 'sc25-vt-aur-1', materialItemId: 'sc25-mt-aur-1', transporterItemId: 'sc25-tp-aur-1', sim: false, gps: true, phone: '9988776655', slaStatus: 'On Time', eta: '04:00 pm', alert: null, alertTime: null, attribute: 'sc25-attr-nsk-transfer' },
  { id: 'sc25-jrn-004', branchId: 'sc25-br-aurangabad', from: 'Aurangabad', to: 'Nashik', routeItemId: 'sc25-rt-aur-1', vehicleNumber: 'MH-20-GH-5567', vehicleType: '20MT Trailer (Open)', vehicleTypeItemId: 'sc25-vt-aur-2', materialItemId: 'sc25-mt-aur-2', transporterItemId: 'sc25-tp-aur-1', sim: true, gps: true, phone: '9871234560', slaStatus: 'Delayed', eta: '07:15 pm', alert: 'Delay at Sinnar toll', alertTime: '2 hrs ago', attribute: 'sc25-attr-nsk-transfer' },
  { id: 'sc25-jrn-005', branchId: 'sc25-br-aurangabad', from: 'Aurangabad', to: 'Nashik', routeItemId: 'sc25-rt-aur-1', vehicleNumber: 'MH-20-IJ-8892', vehicleType: '14MT Ashok Leyland (Covered)', vehicleTypeItemId: 'sc25-vt-aur-1', materialItemId: 'sc25-mt-aur-1', transporterItemId: 'sc25-tp-aur-1', sim: true, gps: true, phone: '9567890123', slaStatus: 'On Time', eta: '05:00 pm', alert: null, alertTime: null, attribute: 'sc25-attr-nsk-transfer' },
  { id: 'sc25-jrn-006', branchId: 'sc25-br-aurangabad', from: 'Aurangabad', to: 'Pune', routeItemId: 'sc25-rt-aur-2', vehicleNumber: 'MH-20-KL-3345', vehicleType: '9MT Tata 407', vehicleTypeItemId: 'sc25-vt-aur-3', materialItemId: 'sc25-mt-aur-3', transporterItemId: 'sc25-tp-aur-2', sim: true, gps: true, phone: '9345678901', slaStatus: 'On Time', eta: '03:30 pm', alert: null, alertTime: null, attribute: 'sc25-attr-aur-ops' },
  { id: 'sc25-jrn-007', branchId: 'sc25-br-aurangabad', from: 'Aurangabad', to: 'Mumbai', routeItemId: 'sc25-rt-aur-3', vehicleNumber: 'MH-20-MN-6789', vehicleType: '9MT Tata 407', vehicleTypeItemId: 'sc25-vt-aur-3', materialItemId: 'sc25-mt-aur-3', transporterItemId: 'sc25-tp-aur-2', sim: false, gps: true, phone: '9009876543', slaStatus: 'At Risk', eta: '08:00 pm', alert: null, alertTime: null, attribute: 'sc25-attr-aur-ops' },
  { id: 'sc25-jrn-008', branchId: 'sc25-br-aurangabad', from: 'Aurangabad', to: 'Pune', routeItemId: 'sc25-rt-aur-2', vehicleNumber: 'MH-20-PQ-1122', vehicleType: '14MT Ashok Leyland (Covered)', vehicleTypeItemId: 'sc25-vt-aur-1', materialItemId: 'sc25-mt-aur-1', transporterItemId: 'sc25-tp-aur-2', sim: true, gps: false, phone: '9876543210', slaStatus: 'On Time', eta: '02:45 pm', alert: null, alertTime: null, attribute: 'sc25-attr-aur-ops' },
  { id: 'sc25-jrn-009', branchId: 'sc25-br-nashik', from: 'Nashik', to: 'Mumbai', routeItemId: 'sc25-rt-nsk-1', vehicleNumber: 'MH-15-ST-4455', vehicleType: '14MT Ashok Leyland (Covered)', vehicleTypeItemId: 'sc25-vt-nsk-1', materialItemId: 'sc25-mt-nsk-1', transporterItemId: 'sc25-tp-nsk-1', sim: true, gps: true, phone: '9876500015', slaStatus: 'On Time', eta: '06:30 pm', alert: null, alertTime: null, attribute: 'sc25-attr-nsk-ops' },
  { id: 'sc25-jrn-010', branchId: 'sc25-br-nashik', from: 'Nashik', to: 'Pune', routeItemId: 'sc25-rt-nsk-2', vehicleNumber: 'MH-15-UV-7788', vehicleType: '14MT Ashok Leyland (Covered)', vehicleTypeItemId: 'sc25-vt-nsk-1', materialItemId: 'sc25-mt-nsk-1', transporterItemId: 'sc25-tp-nsk-1', sim: true, gps: true, phone: '9876500016', slaStatus: 'On Time', eta: '04:15 pm', alert: null, alertTime: null, attribute: 'sc25-attr-nsk-ops' },
];

const scenario25: ScenarioFixture = {
  id: 'scenario-3',
  number: 3,
  title: 'Internal Stock Transfer Indent',
  subtitle: 'Branch raises indent to receive goods from another branch using their master data',
  category: 'Cross-Branch',
  priority: 'Must Have',
  situation: "Diageo's Nashik distillery needs raw materials stored at the Aurangabad warehouse. The Nashik team raises an indent on behalf of their branch, requesting specific goods to be shipped from Aurangabad. They can only use the routes, vehicles, materials, and transporters from Aurangabad that they have been given access to. The Aurangabad team can view and edit these transfer indents to accept or modify them, but Nashik cannot touch Aurangabad's other internal shipments.",
  howItWorks: "The Nashik team gets a cross-branch attribute with access to selected Aurangabad master data. They raise indents using that data. The Aurangabad team has their own attribute covering all Aurangabad data with read and update permissions, so they can view and approve the transfer requests. Nashik also has their own branch attribute for their outbound shipments. Each branch's internal operations remain invisible to the other.",
  keyInsight: "Cross-branch attributes let one branch raise indents using another branch's master data while keeping each branch's internal operations private.",
  masterDataItems: sc25MasterData,
  branches: sc25Branches,
  attributes: sc25Attributes,
  users: sc25Users,
  journeys: sc25Journeys,
  highlightUsers: ['sc25-user-nsk-ops', 'sc25-user-aur-ops', 'sc25-user-aur-mgr'],
  expectedOutcomes: [
    { userId: 'sc25-user-nsk-ops', userName: 'Amit (Nashik Distillery Ops)', description: 'Sees 5 stock transfer journeys + 2 own Nashik journeys. Can edit all 7. Cannot see Aurangabad internal shipments.', canSeeJourneys: 7, canEditJourneys: 7 },
    { userId: 'sc25-user-aur-ops', userName: 'Sneha (Aurangabad Warehouse Ops)', description: 'Sees all 8 Aurangabad journeys (transfer + internal). Can edit all 8 (read+update). Cannot see Nashik outbound.', canSeeJourneys: 8, canEditJourneys: 8 },
    { userId: 'sc25-user-aur-mgr', userName: 'Deepak (Aurangabad Warehouse Manager)', description: 'Same as Sneha — sees all 8 Aurangabad journeys, can edit all 8.', canSeeJourneys: 8, canEditJourneys: 8 },
  ],
};

// --- Scenario 3: Business Head vs Regional Head (Hierarchy) ---
const sc3Branches: Branch[] = [{ id: 'sc3-br-spd', name: 'SPD', code: 'SPD' }];

const sc3NorthIds = ['sc3-md-rn1', 'sc3-md-rn2', 'sc3-md-vn1', 'sc3-md-mn1', 'sc3-md-tn1'];
const sc3SouthIds = ['sc3-md-rs1', 'sc3-md-rs2', 'sc3-md-vs1', 'sc3-md-ms1', 'sc3-md-ts1'];
const sc3EastIds = ['sc3-md-re1', 'sc3-md-re2', 'sc3-md-ve1', 'sc3-md-me1', 'sc3-md-te1'];
const sc3WestIds = ['sc3-md-rw1', 'sc3-md-rw2', 'sc3-md-vw1', 'sc3-md-mw1', 'sc3-md-tw1'];
const sc3AllIds = [...sc3NorthIds, ...sc3SouthIds, ...sc3EastIds, ...sc3WestIds];

const sc3MasterData: MasterDataItem[] = [
  { id: 'sc3-md-rn1', name: 'Delhi → Jaipur (NH48)', type: 'routes', branch: 'sc3-br-spd', onboardedAt: 'branch' },
  { id: 'sc3-md-rn2', name: 'Delhi → Dehradun', type: 'routes', branch: 'sc3-br-spd', onboardedAt: 'branch' },
  { id: 'sc3-md-rs1', name: 'Hyderabad → Vijayawada', type: 'routes', branch: 'sc3-br-spd', onboardedAt: 'branch' },
  { id: 'sc3-md-rs2', name: 'Bengaluru → Mysuru', type: 'routes', branch: 'sc3-br-spd', onboardedAt: 'branch' },
  { id: 'sc3-md-re1', name: 'Kolkata → Patna', type: 'routes', branch: 'sc3-br-spd', onboardedAt: 'branch' },
  { id: 'sc3-md-re2', name: 'Bhubaneswar → Ranchi', type: 'routes', branch: 'sc3-br-spd', onboardedAt: 'branch' },
  { id: 'sc3-md-rw1', name: 'Mumbai → Pune', type: 'routes', branch: 'sc3-br-spd', onboardedAt: 'branch' },
  { id: 'sc3-md-rw2', name: 'Ahmedabad → Vadodara', type: 'routes', branch: 'sc3-br-spd', onboardedAt: 'branch' },
  { id: 'sc3-md-vn1', name: 'DL-01 Tata 407', type: 'vehicle_type_master', branch: 'sc3-br-spd', onboardedAt: 'branch' },
  { id: 'sc3-md-vs1', name: 'TS-08 Ashok Leyland', type: 'vehicle_type_master', branch: 'sc3-br-spd', onboardedAt: 'branch' },
  { id: 'sc3-md-ve1', name: 'WB-02 Eicher', type: 'vehicle_type_master', branch: 'sc3-br-spd', onboardedAt: 'branch' },
  { id: 'sc3-md-vw1', name: 'MH-12 Trailer', type: 'vehicle_type_master', branch: 'sc3-br-spd', onboardedAt: 'branch' },
  { id: 'sc3-md-mn1', name: '10 MT ACC Cement', type: 'material_master', branch: 'sc3-br-spd', onboardedAt: 'branch' },
  { id: 'sc3-md-ms1', name: '8 MT Ambuja Cement', type: 'material_master', branch: 'sc3-br-spd', onboardedAt: 'branch' },
  { id: 'sc3-md-me1', name: '14 MT Birla Cement', type: 'material_master', branch: 'sc3-br-spd', onboardedAt: 'branch' },
  { id: 'sc3-md-mw1', name: '12 MT JK Cement', type: 'material_master', branch: 'sc3-br-spd', onboardedAt: 'branch' },
  { id: 'sc3-md-tn1', name: 'Rajdhani Carriers', type: 'transporter_master', branch: 'sc3-br-spd', onboardedAt: 'branch' },
  { id: 'sc3-md-ts1', name: 'Deccan Freight', type: 'transporter_master', branch: 'sc3-br-spd', onboardedAt: 'branch' },
  { id: 'sc3-md-te1', name: 'Eastern Express', type: 'transporter_master', branch: 'sc3-br-spd', onboardedAt: 'branch' },
  { id: 'sc3-md-tw1', name: 'Western Roadways', type: 'transporter_master', branch: 'sc3-br-spd', onboardedAt: 'branch' },
];

const sc3Attributes: Attribute[] = [
  attr('sc3-attr-all', 'SPD_ALL (View-Only)', 'branch', sc3AllIds, ['sc3-br-spd'], sc3MasterData),
  attr('sc3-attr-north', 'SPD_NORTH', 'branch', sc3NorthIds, ['sc3-br-spd'], sc3MasterData),
  attr('sc3-attr-south', 'SPD_SOUTH', 'branch', sc3SouthIds, ['sc3-br-spd'], sc3MasterData),
  attr('sc3-attr-east', 'SPD_EAST', 'branch', sc3EastIds, ['sc3-br-spd'], sc3MasterData),
  attr('sc3-attr-west', 'SPD_WEST', 'branch', sc3WestIds, ['sc3-br-spd'], sc3MasterData),
];

const sc3Users: User[] = [
  { id: 'sc3-user-sharma', name: 'Mr. Sharma', email: 'sharma@company.com', legoActorType: 'company_user', level: 'company', desks: [{ id: 'sc3-desk-all-view', name: 'Business Head View', roleId: 'role-finance', attributeIds: ['sc3-attr-all'] }], activeDeskId: 'sc3-desk-all-view' },
  { id: 'sc3-user-priya', name: 'Ms. Priya', email: 'priya@company.com', legoActorType: 'branch_user', level: 'branch', branchId: 'sc3-br-spd', desks: [{ id: 'sc3-desk-north', name: 'North Regional', roleId: 'role-ops-manager', attributeIds: ['sc3-attr-north'] }], activeDeskId: 'sc3-desk-north' },
  { id: 'sc3-user-south', name: 'South Regional Head', email: 'south@company.com', legoActorType: 'branch_user', level: 'branch', branchId: 'sc3-br-spd', desks: [{ id: 'sc3-desk-south', name: 'South Regional', roleId: 'role-ops-manager', attributeIds: ['sc3-attr-south'] }], activeDeskId: 'sc3-desk-south' },
  { id: 'sc3-user-east', name: 'East Regional Head', email: 'east@company.com', legoActorType: 'branch_user', level: 'branch', branchId: 'sc3-br-spd', desks: [{ id: 'sc3-desk-east', name: 'East Regional', roleId: 'role-ops-manager', attributeIds: ['sc3-attr-east'] }], activeDeskId: 'sc3-desk-east' },
  { id: 'sc3-user-west', name: 'West Regional Head', email: 'west@company.com', legoActorType: 'branch_user', level: 'branch', branchId: 'sc3-br-spd', desks: [{ id: 'sc3-desk-west', name: 'West Regional', roleId: 'role-ops-manager', attributeIds: ['sc3-attr-west'] }], activeDeskId: 'sc3-desk-west' },
];

const sc3Journeys: MockJourney[] = [
  { id: 'sc3-jrn-n1', branchId: 'sc3-br-spd', from: 'Delhi', to: 'Jaipur', routeItemId: 'sc3-md-rn1', vehicleNumber: 'DL01AA1111', vehicleType: 'DL-01 Tata 407', vehicleTypeItemId: 'sc3-md-vn1', materialItemId: 'sc3-md-mn1', transporterItemId: 'sc3-md-tn1', sim: true, gps: true, phone: '9876500001', slaStatus: 'On Time', eta: '06:00 pm', alert: null, alertTime: null, attribute: 'sc3-attr-north' },
  { id: 'sc3-jrn-n2', branchId: 'sc3-br-spd', from: 'Delhi', to: 'Dehradun', routeItemId: 'sc3-md-rn2', vehicleNumber: 'DL01AA1111', vehicleType: 'DL-01 Tata 407', vehicleTypeItemId: 'sc3-md-vn1', materialItemId: 'sc3-md-mn1', transporterItemId: 'sc3-md-tn1', sim: true, gps: false, phone: '9876500002', slaStatus: 'Delayed', eta: '08:00 pm', alert: 'Toll delay', alertTime: '1 hr ago', attribute: 'sc3-attr-north' },
  { id: 'sc3-jrn-s1', branchId: 'sc3-br-spd', from: 'Hyderabad', to: 'Vijayawada', routeItemId: 'sc3-md-rs1', vehicleNumber: 'TS08BB2222', vehicleType: 'TS-08 Ashok Leyland', vehicleTypeItemId: 'sc3-md-vs1', materialItemId: 'sc3-md-ms1', transporterItemId: 'sc3-md-ts1', sim: true, gps: true, phone: '9876500003', slaStatus: 'On Time', eta: '04:00 pm', alert: null, alertTime: null, attribute: 'sc3-attr-south' },
  { id: 'sc3-jrn-s2', branchId: 'sc3-br-spd', from: 'Bengaluru', to: 'Mysuru', routeItemId: 'sc3-md-rs2', vehicleNumber: 'TS08BB2222', vehicleType: 'TS-08 Ashok Leyland', vehicleTypeItemId: 'sc3-md-vs1', materialItemId: 'sc3-md-ms1', transporterItemId: 'sc3-md-ts1', sim: false, gps: true, phone: '9876500004', slaStatus: 'On Time', eta: '02:00 pm', alert: null, alertTime: null, attribute: 'sc3-attr-south' },
  { id: 'sc3-jrn-e1', branchId: 'sc3-br-spd', from: 'Kolkata', to: 'Patna', routeItemId: 'sc3-md-re1', vehicleNumber: 'WB02CC3333', vehicleType: 'WB-02 Eicher', vehicleTypeItemId: 'sc3-md-ve1', materialItemId: 'sc3-md-me1', transporterItemId: 'sc3-md-te1', sim: true, gps: true, phone: '9876500005', slaStatus: 'At Risk', eta: '07:00 pm', alert: null, alertTime: null, attribute: 'sc3-attr-east' },
  { id: 'sc3-jrn-e2', branchId: 'sc3-br-spd', from: 'Bhubaneswar', to: 'Ranchi', routeItemId: 'sc3-md-re2', vehicleNumber: 'WB02CC3333', vehicleType: 'WB-02 Eicher', vehicleTypeItemId: 'sc3-md-ve1', materialItemId: 'sc3-md-me1', transporterItemId: 'sc3-md-te1', sim: true, gps: true, phone: '9876500006', slaStatus: 'On Time', eta: '05:00 pm', alert: null, alertTime: null, attribute: 'sc3-attr-east' },
  { id: 'sc3-jrn-w1', branchId: 'sc3-br-spd', from: 'Mumbai', to: 'Pune', routeItemId: 'sc3-md-rw1', vehicleNumber: 'MH12DD4444', vehicleType: 'MH-12 Trailer', vehicleTypeItemId: 'sc3-md-vw1', materialItemId: 'sc3-md-mw1', transporterItemId: 'sc3-md-tw1', sim: true, gps: true, phone: '9876500007', slaStatus: 'On Time', eta: '06:30 pm', alert: null, alertTime: null, attribute: 'sc3-attr-west' },
  { id: 'sc3-jrn-w2', branchId: 'sc3-br-spd', from: 'Ahmedabad', to: 'Vadodara', routeItemId: 'sc3-md-rw2', vehicleNumber: 'MH12DD4444', vehicleType: 'MH-12 Trailer', vehicleTypeItemId: 'sc3-md-vw1', materialItemId: 'sc3-md-mw1', transporterItemId: 'sc3-md-tw1', sim: false, gps: true, phone: '9876500008', slaStatus: 'On Time', eta: '03:00 pm', alert: null, alertTime: null, attribute: 'sc3-attr-west' },
];

const scenario3: ScenarioFixture = {
  id: 'scenario-4',
  number: 4,
  title: 'Business Head vs Regional Head (Hierarchy)',
  subtitle: 'Business head sees everything read-only, regional head manages their area',
  category: 'Hierarchy',
  priority: 'Must Have',
  situation: 'Business head needs visibility across all regions; regional heads need full control of their region only.',
  howItWorks: 'SPD_ALL attribute grants read-only on all items. Regional attributes (SPD_NORTH, etc.) grant full CRUD on their items only.',
  keyInsight: 'View-only vs full CRUD on the same branch enables clear hierarchy without data silos.',
  masterDataItems: sc3MasterData,
  branches: sc3Branches,
  attributes: sc3Attributes,
  users: sc3Users,
  journeys: sc3Journeys,
  highlightUsers: ['sc3-user-sharma', 'sc3-user-priya'],
  expectedOutcomes: [
    { userId: 'sc3-user-sharma', userName: 'Mr. Sharma', description: 'Sees all 8 journeys; can edit 0', canSeeJourneys: 8, canEditJourneys: 0 },
    { userId: 'sc3-user-priya', userName: 'Ms. Priya', description: 'Sees 2 North journeys; can edit both', canSeeJourneys: 2, canEditJourneys: 2 },
  ],
};

// --- Scenario 4: Cross-Branch Regional Leader ---
const sc4Branches: Branch[] = [
  { id: 'sc4-br-spd', name: 'SPD', code: 'SPD' },
  { id: 'sc4-br-tmcv', name: 'TMCV', code: 'TMCV' },
  { id: 'sc4-br-def', name: 'DEF', code: 'DEF' },
];

const sc4NorthIds = ['sc4-md-rn1', 'sc4-md-rn2', 'sc4-md-rn3', 'sc4-md-vn1', 'sc4-md-mn1', 'sc4-md-tn1', 'sc4-md-vn2', 'sc4-md-mn2', 'sc4-md-tn2', 'sc4-md-vn3', 'sc4-md-mn3', 'sc4-md-tn3'];

const sc4MasterData: MasterDataItem[] = [
  { id: 'sc4-md-rn1', name: 'Delhi → Jaipur (North)', type: 'routes', branch: 'sc4-br-spd', onboardedAt: 'branch' },
  { id: 'sc4-md-rn2', name: 'Lucknow → Kanpur (North)', type: 'routes', branch: 'sc4-br-tmcv', onboardedAt: 'branch' },
  { id: 'sc4-md-rn3', name: 'Chandigarh → Amritsar (North)', type: 'routes', branch: 'sc4-br-def', onboardedAt: 'branch' },
  { id: 'sc4-md-rs1', name: 'Hyderabad → Vijayawada (South)', type: 'routes', branch: 'sc4-br-spd', onboardedAt: 'branch' },
  { id: 'sc4-md-rw1', name: 'Mumbai → Surat (West)', type: 'routes', branch: 'sc4-br-tmcv', onboardedAt: 'branch' },
  { id: 'sc4-md-vn1', name: 'DL-01 Tata 407', type: 'vehicle_type_master', branch: 'sc4-br-spd', onboardedAt: 'branch' },
  { id: 'sc4-md-vn2', name: 'UP-32 Eicher', type: 'vehicle_type_master', branch: 'sc4-br-tmcv', onboardedAt: 'branch' },
  { id: 'sc4-md-vn3', name: 'PB-10 Ashok Leyland', type: 'vehicle_type_master', branch: 'sc4-br-def', onboardedAt: 'branch' },
  { id: 'sc4-md-vs1', name: 'TS-08 Trailer', type: 'vehicle_type_master', branch: 'sc4-br-spd', onboardedAt: 'branch' },
  { id: 'sc4-md-vw1', name: 'MH-02 Container', type: 'vehicle_type_master', branch: 'sc4-br-tmcv', onboardedAt: 'branch' },
  { id: 'sc4-md-mn1', name: '10 MT ACC Cement', type: 'material_master', branch: 'sc4-br-spd', onboardedAt: 'branch' },
  { id: 'sc4-md-mn2', name: '6 MT Tata Steel Rods', type: 'material_master', branch: 'sc4-br-tmcv', onboardedAt: 'branch' },
  { id: 'sc4-md-mn3', name: '9 MT Grasim Textiles', type: 'material_master', branch: 'sc4-br-def', onboardedAt: 'branch' },
  { id: 'sc4-md-ms1', name: '8 MT Ambuja Cement', type: 'material_master', branch: 'sc4-br-spd', onboardedAt: 'branch' },
  { id: 'sc4-md-mw1', name: '7 MT Asian Paints', type: 'material_master', branch: 'sc4-br-tmcv', onboardedAt: 'branch' },
  { id: 'sc4-md-tn1', name: 'Rajdhani Carriers', type: 'transporter_master', branch: 'sc4-br-spd', onboardedAt: 'branch' },
  { id: 'sc4-md-tn2', name: 'North Star Logistics', type: 'transporter_master', branch: 'sc4-br-tmcv', onboardedAt: 'branch' },
  { id: 'sc4-md-tn3', name: 'Punjab Roadways', type: 'transporter_master', branch: 'sc4-br-def', onboardedAt: 'branch' },
  { id: 'sc4-md-ts1', name: 'Deccan Freight', type: 'transporter_master', branch: 'sc4-br-spd', onboardedAt: 'branch' },
  { id: 'sc4-md-tw1', name: 'Western Express', type: 'transporter_master', branch: 'sc4-br-tmcv', onboardedAt: 'branch' },
];

const sc4Attributes: Attribute[] = [
  attr('sc4-attr-north', 'North Region (Cross-Branch)', 'company', sc4NorthIds, ['sc4-br-spd', 'sc4-br-tmcv', 'sc4-br-def'], sc4MasterData),
  attr('sc4-attr-spd', 'SPD Branch Only', 'branch', ['sc4-md-rn1', 'sc4-md-rs1', 'sc4-md-vn1', 'sc4-md-vs1', 'sc4-md-mn1', 'sc4-md-ms1', 'sc4-md-tn1', 'sc4-md-ts1'], ['sc4-br-spd'], sc4MasterData),
  attr('sc4-attr-tmcv', 'TMCV Branch Only', 'branch', ['sc4-md-rn2', 'sc4-md-rw1', 'sc4-md-vn2', 'sc4-md-vw1', 'sc4-md-mn2', 'sc4-md-mw1', 'sc4-md-tn2', 'sc4-md-tw1'], ['sc4-br-tmcv'], sc4MasterData),
  attr('sc4-attr-def', 'DEF Branch Only', 'branch', ['sc4-md-rn3', 'sc4-md-vn3', 'sc4-md-mn3', 'sc4-md-tn3'], ['sc4-br-def'], sc4MasterData),
];

const sc4Users: User[] = [
  { id: 'sc4-user-vikram', name: 'Mr. Vikram', email: 'vikram@company.com', legoActorType: 'company_user', level: 'company', desks: [{ id: 'sc4-desk-north', name: 'North Regional', roleId: 'role-ops-manager', attributeIds: ['sc4-attr-north'] }], activeDeskId: 'sc4-desk-north' },
  { id: 'sc4-user-spd', name: 'SPD Ops', email: 'spd@company.com', legoActorType: 'branch_user', level: 'branch', branchId: 'sc4-br-spd', desks: [{ id: 'sc4-desk-spd', name: 'SPD Ops', roleId: 'role-ops-manager', attributeIds: ['sc4-attr-spd'] }], activeDeskId: 'sc4-desk-spd' },
  { id: 'sc4-user-tmcv', name: 'TMCV Ops', email: 'tmcv@company.com', legoActorType: 'branch_user', level: 'branch', branchId: 'sc4-br-tmcv', desks: [{ id: 'sc4-desk-tmcv', name: 'TMCV Ops', roleId: 'role-ops-manager', attributeIds: ['sc4-attr-tmcv'] }], activeDeskId: 'sc4-desk-tmcv' },
  { id: 'sc4-user-def', name: 'DEF Ops', email: 'def@company.com', legoActorType: 'branch_user', level: 'branch', branchId: 'sc4-br-def', desks: [{ id: 'sc4-desk-def', name: 'DEF Ops', roleId: 'role-ops-manager', attributeIds: ['sc4-attr-def'] }], activeDeskId: 'sc4-desk-def' },
];

const sc4Journeys: MockJourney[] = [
  { id: 'sc4-jrn-spd-n1', branchId: 'sc4-br-spd', from: 'Delhi', to: 'Jaipur', routeItemId: 'sc4-md-rn1', vehicleNumber: 'DL01AA1111', vehicleType: 'DL-01 Tata 407', vehicleTypeItemId: 'sc4-md-vn1', materialItemId: 'sc4-md-mn1', transporterItemId: 'sc4-md-tn1', sim: true, gps: true, phone: '9876500001', slaStatus: 'On Time', eta: '06:00 pm', alert: null, alertTime: null, attribute: 'sc4-attr-north' },
  { id: 'sc4-jrn-spd-n2', branchId: 'sc4-br-spd', from: 'Jaipur', to: 'Delhi', routeItemId: 'sc4-md-rn1', vehicleNumber: 'DL01AA1111', vehicleType: 'DL-01 Tata 407', vehicleTypeItemId: 'sc4-md-vn1', materialItemId: 'sc4-md-mn1', transporterItemId: 'sc4-md-tn1', sim: true, gps: false, phone: '9876500002', slaStatus: 'On Time', eta: '08:00 pm', alert: null, alertTime: null, attribute: 'sc4-attr-north' },
  { id: 'sc4-jrn-tmcv-n1', branchId: 'sc4-br-tmcv', from: 'Lucknow', to: 'Kanpur', routeItemId: 'sc4-md-rn2', vehicleNumber: 'UP32DD4444', vehicleType: 'UP-32 Eicher', vehicleTypeItemId: 'sc4-md-vn2', materialItemId: 'sc4-md-mn2', transporterItemId: 'sc4-md-tn2', sim: true, gps: true, phone: '9876500003', slaStatus: 'On Time', eta: '04:00 pm', alert: null, alertTime: null, attribute: 'sc4-attr-north' },
  { id: 'sc4-jrn-tmcv-n2', branchId: 'sc4-br-tmcv', from: 'Kanpur', to: 'Lucknow', routeItemId: 'sc4-md-rn2', vehicleNumber: 'UP32DD4444', vehicleType: 'UP-32 Eicher', vehicleTypeItemId: 'sc4-md-vn2', materialItemId: 'sc4-md-mn2', transporterItemId: 'sc4-md-tn2', sim: false, gps: true, phone: '9876500004', slaStatus: 'Delayed', eta: '06:00 pm', alert: 'Breakdown', alertTime: '30 min ago', attribute: 'sc4-attr-north' },
  { id: 'sc4-jrn-def-n1', branchId: 'sc4-br-def', from: 'Chandigarh', to: 'Amritsar', routeItemId: 'sc4-md-rn3', vehicleNumber: 'PB10EE5555', vehicleType: 'PB-10 Ashok Leyland', vehicleTypeItemId: 'sc4-md-vn3', materialItemId: 'sc4-md-mn3', transporterItemId: 'sc4-md-tn3', sim: true, gps: true, phone: '9876500005', slaStatus: 'On Time', eta: '05:00 pm', alert: null, alertTime: null, attribute: 'sc4-attr-north' },
  { id: 'sc4-jrn-def-n2', branchId: 'sc4-br-def', from: 'Amritsar', to: 'Chandigarh', routeItemId: 'sc4-md-rn3', vehicleNumber: 'PB10EE5555', vehicleType: 'PB-10 Ashok Leyland', vehicleTypeItemId: 'sc4-md-vn3', materialItemId: 'sc4-md-mn3', transporterItemId: 'sc4-md-tn3', sim: true, gps: true, phone: '9876500006', slaStatus: 'On Time', eta: '07:00 pm', alert: null, alertTime: null, attribute: 'sc4-attr-north' },
  { id: 'sc4-jrn-spd-s1', branchId: 'sc4-br-spd', from: 'Hyderabad', to: 'Vijayawada', routeItemId: 'sc4-md-rs1', vehicleNumber: 'TS08BB2222', vehicleType: 'TS-08 Trailer', vehicleTypeItemId: 'sc4-md-vs1', materialItemId: 'sc4-md-ms1', transporterItemId: 'sc4-md-ts1', sim: true, gps: true, phone: '9876500007', slaStatus: 'On Time', eta: '03:00 pm', alert: null, alertTime: null, attribute: 'sc4-attr-spd' },
  { id: 'sc4-jrn-tmcv-w1', branchId: 'sc4-br-tmcv', from: 'Mumbai', to: 'Surat', routeItemId: 'sc4-md-rw1', vehicleNumber: 'MH02GG7777', vehicleType: 'MH-02 Container', vehicleTypeItemId: 'sc4-md-vw1', materialItemId: 'sc4-md-mw1', transporterItemId: 'sc4-md-tw1', sim: true, gps: false, phone: '9876500008', slaStatus: 'At Risk', eta: '08:00 pm', alert: null, alertTime: null, attribute: 'sc4-attr-tmcv' },
  { id: 'sc4-jrn-def-n3', branchId: 'sc4-br-def', from: 'Chandigarh', to: 'Ludhiana', routeItemId: 'sc4-md-rn3', vehicleNumber: 'PB10EE5555', vehicleType: 'PB-10 Ashok Leyland', vehicleTypeItemId: 'sc4-md-vn3', materialItemId: 'sc4-md-mn3', transporterItemId: 'sc4-md-tn3', sim: true, gps: true, phone: '9876500009', slaStatus: 'On Time', eta: '02:00 pm', alert: null, alertTime: null, attribute: 'sc4-attr-north' },
];

const scenario4: ScenarioFixture = {
  id: 'scenario-5',
  number: 5,
  title: 'Cross-Branch Regional Leader',
  subtitle: 'One leader sees North region across three branches',
  category: 'Cross-Branch',
  priority: 'Must Have',
  situation: 'A regional director is responsible for North across multiple branches and needs one view of all North data.',
  howItWorks: 'One company-level attribute includes North-region items from all three branches. User sees 9 North journeys; South/West journeys are hidden.',
  keyInsight: 'Company-level attributes can span branches to support cross-branch regional views.',
  masterDataItems: sc4MasterData,
  branches: sc4Branches,
  attributes: sc4Attributes,
  users: sc4Users,
  journeys: sc4Journeys,
  highlightUsers: ['sc4-user-vikram', 'sc4-user-spd', 'sc4-user-tmcv', 'sc4-user-def'],
  expectedOutcomes: [
    { userId: 'sc4-user-vikram', userName: 'Mr. Vikram', description: 'Sees 7 North journeys across all branches; 2 non-North hidden', canSeeJourneys: 7, canEditJourneys: 7 },
    { userId: 'sc4-user-spd', userName: 'SPD Ops', description: 'Sees only SPD branch journeys', canSeeJourneys: 3, canEditJourneys: 3 },
    { userId: 'sc4-user-tmcv', userName: 'TMCV Ops', description: 'Sees only TMCV branch journeys', canSeeJourneys: 3, canEditJourneys: 3 },
    { userId: 'sc4-user-def', userName: 'DEF Ops', description: 'Sees only DEF branch journeys', canSeeJourneys: 3, canEditJourneys: 3 },
  ],
};

// --- Scenario 5: Supplier Cross-Branch Access ---
const sc5Branches: Branch[] = [
  { id: 'sc5-br-pune', name: 'Diageo Pune Plant', code: 'PUNE' },
  { id: 'sc5-br-chennai', name: 'Diageo Chennai Plant', code: 'CHN' },
  { id: 'sc5-br-hyd', name: 'Diageo Hyderabad Plant', code: 'HYD' },
];

const sc5MasterData: MasterDataItem[] = [
  { id: 'sc5-rt-pune-1', name: 'Jharsuguda → Pune (NH49)', type: 'routes', branch: 'sc5-br-pune', onboardedAt: 'branch' },
  { id: 'sc5-rt-pune-2', name: 'Raipur → Pune (NH53)', type: 'routes', branch: 'sc5-br-pune', onboardedAt: 'branch' },
  { id: 'sc5-rt-pune-3', name: 'Vizag → Pune (NH65)', type: 'routes', branch: 'sc5-br-pune', onboardedAt: 'branch' },
  { id: 'sc5-vt-pune-1', name: '14MT Ashok Leyland', type: 'vehicle_type_master', branch: 'sc5-br-pune', onboardedAt: 'branch' },
  { id: 'sc5-vt-pune-2', name: '9MT Tata 407', type: 'vehicle_type_master', branch: 'sc5-br-pune', onboardedAt: 'branch' },
  { id: 'sc5-mt-pune-1', name: 'Aluminium Ingots (Raw Material)', type: 'material_master', branch: 'sc5-br-pune', onboardedAt: 'branch' },
  { id: 'sc5-mt-pune-2', name: 'Copper Cathodes', type: 'material_master', branch: 'sc5-br-pune', onboardedAt: 'branch' },
  { id: 'sc5-tp-pune-1', name: 'Mahalaxmi Roadways', type: 'transporter_master', branch: 'sc5-br-pune', onboardedAt: 'branch' },
  { id: 'sc5-rt-chn-1', name: 'Jharsuguda → Chennai (NH16)', type: 'routes', branch: 'sc5-br-chennai', onboardedAt: 'branch' },
  { id: 'sc5-rt-chn-2', name: 'Vizag → Chennai (NH5)', type: 'routes', branch: 'sc5-br-chennai', onboardedAt: 'branch' },
  { id: 'sc5-vt-chn-1', name: '20MT Trailer', type: 'vehicle_type_master', branch: 'sc5-br-chennai', onboardedAt: 'branch' },
  { id: 'sc5-mt-chn-1', name: 'Aluminium Sheets (Processed)', type: 'material_master', branch: 'sc5-br-chennai', onboardedAt: 'branch' },
  { id: 'sc5-mt-chn-2', name: 'Steel Coils', type: 'material_master', branch: 'sc5-br-chennai', onboardedAt: 'branch' },
  { id: 'sc5-tp-chn-1', name: 'Southern Express Logistics', type: 'transporter_master', branch: 'sc5-br-chennai', onboardedAt: 'branch' },
  { id: 'sc5-rt-hyd-1', name: 'Jharsuguda → Hyderabad (NH65)', type: 'routes', branch: 'sc5-br-hyd', onboardedAt: 'branch' },
  { id: 'sc5-rt-hyd-2', name: 'Raipur → Hyderabad (NH30)', type: 'routes', branch: 'sc5-br-hyd', onboardedAt: 'branch' },
  { id: 'sc5-vt-hyd-1', name: '14MT Ashok Leyland', type: 'vehicle_type_master', branch: 'sc5-br-hyd', onboardedAt: 'branch' },
  { id: 'sc5-mt-hyd-1', name: 'Aluminium Ingots (Raw Material)', type: 'material_master', branch: 'sc5-br-hyd', onboardedAt: 'branch' },
  { id: 'sc5-tp-hyd-1', name: 'Deccan Freight Carriers', type: 'transporter_master', branch: 'sc5-br-hyd', onboardedAt: 'branch' },
];

const sc5SupplierItemIds = [
  'sc5-rt-pune-1', 'sc5-rt-pune-2', 'sc5-vt-pune-1', 'sc5-mt-pune-1', 'sc5-tp-pune-1',
  'sc5-rt-chn-1', 'sc5-vt-chn-1', 'sc5-mt-chn-1', 'sc5-tp-chn-1',
  'sc5-rt-hyd-1', 'sc5-vt-hyd-1', 'sc5-mt-hyd-1', 'sc5-tp-hyd-1',
];
const sc5PuneItemIds = ['sc5-rt-pune-1', 'sc5-rt-pune-2', 'sc5-rt-pune-3', 'sc5-vt-pune-1', 'sc5-vt-pune-2', 'sc5-mt-pune-1', 'sc5-mt-pune-2', 'sc5-tp-pune-1'];
const sc5ChennaiItemIds = ['sc5-rt-chn-1', 'sc5-rt-chn-2', 'sc5-vt-chn-1', 'sc5-mt-chn-1', 'sc5-mt-chn-2', 'sc5-tp-chn-1'];
const sc5HydItemIds = ['sc5-rt-hyd-1', 'sc5-rt-hyd-2', 'sc5-vt-hyd-1', 'sc5-mt-hyd-1', 'sc5-tp-hyd-1'];

const sc5Attributes: Attribute[] = [
  { ...attr('sc5-attr-vedanta', 'Vedanta Supplier Access', 'company', sc5SupplierItemIds, ['sc5-br-pune', 'sc5-br-chennai', 'sc5-br-hyd'], sc5MasterData), description: 'Selective master data across Pune, Chennai, Hyderabad for Vedanta Aluminium' },
  attr('sc5-attr-pune', 'Pune Plant Ops', 'branch', sc5PuneItemIds, ['sc5-br-pune'], sc5MasterData),
  attr('sc5-attr-chennai', 'Chennai Plant Ops', 'branch', sc5ChennaiItemIds, ['sc5-br-chennai'], sc5MasterData),
  attr('sc5-attr-hyd', 'Hyderabad Plant Ops', 'branch', sc5HydItemIds, ['sc5-br-hyd'], sc5MasterData),
];

const sc5Users: User[] = [
  { id: 'sc5-user-vedanta', name: 'Vedanta Dispatch', email: 'vedanta@supplier.com', legoActorType: 'company_user', level: 'company', desks: [{ id: 'sc5-desk-vedanta', name: 'Supplier Access', roleId: 'role-supplier', attributeIds: ['sc5-attr-vedanta'] }], activeDeskId: 'sc5-desk-vedanta' },
  { id: 'sc5-user-pune', name: 'Rajesh (Pune Plant Ops)', email: 'rajesh.pune@diageo.com', legoActorType: 'branch_user', level: 'branch', branchId: 'sc5-br-pune', desks: [{ id: 'sc5-desk-pune', name: 'Pune Plant Ops', roleId: 'role-ops-manager', attributeIds: ['sc5-attr-pune'] }], activeDeskId: 'sc5-desk-pune' },
  { id: 'sc5-user-chennai', name: 'Karthik (Chennai Plant Ops)', email: 'karthik.chennai@diageo.com', legoActorType: 'branch_user', level: 'branch', branchId: 'sc5-br-chennai', desks: [{ id: 'sc5-desk-chennai', name: 'Chennai Plant Ops', roleId: 'role-ops-manager', attributeIds: ['sc5-attr-chennai'] }], activeDeskId: 'sc5-desk-chennai' },
  { id: 'sc5-user-hyd', name: 'Priya (Hyderabad Plant Ops)', email: 'priya.hyd@diageo.com', legoActorType: 'branch_user', level: 'branch', branchId: 'sc5-br-hyd', desks: [{ id: 'sc5-desk-hyd', name: 'Hyderabad Plant Ops', roleId: 'role-ops-manager', attributeIds: ['sc5-attr-hyd'] }], activeDeskId: 'sc5-desk-hyd' },
];

const sc5Journeys: MockJourney[] = [
  { id: 'sc5-jrn-001', branchId: 'sc5-br-pune', from: 'Jharsuguda', to: 'Pune', routeItemId: 'sc5-rt-pune-1', vehicleNumber: 'MH12AB1234', vehicleType: '14MT Ashok Leyland', vehicleTypeItemId: 'sc5-vt-pune-1', materialItemId: 'sc5-mt-pune-1', transporterItemId: 'sc5-tp-pune-1', sim: true, gps: true, phone: '9876500010', slaStatus: 'On Time', eta: '06:00 pm', alert: null, alertTime: null, attribute: 'sc5-attr-vedanta' },
  { id: 'sc5-jrn-002', branchId: 'sc5-br-pune', from: 'Raipur', to: 'Pune', routeItemId: 'sc5-rt-pune-2', vehicleNumber: 'MH12CD5678', vehicleType: '14MT Ashok Leyland', vehicleTypeItemId: 'sc5-vt-pune-1', materialItemId: 'sc5-mt-pune-1', transporterItemId: 'sc5-tp-pune-1', sim: true, gps: false, phone: '9876500011', slaStatus: 'On Time', eta: '04:30 pm', alert: null, alertTime: null, attribute: 'sc5-attr-vedanta' },
  { id: 'sc5-jrn-003', branchId: 'sc5-br-pune', from: 'Jharsuguda', to: 'Pune', routeItemId: 'sc5-rt-pune-1', vehicleNumber: 'MH12EF9012', vehicleType: '14MT Ashok Leyland', vehicleTypeItemId: 'sc5-vt-pune-1', materialItemId: 'sc5-mt-pune-1', transporterItemId: 'sc5-tp-pune-1', sim: false, gps: true, phone: '9876500012', slaStatus: 'Delayed', eta: '08:00 pm', alert: 'En route delay', alertTime: '45 min ago', attribute: 'sc5-attr-vedanta' },
  { id: 'sc5-jrn-004', branchId: 'sc5-br-pune', from: 'Vizag', to: 'Pune', routeItemId: 'sc5-rt-pune-3', vehicleNumber: 'MH12GH3456', vehicleType: '9MT Tata 407', vehicleTypeItemId: 'sc5-vt-pune-2', materialItemId: 'sc5-mt-pune-2', transporterItemId: 'sc5-tp-pune-1', sim: true, gps: true, phone: '9876500013', slaStatus: 'On Time', eta: '07:00 pm', alert: null, alertTime: null, attribute: 'sc5-attr-pune' },
  { id: 'sc5-jrn-005', branchId: 'sc5-br-chennai', from: 'Jharsuguda', to: 'Chennai', routeItemId: 'sc5-rt-chn-1', vehicleNumber: 'TN07AB1234', vehicleType: '20MT Trailer', vehicleTypeItemId: 'sc5-vt-chn-1', materialItemId: 'sc5-mt-chn-1', transporterItemId: 'sc5-tp-chn-1', sim: true, gps: true, phone: '9876500014', slaStatus: 'On Time', eta: '05:00 pm', alert: null, alertTime: null, attribute: 'sc5-attr-vedanta' },
  { id: 'sc5-jrn-006', branchId: 'sc5-br-chennai', from: 'Jharsuguda', to: 'Chennai', routeItemId: 'sc5-rt-chn-1', vehicleNumber: 'TN07CD5678', vehicleType: '20MT Trailer', vehicleTypeItemId: 'sc5-vt-chn-1', materialItemId: 'sc5-mt-chn-1', transporterItemId: 'sc5-tp-chn-1', sim: true, gps: false, phone: '9876500015', slaStatus: 'At Risk', eta: '06:30 pm', alert: null, alertTime: null, attribute: 'sc5-attr-vedanta' },
  { id: 'sc5-jrn-007', branchId: 'sc5-br-chennai', from: 'Jharsuguda', to: 'Chennai', routeItemId: 'sc5-rt-chn-1', vehicleNumber: 'TN07EF9012', vehicleType: '20MT Trailer', vehicleTypeItemId: 'sc5-vt-chn-1', materialItemId: 'sc5-mt-chn-1', transporterItemId: 'sc5-tp-chn-1', sim: false, gps: true, phone: '9876500016', slaStatus: 'On Time', eta: '04:00 pm', alert: null, alertTime: null, attribute: 'sc5-attr-vedanta' },
  { id: 'sc5-jrn-008', branchId: 'sc5-br-chennai', from: 'Vizag', to: 'Chennai', routeItemId: 'sc5-rt-chn-2', vehicleNumber: 'TN07GH3456', vehicleType: '20MT Trailer', vehicleTypeItemId: 'sc5-vt-chn-1', materialItemId: 'sc5-mt-chn-2', transporterItemId: 'sc5-tp-chn-1', sim: true, gps: true, phone: '9876500017', slaStatus: 'Delayed', eta: '07:00 pm', alert: null, alertTime: null, attribute: 'sc5-attr-chennai' },
  { id: 'sc5-jrn-009', branchId: 'sc5-br-hyd', from: 'Jharsuguda', to: 'Hyderabad', routeItemId: 'sc5-rt-hyd-1', vehicleNumber: 'TS09AB1234', vehicleType: '14MT Ashok Leyland', vehicleTypeItemId: 'sc5-vt-hyd-1', materialItemId: 'sc5-mt-hyd-1', transporterItemId: 'sc5-tp-hyd-1', sim: true, gps: true, phone: '9876500018', slaStatus: 'On Time', eta: '06:00 pm', alert: null, alertTime: null, attribute: 'sc5-attr-vedanta' },
  { id: 'sc5-jrn-010', branchId: 'sc5-br-hyd', from: 'Jharsuguda', to: 'Hyderabad', routeItemId: 'sc5-rt-hyd-1', vehicleNumber: 'TS09CD5678', vehicleType: '14MT Ashok Leyland', vehicleTypeItemId: 'sc5-vt-hyd-1', materialItemId: 'sc5-mt-hyd-1', transporterItemId: 'sc5-tp-hyd-1', sim: true, gps: false, phone: '9876500019', slaStatus: 'On Time', eta: '05:30 pm', alert: null, alertTime: null, attribute: 'sc5-attr-vedanta' },
  { id: 'sc5-jrn-011', branchId: 'sc5-br-hyd', from: 'Jharsuguda', to: 'Hyderabad', routeItemId: 'sc5-rt-hyd-1', vehicleNumber: 'TS09EF3456', vehicleType: '14MT Ashok Leyland', vehicleTypeItemId: 'sc5-vt-hyd-1', materialItemId: 'sc5-mt-hyd-1', transporterItemId: 'sc5-tp-hyd-1', sim: false, gps: true, phone: '9876500020', slaStatus: 'At Risk', eta: '08:00 pm', alert: 'Long stoppage', alertTime: '20 min ago', attribute: 'sc5-attr-vedanta' },
  { id: 'sc5-jrn-012', branchId: 'sc5-br-hyd', from: 'Raipur', to: 'Hyderabad', routeItemId: 'sc5-rt-hyd-2', vehicleNumber: 'TS09GH7890', vehicleType: '14MT Ashok Leyland', vehicleTypeItemId: 'sc5-vt-hyd-1', materialItemId: 'sc5-mt-hyd-1', transporterItemId: 'sc5-tp-hyd-1', sim: true, gps: true, phone: '9876500021', slaStatus: 'On Time', eta: '04:00 pm', alert: null, alertTime: null, attribute: 'sc5-attr-hyd' },
];

const scenario5: ScenarioFixture = {
  id: 'scenario-6',
  number: 6,
  title: 'Supplier Cross-Branch Access',
  subtitle: 'Supplier sees shipments across three plants; each plant sees only its own',
  category: 'Shared Entities',
  priority: 'Must Have',
  situation: 'A supplier services multiple branches of a company. They need one login to create indents across all three branches, but only using the specific routes, materials, and vehicles they are contracted for at each branch. Each branch\'s internal ops team should only see transactions relevant to their own plant.',
  howItWorks: 'The supplier gets a single cross-branch attribute containing selective master data items from all three branches. Each branch ops user gets a branch-scoped attribute with full CRUD on their branch\'s complete master data. The supplier can create transactions across branches; each branch user sees only their branch\'s transactions.',
  keyInsight: 'A single cross-branch attribute with selective master data lets external suppliers operate across multiple branches while branch users remain isolated to their own data.',
  masterDataItems: sc5MasterData,
  branches: sc5Branches,
  attributes: sc5Attributes,
  users: sc5Users,
  journeys: sc5Journeys,
  highlightUsers: ['sc5-user-vedanta', 'sc5-user-pune', 'sc5-user-chennai', 'sc5-user-hyd'],
  expectedOutcomes: [
    { userId: 'sc5-user-vedanta', userName: 'Vedanta Dispatch', description: 'Sees 9 supplier-accessible journeys across 3 branches; full CRUD', canSeeJourneys: 9, canEditJourneys: 9 },
    { userId: 'sc5-user-pune', userName: 'Rajesh (Pune Plant Ops)', description: 'Sees all 4 Pune journeys including internal-only', canSeeJourneys: 4, canEditJourneys: 4 },
    { userId: 'sc5-user-chennai', userName: 'Karthik (Chennai Plant Ops)', description: 'Sees all 4 Chennai journeys', canSeeJourneys: 4, canEditJourneys: 4 },
    { userId: 'sc5-user-hyd', userName: 'Priya (Hyderabad Plant Ops)', description: 'Sees all 4 Hyderabad journeys', canSeeJourneys: 4, canEditJourneys: 4 },
  ],
};

// --- Scenario 6: Ops vs Finance ---
const sc6Branches: Branch[] = [
  { id: 'sc6-br-chn', name: 'Chennai', code: 'CHE' },
  { id: 'sc6-br-mum', name: 'Mumbai', code: 'MUM' },
  { id: 'sc6-br-del', name: 'Delhi NCR', code: 'DEL' },
];

const sc6ChennaiIds = ['sc6-md-rc1', 'sc6-md-rc2', 'sc6-md-vc1', 'sc6-md-mc1', 'sc6-md-tc1'];
const sc6AllIds = [...sc6ChennaiIds, 'sc6-md-rm1', 'sc6-md-vm1', 'sc6-md-mm1', 'sc6-md-tm1', 'sc6-md-rd1', 'sc6-md-vd1', 'sc6-md-md1', 'sc6-md-td1'];

const sc6MasterData: MasterDataItem[] = [
  { id: 'sc6-md-rc1', name: 'Chennai → Coimbatore', type: 'routes', branch: 'sc6-br-chn', onboardedAt: 'branch' },
  { id: 'sc6-md-rc2', name: 'Chennai → Bengaluru', type: 'routes', branch: 'sc6-br-chn', onboardedAt: 'branch' },
  { id: 'sc6-md-rm1', name: 'Mumbai → Pune', type: 'routes', branch: 'sc6-br-mum', onboardedAt: 'branch' },
  { id: 'sc6-md-rd1', name: 'Delhi → Jaipur', type: 'routes', branch: 'sc6-br-del', onboardedAt: 'branch' },
  { id: 'sc6-md-vc1', name: 'TN-09 14MT Container', type: 'vehicle_type_master', branch: 'sc6-br-chn', onboardedAt: 'branch' },
  { id: 'sc6-md-vm1', name: 'MH-04 Reefer', type: 'vehicle_type_master', branch: 'sc6-br-mum', onboardedAt: 'branch' },
  { id: 'sc6-md-vd1', name: 'DL-01 Trailer', type: 'vehicle_type_master', branch: 'sc6-br-del', onboardedAt: 'branch' },
  { id: 'sc6-md-mc1', name: '13 MT HUL Soaps (FMCG)', type: 'material_master', branch: 'sc6-br-chn', onboardedAt: 'branch' },
  { id: 'sc6-md-mm1', name: '10 MT Cadbury (FMCG)', type: 'material_master', branch: 'sc6-br-mum', onboardedAt: 'branch' },
  { id: 'sc6-md-md1', name: '8 MT Asian Paints', type: 'material_master', branch: 'sc6-br-del', onboardedAt: 'branch' },
  { id: 'sc6-md-tc1', name: 'Southern Express Lines', type: 'transporter_master', branch: 'sc6-br-chn', onboardedAt: 'branch' },
  { id: 'sc6-md-tm1', name: 'Western Cargo', type: 'transporter_master', branch: 'sc6-br-mum', onboardedAt: 'branch' },
  { id: 'sc6-md-td1', name: 'Rajdhani Carriers', type: 'transporter_master', branch: 'sc6-br-del', onboardedAt: 'branch' },
];

const sc6Attributes: Attribute[] = [
  attr('sc6-attr-ops', 'Chennai Ops', 'branch', sc6ChennaiIds, ['sc6-br-chn'], sc6MasterData),
  attr('sc6-attr-finance', 'Finance All', 'company', sc6AllIds, 'ALL', sc6MasterData),
];

const sc6Users: User[] = [
  { id: 'sc6-user-karthik', name: 'Karthik', email: 'karthik@company.com', legoActorType: 'branch_user', level: 'branch', branchId: 'sc6-br-chn', desks: [{ id: 'sc6-desk-ops', name: 'Chennai Ops', roleId: 'role-ops-manager', attributeIds: ['sc6-attr-ops'] }], activeDeskId: 'sc6-desk-ops' },
  { id: 'sc6-user-anita', name: 'Anita', email: 'anita@company.com', legoActorType: 'company_user', level: 'company', desks: [{ id: 'sc6-desk-finance', name: 'Finance Review', roleId: 'role-finance', attributeIds: ['sc6-attr-finance'] }], activeDeskId: 'sc6-desk-finance' },
];

const sc6Journeys: MockJourney[] = [
  { id: 'sc6-jrn-001', branchId: 'sc6-br-chn', from: 'Chennai', to: 'Coimbatore', routeItemId: 'sc6-md-rc1', vehicleNumber: 'TN09HH8888', vehicleType: 'TN-09 14MT Container', vehicleTypeItemId: 'sc6-md-vc1', materialItemId: 'sc6-md-mc1', transporterItemId: 'sc6-md-tc1', sim: true, gps: true, phone: '9876500020', slaStatus: 'On Time', eta: '06:00 pm', alert: null, alertTime: null, attribute: 'sc6-attr-ops' },
  { id: 'sc6-jrn-002', branchId: 'sc6-br-chn', from: 'Chennai', to: 'Bengaluru', routeItemId: 'sc6-md-rc2', vehicleNumber: 'TN09HH8888', vehicleType: 'TN-09 14MT Container', vehicleTypeItemId: 'sc6-md-vc1', materialItemId: 'sc6-md-mc1', transporterItemId: 'sc6-md-tc1', sim: true, gps: false, phone: '9876500021', slaStatus: 'On Time', eta: '08:00 pm', alert: null, alertTime: null, attribute: 'sc6-attr-ops' },
  { id: 'sc6-jrn-003', branchId: 'sc6-br-chn', from: 'Coimbatore', to: 'Chennai', routeItemId: 'sc6-md-rc1', vehicleNumber: 'TN09HH8888', vehicleType: 'TN-09 14MT Container', vehicleTypeItemId: 'sc6-md-vc1', materialItemId: 'sc6-md-mc1', transporterItemId: 'sc6-md-tc1', sim: false, gps: true, phone: '9876500022', slaStatus: 'Delayed', eta: '05:00 pm', alert: 'Route deviation', alertTime: '1 hr ago', attribute: 'sc6-attr-ops' },
  { id: 'sc6-jrn-004', branchId: 'sc6-br-chn', from: 'Bengaluru', to: 'Chennai', routeItemId: 'sc6-md-rc2', vehicleNumber: 'TN09HH8888', vehicleType: 'TN-09 14MT Container', vehicleTypeItemId: 'sc6-md-vc1', materialItemId: 'sc6-md-mc1', transporterItemId: 'sc6-md-tc1', sim: true, gps: true, phone: '9876500023', slaStatus: 'On Time', eta: '04:00 pm', alert: null, alertTime: null, attribute: 'sc6-attr-ops' },
  { id: 'sc6-jrn-005', branchId: 'sc6-br-mum', from: 'Mumbai', to: 'Pune', routeItemId: 'sc6-md-rm1', vehicleNumber: 'MH04AB1234', vehicleType: 'MH-04 Reefer', vehicleTypeItemId: 'sc6-md-vm1', materialItemId: 'sc6-md-mm1', transporterItemId: 'sc6-md-tm1', sim: true, gps: true, phone: '9876500024', slaStatus: 'On Time', eta: '06:30 pm', alert: null, alertTime: null, attribute: 'sc6-attr-finance' },
  { id: 'sc6-jrn-006', branchId: 'sc6-br-mum', from: 'Pune', to: 'Mumbai', routeItemId: 'sc6-md-rm1', vehicleNumber: 'MH04AB1234', vehicleType: 'MH-04 Reefer', vehicleTypeItemId: 'sc6-md-vm1', materialItemId: 'sc6-md-mm1', transporterItemId: 'sc6-md-tm1', sim: true, gps: false, phone: '9876500025', slaStatus: 'At Risk', eta: '08:00 pm', alert: null, alertTime: null, attribute: 'sc6-attr-finance' },
  { id: 'sc6-jrn-007', branchId: 'sc6-br-del', from: 'Delhi', to: 'Jaipur', routeItemId: 'sc6-md-rd1', vehicleNumber: 'DL01CX5678', vehicleType: 'DL-01 Trailer', vehicleTypeItemId: 'sc6-md-vd1', materialItemId: 'sc6-md-md1', transporterItemId: 'sc6-md-td1', sim: true, gps: true, phone: '9876500026', slaStatus: 'On Time', eta: '05:00 pm', alert: null, alertTime: null, attribute: 'sc6-attr-finance' },
  { id: 'sc6-jrn-008', branchId: 'sc6-br-del', from: 'Jaipur', to: 'Delhi', routeItemId: 'sc6-md-rd1', vehicleNumber: 'DL01CX5678', vehicleType: 'DL-01 Trailer', vehicleTypeItemId: 'sc6-md-vd1', materialItemId: 'sc6-md-md1', transporterItemId: 'sc6-md-td1', sim: false, gps: true, phone: '9876500027', slaStatus: 'Delayed', eta: '07:00 pm', alert: 'Toll', alertTime: '30 min ago', attribute: 'sc6-attr-finance' },
];

const scenario6: ScenarioFixture = {
  id: 'scenario-7',
  number: 7,
  title: 'Ops vs Finance',
  subtitle: 'Ops edits one branch; finance sees all branches, view-only',
  category: 'Department Roles',
  priority: 'Must Have',
  situation: 'Finance needs visibility across all branches for costs and invoices; Ops needs full control only within their branch.',
  howItWorks: 'Finance All attribute is read-only on all items; Chennai Ops has full CRUD on Chennai items only.',
  keyInsight: 'Read-only across the board supports audit and reporting without operational risk.',
  masterDataItems: sc6MasterData,
  branches: sc6Branches,
  attributes: sc6Attributes,
  users: sc6Users,
  journeys: sc6Journeys,
  highlightUsers: ['sc6-user-karthik', 'sc6-user-anita'],
  expectedOutcomes: [
    { userId: 'sc6-user-karthik', userName: 'Karthik', description: 'Sees 4 Chennai journeys; can edit all 4', canSeeJourneys: 4, canEditJourneys: 4 },
    { userId: 'sc6-user-anita', userName: 'Anita', description: 'Sees all 8 journeys; cannot edit any', canSeeJourneys: 8, canEditJourneys: 0 },
  ],
};

// --- Scenario 7: Dashboard Filtering Based on Access ---
const sc7Branches: Branch[] = [
  { id: 'sc7-br-tmcv', name: 'TMCV Division', code: 'TMCV' },
  { id: 'sc7-br-spd', name: 'SPD Division', code: 'SPD' },
  { id: 'sc7-br-def', name: 'DEF Division', code: 'DEF' },
];

const sc7TmcvIds = ['sc7-r-tmcv-1', 'sc7-r-tmcv-2', 'sc7-v-tmcv-1', 'sc7-m-tmcv-1', 'sc7-t-tmcv-1'];
const sc7SpdIds = ['sc7-r-spd-1', 'sc7-r-spd-2', 'sc7-v-spd-1', 'sc7-m-spd-1', 'sc7-t-spd-1'];
const sc7DefIds = ['sc7-r-def-1', 'sc7-r-def-2', 'sc7-v-def-1', 'sc7-m-def-1', 'sc7-t-def-1'];
const sc7AllIds = [...sc7TmcvIds, ...sc7SpdIds, ...sc7DefIds];

const sc7MasterData: MasterDataItem[] = [
  { id: 'sc7-r-tmcv-1', name: 'Pune → Jamshedpur', type: 'routes', branch: 'sc7-br-tmcv', onboardedAt: 'branch' },
  { id: 'sc7-r-tmcv-2', name: 'Jamshedpur → Pune', type: 'routes', branch: 'sc7-br-tmcv', onboardedAt: 'branch' },
  { id: 'sc7-v-tmcv-1', name: 'Flatbed 40MT', type: 'vehicle_type_master', branch: 'sc7-br-tmcv', onboardedAt: 'branch' },
  { id: 'sc7-m-tmcv-1', name: 'CKD Truck Parts', type: 'material_master', branch: 'sc7-br-tmcv', onboardedAt: 'branch' },
  { id: 'sc7-t-tmcv-1', name: 'Tata Logistics', type: 'transporter_master', branch: 'sc7-br-tmcv', onboardedAt: 'branch' },
  { id: 'sc7-r-spd-1', name: 'Mumbai → Chennai', type: 'routes', branch: 'sc7-br-spd', onboardedAt: 'branch' },
  { id: 'sc7-r-spd-2', name: 'Chennai → Mumbai', type: 'routes', branch: 'sc7-br-spd', onboardedAt: 'branch' },
  { id: 'sc7-v-spd-1', name: 'Car Carrier 12-unit', type: 'vehicle_type_master', branch: 'sc7-br-spd', onboardedAt: 'branch' },
  { id: 'sc7-m-spd-1', name: 'Sedan Components', type: 'material_master', branch: 'sc7-br-spd', onboardedAt: 'branch' },
  { id: 'sc7-t-spd-1', name: 'Gati Express', type: 'transporter_master', branch: 'sc7-br-spd', onboardedAt: 'branch' },
  { id: 'sc7-r-def-1', name: 'Avadi → Jabalpur', type: 'routes', branch: 'sc7-br-def', onboardedAt: 'branch' },
  { id: 'sc7-r-def-2', name: 'Jabalpur → Avadi', type: 'routes', branch: 'sc7-br-def', onboardedAt: 'branch' },
  { id: 'sc7-v-def-1', name: 'Armoured Carrier', type: 'vehicle_type_master', branch: 'sc7-br-def', onboardedAt: 'branch' },
  { id: 'sc7-m-def-1', name: 'Defence Equipment', type: 'material_master', branch: 'sc7-br-def', onboardedAt: 'branch' },
  { id: 'sc7-t-def-1', name: 'Military Logistics Corp', type: 'transporter_master', branch: 'sc7-br-def', onboardedAt: 'branch' },
];

const sc7Attributes: Attribute[] = [
  attr('sc7-attr-tmcv', 'TMCV Segment', 'branch', sc7TmcvIds, ['sc7-br-tmcv'], sc7MasterData),
  attr('sc7-attr-spd', 'SPD Segment', 'branch', sc7SpdIds, ['sc7-br-spd'], sc7MasterData),
  attr('sc7-attr-def', 'DEF Segment', 'branch', sc7DefIds, ['sc7-br-def'], sc7MasterData),
  attr('sc7-attr-all', 'All Segments', 'company', sc7AllIds, ['sc7-br-tmcv', 'sc7-br-spd', 'sc7-br-def'], sc7MasterData),
];

const sc7Users: User[] = [
  { id: 'sc7-user-tmcv', name: 'Vikram (TMCV Head)', email: 'vikram@company.com', legoActorType: 'branch_user', level: 'branch', branchId: 'sc7-br-tmcv', desks: [{ id: 'sc7-desk-tmcv', name: 'TMCV Segment', roleId: 'role-ops-manager', attributeIds: ['sc7-attr-tmcv'] }], activeDeskId: 'sc7-desk-tmcv' },
  { id: 'sc7-user-spd', name: 'Priya (SPD Head)', email: 'priya@company.com', legoActorType: 'branch_user', level: 'branch', branchId: 'sc7-br-spd', desks: [{ id: 'sc7-desk-spd', name: 'SPD Segment', roleId: 'role-ops-manager', attributeIds: ['sc7-attr-spd'] }], activeDeskId: 'sc7-desk-spd' },
  { id: 'sc7-user-def', name: 'Col. Sharma (DEF Head)', email: 'sharma@company.com', legoActorType: 'branch_user', level: 'branch', branchId: 'sc7-br-def', desks: [{ id: 'sc7-desk-def', name: 'DEF Segment', roleId: 'role-finance', attributeIds: ['sc7-attr-def'] }], activeDeskId: 'sc7-desk-def' },
  { id: 'sc7-user-national', name: 'Rajesh (National Ops Head)', email: 'rajesh@company.com', legoActorType: 'company_user', level: 'company', desks: [{ id: 'sc7-desk-national', name: 'All Segments', roleId: 'role-finance', attributeIds: ['sc7-attr-all'] }], activeDeskId: 'sc7-desk-national' },
];

const sc7Journeys: MockJourney[] = [
  { id: 'sc7-jrn-t1', branchId: 'sc7-br-tmcv', from: 'Pune', to: 'Jamshedpur', routeItemId: 'sc7-r-tmcv-1', vehicleNumber: 'MH12AA1001', vehicleType: 'Flatbed 40MT', vehicleTypeItemId: 'sc7-v-tmcv-1', materialItemId: 'sc7-m-tmcv-1', transporterItemId: 'sc7-t-tmcv-1', sim: true, gps: true, phone: '9876500071', slaStatus: 'On Time', eta: '06:00 pm', alert: null, alertTime: null, attribute: 'sc7-attr-tmcv' },
  { id: 'sc7-jrn-t2', branchId: 'sc7-br-tmcv', from: 'Jamshedpur', to: 'Pune', routeItemId: 'sc7-r-tmcv-2', vehicleNumber: 'MH12AA1002', vehicleType: 'Flatbed 40MT', vehicleTypeItemId: 'sc7-v-tmcv-1', materialItemId: 'sc7-m-tmcv-1', transporterItemId: 'sc7-t-tmcv-1', sim: true, gps: false, phone: '9876500072', slaStatus: 'On Time', eta: '08:00 pm', alert: null, alertTime: null, attribute: 'sc7-attr-tmcv' },
  { id: 'sc7-jrn-t3', branchId: 'sc7-br-tmcv', from: 'Pune', to: 'Jamshedpur', routeItemId: 'sc7-r-tmcv-1', vehicleNumber: 'MH12AA1003', vehicleType: 'Flatbed 40MT', vehicleTypeItemId: 'sc7-v-tmcv-1', materialItemId: 'sc7-m-tmcv-1', transporterItemId: 'sc7-t-tmcv-1', sim: false, gps: true, phone: '9876500073', slaStatus: 'At Risk', eta: '07:00 pm', alert: 'Delay', alertTime: '1 hr ago', attribute: 'sc7-attr-tmcv' },
  { id: 'sc7-jrn-t4', branchId: 'sc7-br-tmcv', from: 'Jamshedpur', to: 'Pune', routeItemId: 'sc7-r-tmcv-2', vehicleNumber: 'MH12AA1004', vehicleType: 'Flatbed 40MT', vehicleTypeItemId: 'sc7-v-tmcv-1', materialItemId: 'sc7-m-tmcv-1', transporterItemId: 'sc7-t-tmcv-1', sim: true, gps: true, phone: '9876500074', slaStatus: 'Delayed', eta: '09:00 pm', alert: 'Breakdown', alertTime: '30 min ago', attribute: 'sc7-attr-tmcv' },
  { id: 'sc7-jrn-s1', branchId: 'sc7-br-spd', from: 'Mumbai', to: 'Chennai', routeItemId: 'sc7-r-spd-1', vehicleNumber: 'MH04BB2001', vehicleType: 'Car Carrier 12-unit', vehicleTypeItemId: 'sc7-v-spd-1', materialItemId: 'sc7-m-spd-1', transporterItemId: 'sc7-t-spd-1', sim: true, gps: true, phone: '9876500075', slaStatus: 'On Time', eta: '05:00 pm', alert: null, alertTime: null, attribute: 'sc7-attr-spd' },
  { id: 'sc7-jrn-s2', branchId: 'sc7-br-spd', from: 'Chennai', to: 'Mumbai', routeItemId: 'sc7-r-spd-2', vehicleNumber: 'MH04BB2002', vehicleType: 'Car Carrier 12-unit', vehicleTypeItemId: 'sc7-v-spd-1', materialItemId: 'sc7-m-spd-1', transporterItemId: 'sc7-t-spd-1', sim: true, gps: false, phone: '9876500076', slaStatus: 'On Time', eta: '07:00 pm', alert: null, alertTime: null, attribute: 'sc7-attr-spd' },
  { id: 'sc7-jrn-s3', branchId: 'sc7-br-spd', from: 'Mumbai', to: 'Chennai', routeItemId: 'sc7-r-spd-1', vehicleNumber: 'MH04BB2003', vehicleType: 'Car Carrier 12-unit', vehicleTypeItemId: 'sc7-v-spd-1', materialItemId: 'sc7-m-spd-1', transporterItemId: 'sc7-t-spd-1', sim: false, gps: true, phone: '9876500077', slaStatus: 'At Risk', eta: '06:30 pm', alert: null, alertTime: null, attribute: 'sc7-attr-spd' },
  { id: 'sc7-jrn-s4', branchId: 'sc7-br-spd', from: 'Chennai', to: 'Mumbai', routeItemId: 'sc7-r-spd-2', vehicleNumber: 'MH04BB2004', vehicleType: 'Car Carrier 12-unit', vehicleTypeItemId: 'sc7-v-spd-1', materialItemId: 'sc7-m-spd-1', transporterItemId: 'sc7-t-spd-1', sim: true, gps: true, phone: '9876500078', slaStatus: 'Delayed', eta: '08:00 pm', alert: 'Toll delay', alertTime: '45 min ago', attribute: 'sc7-attr-spd' },
  { id: 'sc7-jrn-d1', branchId: 'sc7-br-def', from: 'Avadi', to: 'Jabalpur', routeItemId: 'sc7-r-def-1', vehicleNumber: 'TN09CC3001', vehicleType: 'Armoured Carrier', vehicleTypeItemId: 'sc7-v-def-1', materialItemId: 'sc7-m-def-1', transporterItemId: 'sc7-t-def-1', sim: true, gps: true, phone: '9876500079', slaStatus: 'On Time', eta: '04:00 pm', alert: null, alertTime: null, attribute: 'sc7-attr-def' },
  { id: 'sc7-jrn-d2', branchId: 'sc7-br-def', from: 'Jabalpur', to: 'Avadi', routeItemId: 'sc7-r-def-2', vehicleNumber: 'TN09CC3002', vehicleType: 'Armoured Carrier', vehicleTypeItemId: 'sc7-v-def-1', materialItemId: 'sc7-m-def-1', transporterItemId: 'sc7-t-def-1', sim: true, gps: false, phone: '9876500080', slaStatus: 'On Time', eta: '06:00 pm', alert: null, alertTime: null, attribute: 'sc7-attr-def' },
  { id: 'sc7-jrn-d3', branchId: 'sc7-br-def', from: 'Avadi', to: 'Jabalpur', routeItemId: 'sc7-r-def-1', vehicleNumber: 'TN09CC3003', vehicleType: 'Armoured Carrier', vehicleTypeItemId: 'sc7-v-def-1', materialItemId: 'sc7-m-def-1', transporterItemId: 'sc7-t-def-1', sim: false, gps: true, phone: '9876500081', slaStatus: 'At Risk', eta: '05:30 pm', alert: null, alertTime: null, attribute: 'sc7-attr-def' },
  { id: 'sc7-jrn-d4', branchId: 'sc7-br-def', from: 'Jabalpur', to: 'Avadi', routeItemId: 'sc7-r-def-2', vehicleNumber: 'TN09CC3004', vehicleType: 'Armoured Carrier', vehicleTypeItemId: 'sc7-v-def-1', materialItemId: 'sc7-m-def-1', transporterItemId: 'sc7-t-def-1', sim: true, gps: true, phone: '9876500082', slaStatus: 'On Time', eta: '07:30 pm', alert: null, alertTime: null, attribute: 'sc7-attr-def' },
];

const scenario7: ScenarioFixture = {
  id: 'scenario-8',
  number: 8,
  title: 'Dashboard Filtering Based on Access',
  subtitle: 'Regional head sees only their segment\'s dashboard data',
  category: 'Reporting',
  priority: 'Must Have',
  situation: "A logistics company has three business segments: TMCV (commercial vehicles), SPD (passenger vehicles), and DEF (defence). Each segment head needs to see performance dashboards showing only their segment's data. A national operations head needs to see all three segments combined.",
  howItWorks: "Each segment head gets an attribute scoped to their segment's master data. The national head gets an attribute covering all three segments. Dashboard charts, KPIs, and tables automatically filter based on the user's attribute — the same dashboard page shows different data depending on who is logged in.",
  keyInsight: "The same dashboard page serves every user — attributes control what data populates the charts, not which charts are shown.",
  masterDataItems: sc7MasterData,
  branches: sc7Branches,
  attributes: sc7Attributes,
  users: sc7Users,
  journeys: sc7Journeys,
  highlightUsers: ['sc7-user-tmcv', 'sc7-user-spd', 'sc7-user-def', 'sc7-user-national'],
  expectedOutcomes: [
    { userId: 'sc7-user-tmcv', userName: 'Vikram (TMCV Head)', description: 'Sees 4 TMCV journeys, edits all 4', canSeeJourneys: 4, canEditJourneys: 4 },
    { userId: 'sc7-user-spd', userName: 'Priya (SPD Head)', description: 'Sees 4 SPD journeys, edits all 4', canSeeJourneys: 4, canEditJourneys: 4 },
    { userId: 'sc7-user-def', userName: 'Col. Sharma (DEF Head)', description: 'Sees 4 DEF journeys, edits 0 (read only)', canSeeJourneys: 4, canEditJourneys: 0 },
    { userId: 'sc7-user-national', userName: 'Rajesh (National Ops Head)', description: 'Sees all 12 journeys, edits 0 (read only)', canSeeJourneys: 12, canEditJourneys: 0 },
  ],
};

// --- Scenario 8: New User No Attributes (Default Branch Fallback) ---
const sc8Branches: Branch[] = [{ id: 'sc8-br-pune', name: 'Pune', code: 'PUN' }];

const sc8FmcgIds = ['sc8-md-r1', 'sc8-md-r2', 'sc8-md-v1', 'sc8-md-m1', 'sc8-md-m2', 'sc8-md-t1'];

const sc8MasterData: MasterDataItem[] = [
  { id: 'sc8-md-r1', name: 'Pune → Solapur', type: 'routes', branch: 'sc8-br-pune', onboardedAt: 'branch' },
  { id: 'sc8-md-r2', name: 'Pune → Kolhapur', type: 'routes', branch: 'sc8-br-pune', onboardedAt: 'branch' },
  { id: 'sc8-md-v1', name: 'MH-12 14MT Ashok Leyland', type: 'vehicle_type_master', branch: 'sc8-br-pune', onboardedAt: 'branch' },
  { id: 'sc8-md-m1', name: '11 MT Nirma Detergent (FMCG)', type: 'material_master', branch: 'sc8-br-pune', onboardedAt: 'branch' },
  { id: 'sc8-md-m2', name: '8 MT Amul Butter (FMCG)', type: 'material_master', branch: 'sc8-br-pune', onboardedAt: 'branch' },
  { id: 'sc8-md-m3', name: '15 MT UltraTech Cement', type: 'material_master', branch: 'sc8-br-pune', onboardedAt: 'branch' },
  { id: 'sc8-md-m4', name: '12 MT ACC Cement', type: 'material_master', branch: 'sc8-br-pune', onboardedAt: 'branch' },
  { id: 'sc8-md-t1', name: 'ABC Logistics', type: 'transporter_master', branch: 'sc8-br-pune', onboardedAt: 'branch' },
  { id: 'sc8-md-t2', name: 'Shreeji Transport', type: 'transporter_master', branch: 'sc8-br-pune', onboardedAt: 'branch' },
];

const sc8Attributes: Attribute[] = [
  attr('sc8-attr-fmcg', 'Pune FMCG', 'branch', sc8FmcgIds, ['sc8-br-pune'], sc8MasterData),
];

const sc8Users: User[] = [
  { id: 'sc8-user-sunil', name: 'Sunil', email: 'sunil@company.com', legoActorType: 'branch_user', level: 'branch', branchId: 'sc8-br-pune', desks: [], activeDeskId: '', defaultBranchAccess: true },
  { id: 'sc8-user-ops', name: 'Pune Ops User', email: 'pune-ops@company.com', legoActorType: 'branch_user', level: 'branch', branchId: 'sc8-br-pune', desks: [{ id: 'sc8-desk-fmcg', name: 'Pune FMCG', roleId: 'role-ops-manager', attributeIds: ['sc8-attr-fmcg'] }], activeDeskId: 'sc8-desk-fmcg' },
];

const sc8Journeys: MockJourney[] = [
  { id: 'sc8-jrn-001', branchId: 'sc8-br-pune', from: 'Pune', to: 'Solapur', routeItemId: 'sc8-md-r1', vehicleNumber: 'MH12FF6666', vehicleType: 'MH-12 14MT Ashok Leyland', vehicleTypeItemId: 'sc8-md-v1', materialItemId: 'sc8-md-m1', transporterItemId: 'sc8-md-t1', sim: true, gps: true, phone: '9876500030', slaStatus: 'On Time', eta: '06:00 pm', alert: null, alertTime: null, attribute: 'sc8-attr-fmcg' },
  { id: 'sc8-jrn-002', branchId: 'sc8-br-pune', from: 'Pune', to: 'Kolhapur', routeItemId: 'sc8-md-r2', vehicleNumber: 'MH12FF6666', vehicleType: 'MH-12 14MT Ashok Leyland', vehicleTypeItemId: 'sc8-md-v1', materialItemId: 'sc8-md-m2', transporterItemId: 'sc8-md-t1', sim: true, gps: false, phone: '9876500031', slaStatus: 'On Time', eta: '04:00 pm', alert: null, alertTime: null, attribute: 'sc8-attr-fmcg' },
  { id: 'sc8-jrn-003', branchId: 'sc8-br-pune', from: 'Solapur', to: 'Pune', routeItemId: 'sc8-md-r1', vehicleNumber: 'MH12FF6666', vehicleType: 'MH-12 14MT Ashok Leyland', vehicleTypeItemId: 'sc8-md-v1', materialItemId: 'sc8-md-m1', transporterItemId: 'sc8-md-t1', sim: false, gps: true, phone: '9876500032', slaStatus: 'Delayed', eta: '08:00 pm', alert: 'Delay', alertTime: '1 hr ago', attribute: 'sc8-attr-fmcg' },
  { id: 'sc8-jrn-004', branchId: 'sc8-br-pune', from: 'Pune', to: 'Solapur', routeItemId: 'sc8-md-r1', vehicleNumber: 'MH12GG7777', vehicleType: 'MH-12 14MT Ashok Leyland', vehicleTypeItemId: 'sc8-md-v1', materialItemId: 'sc8-md-m3', transporterItemId: 'sc8-md-t2', sim: true, gps: true, phone: '9876500033', slaStatus: 'On Time', eta: '05:00 pm', alert: null, alertTime: null, attribute: 'sc8-attr-fmcg' },
  { id: 'sc8-jrn-005', branchId: 'sc8-br-pune', from: 'Pune', to: 'Kolhapur', routeItemId: 'sc8-md-r2', vehicleNumber: 'MH12GG7777', vehicleType: 'MH-12 14MT Ashok Leyland', vehicleTypeItemId: 'sc8-md-v1', materialItemId: 'sc8-md-m4', transporterItemId: 'sc8-md-t2', sim: true, gps: true, phone: '9876500034', slaStatus: 'At Risk', eta: '07:00 pm', alert: null, alertTime: null, attribute: 'sc8-attr-fmcg' },
  { id: 'sc8-jrn-006', branchId: 'sc8-br-pune', from: 'Kolhapur', to: 'Pune', routeItemId: 'sc8-md-r2', vehicleNumber: 'MH12GG7777', vehicleType: 'MH-12 14MT Ashok Leyland', vehicleTypeItemId: 'sc8-md-v1', materialItemId: 'sc8-md-m3', transporterItemId: 'sc8-md-t2', sim: true, gps: true, phone: '9876500035', slaStatus: 'On Time', eta: '09:00 pm', alert: null, alertTime: null, attribute: 'sc8-attr-fmcg' },
];

const scenario8: ScenarioFixture = {
  id: 'scenario-9',
  number: 9,
  title: 'New User with No Attributes Assigned Yet',
  subtitle: 'New user sees all branch data until given a role',
  category: 'Default Behaviour',
  priority: 'Must Have',
  situation: 'A new joiner has no tags yet. System can grant full branch access until attributes are assigned (Option B — Open Start).',
  howItWorks: 'Sunil has defaultBranchAccess: true and no attributes, so resolver grants full CRUD on branch data. Ops user has FMCG attribute and sees only FMCG journeys.',
  keyInsight: 'Default branch fallback avoids blocking new users while admin configures tags.',
  masterDataItems: sc8MasterData,
  branches: sc8Branches,
  attributes: sc8Attributes,
  users: sc8Users,
  journeys: sc8Journeys,
  highlightUsers: ['sc8-user-sunil', 'sc8-user-ops'],
  expectedOutcomes: [
    { userId: 'sc8-user-sunil', userName: 'Sunil', description: 'Sees all 6 Pune journeys (default fallback)', canSeeJourneys: 6, canEditJourneys: 6 },
    { userId: 'sc8-user-ops', userName: 'Pune Ops User', description: 'Sees only 3 FMCG journeys (attribute scoped)', canSeeJourneys: 3, canEditJourneys: 3 },
  ],
};

// --- Scenario 16: Bulk Actions Across Boundaries ---
const sc16Branches: Branch[] = [{ id: 'sc16-br-spd', name: 'SPD', code: 'SPD' }];

const sc16NorthIds = ['sc16-md-rn1', 'sc16-md-rn2', 'sc16-md-vn1', 'sc16-md-mn1', 'sc16-md-tn1'];
const sc16SouthIds = ['sc16-md-rs1', 'sc16-md-rs2', 'sc16-md-vs1', 'sc16-md-ms1', 'sc16-md-ts1'];

const sc16MasterData: MasterDataItem[] = [
  { id: 'sc16-md-rn1', name: 'Delhi → Jaipur', type: 'routes', branch: 'sc16-br-spd', onboardedAt: 'branch' },
  { id: 'sc16-md-rn2', name: 'Delhi → Lucknow', type: 'routes', branch: 'sc16-br-spd', onboardedAt: 'branch' },
  { id: 'sc16-md-rs1', name: 'Hyderabad → Vijayawada', type: 'routes', branch: 'sc16-br-spd', onboardedAt: 'branch' },
  { id: 'sc16-md-rs2', name: 'Bengaluru → Mysuru', type: 'routes', branch: 'sc16-br-spd', onboardedAt: 'branch' },
  { id: 'sc16-md-vn1', name: 'DL-01 Tata 407', type: 'vehicle_type_master', branch: 'sc16-br-spd', onboardedAt: 'branch' },
  { id: 'sc16-md-vs1', name: 'TS-08 Ashok Leyland', type: 'vehicle_type_master', branch: 'sc16-br-spd', onboardedAt: 'branch' },
  { id: 'sc16-md-mn1', name: '10 MT ACC Cement', type: 'material_master', branch: 'sc16-br-spd', onboardedAt: 'branch' },
  { id: 'sc16-md-ms1', name: '8 MT Ambuja Cement', type: 'material_master', branch: 'sc16-br-spd', onboardedAt: 'branch' },
  { id: 'sc16-md-tn1', name: 'Rajdhani Carriers', type: 'transporter_master', branch: 'sc16-br-spd', onboardedAt: 'branch' },
  { id: 'sc16-md-ts1', name: 'Deccan Freight', type: 'transporter_master', branch: 'sc16-br-spd', onboardedAt: 'branch' },
];

const sc16Attributes: Attribute[] = [
  attr('sc16-attr-north', 'SPD_NORTH', 'branch', sc16NorthIds, ['sc16-br-spd'], sc16MasterData),
  attr('sc16-attr-south', 'SPD_SOUTH', 'branch', sc16SouthIds, ['sc16-br-spd'], sc16MasterData),
];

const sc16Users: User[] = [
  { id: 'sc16-user-anil', name: 'Mr. Anil', email: 'anil@company.com', legoActorType: 'company_user', level: 'company', desks: [{ id: 'sc16-desk-north', name: 'North Ops', roleId: 'role-ops-manager', attributeIds: ['sc16-attr-north'] }, { id: 'sc16-desk-south', name: 'South Monitor', roleId: 'role-finance', attributeIds: ['sc16-attr-south'] }], activeDeskId: 'sc16-desk-north' },
];

const sc16Journeys: MockJourney[] = [
  { id: 'sc16-jrn-n1', branchId: 'sc16-br-spd', from: 'Delhi', to: 'Jaipur', routeItemId: 'sc16-md-rn1', vehicleNumber: 'DL01AA1111', vehicleType: 'DL-01 Tata 407', vehicleTypeItemId: 'sc16-md-vn1', materialItemId: 'sc16-md-mn1', transporterItemId: 'sc16-md-tn1', sim: true, gps: true, phone: '9876500050', slaStatus: 'On Time', eta: '06:00 pm', alert: null, alertTime: null, attribute: 'sc16-attr-north' },
  { id: 'sc16-jrn-n2', branchId: 'sc16-br-spd', from: 'Delhi', to: 'Lucknow', routeItemId: 'sc16-md-rn2', vehicleNumber: 'DL01AA1111', vehicleType: 'DL-01 Tata 407', vehicleTypeItemId: 'sc16-md-vn1', materialItemId: 'sc16-md-mn1', transporterItemId: 'sc16-md-tn1', sim: true, gps: false, phone: '9876500051', slaStatus: 'On Time', eta: '08:00 pm', alert: null, alertTime: null, attribute: 'sc16-attr-north' },
  { id: 'sc16-jrn-n3', branchId: 'sc16-br-spd', from: 'Jaipur', to: 'Delhi', routeItemId: 'sc16-md-rn1', vehicleNumber: 'DL01AA1111', vehicleType: 'DL-01 Tata 407', vehicleTypeItemId: 'sc16-md-vn1', materialItemId: 'sc16-md-mn1', transporterItemId: 'sc16-md-tn1', sim: false, gps: true, phone: '9876500052', slaStatus: 'Delayed', eta: '05:00 pm', alert: 'Toll', alertTime: '30 min ago', attribute: 'sc16-attr-north' },
  { id: 'sc16-jrn-n4', branchId: 'sc16-br-spd', from: 'Lucknow', to: 'Delhi', routeItemId: 'sc16-md-rn2', vehicleNumber: 'DL01AA1111', vehicleType: 'DL-01 Tata 407', vehicleTypeItemId: 'sc16-md-vn1', materialItemId: 'sc16-md-mn1', transporterItemId: 'sc16-md-tn1', sim: true, gps: true, phone: '9876500053', slaStatus: 'On Time', eta: '07:00 pm', alert: null, alertTime: null, attribute: 'sc16-attr-north' },
  { id: 'sc16-jrn-n5', branchId: 'sc16-br-spd', from: 'Delhi', to: 'Jaipur', routeItemId: 'sc16-md-rn1', vehicleNumber: 'DL01BB2222', vehicleType: 'DL-01 Tata 407', vehicleTypeItemId: 'sc16-md-vn1', materialItemId: 'sc16-md-mn1', transporterItemId: 'sc16-md-tn1', sim: true, gps: true, phone: '9876500054', slaStatus: 'On Time', eta: '04:00 pm', alert: null, alertTime: null, attribute: 'sc16-attr-north' },
  { id: 'sc16-jrn-n6', branchId: 'sc16-br-spd', from: 'Jaipur', to: 'Lucknow', routeItemId: 'sc16-md-rn2', vehicleNumber: 'DL01BB2222', vehicleType: 'DL-01 Tata 407', vehicleTypeItemId: 'sc16-md-vn1', materialItemId: 'sc16-md-mn1', transporterItemId: 'sc16-md-tn1', sim: true, gps: true, phone: '9876500055', slaStatus: 'At Risk', eta: '09:00 pm', alert: null, alertTime: null, attribute: 'sc16-attr-north' },
  { id: 'sc16-jrn-s1', branchId: 'sc16-br-spd', from: 'Hyderabad', to: 'Vijayawada', routeItemId: 'sc16-md-rs1', vehicleNumber: 'TS08BB2222', vehicleType: 'TS-08 Ashok Leyland', vehicleTypeItemId: 'sc16-md-vs1', materialItemId: 'sc16-md-ms1', transporterItemId: 'sc16-md-ts1', sim: true, gps: true, phone: '9876500056', slaStatus: 'On Time', eta: '03:00 pm', alert: null, alertTime: null, attribute: 'sc16-attr-south' },
  { id: 'sc16-jrn-s2', branchId: 'sc16-br-spd', from: 'Bengaluru', to: 'Mysuru', routeItemId: 'sc16-md-rs2', vehicleNumber: 'TS08BB2222', vehicleType: 'TS-08 Ashok Leyland', vehicleTypeItemId: 'sc16-md-vs1', materialItemId: 'sc16-md-ms1', transporterItemId: 'sc16-md-ts1', sim: true, gps: false, phone: '9876500057', slaStatus: 'On Time', eta: '02:00 pm', alert: null, alertTime: null, attribute: 'sc16-attr-south' },
  { id: 'sc16-jrn-s3', branchId: 'sc16-br-spd', from: 'Vijayawada', to: 'Hyderabad', routeItemId: 'sc16-md-rs1', vehicleNumber: 'TS08BB2222', vehicleType: 'TS-08 Ashok Leyland', vehicleTypeItemId: 'sc16-md-vs1', materialItemId: 'sc16-md-ms1', transporterItemId: 'sc16-md-ts1', sim: false, gps: true, phone: '9876500058', slaStatus: 'Delayed', eta: '06:00 pm', alert: 'Breakdown', alertTime: '1 hr ago', attribute: 'sc16-attr-south' },
  { id: 'sc16-jrn-s4', branchId: 'sc16-br-spd', from: 'Mysuru', to: 'Bengaluru', routeItemId: 'sc16-md-rs2', vehicleNumber: 'TS08BB2222', vehicleType: 'TS-08 Ashok Leyland', vehicleTypeItemId: 'sc16-md-vs1', materialItemId: 'sc16-md-ms1', transporterItemId: 'sc16-md-ts1', sim: true, gps: true, phone: '9876500059', slaStatus: 'On Time', eta: '05:00 pm', alert: null, alertTime: null, attribute: 'sc16-attr-south' },
];

const scenario16: ScenarioFixture = {
  id: 'scenario-10',
  number: 10,
  title: 'Bulk Actions Across Mixed Access Boundaries',
  subtitle: 'User sees two regions: full access in one, view-only in the other. Use desk switcher in demo.',
  category: 'Bulk Operations',
  priority: 'Supported',
  situation: 'User has full access to one region and read-only to another. Bulk actions would update only the rows they can edit.',
  howItWorks: 'SPD_NORTH grants CRUD, SPD_SOUTH grants read-only. Same user has both; journey list shows mixed Edit enabled/disabled.',
  keyInsight: 'Mixed permissions surface as mixed Edit button state; bulk ops would skip read-only rows.',
  masterDataItems: sc16MasterData,
  branches: sc16Branches,
  attributes: sc16Attributes,
  users: sc16Users,
  journeys: sc16Journeys,
  highlightUsers: ['sc16-user-anil'],
  expectedOutcomes: [
    { userId: 'sc16-user-anil', userName: 'Mr. Anil', description: 'Sees all 10; can edit 6 North, Edit disabled on 4 South', canSeeJourneys: 10, canEditJourneys: 6 },
  ],
};

// --- Scenario 18: Conflicting Access Rules (Most Permissive Wins) ---
const sc18Branches: Branch[] = [{ id: 'sc18-br-spd', name: 'SPD', code: 'SPD' }];

const sc18NorthIds = ['sc18-md-rn1', 'sc18-md-rn2', 'sc18-md-vn1', 'sc18-md-mn1', 'sc18-md-tn1'];
const sc18AllIds = [...sc18NorthIds, 'sc18-md-rs1', 'sc18-md-re1', 'sc18-md-rw1', 'sc18-md-vs1', 'sc18-md-ve1', 'sc18-md-vw1', 'sc18-md-ms1', 'sc18-md-me1', 'sc18-md-mw1', 'sc18-md-ts1', 'sc18-md-te1', 'sc18-md-tw1'];

const sc18MasterData: MasterDataItem[] = [
  { id: 'sc18-md-rn1', name: 'Delhi → Jaipur (North)', type: 'routes', branch: 'sc18-br-spd', onboardedAt: 'branch' },
  { id: 'sc18-md-rn2', name: 'Delhi → Dehradun (North)', type: 'routes', branch: 'sc18-br-spd', onboardedAt: 'branch' },
  { id: 'sc18-md-rs1', name: 'Hyderabad → Vijayawada (South)', type: 'routes', branch: 'sc18-br-spd', onboardedAt: 'branch' },
  { id: 'sc18-md-re1', name: 'Kolkata → Patna (East)', type: 'routes', branch: 'sc18-br-spd', onboardedAt: 'branch' },
  { id: 'sc18-md-rw1', name: 'Mumbai → Pune (West)', type: 'routes', branch: 'sc18-br-spd', onboardedAt: 'branch' },
  { id: 'sc18-md-vn1', name: 'DL-01 Tata 407', type: 'vehicle_type_master', branch: 'sc18-br-spd', onboardedAt: 'branch' },
  { id: 'sc18-md-vs1', name: 'TS-08 Ashok Leyland', type: 'vehicle_type_master', branch: 'sc18-br-spd', onboardedAt: 'branch' },
  { id: 'sc18-md-ve1', name: 'WB-02 Eicher', type: 'vehicle_type_master', branch: 'sc18-br-spd', onboardedAt: 'branch' },
  { id: 'sc18-md-vw1', name: 'MH-12 Trailer', type: 'vehicle_type_master', branch: 'sc18-br-spd', onboardedAt: 'branch' },
  { id: 'sc18-md-mn1', name: '10 MT ACC Cement', type: 'material_master', branch: 'sc18-br-spd', onboardedAt: 'branch' },
  { id: 'sc18-md-ms1', name: '8 MT Ambuja Cement', type: 'material_master', branch: 'sc18-br-spd', onboardedAt: 'branch' },
  { id: 'sc18-md-me1', name: '14 MT Birla Cement', type: 'material_master', branch: 'sc18-br-spd', onboardedAt: 'branch' },
  { id: 'sc18-md-mw1', name: '12 MT JK Cement', type: 'material_master', branch: 'sc18-br-spd', onboardedAt: 'branch' },
  { id: 'sc18-md-tn1', name: 'Rajdhani Carriers', type: 'transporter_master', branch: 'sc18-br-spd', onboardedAt: 'branch' },
  { id: 'sc18-md-ts1', name: 'Deccan Freight', type: 'transporter_master', branch: 'sc18-br-spd', onboardedAt: 'branch' },
  { id: 'sc18-md-te1', name: 'Eastern Express', type: 'transporter_master', branch: 'sc18-br-spd', onboardedAt: 'branch' },
  { id: 'sc18-md-tw1', name: 'Western Roadways', type: 'transporter_master', branch: 'sc18-br-spd', onboardedAt: 'branch' },
];

const sc18Attributes: Attribute[] = [
  attr('sc18-attr-north', 'SPD_NORTH', 'branch', sc18NorthIds, ['sc18-br-spd'], sc18MasterData),
  attr('sc18-attr-all', 'SPD_ALL', 'branch', sc18AllIds, ['sc18-br-spd'], sc18MasterData),
];

const sc18Users: User[] = [
  { id: 'sc18-user-lakshmi', name: 'Ms. Lakshmi', email: 'lakshmi@company.com', legoActorType: 'company_user', level: 'company', desks: [{ id: 'sc18-desk-north', name: 'North Ops', roleId: 'role-ops-manager', attributeIds: ['sc18-attr-north'] }, { id: 'sc18-desk-all', name: 'SPD Monitor', roleId: 'role-finance', attributeIds: ['sc18-attr-all'] }], activeDeskId: 'sc18-desk-north' },
];

const sc18Journeys: MockJourney[] = [
  { id: 'sc18-jrn-n1', branchId: 'sc18-br-spd', from: 'Delhi', to: 'Jaipur', routeItemId: 'sc18-md-rn1', vehicleNumber: 'DL01AA1111', vehicleType: 'DL-01 Tata 407', vehicleTypeItemId: 'sc18-md-vn1', materialItemId: 'sc18-md-mn1', transporterItemId: 'sc18-md-tn1', sim: true, gps: true, phone: '9876500060', slaStatus: 'On Time', eta: '06:00 pm', alert: null, alertTime: null, attribute: 'sc18-attr-north' },
  { id: 'sc18-jrn-n2', branchId: 'sc18-br-spd', from: 'Delhi', to: 'Dehradun', routeItemId: 'sc18-md-rn2', vehicleNumber: 'DL01AA1111', vehicleType: 'DL-01 Tata 407', vehicleTypeItemId: 'sc18-md-vn1', materialItemId: 'sc18-md-mn1', transporterItemId: 'sc18-md-tn1', sim: true, gps: false, phone: '9876500061', slaStatus: 'Delayed', eta: '08:00 pm', alert: 'Toll', alertTime: '1 hr ago', attribute: 'sc18-attr-north' },
  { id: 'sc18-jrn-s1', branchId: 'sc18-br-spd', from: 'Hyderabad', to: 'Vijayawada', routeItemId: 'sc18-md-rs1', vehicleNumber: 'TS08BB2222', vehicleType: 'TS-08 Ashok Leyland', vehicleTypeItemId: 'sc18-md-vs1', materialItemId: 'sc18-md-ms1', transporterItemId: 'sc18-md-ts1', sim: true, gps: true, phone: '9876500062', slaStatus: 'On Time', eta: '04:00 pm', alert: null, alertTime: null, attribute: 'sc18-attr-all' },
  { id: 'sc18-jrn-s2', branchId: 'sc18-br-spd', from: 'Bengaluru', to: 'Mysuru', routeItemId: 'sc18-md-rs1', vehicleNumber: 'TS08BB2222', vehicleType: 'TS-08 Ashok Leyland', vehicleTypeItemId: 'sc18-md-vs1', materialItemId: 'sc18-md-ms1', transporterItemId: 'sc18-md-ts1', sim: false, gps: true, phone: '9876500063', slaStatus: 'On Time', eta: '02:00 pm', alert: null, alertTime: null, attribute: 'sc18-attr-all' },
  { id: 'sc18-jrn-e1', branchId: 'sc18-br-spd', from: 'Kolkata', to: 'Patna', routeItemId: 'sc18-md-re1', vehicleNumber: 'WB02CC3333', vehicleType: 'WB-02 Eicher', vehicleTypeItemId: 'sc18-md-ve1', materialItemId: 'sc18-md-me1', transporterItemId: 'sc18-md-te1', sim: true, gps: true, phone: '9876500064', slaStatus: 'At Risk', eta: '07:00 pm', alert: null, alertTime: null, attribute: 'sc18-attr-all' },
  { id: 'sc18-jrn-e2', branchId: 'sc18-br-spd', from: 'Patna', to: 'Kolkata', routeItemId: 'sc18-md-re1', vehicleNumber: 'WB02CC3333', vehicleType: 'WB-02 Eicher', vehicleTypeItemId: 'sc18-md-ve1', materialItemId: 'sc18-md-me1', transporterItemId: 'sc18-md-te1', sim: true, gps: true, phone: '9876500065', slaStatus: 'On Time', eta: '05:00 pm', alert: null, alertTime: null, attribute: 'sc18-attr-all' },
  { id: 'sc18-jrn-w1', branchId: 'sc18-br-spd', from: 'Mumbai', to: 'Pune', routeItemId: 'sc18-md-rw1', vehicleNumber: 'MH12DD4444', vehicleType: 'MH-12 Trailer', vehicleTypeItemId: 'sc18-md-vw1', materialItemId: 'sc18-md-mw1', transporterItemId: 'sc18-md-tw1', sim: true, gps: true, phone: '9876500066', slaStatus: 'On Time', eta: '06:30 pm', alert: null, alertTime: null, attribute: 'sc18-attr-all' },
  { id: 'sc18-jrn-w2', branchId: 'sc18-br-spd', from: 'Pune', to: 'Mumbai', routeItemId: 'sc18-md-rw1', vehicleNumber: 'MH12DD4444', vehicleType: 'MH-12 Trailer', vehicleTypeItemId: 'sc18-md-vw1', materialItemId: 'sc18-md-mw1', transporterItemId: 'sc18-md-tw1', sim: false, gps: true, phone: '9876500067', slaStatus: 'On Time', eta: '03:00 pm', alert: null, alertTime: null, attribute: 'sc18-attr-all' },
];

const scenario18: ScenarioFixture = {
  id: 'scenario-11',
  number: 11,
  title: 'Conflicting Access Rules — Most Permissive Wins',
  subtitle: 'User has two roles: full access in one region, view-only everywhere. Switch desks to toggle.',
  category: 'Conflict Resolution',
  priority: 'Must Have',
  situation: 'User has two tags: one gives full CRUD on North, one gives view-only on all. Permissions are unioned — most permissive wins.',
  howItWorks: 'Existing resolver unions permissions across attributes. For North items Lakshmi has read+update from SPD_NORTH; for others only read from SPD_ALL.',
  keyInsight: 'Union-based aggregation implements "most permissive wins" without explicit conflict rules.',
  masterDataItems: sc18MasterData,
  branches: sc18Branches,
  attributes: sc18Attributes,
  users: sc18Users,
  journeys: sc18Journeys,
  highlightUsers: ['sc18-user-lakshmi'],
  expectedOutcomes: [
    { userId: 'sc18-user-lakshmi', userName: 'Ms. Lakshmi', description: 'Sees all 8; can edit 2 North only', canSeeJourneys: 8, canEditJourneys: 2 },
  ],
};

// --- Export ---
export const SCENARIO_FIXTURES: ScenarioFixture[] = [
  scenario1,
  scenario2,
  scenario25,
  scenario3,
  scenario4,
  scenario5,
  scenario6,
  scenario7,
  scenario8,
  scenario16,
  scenario18,
];

export const getScenarioById = (id: string): ScenarioFixture | undefined =>
  SCENARIO_FIXTURES.find((s) => s.id === id);
