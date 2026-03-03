# PRD: Attribute Modelling for Freight Tiger TMS

## 1. Overview

Attribute Modelling is a configuration layer within the LEGO platform that enables granular, role-aware data access control for users of the Freight Tiger TMS. It allows company and branch administrators to define "attributes" — named segments of master data with explicit CRUD permissions — and assign them to users. These attributes then govern what data each user can see, create, and modify across the product.

The system must support two fundamentally different organizational structures:

- **Central Onboarding**: A single pool of master data exists at the company level. Attributes are slices carved out of this pool and distributed to users across business units.
- **Branch Specific Onboarding**: Each branch independently owns its data. Attributes can span multiple branches (company-level) or be scoped to a single branch.

Both modes coexist as parallel configurations. All downstream product behavior — transaction visibility, edit permissions, filter options — is derived from the attribute assignments on each user.

---

## 2. Problem Statement

In a multi-branch logistics operation, not every user should see or modify every piece of data. A branch manager in Mumbai should not be editing Delhi's transporter contracts. A regional ops lead should see data across their region but not beyond it.

Today, access control is either all-or-nothing or requires manual workarounds. There is no structured way to:

- Carve subsets of master data into reusable segments
- Assign those segments to users with fine-grained CRUD permissions
- Have downstream product screens (journey lists, indent creation) automatically respect those permissions
- Support both centralized and decentralized organizational models from the same configuration layer

---

## 3. Desired Outcomes

1. **Administrators can create named data segments (attributes)** by selecting subsets of master data items and defining CRUD permissions per item.
2. **Attributes can be assigned to users**, and the product automatically enforces the resulting access scope.
3. **Transaction visibility and editability are permission-driven** — users only see journeys linked to master data they have read access to, and can only edit those they have update access to.
4. **The system adapts to two onboarding models** (central and branch-specific) with distinct attribute creation, user assignment, and filtering behaviors.
5. **Branch admins operate within their own branch** without seeing or affecting other branches.
6. **Company admins have full cross-branch visibility** and can create both company-wide and branch-specific attributes.

---

## 4. Key Concepts

| Term | Definition |
|---|---|
| **Attribute** | A named, reusable segment of master data with per-item CRUD permissions. Acts as a "lens" through which a user sees data. |
| **Master Data Item** | An individual record within a master data type (e.g., a specific route, a specific vehicle type, a specific transporter). |
| **Master Data Type** | A category of master data: Routes, Route Master, Location Master, Material Master, Vehicle Type Master, Driver Master, Transporter Master. |
| **CRUD Permission** | Per-item access level: Create, Read, Update, Delete. Multiple can be assigned per item. |
| **Scope** | Whether an attribute is company-level (spans branches) or branch-specific (scoped to one branch). |
| **Onboarding Type** | The organizational model: Central Onboarding or Branch Specific Onboarding. |
| **LEGO Config** | The admin configuration section where attributes and users are managed. |
| **In-Product** | The operational section where transactions are viewed, created, and filtered based on attribute permissions. |

---

## 5. User Roles

- **Company Admin**: Full access to LEGO Config. Can create company-level and branch-specific attributes. Can create company and branch users. Operates in both onboarding modes.
- **Branch Admin**: Access to LEGO Config scoped to their branch. Can only create branch-specific attributes for their own branch. Can only create branch-level users for their branch.
- **Company User**: Operational user with company-level attribute assignments. Sees data across branches based on their attributes.
- **Branch User**: Operational user with branch-specific attribute assignments. Sees data within their assigned branch only.

---

## 6. Functional Requirements

### FR-1: Attribute List Page

**Description**: A table displaying all attributes in the system, with contextual columns based on the active onboarding mode.

**Acceptance Criteria**:

