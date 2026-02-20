import type { Attribute, CrudPermission, User } from '../../types';
import { ALL_CRUD } from '../../types';
import { MASTER_DATA_ITEMS } from '../../data/mockData';
import type { MockJourney } from '../../data/mockData';

export interface JourneyAccess {
  canReadRow: boolean;
  canUpdateRow: boolean;
  missingReadItems: string[];
  missingUpdateItems: string[];
}

export const buildUserPermissionMap = (
  attributes: Attribute[],
  currentUser: User
): Map<string, Set<CrudPermission>> => {
  const permissionMap = new Map<string, Set<CrudPermission>>();
  const assigned = attributes.filter((a) => currentUser.assignedAttributes.includes(a.id));

  for (const attr of assigned) {
    for (const selected of attr.masterDataMapping.selectedItems) {
      const existing = permissionMap.get(selected.itemId) ?? new Set<CrudPermission>();
      for (const perm of selected.permissions) existing.add(perm);
      permissionMap.set(selected.itemId, existing);
    }
  }

  // Branch-user fallback: if no branch-admin attributes exist for their branch,
  // treat branch data as full CRUD for product access checks.
  if (currentUser.legoActorType === 'branch_user' && currentUser.defaultBranchAccess && currentUser.branchId) {
    const scopedItems = MASTER_DATA_ITEMS.filter(
      (item) => item.onboardedAt === 'company' || item.branch === currentUser.branchId
    );
    for (const item of scopedItems) {
      permissionMap.set(item.id, new Set<CrudPermission>(ALL_CRUD));
    }
  }

  return permissionMap;
};

const hasReadPermission = (perms?: Set<CrudPermission>): boolean => {
  if (!perms) return false;
  return (
    perms.has('read') ||
    perms.has('create') ||
    perms.has('update') ||
    perms.has('delete')
  );
};

export const resolveJourneyAccess = (
  journey: MockJourney,
  permissionMap: Map<string, Set<CrudPermission>>
): JourneyAccess => {
  const requiredItemIds = [
    journey.routeItemId,
    journey.vehicleTypeItemId,
    journey.materialItemId,
    journey.transporterItemId,
  ];

  const missingReadItems = requiredItemIds.filter((itemId) => !hasReadPermission(permissionMap.get(itemId)));
  const missingUpdateItems = requiredItemIds.filter((itemId) => !permissionMap.get(itemId)?.has('update'));

  return {
    canReadRow: missingReadItems.length === 0,
    canUpdateRow: missingUpdateItems.length === 0,
    missingReadItems,
    missingUpdateItems,
  };
};
