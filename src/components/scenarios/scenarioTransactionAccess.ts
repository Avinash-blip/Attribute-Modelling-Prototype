import type { Attribute, CrudPermission, User, MasterDataItem } from '../../types';
import { getActiveDesk, getRolePermissions, getRoleById } from '../../types';
import type { MockJourney } from '../../data/mockData';

import type { JourneyAccess } from '../transactions/transactionAccess';

export type { JourneyAccess };

function scenarioItemById(masterDataItems: MasterDataItem[]): Map<string, MasterDataItem> {
  return new Map(masterDataItems.map((i) => [i.id, i]));
}

function doesScenarioAttributeCoverItem(
  attr: Attribute,
  itemId: string,
  allItems: Map<string, MasterDataItem>
): boolean {
  const item = allItems.get(itemId);
  if (!item) return false;
  const restriction = attr.masterDataMapping.typeRestrictions[item.type];
  if (!restriction) return true;
  if (restriction.mode === 'all') return true;
  if (restriction.mode === 'none') return false;
  return restriction.selectedItemIds.includes(itemId);
}

function doesScenarioAttributeCoverJourney(
  attr: Attribute,
  journey: MockJourney,
  allItems: Map<string, MasterDataItem>
): boolean {
  const requiredItemIds = [
    journey.routeItemId,
    journey.vehicleTypeItemId,
    journey.materialItemId,
    journey.transporterItemId,
  ];
  return requiredItemIds.every((itemId) => doesScenarioAttributeCoverItem(attr, itemId, allItems));
}

export function resolveScenarioJourneyAccess(
  journey: MockJourney,
  attributes: Attribute[],
  user: User,
  masterDataItems: MasterDataItem[]
): JourneyAccess {
  const itemById = scenarioItemById(masterDataItems);

  const noAccess = (roleName: string, rolePerms: CrudPermission[], missing: JourneyAccess['missingItems'] = []): JourneyAccess => ({
    canReadRow: false, canUpdateRow: false, canCreateRow: false, canDeleteRow: false,
    matchedAttribute: null, matchedCrud: [], roleName, rolePermissions: rolePerms, missingItems: missing,
  });

  const activeDesk = getActiveDesk(user);
  if (!activeDesk) {
    if (user.defaultBranchAccess && user.branchId && journey.branchId === user.branchId) {
      return {
        canReadRow: true, canUpdateRow: true, canCreateRow: true, canDeleteRow: true,
        matchedAttribute: '__default_branch_access__', matchedCrud: ['create', 'read', 'update', 'delete'],
        roleName: 'Default Branch', rolePermissions: ['create', 'read', 'update', 'delete'], missingItems: [],
      };
    }
    return noAccess('No Desk', []);
  }

  const rolePerms = getRolePermissions(activeDesk.roleId);
  const roleName = getRoleById(activeDesk.roleId)?.name ?? 'Unknown';
  const deskAttributes = attributes.filter((a) => activeDesk.attributeIds.includes(a.id));

  let matchedAttrId: string | null = null;
  for (const attr of deskAttributes) {
    if (doesScenarioAttributeCoverJourney(attr, journey, itemById)) {
      matchedAttrId = attr.id;
      break;
    }
  }

  if (!matchedAttrId && user.defaultBranchAccess && user.branchId && journey.branchId === user.branchId) {
    matchedAttrId = '__default_branch_access__';
  }

  if (!matchedAttrId) {
    const missingItems: JourneyAccess['missingItems'] = [];
    const requiredItemIds = [journey.routeItemId, journey.vehicleTypeItemId, journey.materialItemId, journey.transporterItemId];
    for (const id of requiredItemIds) {
      const item = itemById.get(id);
      let covered = false;
      for (const attr of deskAttributes) {
        if (doesScenarioAttributeCoverItem(attr, id, itemById)) { covered = true; break; }
      }
      if (!covered && item) missingItems.push({ itemId: id, itemName: item.name, type: item.type });
    }
    return noAccess(roleName, rolePerms, missingItems);
  }

  const canRead = rolePerms.includes('read') || rolePerms.includes('create') || rolePerms.includes('update') || rolePerms.includes('delete');
  return {
    canReadRow: canRead,
    canUpdateRow: rolePerms.includes('update'),
    canCreateRow: rolePerms.includes('create'),
    canDeleteRow: rolePerms.includes('delete'),
    matchedAttribute: matchedAttrId,
    matchedCrud: rolePerms,
    roleName,
    rolePermissions: rolePerms,
    missingItems: [],
  };
}

export { doesScenarioAttributeCoverItem, doesScenarioAttributeCoverJourney };