- FR-1.1: Table displays columns: Label, Description, Master Data Items (count), Fields (count), Assigned Users (count), Created By, Created On.
- FR-1.2: When onboarding mode is **Central Onboarding**, the Scope column is hidden.
- FR-1.3: When onboarding mode is **Branch Specific Onboarding**, the Scope column is visible showing "Company" or "Branch" tags.
- FR-1.4: Search input filters attributes by label (case-insensitive).
- FR-1.5: Each row has Edit and Delete actions. Delete shows a confirmation modal.
- FR-1.6: "Create Attribute" button opens the attribute creation drawer.
- FR-1.7: Empty state is shown when no attributes exist.

---

### FR-2: Attribute Creation / Edit Drawer

**Description**: A drawer form that allows administrators to define an attribute by naming it, selecting master data items with CRUD permissions, and selecting fields.

**Acceptance Criteria**:

- FR-2.1: Drawer contains: Attribute Label (text input), Description (textarea), and two tabs — "Master Data" and "Fields".
- FR-2.2: When editing an existing attribute, all fields are pre-populated with the attribute's current values.

#### FR-2A: Central Onboarding — Attribute Creation

- FR-2A.1: No branch selector is shown. Attributes apply to the entire company data pool.
- FR-2A.2: All master data items (across all types) are displayed in collapsible panels grouped by type.
- FR-2A.3: Each item has inline CRUD checkboxes (Create, Read, Update, Delete). All are checked by default.
- FR-2A.4: "Select All" toggle per master data type selects/deselects all items of that type with full CRUD.
- FR-2A.5: A search input filters visible items within the master data tab.

#### FR-2B: Branch Specific Onboarding — Attribute Creation

- FR-2B.1: An "Attribute Hierarchy" radio group appears with two options: "Company Level" and "Branch Specific".
- FR-2B.2: When **Company Admin** selects "Company Level": a branch multi-select dropdown appears (defaulted to ALL). Master data items from selected branches are shown. Attribute scope is set to "company". These attributes can only be assigned to company-level users.
- FR-2B.3: When **Company Admin** selects "Branch Specific": a branch single-select dropdown appears. Master data items from that specific branch are shown. Attribute scope is set to "branch". These attributes can only be assigned to branch-level users of that branch.
- FR-2B.4: When **Branch Admin**: the radio is locked to "Branch Specific" and the branch selector is locked to the admin's own branch.
- FR-2B.5: All visible master data items are pre-selected with full CRUD by default.
- FR-2B.6: CRUD checkboxes are individually controllable per item.

#### FR-2C: Fields Tab

- FR-2C.1: Fields are grouped by module (Indent, Trip, ePOD, Invoice, Tracking).
- FR-2C.2: Each field shows a "Primary" or "Custom" tag.
- FR-2C.3: "Select All" toggle per module.
- FR-2C.4: Search input filters fields by name.

---

### FR-3: User List Page

**Description**: A table displaying all users with their role and attribute assignments.

**Acceptance Criteria**:

- FR-3.1: Table displays columns: Name, Email, Role.
- FR-3.2: When onboarding mode is **Central Onboarding**: an "Attributes / Segment" column shows assigned attribute labels as tags. If a user has no attributes, a gold "All Company Data (Admin)" badge is displayed.
- FR-3.3: When onboarding mode is **Branch Specific Onboarding**: "User Type" column shows "Company" or "Branch" tags. "Branch" column shows the assigned branch. "Attributes" column shows assigned attribute labels.
- FR-3.4: Each row has Edit and Delete actions. Delete shows a confirmation modal.
- FR-3.5: "Create User" button opens the user creation drawer.

---

### FR-4: User Creation / Edit Drawer

**Description**: A drawer form for creating users and assigning attributes to them.

**Acceptance Criteria**:

#### FR-4A: Central Onboarding — User Creation

- FR-4A.1: Form fields: Name, Email, Role, Assigned Attributes (multi-select dropdown).
- FR-4A.2: All attributes in the system are available for assignment (no branch filtering).
- FR-4A.3: Users with no attributes assigned have implicit full company data access.

#### FR-4B: Branch Specific Onboarding — User Creation

**When acting as Company Admin**:

