# Incremental Update: Onboarding Modes for Attribute Modelling POC

> **IMPORTANT**: This builds ON TOP of the existing attribute modelling codebase. Do NOT recreate components that already exist. Reuse `MasterDataPicker`, `FieldsTab`, `BulkUploadModal`, `AppLayout`, `Sidebar`, and all existing types/mock data. Only modify or extend what's needed.

---

## What's Changing

We're introducing **two onboarding modes** that change how attribute creation works. The mode is a company-level config — it determines the entire attribute creation experience.

| | Centrally Managed | BU/Branch Managed |
|---|---|---|
| Data lives at | Company level only | Each branch independently |
| Branch selector in attribute creation | No | Yes (for company users) |
| Master data grouping | By type only | By branch → then by type |
| Branch user experience | N/A (all users are company-level) | Sees only their branch's data |

---

## Changes Required (minimal, ordered)

### 1. Update `types/index.ts`

Add to existing types (don't replace):

```typescript
type OnboardingMode = 'centrally_managed' | 'bu_managed';

// Add to existing AppContext or create alongside it
interface CompanyConfig {
  onboardingMode: OnboardingMode;
}
```

### 2. Update `context/AppContext.tsx`

Add `onboardingMode` to the existing context state. Default to `'centrally_managed'`. Expose a setter so the POC demo toggle can switch it.

### 3. Update `data/mockData.ts`

Extend (don't replace) existing mock data:

- Add an `onboardedAt: 'company' | 'branch'` field to each `MasterDataItem` if not already present
- For **centrally managed** demo: tag all items as `onboardedAt: 'company'`, no branch association
- For **BU/Branch managed** demo: tag items with specific branch IDs
- Create two mock data sets or use a filter function that returns the right data based on mode

### 4. Update `AttributeListPage.tsx`

Minimal changes:
- Add a **segmented control** (`antd Segmented`) at the top of the page, above the table:
  - Options: `"Centrally Managed"` | `"BU/Branch Managed"`
  - This reads/writes `onboardingMode` from context
  - Style it as a demo/POC indicator (subtle banner: "POC: Switch onboarding mode to preview both flows")
- No other changes to the table or list logic

### 5. Update `CreateAttributeDrawer.tsx`

This is the main change. Read `onboardingMode` from context and conditionally render:

**If `centrally_managed`:**
- Remove the `Company Onboarded / Branch Specific` radio group entirely
- Master Data tab renders `MasterDataPicker` directly with company-level items only
- No `BranchSelector` component
- Everything else stays identical (label input, tabs, fields tab, save logic)

**If `bu_managed`:**
- Check user level from context (`company` or `branch`)
- **Company user**: Show `BranchSelector` at top of Master Data tab → feed selected branches into `MasterDataPicker` → group items by branch then by type
- **Branch user**: No `BranchSelector` (locked). Pass user's branch ID directly to `MasterDataPicker` → show only that branch's data grouped by type
- Everything else stays identical

**Implementation approach**: Use a wrapper pattern inside the Master Data tab:
```tsx
// Inside MasterDataTab.tsx
const { onboardingMode } = useAppContext();
const { userLevel, userBranchId } = useAuth();

if (onboardingMode === 'centrally_managed') {
  return <MasterDataPicker items={companyLevelItems} groupBy="type" />;
}

// bu_managed
if (userLevel === 'branch') {
  return <MasterDataPicker items={branchItems(userBranchId)} groupBy="type" />;
}

// bu_managed + company user
return (
  <>
    <BranchSelector value={selectedBranches} onChange={setSelectedBranches} />
    <MasterDataPicker items={itemsForBranches(selectedBranches)} groupBy="branch_then_type" />
  </>
);
```

### 6. Update `MasterDataPicker.tsx`

Add a `groupBy` prop to the existing component:

- `groupBy: 'type'` — current behavior, flat grouping by master data type (Consignors, Consignees, etc.)
- `groupBy: 'branch_then_type'` — NEW: nested Collapse panels, outer level = branch name, inner level = type

This is the only structural change to this component. All existing selection logic (checkboxes, select all, search, counts) stays the same — it just renders one or two levels of nesting.

### 7. No changes needed to:
- `FieldsTab.tsx` — identical in both modes
- `BulkUploadModal.tsx` — works the same regardless of mode
- `Sidebar.tsx` / `AppLayout.tsx` — no structural changes
- `UserListPage.tsx` / `CreateUserDrawer.tsx` — no changes for now

---

## File Change Summary

| File | Action | Scope |
|---|---|---|
| `types/index.ts` | EXTEND | Add `OnboardingMode`, `CompanyConfig` |
| `context/AppContext.tsx` | EXTEND | Add `onboardingMode` state + setter |
| `data/mockData.ts` | EXTEND | Add `onboardedAt` field, mode-aware data helpers |
| `AttributeListPage.tsx` | MODIFY | Add Segmented control for mode toggle |
| `CreateAttributeDrawer.tsx` | MODIFY | Conditional rendering based on mode |
| `MasterDataTab.tsx` | MODIFY | Add mode-aware logic (wrapper pattern above) |
| `MasterDataPicker.tsx` | MODIFY | Add `groupBy` prop for nested vs flat grouping |
| Everything else | NO CHANGE | Reuse as-is |

---

## Testing the POC

After building, verify these scenarios work:

1. **Centrally Managed → Create Attribute**: No branch selector visible. Flat pick-list. Save works.
2. **BU/Branch Managed → Company User → Create Attribute**: Branch selector visible. Default ALL. Master data grouped by branch. Can narrow branches. Can subset items. Save works.
3. **BU/Branch Managed → Branch User → Create Attribute**: No branch selector. Only sees their branch data. Flat pick-list. Save works.
4. **Switching modes**: Toggle on list page → create attribute → flow matches the selected mode.
5. **Edit attribute**: Pre-populated correctly in both modes.

---

## Do NOT:
- Rebuild existing components from scratch
- Create separate page routes for each mode — it's the SAME pages, conditionally rendered
- Duplicate `MasterDataPicker` — extend it with the `groupBy` prop
- Touch `FieldsTab`, `BulkUploadModal`, or layout components
