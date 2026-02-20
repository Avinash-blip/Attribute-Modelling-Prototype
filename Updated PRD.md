# Attribute Based Access Control PRD

**Link to POC:** [Netlify Prototype](https://attributemodellingprototype.netlify.app/settings/attributes)
**Link to FR's / Stories:** See Section 10

---

## Summary of Additions (from Prototype Validation)

The following sections were added or updated based on learnings from the working prototype. Look for **[ADDED]** and **[UPDATED]** markers throughout the document.

1. **Section 1.2.1 — Onboarding Modes**: Expanded both modes with detailed, field-level UI specifications validated in prototype. Documented that Central and Branch Specific are treated as independent parallel experiences with completely different attribute creation, user creation, and transaction filtering behaviors.
2. **Section 2.7 — Attribute Description** (new): Attributes carry an optional description field for business context.
3. **Section 4 — Admin Personas**: Added Company Admin and Branch Admin as distinct LEGO configuration personas with different capabilities per onboarding mode.
4. **Section 5.2 — Master Data Mapping**: Added default behavior (all items pre-selected with full CRUD), inline C/R/U/D checkboxes per item, and master data type grouping.
5. **Section 5.3 — User Onboarding**: Expanded with detailed rules per onboarding mode — user types, branch scope filter for company users, attribute eligibility rules, and default branch access fallback.
6. **Section 5.5 — LEGO Config vs In-Product** (new): Documents the navigation and workflow separation between configuration (LEGO) and product-side (In-Product) experiences.
7. **Section 8.3 — Transaction Listing Filters** (new): Documents how transaction filters differ by onboarding mode and user type.
8. **Epic B — New stories**: US-B4 (Attribute Description), US-B5 (Default CRUD Pre-selection).
9. **Epic C — New stories**: US-C3 (Branch Scope Filter for Company Users), US-C4 (Default Branch Access Fallback), US-C5 (Branch Admin User Creation Constraints).
10. **Epic F — New story**: US-F4 (Transaction Filtering by Onboarding Mode and User Type).
11. **Multiple existing stories updated** with prototype-validated acceptance criteria.

---

## 1. Executive Summary

Large logistics companies often have multiple business units, regions, branches, and teams all working under one account. They share common data like routes, vehicle types, materials, and transporters. But each team should only see and work with the data that belongs to them.

This document defines how we will control access in the Freight Tiger platform using two systems working together:
- **Roles (RBAC):** Control what actions a user can perform (e.g., create a trip, edit an indent).
- **Attributes (ABAC):** Control what data a user can see and work with (e.g., only routes in the North region).

The system must be:
- **Secure by default:** No data leaks across organisational boundaries.
- **Configurable without code:** Admins can set up access rules through the UI without needing engineering help.
- **Easy to understand:** Users can see exactly what they can and cannot do, and why.
- **Consistent:** The same rules apply whether a user is on the web app, mobile app, or API.

ABAC will work alongside Company/Branch and will not replace them.
Branch scope is always evaluated first as the base visibility universe. ABAC is applied as an additional filter on top of the branch-filtered dataset.
Cross-branch access is a tenant-level setting. If enabled, the branch filter is relaxed for the permitted users, but ABAC privacy gates and scope rules still apply.

### 1.1 Business Context

Large logistics enterprises typically operate in one of two ways:
- **Single tenant, many internal slices.** One legal entity with multiple business units, regions, branches, and channels operating under one account. Example: TATA MOTORS has SPD_North, SPD_South, SPD_East, SPD_West — all under one tenant but with strict internal walls.
- **Parent + sister companies with shared resources.** Separate operational entities that share common infrastructure — vehicle fleets, lanes, vendors, transporters — but must keep their transactions completely segregated.

In both cases, three realities exist on the ground:
- **Shared resources, private transactions.** Teams share the same routes, vehicles, and transporters, but the SKIN team should never see the FACE team's journeys even if they use the same truck on the same lane.
- **Different roles need different capabilities.** Ops users create and edit. Finance users only read. Managers see roll-ups but don't edit. Suppliers can only create against pre-approved contracts.
- **Without a proper access layer, platforms fail in one of three ways:**
  - They leak data across internal org boundaries
  - They become unusably rigid by splitting tenants unnaturally, making multiple branches
  - They require custom code per enterprise, which doesn't scale

### 1.2 Problem Statements

**P1: Selective master data access for transaction creation.** Users must only be able to use specific master data items (routes, vehicle types, materials, transporters) when creating or editing transactions. A user in SPD_North should not be able to create a trip using a route that belongs to SPD_South — even though both routes exist in the same tenant.
In tenants where master data is maintained at the branch level, ABAC must restrict visibility and usage within the branch's master data universe.

**P2: Data visibility without data leakage.** Users need to see transactions relevant to them (including ones where items were updated by operations after creation), but must never see transactions that belong to a different org boundary. Visibility and editability must be independently controlled.
ABAC must not expand access beyond a user's branch base visibility unless explicitly enabled.

**P3: Role-based action control independent of data scope.** The system must separately control what a user can do (create, edit, delete, share) from what data they can do it on. A Finance user and an Ops user may see the same transaction, but only Ops can edit it.

**P4: Supplier/vendor access on strict contracted combinations.** External users (suppliers, vendors) must only be able to raise transactions for explicitly approved combinations — not mix-and-match from a broad scope.

**P5: Manager roll-up without manual duplication.** Managers at a parent level need visibility across all children's data without admins having to manually duplicate every mapping. This must work automatically as children's data changes.

### 1.2.1 Pre-requisites: Master Data Onboarding Modes

Master data must be uniform and needs to be onboarded in one of two manners. These two modes are treated as **independent parallel experiences** — each with completely different UI flows for attribute creation, user onboarding, and transaction filtering. The onboarding mode is a tenant-level configuration.

#### Mode 1: Central Onboarding (Centrally Managed)

**Mental model:** One pool of master data at company level. Attributes are lenses/slices carved out of this single pool to distribute access across BUs/branches/user groups.

**Attribute Listing:**
- No "Scope" column — all attributes are company-scoped by definition.
- **[ADDED]** Description column shows a short text describing the attribute's business purpose (e.g., "SPD Business units segment covering north region").
- **[ADDED]** No scope filter in search bar (irrelevant in this mode).

**Attribute Creation Flow:**
- No branch selector needed — there is only one universe (company).
- The master data picker is flat — grouped by type (Routes, Route Master, Location Master, Material Master, Vehicle Type Master, Driver Master, Transporter Master) but not by branch.
- **[ADDED]** All master data items are pre-selected with full CRUD (C/R/U/D all checked) by default. The admin deselects items or downgrades permissions as needed.
- **[ADDED]** Each item shows inline C/R/U/D checkboxes when selected. The admin can individually toggle Create, Read, Update, Delete per item.
- **[ADDED]** Attribute creation includes a Description field (optional, max 200 chars).
- Attribute creation is essentially: Name it → Describe it → Pick items from the company pool (adjust CRUD per item) → Pick fields → Save.
- The "who gets what" question is answered purely by which items you include in the attribute.

**User Listing:**
- **[ADDED]** No "User Type", "Level", or "Branch" columns — all users are company-level.
- Shows "Attributes / Segment" column with mapped attribute tags.
- **[ADDED]** Users with no attributes assigned show "All Company Data (Admin)" tag — they have access to the full company data universe.
- **[ADDED]** Company Admin users are badged with a "Company Admin" chip next to their name.

**User Onboarding:**
- Role + Attribute assignment only. No user type or branch selection needed.
- Attributes define the user's scope. If no attributes are assigned, the user defaults to full company data access.

**Transaction Listing:**
- **[ADDED]** Primary filter is **Attribute** — users filter transactions by their assigned attributes to slice cross-branch data.
- No branch filter (branches are not a meaningful axis in this mode).

**Key UX simplification:** This mode is significantly simpler. No branch dropdown, no nested grouping. Just a clean pick-list from one master pool.

#### Mode 2: Branch Specific Onboarding (BU/Branch Managed)

**Mental model:** Each branch owns its own data independently. The company level is an aggregation layer. Attributes can either span across branches (created by company-level users) or be scoped within a single branch (created by branch-level users).

**Attribute Listing:**
- **[ADDED]** Description column shows attribute purpose.
- "Scope" column is visible — distinguishes "Company Level" vs "Branch Specific" attributes.
- **[ADDED]** Scope filter dropdown in search bar allows filtering by Company Level or Branch Specific.

**Attribute Creation Flow — Company Admin:**
- **[ADDED]** First step is an **Attribute Scope** radio group with two options:
  - **Company Level:** Maps master data across one or many branches. These attributes can only be assigned to company-level users.
  - **Branch Specific:** Scoped to a single branch's data. These attributes can only be assigned to branch-level users of that branch.
- **[ADDED]** When **Company Level** is selected:
  - Branch dropdown appears with "ALL Branches" selected by default.
  - Supports multi-select — admin can select specific branches.
  - Master data from selected branches loads below, grouped by branch then by type.
  - All items pre-selected with full CRUD by default.
- **[ADDED]** When **Branch Specific** is selected:
  - Branch dropdown appears as **single-select** (admin picks exactly one branch).
  - Only that branch's master data appears below, grouped by type.
  - All items pre-selected with full CRUD by default.
- **[ADDED]** Attribute includes a Description field.

**Attribute Creation Flow — Branch Admin:**
- **[ADDED]** Scope is locked to "Branch Specific" (radio disabled).
- **[ADDED]** Branch selector is locked to the admin's own branch (disabled).
- Branch admin can only create sub-scope attributes within their branch's data.

**User Listing:**
- **[ADDED]** "User Type" column shows clean "Company" or "Branch" tags (derived from the user's level, not the granular actor type).
- "Branch" column shows the branch name for branch users, dash for company users.
- "Attributes" column shows mapped attributes or "Default Branch Access (Full CRUD)" for fallback users.

**User Onboarding — Company Admin creating users:**
- **[ADDED]** "User Type" dropdown: **Company** or **Branch**.
- **[ADDED]** If **Company** user:
  - A "Branches (scope filter)" multi-selector appears. This is NOT a branch assignment — it's a filter to narrow which attributes are relevant.
  - "Assigned Attributes" dropdown shows only **company-level** attributes whose `selectedBranches` overlap with the chosen branches.
  - If no branches are selected, the attribute list is empty (forces the admin to define scope first).
- **[ADDED]** If **Branch** user:
  - Single branch selector appears.
  - "Assigned Attributes" shows only **branch-specific** attributes scoped to that branch.
- **[ADDED]** Both flows: changing the branch selection resets the attribute selection.

**User Onboarding — Branch Admin creating users:**
- **[ADDED]** "User Type" is auto-set to **Branch** and disabled.
- **[ADDED]** "Branch" is auto-populated to the admin's branch and disabled.
- **[ADDED]** "Assigned Attributes" shows only branch-specific attributes for that branch.

**[ADDED] Default Branch Access Fallback:**
- If a branch user is being created for a branch that has no branch-specific attributes, the system applies a default: the user gets full CRUD access to all master data within their branch.
- This is a safety net ensuring branch users are never left without any access.
- The UI shows a warning: "No branch-specific attributes found for this branch. Default full CRUD branch access will be applied."
- On the user list, such users show a "Default Branch Access (Full CRUD)" tag.

**Transaction Listing:**
- **[ADDED]** For **company-level users:** Both Branch filter and Attribute filter appear, working in tandem.
- **[ADDED]** For **branch-level users:** Only Attribute filter appears (they are locked to their branch scope).
- **[ADDED]** Users with default branch access see all transactions within their branch with full CRUD.

**Key UX complexity:** The branch selector is load-bearing here. It determines what data appears below it. The master data picker needs a branch → type hierarchy.

### 1.3 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Cross-BU data leakage incidents | Zero | Automated privacy test suite, run weekly |
| UI–API enforcement parity | 100% | Single resolver used by both; tested in CI |
| Non-technical stakeholder comprehension | 80% can explain the model after a 10-min walkthrough | Usability test with ops managers and finance users |
| Custom permission code requests | 50% reduction vs. current baseline | Engineering tickets tagged "custom-permissions" |
| Access-related support tickets | 40% reduction within 3 months of launch | Helpdesk tickets tagged "access" or "permission" |
| Admin setup time for new enterprise | Under 2 hours for full attribute + mapping setup | Timed during onboarding of next 3 customers |

---

## 2. Key Definitions

### 2.1 Roles (RBAC)
A Role is a bundle of allowed actions. For example, a role might allow a user to create, view, and edit trips, but not delete them.
Roles answer: "What can this user do?"
Roles do NOT decide which specific data items (routes, vehicles, etc.) a user can access. That is the job of Attributes.

### 2.2 Attributes (ABAC)
An Attribute represents a business dimension such as Business Unit, Region, Channel, or Segment. Attributes are organised in a tree (parent-child hierarchy) and are used to control which master data and transactions a user can work with.
Attributes answer: "What data can this user see and act on?"
A branch can be treated as an operational unit. Attributes are used to further segment access within or across branches. For most tenants, Branch membership defines the base universe; attributes narrow it further.

### 2.3 Master Data
Master data refers to the shared reference items used across the platform: routes, route masters, location masters, material masters, vehicle type masters, driver masters, transporter masters, and any configured primary or custom fields. These are the building blocks of every transaction.

### 2.4 Attributes as Organisational Boundaries
Attributes define the organisational boundaries within which a user can operate. When attributes are assigned to a user, the user can only see or work with transactions that belong to those attributes.
For example, if a user is mapped to Business Unit = SPD_NORTH, they cannot view or edit transactions belonging to SPD_SOUTH.
These boundaries are enforced before any scope or permission checks, ensuring that data does not leak across organisational units.

### 2.5 Transaction
A transaction is any operational record in the system: a trip, an indent, a shipment, or similar. Each transaction contains references to master data items (e.g., which route, which vehicle type, which transporter).

#### 2.5.1 Transaction Owning Branch (Base Visibility)
Every transaction is associated with an Owning Branch, which defines the transaction's base Company/Branch visibility universe. Unless cross-branch access is enabled for the tenant (or for specific users), a user can only access transactions belonging to branches they are mapped to.

#### 2.5.2 Transaction Boundary Fields (Attribute Boundaries)
Every transaction belongs to a specific part of the organisation, such as a Business Unit, Region, or Channel. These values come from the attributes used for access control.
When the system checks access, it compares the attributes assigned to the user with the attribute values stored on the transaction. A user can only access transactions that belong to their assigned attributes.
To make this consistent, these attribute values are saved on the transaction when it is created. The same values are then used for access checks across both the UI and API.

### 2.6 Access Levels

| Access Level | What It Means | Includes Read? |
|-------------|---------------|----------------|
| CRUD (Full Access) | User can create, read, update, and delete using this item. | Yes |
| Read Only | User can view transactions containing this item but cannot create or edit using it. | Yes (read only) |
| Custom | Any specific combination (e.g., Read + Update, Read + Create). Configured per item. | Must include Read |
| No Access | User cannot see transactions containing this item. | No |

### **[ADDED]** 2.7 Attribute Description
Each attribute carries an optional description field (max 200 characters) that provides business context. This appears in the attribute listing table and is editable during attribute creation/editing. Examples: "SPD Business units segment covering north region", "Automotive parts logistics for Chennai and Bengaluru branches".

**MENTAL MODEL**

- RBAC → what user can do
- Branch → where user operates
- Attributes → which organisational slice of data they belong to
- Scope → what master data they can use (mapped in attribute)
- Exceptions/Sharing → special overrides

---

## 3. Goals

### 3.1 In Scope
1. ABAC is evaluated as a filter on top of Company/Branch context. Final access = Branch scope AND Attribute scope. Branch defines the base visibility universe. Attributes further restrict access by defining the organisational boundary and data scope for the user.
2. Let admins define user access scope using Attributes mapped to master data.
3. Support hierarchical roll-ups so parent attributes automatically see children's data.
4. Support three access modes: Open (mix-and-match), Fixed (allowlisted combos only), and Hybrid (open + exceptions).
5. Enforce the same rules in both the UI and the API using a single authorization engine.
6. Show users a clear, friendly UI where they can see what they can do, what they can't, and why.

### 3.2 Out of Scope (v1)
- Primary and custom attributes mapping
- Complex org hierarchy modelling beyond parent-child roll-ups
- Shared Resources view across modules (composite access control)
- Cross-tenant federation of legal entities

---

## 4. Generic Personas

| Persona | Description | Typical Access Pattern |
|---------|-------------|----------------------|
| Admin | Sets up roles, attributes, users. Maintains the system. | Full configuration access. Does not transact. |
| Ops User | Creates and manages transactions day-to-day. | CRUD on their assigned scope. |
| Ops Manager | Needs roll-up visibility across multiple teams. | Mapped to parent attribute. Mostly view-only, selective edit. |
| Finance / Audit | Needs read-only access for review and investigation. | Read-only scope. May receive shared transactions. |
| Supplier / Vendor | External user who can only transact on contracted combinations. | Fixed mode: explicit allowlisted combinations only. |

### **[ADDED]** 4.1 LEGO Configuration Personas (Admin Sub-Types)

These personas operate within the LEGO Config section of the platform and have distinct capabilities depending on the onboarding mode:

| Persona | Central Onboarding Capabilities | Branch Specific Onboarding Capabilities |
|---------|-------------------------------|----------------------------------------|
| **Company Admin** | Creates and manages all attributes from the company-level master data pool. Creates and manages all users. | Can create both Company Level and Branch Specific attributes. Can create both Company and Branch users. Has access across all branches. |
| **Branch Admin** | N/A (no branch admins in central mode) | Can only create Branch Specific attributes for their own branch. Can only create Branch users for their own branch. Branch selector is locked to their branch. |

The LEGO Config UI provides a role switcher (Company Admin / Branch Admin) so admins can simulate and demo the behavioral differences between these two personas.

---

## 5. How the System Works

This section describes the expected product behaviour in plain terms. The system has four layers that work together.

### 5.1 Layer 1: Attributes and Hierarchy
Admins create attributes that mirror the company's org structure. For example:
- Business Unit: TATA MOTORS LTD (parent) → SPD_N, SPD_S, SPD_E, SPD_W (children)
- Region: ALL (parent) → North, South, East, West (children)

Key rules:
- Attributes support parent-child trees. In v1, each child attribute can belong to only one parent (single-parent hierarchy).
- Parent attributes automatically see everything their children can see (bottom-up roll-up).
- When a child's mapping changes, the parent's inherited view updates automatically.
- **[ADDED]** Each attribute has a label (required) and description (optional) to provide business context.

### 5.2 Layer 2: Master Data Mapping
Admins map master data items (routes, vehicle types, materials, transporters, custom fields) to each attribute, along with an access level for each item.

Example:
- Attribute: SPD_NORTH
  - Routes r1, r2, r3 → CRUD
  - Routes r4, r5 → Read Only
  - Vehicle types v1, v2 → CRUD
  - Transporter t1 → CRUD

**[ADDED]** Default Behavior (Validated in Prototype):
- When an attribute is created, all available master data items within the selected scope are **pre-selected with full CRUD** (Create, Read, Update, Delete all checked).
- The admin then deselects items or downgrades individual permissions as needed (subtractive model, not additive).
- Each selected item displays inline **C / R / U / D checkboxes** that can be individually toggled.
- Items are grouped by master data type (Routes, Route Master, Location Master, Material Master, Vehicle Type Master, Driver Master, Transporter Master) with collapsible sections.
- Each group header shows a count badge (e.g., "3/5") and indicates if any items have restricted permissions.
- "Select All" checkbox per group for bulk operations.
- Search within master data items.
- Bulk Upload via Excel for large-scale mapping.

How parent inheritance works for master data:
- Default: Parent gets Read-Only access to all items inherited from children. The parent can view but not create or edit.
- All CRUD mode: Admin can upgrade the parent to full CRUD on all inherited items (acts like an admin for that scope).
- Custom mode: Parent keeps Read on everything, and admin selectively upgrades specific items to CRUD. Supports bulk upload for large-scale upgrades.

### 5.3 Layer 3: User Onboarding

When onboarding a user, the admin assigns two things:
1. **Role** — which actions the user can perform (from the RBAC layer).
2. **Attribute** — which data the user can work with (from the ABAC layer).

The combination of role + attribute creates the user's complete access profile. Role decides which buttons appear enabled. Attribute decides which data populates the dropdowns.

**[ADDED]** Onboarding Behavior by Mode (Validated in Prototype):

**Central Onboarding:**
- Admin assigns Role and one or more Attributes. No user type or branch selection.
- Attributes directly define the user's data scope.
- Users without any assigned attributes default to full company data access (admin-level).

**Branch Specific Onboarding — Company Admin creating users:**
- Admin selects a **User Type**: Company or Branch.
- **Company User:** A "Branches (scope filter)" multi-selector appears. Admin selects branches the user operates across. Only company-level attributes whose branch scope overlaps with these selections appear in the Assigned Attributes dropdown. The branch selector acts as a filter to surface relevant attributes — it is not a branch assignment.
- **Branch User:** A single branch selector appears. Only branch-specific attributes scoped to that branch appear in the Assigned Attributes dropdown. Changing the branch resets the attribute selection.

**Branch Specific Onboarding — Branch Admin creating users:**
- User Type is auto-locked to **Branch** (disabled).
- Branch is auto-populated to the admin's own branch (disabled).
- Only branch-specific attributes for that branch appear in the Assigned Attributes dropdown.

**Default Branch Access Fallback:**
- If a Branch User is being created for a branch that has zero branch-specific attributes, the system applies a default: the user gets full CRUD access to all master data within their branch.
- UI shows a warning explaining the fallback.
- On the user list, these users display a "Default Branch Access (Full CRUD)" tag.
- The access resolver honors this fallback when evaluating transaction permissions.

### 5.4 Layer 4: The Access Resolver
Every time a user tries to view, create, edit, or delete a transaction, the system runs a single resolver that checks access in a strict order. The resolver returns: Can View? Can Edit/Create/Delete? A reason code. A plain-English explanation.

**[ADDED]** Transaction-Level Permission Resolution (Validated in Prototype):

Each transaction is linked to specific master data items (route, vehicle type, material, transporter). The resolver builds a per-user permission map by aggregating permissions across all assigned attributes, then evaluates each transaction:

- **Row Visibility (canReadRow):** The user must have READ access (or any CRUD permission) on **ALL** linked master data items in the transaction. If the user lacks read access on even one linked item, the entire transaction row is hidden.
- **Row Editability (canUpdateRow):** The user must have UPDATE access on **ALL** linked master data items. If any item lacks update permission, the Edit button is disabled with a tooltip listing the specific items blocking access.
- **Permission Aggregation:** When a user has multiple attributes, permissions are unioned across attributes per item (e.g., if Attribute A grants Read on item X and Attribute B grants CRUD on item X, the user has CRUD on item X).

### **[ADDED]** 5.5 LEGO Config vs In-Product (Navigation Architecture)

The platform separates configuration workflows from product-side workflows:

**LEGO Config** (left nav section):
- **Attributes:** Attribute listing, creation, editing, deletion.
- **Users:** User listing, creation, editing, deletion.
- Admin role switcher in header: Company Admin / Branch Admin (to simulate different admin capabilities).

**In-Product** (left nav section):
- **Transactions:** Journey/trip listing, creation, filtering.
- User switcher in header: Shows all created users (to simulate different user perspectives and permission outcomes).

This separation ensures that configuration and product-side behaviors can be independently developed and demonstrated. The global POC Scenario toggle (Central Onboarding / Branch Specific Onboarding) controls both sections consistently.

---

## 6. The Access Resolver: Step-by-Step Logic

The resolver evaluates every access request in the following order. If any step results in a deny, the system stops and returns that result.

### 6.1 Step 1: Role Check (RBAC)
Does the user's role allow this action? If the role does not include the action (e.g., "Edit Trip" is not in the role), deny immediately. No further checks are run.

### 6.2 Step 2: Attribute Boundary Check
Attributes mapped to a user define the organisational boundary within which the user can operate.
The system checks whether the transaction belongs to the same attribute values as the user (for example: Business Unit, Region, or Segment).
- If the transaction does not match the user's attributes, access is denied immediately. The user cannot view or edit the transaction.
- If a user is mapped to multiple attributes, all applicable attribute conditions must match (AND logic).
- This check happens after the RBAC role check and branch filtering, and before scope matching or sharing checks.
- Attribute values used for this check are stored on the transaction to ensure consistent behaviour across UI and API.

### 6.3 Step 3: Sharing Check
Has this specific transaction been explicitly shared with the user? If yes, the user gets read-only access to that one transaction. Sharing never grants edit, create, or delete rights, and does not expand future scope.
- Shared access must still pass privacy gates (configurable per tenant; default = yes).

### 6.4 Step 4: Combination Exceptions
Are there explicit allow or deny rules for specific master data combinations?
- Deny rules: Block a specific combination even if the user generally has scope access.
- Allow rules: Grant CRUD for a specific combination even if it's outside normal scope (e.g., supplier allowlist).

Precedence:
- DENY always wins over ALLOW.
- ALLOW wins over normal scope.
- If no exception applies, proceed to Step 5.

### 6.5 Step 5: Scope Match
The system checks whether the master data items inside the transaction fall within the user's mapped scope.

**For full access (create/edit/delete): AND logic across all dimensions.**
Every master data item in the transaction must be in the user's CRUD set. If even one item is outside CRUD scope, full access is denied.

Example: CRUD Check
- Transaction contains: Route r1, Vehicle v2, Material m1, Transporter t4
- User CRUD scope: Routes {r1,r2,r3}, Vehicles {v1,v2}, Materials {m1,m2}, Transporters {t1,t4}
- Result: All items match → CRUD ALLOWED

**For read-only visibility: OR logic across any dimension.**
A transaction becomes visible if any one dimension matches the user's readable set (Read scope + CRUD scope combined).

Why OR logic for reads?
In real operations, an indent might be raised with vehicle v1, then later upon vehicle reporting at gate, the transporter would have sent another vehicle and hence the trip is updated with vehicle v2. The original user should still be able to see the trip as long as v2 is in their Read scope, even if v2 is not in their CRUD scope. OR logic supports these handoff scenarios.

**[ADDED]** Note on Prototype Implementation:
The prototype implements a stricter model for row visibility where ALL linked items must have at least read-level access for the row to be visible. This was chosen for the POC to demonstrate clear permission boundaries. The production implementation should evaluate whether OR logic (as specified above) or AND logic (as prototyped) better serves the business need — this is flagged as an open question.

---

## 7. Supported Access Modes

### 7.1 Open Mode
The user can create transactions using any mix of master data items within their CRUD scope. If they have CRUD access to routes r1–r4, vehicles v1–v3, and transporter t1, they can combine these freely.

### 7.2 Fixed Mode (Supplier Allowlist)
The user can only create transactions for explicitly defined combinations. Even if the user can "see" other items, they cannot create unless the exact combination is allowlisted.

Example: Fixed Mode
- Supplier is allowed: (r1, v2, m3, t1) and (r2, v2, m3, t1)
- Supplier tries to create (r1, v1, m3, t1) → DENIED (v1 not in allowed combo)

### 7.3 Hybrid Mode
The user can transact freely within their normal scope, plus the system supports specific exceptions:
- Extra allow: A specific combination outside normal scope is explicitly granted.
- Extra deny: A specific combination within normal scope is explicitly blocked.

---

## 8. UI Expectations

### 8.1 Transaction Creation UI
When a user is creating a transaction (trip, indent, etc.), the dropdowns for master data must visually communicate access:

| Item Status | Visual Treatment | Interaction | Tooltip / Explanation |
|------------|-----------------|-------------|----------------------|
| CRUD Access | Normal text (black), selectable | Clickable | None needed |
| Read Only | Greyed out text with "Read Only" badge | Not selectable | "You can view transactions with this item, but cannot create or edit using it." |
| No Access | Greyed out text with "No Access" badge | Not selectable | "You cannot view transactions that contain this item. Contact your admin for access." |

Why show items the user can't select? Because it reduces confusion. Users understand the item exists, they just don't have access. This cuts down on support tickets asking "where is route X?"

### 8.2 Transaction Actions UI
After a user can see a transaction, actions (edit, delete, share, etc.) should always be visible:
- **Enabled (black):** Allowed by both role AND scope.
- **Disabled (grey):** Blocked by role OR scope. Tooltip explains why.

Actions should never be hidden. Users need to see the full set of what's possible in the product.

**[ADDED]** Edit Button Specifics (Validated in Prototype):
- When a user lacks UPDATE access on any linked master data item in the transaction, the Edit button is disabled.
- The tooltip on the disabled Edit button lists the specific master data items blocking update access (e.g., "Update blocked: missing update access for Delhi → Jaipur (NH48), Tata 407").
- This gives the user actionable information to request specific access from their admin.

### **[ADDED]** 8.3 Transaction Listing Filters

Transaction listing filters adapt based on the onboarding mode and the current user's type:

**Central Onboarding:**
- **Attribute filter** is the primary filter. Users select one or more of their assigned attributes to slice cross-branch data.
- No branch filter (irrelevant in this mode).

**Branch Specific Onboarding — Company User:**
- **Branch filter** and **Attribute filter** appear side by side, working in tandem.
- Branch filter narrows by geography. Attribute filter narrows by organisational scope within those branches.

**Branch Specific Onboarding — Branch User:**
- **Attribute filter** only (user is locked to their branch scope; branch filter would be redundant).
- Users with default branch access (fallback) see all transactions within their branch.

All modes include a text search across Journey ID, route, and vehicle number.

---

## 9. Reason Codes

Every access decision returns a machine-readable reason code and a human-readable explanation. This is used in tooltips, API error responses, and audit logs.

| Reason Code | Meaning | User-Facing Explanation |
|------------|---------|------------------------|
| RBAC_DENY | User's role does not include this action. | "Your role does not allow this action. Contact your admin." |
| ATTRIBUTE_BOUNDARY_DENY | User's attribute does not match the transaction's boundary. | "This transaction belongs to a different part of the organisation." |
| SHARE_ALLOW_READ | Transaction was explicitly shared with the user. | "This transaction was shared with you for viewing." |
| EXCEPTION_DENY | An explicit deny rule blocks this combination. | "This combination has been restricted by your admin." |
| EXCEPTION_ALLOW_CRUD | An explicit allow rule grants full access to this combination. | "You have special access to this combination." |
| BRANCH_SCOPE_DENY | Transaction is outside user's branch visibility universe. | "This transaction belongs to a branch you don't have access to." |
| SCOPE_DOWNGRADED_READ_DUE_TO_UPDATE | Transaction changed and now contains items outside CRUD scope. | "This transaction was updated with items outside your create/edit scope. You can still view it." |
| EXCEPTION_ALLOW_READ | An explicit allow rule grants read access to this combination. | "You can view this combination under a special rule." |
| SCOPE_ALLOW_CRUD | All items match the user's CRUD scope. | "You have full access to this transaction." |
| SCOPE_ALLOW_READ | At least one item matches the user's read scope. | "You can view this transaction but cannot edit it." |
| SCOPE_DENY_NO_MATCH | No items in the transaction match the user's scope. | "None of the items in this transaction are in your access scope." |

---

## 10. Functional Requirements (User Stories)

### Epic A: Attribute Setup and Hierarchy

#### US-A1: Create Attributes with Hierarchy
**As an** admin,
**I want to** create attributes with parent-child hierarchy (e.g., BU → Region → Branch),
**So that** I can mirror our real org structure and manage access at the right level of granularity.

Acceptance Criteria:
- ✓ Given the admin is on the Attribute setup page, When they create a new attribute, Then they can define it as a root or child of an existing attribute.
- ✓ Given a child attribute exists, When the admin views the tree, Then the child is visually linked to its parent.
- ✓ Given single-parent mode (default), When an admin tries to assign a child to two parents, Then the system blocks this with a clear error.
- ✓ Given the hierarchy exists, When the admin navigates the tree, Then the full path is displayed (e.g., TATA MOTORS → SPD_N → Delhi).
- **[ADDED]** ✓ Given the admin is creating an attribute, When they enter a label, Then they can also enter an optional description (max 200 chars) to provide business context.
- **[ADDED]** ✓ Given the admin is in Branch Specific Onboarding mode and is a Company Admin, When they create an attribute, Then they must first select the Attribute Scope (Company Level or Branch Specific) before proceeding.
- **[ADDED]** ✓ Given the admin is a Branch Admin in Branch Specific mode, When they create an attribute, Then the scope is locked to "Branch Specific" and the branch is locked to their own branch.

#### US-A2: Parent Roll-Up Works Automatically
**As an** admin,
**I want** parent attributes to automatically aggregate scope from their children,
**So that** managers at the parent level can see all relevant data without manual duplication.

Acceptance Criteria:
- ✓ Given a parent attribute with two children, When I view the parent's scope, Then it shows the union of both children's mapped items.
- ✓ Given an inherited item on the parent, When I hover over it, Then it is visually labelled as "Inherited from [child name]".
- ✓ Given a child's mapping is removed, When I view the parent, Then the inherited item is also removed automatically.
- ✓ Given a child adds a new mapping, When I view the parent, Then the new item appears as inherited within the next refresh cycle.

### Epic B: Master Data Mapping with Access Levels

#### US-B1: Map Master Data to an Attribute
**As an** admin,
**I want to** map routes, vehicle types, materials, transporters, and custom fields to an attribute,
**So that** users under that attribute can only transact on permitted items.

Acceptance Criteria:
- ✓ Given I select an attribute, When I open the mapping panel, Then I see a list of all master data types available for mapping.
- ✓ Given I select a master data type (e.g., Routes), When I search for items, Then I can filter, multi-select, and map items in bulk via excel sheet.
- ✓ Given items are mapped, When I view the attribute's mapping summary, Then all mapped items are listed grouped by master data type.
- ✓ Given an item is already mapped to this attribute, When I try to map it again, Then the system prevents duplication with a clear message.
- **[ADDED]** ✓ Given I am creating a new attribute, When the master data picker loads, Then all available items are pre-selected with full CRUD by default (subtractive model).
- **[ADDED]** ✓ Given items are grouped by type, When I expand a group, Then I see a "Select All" checkbox and individual item rows with inline C/R/U/D checkboxes.
- **[ADDED]** ✓ Given a Branch Specific attribute with "Company Level" scope, When I select branches, Then master data from those branches loads automatically with all items pre-selected.
- **[ADDED]** ✓ Given a Branch Specific attribute with "Branch Specific" scope, When I select a single branch, Then only that branch's master data loads.

#### US-B2: Assign Access Level During Mapping
**As an** admin,
**I want to** assign CRUD, Read Only, or Custom access to each mapped item,
**So that** I can control whether users can create with an item or only view transactions containing it.

Acceptance Criteria:
- ✓ Given I am mapping an item, When I select the access level, Then I can choose from CRUD, Read Only, or Custom.
- ✓ Given I choose Custom, When I configure it, Then I can select any combination of Create, Read, Update, Delete.
- ✓ Given I choose CRUD, When the mapping is saved, Then Read access is automatically included.
- ✓ Given items are mapped in bulk, When I set an access level, Then the same level applies to all items in that batch (with option to override individually).
- **[ADDED]** ✓ Given I am viewing a selected item, When I look at the item row, Then I see four inline checkboxes labelled C, R, U, D that I can individually toggle.
- **[ADDED]** ✓ Given a group of items, When I check the group header badge, Then it shows how many items have restricted permissions (e.g., "3/5 (1 restricted)").

#### US-B3: Parent Inheritance Modes for Master Data
**As an** admin,
**I want to** control how a parent attribute inherits master data from its children,
**So that** I can give managers the right level of access — from view-only oversight to full operational control.

Acceptance Criteria:
- ✓ Given a parent has children with mapped items, When inheritance mode is "Default", Then the parent gets Read-Only access to all inherited items.
- ✓ Given I switch the parent to "All CRUD" mode, When I save, Then the parent gets full CRUD access on all inherited items.
- ✓ Given I switch the parent to "Custom" mode, When I view inherited items, Then I can individually or bulk-upgrade specific items from Read to CRUD.
- ✓ Given the parent is in Custom mode with some CRUD upgrades, When a child adds a new mapping, Then the new item inherits at Read-Only by default.
- ✓ Given the parent is in Default mode, When the parent's role allows "Create Journey" but no CRUD items exist, Then the Create button is visible but disabled with message: "Your role allows creation, but you don't have create access to any master data items."

#### **[ADDED]** US-B4: Attribute Description Field
**As an** admin,
**I want to** add a description to each attribute,
**So that** other admins and auditors can understand the business purpose of the attribute without opening its configuration.

Acceptance Criteria:
- ✓ Given I am creating or editing an attribute, When I see the attribute form, Then there is an optional Description field (max 200 chars) below the label.
- ✓ Given I enter a description, When I save the attribute, Then the description is stored and displayed in the attribute listing table.
- ✓ Given the attribute listing table, When I view it, Then I see a "Description" column showing each attribute's description (or a dash if empty).

#### **[ADDED]** US-B5: Default CRUD Pre-Selection
**As an** admin,
**I want** all available master data items to be pre-selected with full CRUD when I create a new attribute,
**So that** I can quickly deselect or downgrade permissions rather than manually selecting every item.

Acceptance Criteria:
- ✓ Given I open the Create Attribute drawer, When the master data tab loads, Then all available items for the selected scope are pre-selected with C, R, U, D all checked.
- ✓ Given I deselect an item or uncheck a permission, When I save, Then only the items and permissions I left selected are stored.
- ✓ Given I change the branch selection (Branch Specific mode), When new data loads, Then all newly loaded items are pre-selected with full CRUD.

### Epic C: User Onboarding

#### US-C1: Assign Role and Attribute to a User
**As an** admin,
**I want to** assign both a role and an attribute to a user during onboarding,
**So that** their actions and data scope are both controlled from day one.

Acceptance Criteria:
- ✓ Given I am creating a new user, When I reach the access section, Then both Role and Attribute are mandatory fields.
- ✓ Given I select a role, When I save, Then the user's module actions are determined by that role.
- ✓ Given I select an attribute, When I save, Then the user's data scope is determined by that attribute's mappings.
- ✓ Given I try to save without selecting both, When I click Save, Then the system shows a validation error.
- **[ADDED]** ✓ Given Central Onboarding mode, When I create a user with no attributes assigned, Then the user defaults to full company data access (admin-level) and the user list shows "All Company Data (Admin)" tag.
- **[ADDED]** ✓ Given Branch Specific Onboarding mode, When I create a user, Then I must first select the User Type (Company or Branch) which determines the subsequent form fields and eligible attributes.

#### US-C2: Map User to Parent Attribute for Roll-Up Access
**As an** admin,
**I want to** map a user to a parent attribute,
**So that** they can see aggregated data across all children without extra setup.

Acceptance Criteria:
- ✓ Given a user is mapped to a parent attribute, When they log in, Then their data scope includes all items inherited from child attributes.
- ✓ Given the parent is in Default mode, When the user tries to create a transaction, Then only directly-mapped CRUD items are available (inherited items are read-only).
- ✓ Given the parent is in All CRUD mode, When the user creates a transaction, Then all inherited items are available for selection.

#### **[ADDED]** US-C3: Branch Scope Filter for Company Users
**As a** Company Admin in Branch Specific Onboarding,
**I want to** select branches as a scope filter when creating a Company User,
**So that** only company-level attributes relevant to those branches appear in the attribute assignment dropdown, ensuring precise scope control.

Acceptance Criteria:
- ✓ Given I am creating a Company User in Branch Specific mode, When I see the form, Then a "Branches (scope filter)" multi-selector appears.
- ✓ Given I select one or more branches, When the attribute dropdown updates, Then it shows only company-level attributes whose branch scope overlaps with my selection.
- ✓ Given I have not selected any branches, When I view the attribute dropdown, Then it is empty with placeholder text "Select branches above to see matching attributes."
- ✓ Given I change the branch selection, When the list updates, Then previously selected attributes are reset to prevent stale mappings.

#### **[ADDED]** US-C4: Default Branch Access Fallback for Branch Users
**As the** system,
**I want to** automatically grant full CRUD branch access to Branch Users whose branch has no branch-specific attributes,
**So that** branch users are never left without any access when admins haven't yet created attributes for their branch.

Acceptance Criteria:
- ✓ Given a Branch User is being created for a branch with zero branch-specific attributes, When the form detects this, Then a warning is shown: "No branch-specific attributes found for this branch. Default full CRUD branch access will be applied."
- ✓ Given the user is saved with default branch access, When the access resolver evaluates their permissions, Then they have full CRUD on all master data items within their branch.
- ✓ Given the user list page, When a user has default branch access, Then their Attributes column shows "Default Branch Access (Full CRUD)" tag.
- ✓ Given a branch admin later creates attributes for that branch, When the branch user is re-assigned, Then the fallback is removed and normal attribute-based access applies.

#### **[ADDED]** US-C5: Branch Admin User Creation Constraints
**As a** Branch Admin in Branch Specific Onboarding,
**I want** the user creation form to auto-lock to my branch,
**So that** I can only create users for my own branch without accidentally assigning cross-branch access.

Acceptance Criteria:
- ✓ Given I am a Branch Admin creating a user, When the form loads, Then User Type is auto-set to "Branch" and disabled.
- ✓ Given I am a Branch Admin creating a user, When the form loads, Then Branch is auto-populated with my branch and disabled.
- ✓ Given the attribute dropdown, When it loads, Then only branch-specific attributes for my branch are shown.

### Epic D: Attribute Boundary Enforcement

#### US-D1: Attribute Assignment Defines Organisational Boundary
**As an** admin,
**I want** attributes assigned to users to define their organisational boundaries,
**So that** transactions outside those boundaries are never visible regardless of scope configuration.

Acceptance Criteria:
- ✓ Given I am configuring attribute boundaries, When I select an attribute dimension (e.g., Business Unit = FMCG), Then the system registers it as an attribute boundary.
- ✓ Given multiple attribute boundaries are mapped to a user, When the resolver evaluates access, Then all gates are checked using AND logic.
- ✓ Given a user's BU attribute does not match the transaction's attribute, When the resolver runs, Then access is denied at Step 2 with reason code ATTRIBUTE_BOUNDARY_DENY.
- ✓ Given an attribute boundary is added after users are already active, When the gate takes effect, Then existing users' access is re-evaluated against the new gate.

### Epic E: Transaction Creation UX

#### US-E1: Show CRUD Items as Selectable
**As an** ops user,
**I want to** see master data items I have full access to appear as selectable (black, clickable) in dropdowns,
**So that** I can create transactions confidently without guessing what I'm allowed to use.

Acceptance Criteria:
- ✓ Given I am creating a transaction, When I open a master data dropdown, Then items in my CRUD scope appear in normal black text and are clickable.
- ✓ Given I select a CRUD item, When I proceed, Then the system accepts my selection without error.
- **[ADDED]** ✓ Given I am a user with default branch access (fallback), When I open the creation form, Then all master data items within my branch appear as selectable with a note indicating fallback access is active.

#### US-E2: Show Read-Only Items as Greyed with Explanation
**As an** ops user,
**I want to** see read-only items appear greyed out with a "Read Only" badge and an explanation tooltip,
**So that** I understand I can view related transactions but cannot create with these items.

Acceptance Criteria:
- ✓ Given I am creating a transaction, When I open a dropdown, Then Read-Only items appear greyed out with a "Read Only" badge.
- ✓ Given a Read-Only item is displayed, When I hover over the info icon, Then a tooltip says: "You can view transactions with this item, but cannot create or edit using it."
- ✓ Given a Read-Only item is displayed, When I click on it, Then nothing happens (it is not selectable).

#### US-E3: Show No-Access Items as Greyed with Explanation
**As an** ops user,
**I want to** see no-access items appear greyed out with a "No Access" badge and explanation,
**So that** I know the item exists and can request access if needed, instead of thinking it's missing.

Acceptance Criteria:
- ✓ Given I am creating a transaction, When I open a dropdown, Then No-Access items appear greyed out with a "No Access" badge.
- ✓ Given a No-Access item is displayed, When I hover over the info icon, Then a tooltip says: "You cannot view transactions that contain this item. Contact your admin for access."

### Epic F: Transaction Visibility and Access Enforcement

#### US-F1: Enforce Privacy Gates Before Scope Checks
**As a** user,
**I want to** be blocked from transactions outside my org boundary regardless of my scope settings,
**So that** there is zero risk of data leakage across hard boundaries.

Acceptance Criteria:
- ✓ Given my attribute is BU = SPD_NORTH, When I search for transactions belonging to BU = SPD_SOUTH, Then zero results are returned.
- ✓ Given I have multiple privacy gates (BU = SPD_N AND Region = North), When a transaction matches BU but not Region, Then access is denied.
- ✓ Given a privacy gate denies access, When the resolver returns, Then the reason code is PRIVACY_ATTRIBUTE_DENY with an appropriate explanation.

#### US-F2: Grant CRUD Only When Full Scope Matches
**As a** user,
**I want to** have full access only when every master data item in the transaction is within my CRUD scope,
**So that** I cannot accidentally edit a transaction that includes items outside my control.

Acceptance Criteria:
- ✓ Given a transaction contains route r1, vehicle v2, material m1, and all are in my CRUD scope, When I try to edit, Then the action is allowed.
- ✓ Given a transaction contains route r1 (in my CRUD scope) and vehicle v5 (NOT in my CRUD scope), When I try to edit, Then the action is denied with reason SCOPE_ALLOW_READ.
- ✓ Given CRUD is denied, When I view the transaction, Then edit/delete actions appear greyed out with a tooltip explaining which item is outside my scope.
- **[ADDED]** ✓ Given update access is denied, When I hover over the disabled Edit button, Then the tooltip lists the specific master data items missing update access (e.g., "Update blocked: missing update access for Delhi → Jaipur (NH48)").

#### US-F3: Grant Read Visibility When Any Dimension Matches
**As a** user,
**I want to** be able to see transactions read-only if any one master data dimension matches my read or CRUD scope,
**So that** I can track operational updates and handoffs even when I don't have full control over every item.

Acceptance Criteria:
- ✓ Given a transaction contains route r1 (in my Read scope) and vehicle v5 (NOT in any scope), When I view my transaction list, Then the transaction appears in my list as read-only.
- ✓ Given a transaction was created with vehicle v1 (my scope) and later updated to v2 (also in my Read scope), When I view the transaction, Then I can still see it.
- ✓ Given a read-only transaction, When I view it, Then all action buttons (edit, delete) are greyed out with appropriate tooltips.

#### **[ADDED]** US-F4: Transaction Filtering by Onboarding Mode and User Type
**As a** user viewing the transaction list,
**I want** the available filters to adapt to my onboarding mode and user type,
**So that** I can efficiently find relevant transactions using the most meaningful axes for my context.

Acceptance Criteria:
- ✓ Given Central Onboarding mode, When I view the transaction list, Then I see an Attribute filter as the primary filter (no branch filter).
- ✓ Given Branch Specific mode and I am a Company User, When I view the transaction list, Then I see both Branch and Attribute filters working in tandem.
- ✓ Given Branch Specific mode and I am a Branch User, When I view the transaction list, Then I see only an Attribute filter (my branch is implicit).
- ✓ Given any mode, When I view the transaction list, Then I see a text search for Journey ID, route, and vehicle number.
- ✓ Given the transaction count, When the page loads, Then a subtitle shows the number of visible journeys by permission scope.

### Epic G: Combination Exceptions

#### US-G1: Allowlist Specific Combinations for Suppliers
**As an** admin,
**I want to** explicitly allow certain route + vehicle + material + transporter combinations for a user,
**So that** suppliers can only raise transactions for contracted combinations, preventing unauthorised creation.

Acceptance Criteria:
- ✓ Given I am configuring a supplier user, When I add an allow combo (r1, v2, m3, t1), Then that user can create transactions with exactly that combination.
- ✓ Given the supplier tries a combination not in their allowlist, When they attempt to create, Then the system denies with reason EXCEPTION_DENY or SCOPE_DENY_NO_MATCH.
- ✓ Given multiple combos are allowlisted, When the supplier opens the creation form, Then only allowlisted items are selectable (in Fixed mode).

#### US-G2: Denylist Specific Combinations
**As an** admin,
**I want to** explicitly block specific combinations even if the user generally has scope access,
**So that** I can prevent sensitive or invalid transaction creation without removing broad scope.

Acceptance Criteria:
- ✓ Given a user has CRUD access to routes r1–r5, When I add a deny rule for (r3, v2, m1, t1), Then the user cannot create that specific combination.
- ✓ Given a deny rule and an allow rule exist for the same combination, When the resolver evaluates, Then DENY wins (deny > allow > scope).
- ✓ Given a deny rule blocks creation, When the user tries, Then the system returns reason EXCEPTION_DENY with explanation.

### Epic H: Transaction Sharing

#### US-H1: Share a Transaction with Another User
**As a** user with share permission in my role,
**I want to** share a specific transaction with another user for read-only viewing,
**So that** cross-functional teams (e.g., finance, audit) can investigate specific transactions without broad scope changes.

Acceptance Criteria:
- ✓ Given I have share permission and the transaction is in my scope, When I share it with another user, Then that user receives read-only access to that specific transaction.
- ✓ Given a transaction is shared with me, When I view my transaction list, Then the shared transaction appears with a "Shared" badge.
- ✓ Given a shared transaction, When I try to edit it, Then all edit actions are disabled with reason SHARE_ALLOW_READ.
- ✓ Given the sharer revokes the share, When I next access the transaction, Then it is no longer visible to me (unless I have scope access independently).

#### US-H2: Shared Transactions Respect Privacy Gates
**As the** system,
**I want to** enforce privacy gates even on shared transactions,
**So that** sharing cannot be used as a backdoor to bypass hard org boundaries.

Acceptance Criteria:
- ✓ Given a transaction belongs to BU = SPD_SOUTH, When a user in BU = SPD_NORTH receives a share, Then access is denied (default behaviour) with reason PRIVACY_ATTRIBUTE_DENY.
- ✓ Given the tenant has configured "shares bypass privacy gates", When a cross-BU share is created, Then read-only access is granted.
- ✓ Given the tenant setting, When an admin reviews sharing configuration, Then the privacy bypass setting is visible with a warning about its implications.

### Epic I: Explainability and Audit

#### US-I1: Provide Reason and Explanation for Every Decision
**As a** user,
**I want to** see a clear explanation when the system allows or blocks my access,
**So that** I trust the system and don't need to raise support tickets to understand access decisions.

Acceptance Criteria:
- ✓ Given any access check (view, create, edit, delete), When the resolver returns a result, Then the response includes: allow_read (boolean), allow_crud (boolean), reason_code (from the defined list), explanation (plain English).
- ✓ Given a blocked action, When I hover over the disabled button, Then a tooltip shows the explanation (e.g., "Your role does not allow this action").
- ✓ Given an API request is denied, When the error response is returned, Then it includes the same reason_code and explanation as the UI would show.

#### US-I2: Show All Actions (Enabled and Disabled)
**As a** user,
**I want to** see all possible actions on a transaction, even if some are disabled for me,
**So that** I understand the full product capability and know what to request access for if needed.

Acceptance Criteria:
- ✓ Given a transaction I can view, When I open it, Then all actions (edit, delete, share, etc.) are visible.
- ✓ Given an action is blocked by role, When I view the button, Then it is greyed out with tooltip: "Your role does not include this action."
- ✓ Given an action is blocked by scope (read-only transaction), When I view the button, Then it is greyed out with tooltip explaining the scope mismatch.

#### US-I3: Audit Log for Access Configuration Changes
**As an** admin,
**I want to** see a log of all changes to roles, attributes, mappings, and user assignments,
**So that** I can trace who changed what and when, supporting compliance and troubleshooting.

Acceptance Criteria:
- ✓ Given I change an attribute mapping (add/remove/modify), When I save, Then the change is logged with timestamp, admin user, attribute, item, old value, and new value.
- ✓ Given I change a user's role or attribute, When I save, Then the change is logged.
- ✓ Given I add or remove a combination exception, When I save, Then the change is logged.
- ✓ Given I access the audit log, When I filter by date range, user, or attribute, Then I see relevant entries.

### Epic J: Multi-Attribute Users

#### US-J1: Support Users Mapped to Multiple Attributes
**As an** admin,
**I want to** assign a user to more than one attribute (e.g., BU = Hair AND Region = North),
**So that** users who work across organisational cuts can operate effectively without workarounds.

Acceptance Criteria:
- ✓ Given a user is mapped to two attributes, When the resolver calculates visibility, Then the user's readable scope is the UNION of both attributes' read sets.
- ✓ Given a user is mapped to two attributes, When the resolver calculates CRUD access, Then CRUD still requires all items in the transaction to be in the user's combined CRUD set (AND logic on items, UNION on scope sources).
- ✓ Given a user has multiple attributes that act as privacy gates, When the resolver evaluates, Then all privacy gates are checked using AND logic.
- ✓ Given an admin views a multi-attribute user's profile, When they open the access summary, Then all assigned attributes and their combined scope are clearly displayed.

### Epic K: Edge Cases and Data Lifecycle

#### US-K1: Handle Attribute Deletion Gracefully
**As an** admin,
**I want to** delete an attribute that is no longer needed,
**So that** the system cleans up related mappings and user assignments without leaving orphan data.

Acceptance Criteria:
- ✓ Given an attribute has users mapped to it, When I try to delete it, Then the system warns me and requires me to reassign those users first.
- ✓ Given an attribute has child attributes, When I try to delete it, Then the system blocks deletion until children are removed or reassigned.
- ✓ Given an attribute is successfully deleted, When I check master data mappings, Then all mappings to that attribute are removed.

#### US-K2: Handle User Deactivation
**As an** admin,
**I want to** deactivate a user account,
**So that** the user immediately loses all access and shared transactions are cleaned up.

Acceptance Criteria:
- ✓ Given a user is deactivated, When they try to log in or call the API, Then access is denied immediately.
- ✓ Given a user is deactivated, When other users check transactions shared by this user, Then shares created by this user remain (shares are linked to transactions, not users).
- ✓ Given a deactivated user is reactivated, When they log in, Then their previous role + attribute assignment is restored.

#### US-K3: Handle Master Data Archival
**As the** system,
**I want to** handle master data items that are archived or deactivated,
**So that** existing transactions using those items remain visible but new transactions cannot use them.

Acceptance Criteria:
- ✓ Given a route is archived, When a user opens the creation dropdown, Then the archived route does not appear.
- ✓ Given a transaction was created with a now-archived route, When a user with read scope views it, Then the transaction is still visible with the archived route shown as "[Archived]".
- ✓ Given a transaction uses an archived item, When a user tries to edit it, Then the archived field is locked with explanation: "This item has been archived and cannot be modified."

---

## 11. Key Flows Summary

### 11.1 Admin Setup Flow
1. Create attributes with parent-child hierarchy.
2. Map master data items to attributes with access levels.
3. Configure privacy gates (which dimensions are hard boundaries).
4. Onboard users with role + attribute.
5. (Optional) Add combination exceptions for suppliers or special rules.
6. (Optional) Share specific transactions when needed.

### 11.2 Transaction Creation Flow
When a user tries to create a transaction, the system runs:
1. Role check: Does the role allow this action?
2. Privacy gate: Is the user in the right org boundary?
3. Combo exceptions: Is there an explicit allow or deny for this combination?
4. Scope match: Are all items in the user's CRUD scope? (AND logic)

### 11.3 Transaction Listing Flow
When populating a user's transaction list:
1. Branch scope filters out all transactions outside the user's branch visibility universe. Attribute boundaries then filter out transactions that do not belong to the user's assigned attributes.
2. Visibility is granted if: any dimension is in Read/CRUD scope, OR an explicit read exception exists, OR the transaction was shared.
3. Each transaction can optionally display its access status and reason.

**[ADDED]** 4. Filters adapt by context: Attribute filter for Central Onboarding; Branch + Attribute filters for Branch Specific company users; Attribute filter only for Branch Specific branch users.

---

## 12. Success Metrics

| Metric | Target | How We Measure |
|--------|--------|---------------|
| Data leakage across BU/branch boundaries | Zero incidents | Automated privacy test suite run weekly |
| UI-API enforcement parity | 100% | Both UI and API use the same resolver; test both paths in CI |
| Non-technical stakeholder comprehension | 80% can explain the model after a 10-min walkthrough | Usability test with ops managers and finance users |
| Custom permission code requests | 50% reduction vs. current baseline | Track engineering tickets tagged "custom-permissions" |
| Access-related support tickets | 40% reduction in 3 months post-launch | Track tickets tagged "access" or "permission" in helpdesk |

---

## 13. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Admin misconfiguration | Users get wrong access, data leaks possible | Admin preview/simulator before saving changes; clear inheritance markers in UI; audit log for all changes |
| Complexity creep | System becomes hard to understand and maintain | Keep gates + scope + exceptions minimal in v1; defer DSL engine to v2 |
| Performance at scale | Slow page loads and API responses for large enterprises | Cache per-user resolved policy context; batch evaluation for transaction listings; lazy load dropdowns |
| Adoption resistance | Users and admins don't trust or understand the system | Invest in explainability (tooltips, reason codes); run training with CS team before rollout |

---

## 14. Open Questions

| # | Question | Current Thinking | Owner |
|---|----------|-----------------|-------|
| 1 | For users mapped to multiple attributes, should visibility be union or intersection? | Default: union for visibility. CRUD still requires full AND match on items. | Product |
| 2 | Should item-level shares always bypass scope (currently: yes for read-only after privacy)? | Yes for read-only. Need to validate this is acceptable for all tenants. | Product + CS |
| 3 | How should manager roll-up work when managers need multiple cuts (e.g., BU + Region)? | Multiple privacy gates with AND logic, plus attribute roll-up. Needs validation with TML and Asian Paints. | Product + Eng |
| 4 | Should the admin simulator be part of v1 or v1.1? | Strongly recommended for v1 to reduce misconfiguration risk. Needs scoping. | Eng |
| 5 | Should archived master data be hidden or shown with a badge in dropdowns? | Hidden in creation, visible with [Archived] badge in existing transactions. | Design |
| **[ADDED]** 6 | Should transaction row visibility use AND logic (all linked items must have read access) or OR logic (any one item grants visibility)? | Prototype uses AND logic for stricter boundaries. PRD specifies OR for operational flexibility. Needs production decision. | Product + Eng |
| **[ADDED]** 7 | Should the default branch access fallback be time-limited or permanent until admin intervention? | Currently permanent until a branch admin creates attributes. Consider adding an expiry or notification. | Product |

---

## Appendix: Resolver Decision Flowchart

The following is a simplified textual representation of the resolver logic. Refer to Section 6 for full detail.

```
Request comes in →
1. Role allows action? → No → DENY (RBAC_DENY)
2. Privacy gates pass? → No → DENY (PRIVACY_ATTRIBUTE_DENY)
3. Transaction shared to user? → Yes → ALLOW READ ONLY (SHARE_ALLOW_READ)
4. Explicit deny exception? → Yes → DENY (EXCEPTION_DENY)
5. Explicit allow exception? → Yes → ALLOW per exception level (EXCEPTION_ALLOW_CRUD or EXCEPTION_ALLOW_READ)
6. All items in CRUD scope? → Yes → ALLOW CRUD (SCOPE_ALLOW_CRUD)
7. Any item in Read scope? → Yes → ALLOW READ ONLY (SCOPE_ALLOW_READ)
8. No match → DENY (SCOPE_DENY_NO_MATCH)
```

---

End of document.