- FR-4B.1: "User Type" dropdown with "Company" and "Branch" options.
- FR-4B.2: If "Company" is selected: a "Branches (scope filter)" multi-select appears. The "Assigned Attributes" dropdown shows only company-level attributes (`scope === 'company'`) that overlap with the selected branches.
- FR-4B.3: If "Branch" is selected: a single branch selector appears. The "Assigned Attributes" dropdown shows only branch-specific attributes scoped to that specific branch.
- FR-4B.4: Changing branch selection resets previously selected attributes.

**When acting as Branch Admin**:

- FR-4B.5: "User Type" is locked to "Branch". Branch is locked to the admin's own branch.
- FR-4B.6: "Assigned Attributes" shows only branch-specific attributes for that branch.
- FR-4B.7: **Fallback rule**: If no branch-specific attributes exist for a branch user's branch, the user automatically receives full CRUD access to all data within that branch. An alert is shown indicating this fallback is active.

---

### FR-5: Transaction (Journey) List Page

**Description**: Displays journey records filtered by the current user's attribute-based permissions.

**Acceptance Criteria**:

#### FR-5A: Permission-Based Visibility

- FR-5A.1: A journey is visible only if the current user has read access (any CRUD permission) on ALL four linked master data items: route, vehicle type, material, and transporter.
- FR-5A.2: A journey's "Edit" button is enabled only if the user has explicit "update" permission on ALL four linked master data items.
- FR-5A.3: If "Edit" is disabled, a tooltip explains which master data items are missing update access.
- FR-5A.4: Journeys where the user lacks read access on any linked item are hidden entirely.

#### FR-5B: Filtering Behavior

- FR-5B.1: When onboarding mode is **Central Onboarding**: an Attribute filter is available. It filters journeys by the attribute they are associated with.
- FR-5B.2: When onboarding mode is **Branch Specific Onboarding** and current user is a **Company User**: both Branch filter and Attribute filter are available and work in tandem.
- FR-5B.3: When onboarding mode is **Branch Specific Onboarding** and current user is a **Branch User**: only the Attribute filter is available.
- FR-5B.4: A search input filters by Journey ID, route, or vehicle number.
- FR-5B.5: Helper text below the page title explains the active filtering mode.

#### FR-5C: Branch User Fallback

- FR-5C.1: When a branch user has `defaultBranchAccess` active (no branch-specific attributes exist), they see all journeys linked to their branch with full CRUD.
- FR-5C.2: A message indicates the fallback is active.

---

### FR-6: Trip Creation Drawer

**Description**: Form for creating new journey/transaction records, respecting the user's create permissions.

**Acceptance Criteria**:

- FR-6.1: Dropdown fields for Route, Vehicle Type, Material, and Transporter.
- FR-6.2: Each dropdown shows all items of that type, sorted by access level: selectable (create access) first, then read-only, then no-access.
- FR-6.3: Items without "create" permission are visible but disabled in the dropdown, with a visual indicator (Read Only / No Access badge).
- FR-6.4: On successful submission, a new journey record is created and immediately appears in the Journey List.
- FR-6.5: The created journey is associated with the current user's first assigned attribute and branch context.
- FR-6.6: Created journeys persist across page refreshes within the same onboarding scenario.

---

### FR-7: POC Scenario Switcher

**Description**: A global toggle in the application header that switches the entire prototype between Central Onboarding and Branch Specific Onboarding modes.

**Acceptance Criteria**:

- FR-7.1: Segmented control in the header with two options: "Central Onboarding" and "Branch Specific Onboarding".
- FR-7.2: Each option has an info icon with a tooltip explaining the mode.
- FR-7.3: Switching modes loads an entirely separate dataset (attributes, users, journeys, current user). Data created in one mode does not appear in the other.
- FR-7.4: The selected mode persists across page refreshes.

---

### FR-8: Data Isolation Between Scenarios

**Description**: Central Onboarding and Branch Specific Onboarding operate as fully independent parallel environments.

**Acceptance Criteria**:

