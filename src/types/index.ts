export interface Attribute {
  id: string;
  label: string;
  description?: string;
  scope: 'company' | 'branch';
  createdBy: string;
  createdByUserId: string;
  createdByActorType: LegoActorType;
  createdAt: string;
  masterDataMapping: MasterDataMapping;
  fieldMapping: FieldMapping;
  assignedUsers: string[];
}

export type LegoActorType =
  | 'company_admin'
  | 'branch_admin'
  | 'company_user'
  | 'branch_user';

export type CrudPermission = 'create' | 'read' | 'update' | 'delete';

export const ALL_CRUD: CrudPermission[] = ['create', 'read', 'update', 'delete'];

export interface MasterDataTypeRestriction {
  mode: 'all' | 'specific' | 'none';
  selectedItemIds: string[]; // only used when mode === 'specific'
}

export interface MasterDataMapping {
  onboardingType: 'company' | 'branch';
  selectedBranches: string[] | 'ALL';
  typeRestrictions: Record<string, MasterDataTypeRestriction>;
}

export function getAttributeItemIds(mapping: MasterDataMapping): string[] {
  const ids: string[] = [];
  for (const restriction of Object.values(mapping.typeRestrictions)) {
    if (restriction.mode === 'specific') {
      ids.push(...restriction.selectedItemIds);
    }
  }
  return ids;
}

export const MASTER_DATA_TYPE_KEYS = [
  'routes',
  'route_master',
  'location_master',
  'material_master',
  'vehicle_type_master',
  'driver_master',
  'transporter_master',
] as const;

export interface MasterDataItem {
  id: string;
  name: string;
  type: string;
  branch?: string;
  onboardedAt: 'company' | 'branch';
}

export interface FieldMapping {
  selectedFields: string[];
}

export interface FieldItem {
  id: string;
  name: string;
  module: string;
  type: 'primary' | 'custom';
}

export interface Branch {
  id: string;
  name: string;
  code: string;
}

// --- Role Definitions ---

export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  permissions: CrudPermission[];
}

export const PREDEFINED_ROLES: RoleDefinition[] = [
  { id: 'role-admin', name: 'Admin', description: 'Full access to all operations', permissions: ['create', 'read', 'update', 'delete'] },
  { id: 'role-ops-manager', name: 'Operations Manager', description: 'Full CRUD for day-to-day operations', permissions: ['create', 'read', 'update', 'delete'] },
  { id: 'role-supervisor', name: 'Supervisor', description: 'Can view and update but not create or delete', permissions: ['read', 'update'] },
  { id: 'role-finance', name: 'Finance', description: 'Read-only access for auditing and reporting', permissions: ['read'] },
  { id: 'role-supplier', name: 'Supplier', description: 'Can create and view transactions', permissions: ['create', 'read'] },
];

export const getRoleById = (roleId: string): RoleDefinition | undefined =>
  PREDEFINED_ROLES.find((r) => r.id === roleId);

export const getRolePermissions = (roleId: string): CrudPermission[] =>
  getRoleById(roleId)?.permissions ?? [];

// --- Desk Model ---

export interface Desk {
  id: string;
  name: string;
  description?: string;
  roleId: string;
  attributeIds: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  legoActorType: LegoActorType;
  level: 'company' | 'branch';
  branchId?: string;
  desks: Desk[];
  activeDeskId: string;
  defaultBranchAccess?: boolean;
}

export const getActiveDesk = (user: User): Desk | undefined =>
  user.desks.find((d) => d.id === user.activeDeskId);
