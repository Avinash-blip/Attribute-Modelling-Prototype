import type { Attribute, CrudPermission, User, MasterDataItem, UserAttributeAssignment } from '../../types';
import { PRESET_PERMISSIONS, ALL_CRUD } from '../../types';
import {
  resolveJourneyAccess as resolveJourneyAccessOriginal,
  type JourneyAccess,
} from '../transactions/transactionAccess';

export type { JourneyAccess };

function getEffectivePermissions(
  assignment: UserAttributeAssignment,
  attr: Attribute
): CrudPermission[] {
  if (assignment.crudOverride != null) {
    if (assignment.crudOverride === 'custom') return assignment.customOverridePermissions ?? [];
    return PRESET_PERMISSIONS[assignment.crudOverride];
  }
  const preset = attr.masterDataMapping.crudPreset;
  if (preset === 'custom') return attr.masterDataMapping.customPermissions ?? [];
  return PRESET_PERMISSIONS[preset];
}

export const buildScenarioPermissionMap = (
  attributes: Attribute[],
  currentUser: User,
  masterDataItems: MasterDataItem[]
): Map<string, Set<CrudPermission>> => {
  const permissionMap = new Map<string, Set<CrudPermission>>();

  for (const assignment of currentUser.attributeAssignments) {
    const attr = attributes.find((a) => a.id === assignment.attributeId);
    if (!attr) continue;
    const perms = getEffectivePermissions(assignment, attr);
    for (const itemId of attr.masterDataMapping.selectedItemIds) {
      const existing = permissionMap.get(itemId) ?? new Set<CrudPermission>();
      for (const perm of perms) existing.add(perm);
      permissionMap.set(itemId, existing);
    }
  }

  if (currentUser.legoActorType === 'branch_user' && currentUser.defaultBranchAccess && currentUser.branchId) {
    const scopedItems = masterDataItems.filter(
      (item) => item.onboardedAt === 'company' || item.branch === currentUser.branchId
    );
    for (const item of scopedItems) {
      permissionMap.set(item.id, new Set<CrudPermission>(ALL_CRUD));
    }
  }

  return permissionMap;
};

export const resolveJourneyAccess = resolveJourneyAccessOriginal;