- FR-8.1: Each scenario maintains its own set of attributes, users, journeys, and active user selection.
- FR-8.2: Creating, editing, or deleting data in one scenario has zero effect on the other.
- FR-8.3: All data persists in localStorage, namespaced by scenario.
- FR-8.4: On switching scenarios, the UI fully reflects the target scenario's data without requiring a page refresh.

---

### FR-9: Admin / User Persona Switcher

**Description**: A dropdown in the header that allows switching between personas to simulate different user experiences.

**Acceptance Criteria**:

- FR-9.1: When navigating within **LEGO Config** pages (`/settings/*`): the dropdown shows exactly two options — "Company Admin" and "Branch Admin". This applies to both onboarding scenarios.
- FR-9.2: When navigating within **In-Product** pages (`/transactions/*`): the dropdown shows the names of all created users. Selecting a user switches the active persona, and all permission-based filtering updates accordingly.
- FR-9.3: The selected persona persists within each scenario's state.

---

### FR-10: Navigation Structure

**Description**: Left sidebar navigation organized by functional area.

**Acceptance Criteria**:

- FR-10.1: Two navigation groups: "LEGO Config" and "In-Product".
- FR-10.2: LEGO Config contains: Attributes, Users.
- FR-10.3: In-Product contains: Transactions.
- FR-10.4: Active page is highlighted in the sidebar.
- FR-10.5: Default landing page is Attributes (`/settings/attributes`).

---

### FR-11: State Persistence

**Description**: All application state survives page refreshes and navigation.

**Acceptance Criteria**:

- FR-11.1: Attributes, users, journeys, current user selection, and POC scenario selection persist in localStorage.
- FR-11.2: On page load, the application restores the last known state.
- FR-11.3: If the persisted current user no longer exists (e.g., was deleted), the system falls back to the first available user.

---

## 7. Master Data Types

The following master data types are supported:

- **Routes** — Named origin-destination route pairs (e.g., "Mumbai to Delhi NH48")
- **Route Master** — Route corridor definitions (e.g., "NH48 Corridor - Pan India")
- **Location Master** — Known locations such as warehouses, ports, and industrial areas
- **Material Master** — Types of goods being transported (e.g., "Cement OPC 53 Grade", "FMCG - Packaged Food")
- **Vehicle Type Master** — Vehicle categories (e.g., "Flatbed Open", "Reefer", "Tanker")
- **Driver Master** — Individual driver records
- **Transporter Master** — Logistics service provider records

Each item is either company-level (`onboardedAt: 'company'`) or branch-level (`onboardedAt: 'branch'`, linked to a specific branch). This distinction drives which items appear during attribute creation based on the selected scope and branches.

---

## 8. Permission Resolution Logic

The system resolves transaction-level access as follows:

1. **Build permission map**: For the active user, aggregate all CRUD permissions from all assigned attributes across all master data items. If `defaultBranchAccess` is active (branch user fallback), grant full CRUD on all company-level items and all items within the user's branch.

2. **Resolve per-journey access**: Each journey links to four master data items (route, vehicle type, material, transporter). For each journey:
   - **Can Read**: True only if the user has at least one CRUD permission on ALL four linked items.
   - **Can Update**: True only if the user has explicit "update" permission on ALL four linked items.
   - If any linked item lacks read access, the journey is hidden entirely.

3. **Fallback for branch users**: If a branch user has no attributes assigned and no branch-specific attributes exist for their branch, they receive full CRUD on all branch-relevant data until an admin creates attributes for that branch.

---

## 9. Non-Functional Requirements

- **Client-side only**: The prototype runs entirely in the browser with no backend. All data is stored in localStorage.
- **Responsive drawer**: Attribute and user creation drawers are 520px wide and scroll internally.
- **Feedback**: Counts are shown inline (e.g., "3 master data items selected", "5 journeys visible by permission scope").
- **Confirmation on destructive actions**: Delete operations require explicit confirmation via modal.
- **Search everywhere**: All list pages and picker components support text search.
- **Empty states**: Meaningful empty state messages when no data exists.
