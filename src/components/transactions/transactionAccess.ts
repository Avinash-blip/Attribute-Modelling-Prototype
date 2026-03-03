import { MASTER_DATA_ITEMS } from '../../data/mockData';
import type { Attribute, User, CrudPermission, MasterDataItem } from '../../types';
import { PRESET_PERMISSIONS } from '../../types';
import type { MockJourney } from '../../data/mockData';

export interface JourneyAccess {
  canReadRow: boolean;
  canUpdateRow: boolean;
  canCreateRow: boolean;
  canDeleteRow: boolean;
  matchedAttribute: string | null;
  matchedCrud: CrudPermission[];
  missingItems: { itemId: string; itemName: string; type: string }[];
}

const itemById = new Map<string, MasterDataItem>(MASTER_DATA_ITEMS.map((i) => [i.id, i]));

function doesAttributeCoverItem(
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

function doesAttributeCoverJourney(
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
  return requiredItemIds.every((itemId) => doesAttributeCoverItem(attr, itemId, allItems));
}

export function resolveJourneyAccess(
  journey: MockJourney,
  attributes: Attribute[],
  user: User
): JourneyAccess {
  let bestCrud: CrudPermission[] = [];
  let matchedAttrId: string | null = null;

  for (const assignment of user.attributeAssignments) {
    const attr = attributes.find((a) => a.id === assignment.attributeId);
    if (!attr) continue;

    if (doesAttributeCoverJourney(attr, journey, itemById)) {
      const perms =
        assignment.crudPreset === 'custom'
          ? (assignment.customPermissions ?? [])
          : PRESET_PERMISSIONS[assignment.crudPreset];

      if (perms.length > bestCrud.length) {
        bestCrud = perms;
        matchedAttrId = attr.id;
      }
    }
  }

  if (bestCrud.length === 0 && user.defaultBranchAccess && user.branchId) {
    if (journey.branchId === user.branchId) {
      bestCrud = ['create', 'read', 'update', 'delete'];
      matchedAttrId = '__default_branch_access__';
    }
  }

  const canRead =
    bestCrud.includes('read') ||
    bestCrud.includes('create') ||
    bestCrud.includes('update') ||
    bestCrud.includes('delete');

  const missingItems: { itemId: string; itemName: string; type: string }[] = [];
  if (!canRead) {
    const requiredItemIds = [
      journey.routeItemId,
      journey.vehicleTypeItemId,
      journey.materialItemId,
      journey.transporterItemId,
    ];
    for (const itemId of requiredItemIds) {
      const item = itemById.get(itemId);
      let covered = false;
      for (const assignment of user.attributeAssignments) {
        const attr = attributes.find((a) => a.id === assignment.attributeId);
        if (attr && doesAttributeCoverItem(attr, itemId, itemById)) {
          covered = true;
          break;
        }
      }
      if (!covered && item) {
        missingItems.push({ itemId, itemName: item.name, type: item.type });
      }
    }
  }

  return {
    canReadRow: canRead,
    canUpdateRow: bestCrud.includes('update'),
    canCreateRow: bestCrud.includes('create'),
    canDeleteRow: bestCrud.includes('delete'),
    matchedAttribute: matchedAttrId,
    matchedCrud: bestCrud,
    missingItems,
  };
}

export { doesAttributeCoverItem, doesAttributeCoverJourney };
