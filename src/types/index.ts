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

export interface ItemPermission {
  itemId: string;
  permissions: CrudPermission[];
}

export interface MasterDataMapping {
  onboardingType: 'company' | 'branch';
  selectedBranches: string[] | 'ALL';
  selectedItems: ItemPermission[];
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
  assignedAttributes: string[];
  defaultBranchAccess?: boolean;
}
