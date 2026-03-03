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

export type CrudPreset = 'full_crud' | 'read_only' | 'create_read' | 'custom';

export const PRESET_PERMISSIONS: Record<CrudPreset, CrudPermission[]> = {
  full_crud: ['create', 'read', 'update', 'delete'],
  read_only: ['read'],
  create_read: ['create', 'read'],
  custom: [],
};

export const ALL_CRUD: CrudPermission[] = PRESET_PERMISSIONS.full_crud;

export interface MasterDataTypeRestriction {
  mode: 'all' | 'specific' | 'none';
  selectedItemIds: string[]; // only used when mode === 'specific'
}

export interface MasterDataMapping {
  onboardingType: 'company' | 'branch';
  selectedBranches: string[] | 'ALL';
  typeRestrictions: Record<string, MasterDataTypeRestriction>;
  // Keys: 'routes', 'route_master', 'location_master', 'material_master', 'vehicle_type_master', 'driver_master', 'transporter_master'
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

export interface UserAttributeAssignment {
  attributeId: string;
  crudPreset: CrudPreset; // REQUIRED — always set during mapping
  customPermissions?: CrudPermission[]; // only when crudPreset === 'custom'
}

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

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  legoActorType: LegoActorType;
  level: 'company' | 'branch';
  branchId?: string;
  attributeAssignments: UserAttributeAssignment[];
  defaultBranchAccess?: boolean;
}
