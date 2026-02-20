import type { Branch, MasterDataItem, FieldItem, Attribute, User, ItemPermission } from '../types';
import { ALL_CRUD } from '../types';

const withFullCrud = (ids: string[]): ItemPermission[] =>
  ids.map((id) => ({ itemId: id, permissions: [...ALL_CRUD] }));

export const BRANCHES: Branch[] = [
  { id: 'br-1', name: 'Mumbai HQ', code: 'MUM' },
  { id: 'br-2', name: 'Delhi NCR', code: 'DEL' },
  { id: 'br-3', name: 'Chennai', code: 'CHE' },
  { id: 'br-4', name: 'Bengaluru', code: 'BLR' },
  { id: 'br-5', name: 'Kolkata', code: 'KOL' },
  { id: 'br-6', name: 'Ahmedabad', code: 'AHM' },
  { id: 'br-7', name: 'Pune', code: 'PUN' },
  { id: 'br-8', name: 'Hyderabad', code: 'HYD' },
];

export const MASTER_DATA_TYPES = [
  'routes',
  'route_master',
  'location_master',
  'material_master',
  'vehicle_type_master',
  'driver_master',
  'transporter_master',
] as const;

export const MASTER_DATA_TYPE_LABELS: Record<string, string> = {
  routes: 'Routes',
  route_master: 'Route Master',
  location_master: 'Location Master',
  material_master: 'Material Master',
  vehicle_type_master: 'Vehicle Type Master',
  driver_master: 'Driver Master',
  transporter_master: 'Transporter Master',
};

export const MASTER_DATA_ITEMS: MasterDataItem[] = [
  // Routes
  { id: 'md-1', name: 'Mumbai → Delhi (NH48)', type: 'routes', onboardedAt: 'company' },
  { id: 'md-2', name: 'Delhi → Kolkata (NH19)', type: 'routes', onboardedAt: 'company' },
  { id: 'md-3', name: 'Chennai → Bengaluru (NH48)', type: 'routes', onboardedAt: 'company' },
  { id: 'md-4', name: 'Mumbai → Pune (Expressway)', type: 'routes', branch: 'br-1', onboardedAt: 'branch' },
  { id: 'md-5', name: 'Delhi → Jaipur (NH48)', type: 'routes', branch: 'br-2', onboardedAt: 'branch' },
  { id: 'md-6', name: 'Ahmedabad → Mumbai (NH48)', type: 'routes', branch: 'br-6', onboardedAt: 'branch' },

  // Route Master
  { id: 'md-10', name: 'NH48 Corridor - Pan India', type: 'route_master', onboardedAt: 'company' },
  { id: 'md-11', name: 'NH19 Delhi-Kolkata', type: 'route_master', onboardedAt: 'company' },
  { id: 'md-12', name: 'Western Expressway', type: 'route_master', branch: 'br-1', onboardedAt: 'branch' },
  { id: 'md-13', name: 'Golden Quadrilateral East', type: 'route_master', branch: 'br-5', onboardedAt: 'branch' },
  { id: 'md-14', name: 'South Corridor', type: 'route_master', branch: 'br-4', onboardedAt: 'branch' },

  // Location Master
  { id: 'md-20', name: 'Bhiwandi Warehouse', type: 'location_master', branch: 'br-1', onboardedAt: 'branch' },
  { id: 'md-21', name: 'Manesar Industrial Area', type: 'location_master', branch: 'br-2', onboardedAt: 'branch' },
  { id: 'md-22', name: 'Sriperumbudur Hub', type: 'location_master', branch: 'br-3', onboardedAt: 'branch' },
  { id: 'md-23', name: 'Peenya Industrial Estate', type: 'location_master', branch: 'br-4', onboardedAt: 'branch' },
  { id: 'md-24', name: 'Dankuni Logistics Park', type: 'location_master', branch: 'br-5', onboardedAt: 'branch' },
  { id: 'md-25', name: 'Sanand GIDC', type: 'location_master', branch: 'br-6', onboardedAt: 'branch' },
  { id: 'md-26', name: 'Chakan Industrial Area', type: 'location_master', branch: 'br-7', onboardedAt: 'branch' },
  { id: 'md-27', name: 'Shamshabad Logistics Hub', type: 'location_master', branch: 'br-8', onboardedAt: 'branch' },
  { id: 'md-28', name: 'Jawaharlal Nehru Port', type: 'location_master', onboardedAt: 'company' },

  // Material Master
  { id: 'md-30', name: 'Cement OPC 53 Grade', type: 'material_master', onboardedAt: 'company' },
  { id: 'md-31', name: 'Steel Rebar TMT', type: 'material_master', onboardedAt: 'company' },
  { id: 'md-32', name: 'FMCG - Packaged Food', type: 'material_master', onboardedAt: 'company' },
  { id: 'md-33', name: 'Pharma - Cold Chain', type: 'material_master', branch: 'br-1', onboardedAt: 'branch' },
  { id: 'md-34', name: 'Auto Parts - Engine', type: 'material_master', branch: 'br-3', onboardedAt: 'branch' },
  { id: 'md-35', name: 'Aggregates - Stone', type: 'material_master', branch: 'br-6', onboardedAt: 'branch' },
  { id: 'md-36', name: 'Paints & Coatings', type: 'material_master', branch: 'br-7', onboardedAt: 'branch' },

  // Vehicle Type Master
  { id: 'md-40', name: 'Flatbed (Open)', type: 'vehicle_type_master', onboardedAt: 'company' },
  { id: 'md-41', name: 'Container (20/40 ft)', type: 'vehicle_type_master', onboardedAt: 'company' },
  { id: 'md-42', name: 'Tanker', type: 'vehicle_type_master', onboardedAt: 'company' },
  { id: 'md-43', name: 'Reefer', type: 'vehicle_type_master', branch: 'br-1', onboardedAt: 'branch' },
  { id: 'md-44', name: 'Trailer - Multi-Axle', type: 'vehicle_type_master', branch: 'br-2', onboardedAt: 'branch' },
  { id: 'md-45', name: 'Tipper', type: 'vehicle_type_master', branch: 'br-6', onboardedAt: 'branch' },

  // Driver Master
  { id: 'md-50', name: 'Ramesh Kumar', type: 'driver_master', branch: 'br-1', onboardedAt: 'branch' },
  { id: 'md-51', name: 'Suresh Singh', type: 'driver_master', branch: 'br-2', onboardedAt: 'branch' },
  { id: 'md-52', name: 'Venkatesh R', type: 'driver_master', branch: 'br-3', onboardedAt: 'branch' },
  { id: 'md-53', name: 'Prakash Gowda', type: 'driver_master', branch: 'br-4', onboardedAt: 'branch' },
  { id: 'md-54', name: 'Amit Sharma', type: 'driver_master', branch: 'br-2', onboardedAt: 'branch' },
  { id: 'md-55', name: 'Ravi Patil', type: 'driver_master', branch: 'br-7', onboardedAt: 'branch' },
  { id: 'md-56', name: 'Sandeep Yadav', type: 'driver_master', branch: 'br-5', onboardedAt: 'branch' },
  { id: 'md-57', name: 'Naveen Reddy', type: 'driver_master', branch: 'br-8', onboardedAt: 'branch' },

  // Transporter Master
  { id: 'md-60', name: 'Vinsum Axpress India Pvt Ltd', type: 'transporter_master', onboardedAt: 'company' },
  { id: 'md-61', name: 'TCI Express', type: 'transporter_master', onboardedAt: 'company' },
  { id: 'md-62', name: 'Rivigo Services', type: 'transporter_master', onboardedAt: 'company' },
  { id: 'md-63', name: 'Delhivery Ltd', type: 'transporter_master', branch: 'br-2', onboardedAt: 'branch' },
  { id: 'md-64', name: 'VRL Logistics', type: 'transporter_master', branch: 'br-4', onboardedAt: 'branch' },
  { id: 'md-65', name: 'Gati KWE', type: 'transporter_master', branch: 'br-1', onboardedAt: 'branch' },
];

export const FIELD_ITEMS: FieldItem[] = [
  // Indent
  { id: 'f-1', name: 'Indent Number', module: 'Indent', type: 'primary' },
  { id: 'f-2', name: 'Indent Date', module: 'Indent', type: 'primary' },
  { id: 'f-3', name: 'Consignor', module: 'Indent', type: 'primary' },
  { id: 'f-4', name: 'Consignee', module: 'Indent', type: 'primary' },
  { id: 'f-5', name: 'Material Type', module: 'Indent', type: 'primary' },
  { id: 'f-6', name: 'Weight (MT)', module: 'Indent', type: 'primary' },
  { id: 'f-7', name: 'Custom Field - PO Number', module: 'Indent', type: 'custom' },
  { id: 'f-8', name: 'Custom Field - Priority', module: 'Indent', type: 'custom' },
  { id: 'f-9', name: 'Custom Field - Delivery SLA', module: 'Indent', type: 'custom' },

  // Trip
  { id: 'f-10', name: 'Trip Number', module: 'Trip', type: 'primary' },
  { id: 'f-11', name: 'Vehicle Number', module: 'Trip', type: 'primary' },
  { id: 'f-12', name: 'Driver Name', module: 'Trip', type: 'primary' },
  { id: 'f-13', name: 'Transporter', module: 'Trip', type: 'primary' },
  { id: 'f-14', name: 'Trip Status', module: 'Trip', type: 'primary' },
  { id: 'f-15', name: 'ETA', module: 'Trip', type: 'primary' },
  { id: 'f-16', name: 'Custom Field - Seal Number', module: 'Trip', type: 'custom' },
  { id: 'f-17', name: 'Custom Field - GPS Provider', module: 'Trip', type: 'custom' },

  // ePOD
  { id: 'f-20', name: 'POD Number', module: 'ePOD', type: 'primary' },
  { id: 'f-21', name: 'Delivery Date', module: 'ePOD', type: 'primary' },
  { id: 'f-22', name: 'Receiver Name', module: 'ePOD', type: 'primary' },
  { id: 'f-23', name: 'Delivery Status', module: 'ePOD', type: 'primary' },
  { id: 'f-24', name: 'Custom Field - Damage Report', module: 'ePOD', type: 'custom' },
  { id: 'f-25', name: 'Custom Field - Unloading Time', module: 'ePOD', type: 'custom' },

  // Invoice
  { id: 'f-30', name: 'Invoice Number', module: 'Invoice', type: 'primary' },
  { id: 'f-31', name: 'Invoice Date', module: 'Invoice', type: 'primary' },
  { id: 'f-32', name: 'Amount', module: 'Invoice', type: 'primary' },
  { id: 'f-33', name: 'GST Number', module: 'Invoice', type: 'primary' },
  { id: 'f-34', name: 'Payment Status', module: 'Invoice', type: 'primary' },
  { id: 'f-35', name: 'Custom Field - Cost Center', module: 'Invoice', type: 'custom' },

  // Tracking
  { id: 'f-40', name: 'Current Location', module: 'Tracking', type: 'primary' },
  { id: 'f-41', name: 'Last Updated', module: 'Tracking', type: 'primary' },
  { id: 'f-42', name: 'Speed (km/h)', module: 'Tracking', type: 'primary' },
  { id: 'f-43', name: 'Distance Covered', module: 'Tracking', type: 'primary' },
  { id: 'f-44', name: 'Custom Field - Geofence Alert', module: 'Tracking', type: 'custom' },
];

export const MODULES = [...new Set(FIELD_ITEMS.map((f) => f.module))];

export const DEFAULT_ATTRIBUTES: Attribute[] = [
  {
    id: 'attr-1',
    label: 'FMCG Ops',
    description: 'Fast-moving consumer goods operations across Mumbai, Delhi and Pune corridors',
    scope: 'branch',
    createdBy: 'Anita Desai',
    createdByUserId: 'usr-1',
    createdByActorType: 'branch_admin',
    createdAt: '2025-12-10T10:30:00Z',
    masterDataMapping: {
      onboardingType: 'branch',
      selectedBranches: ['br-1', 'br-2', 'br-7'],
      selectedItems: [
        ...withFullCrud(['md-1', 'md-4', 'md-10', 'md-12', 'md-20', 'md-21', 'md-26', 'md-28', 'md-32', 'md-33', 'md-40', 'md-50', 'md-51', 'md-60', 'md-65']),
        { itemId: 'md-5', permissions: ['read'] },
        { itemId: 'md-36', permissions: ['read'] },
        { itemId: 'md-43', permissions: ['read'] },
        { itemId: 'md-55', permissions: ['read', 'update'] },
        { itemId: 'md-61', permissions: ['read'] },
      ],
    },
    fieldMapping: { selectedFields: ['f-1', 'f-2', 'f-3', 'f-4', 'f-5', 'f-6', 'f-7', 'f-10', 'f-11', 'f-12', 'f-13', 'f-14', 'f-20', 'f-21', 'f-22', 'f-30', 'f-31', 'f-32'] },
    assignedUsers: ['usr-1', 'usr-2'],
  },
  {
    id: 'attr-2',
    label: 'Cement North',
    description: 'Cement division — northern region covering Delhi NCR and Kolkata branches',
    scope: 'branch',
    createdBy: 'Vikram Mehta',
    createdByUserId: 'usr-7',
    createdByActorType: 'company_admin',
    createdAt: '2025-12-15T14:00:00Z',
    masterDataMapping: {
      onboardingType: 'branch',
      selectedBranches: ['br-2', 'br-5'],
      selectedItems: withFullCrud(['md-2', 'md-5', 'md-11', 'md-13', 'md-21', 'md-24', 'md-30', 'md-31', 'md-40', 'md-41', 'md-44', 'md-51', 'md-54', 'md-56', 'md-61', 'md-63']),
    },
    fieldMapping: { selectedFields: ['f-1', 'f-2', 'f-3', 'f-4', 'f-10', 'f-11', 'f-12', 'f-14', 'f-40', 'f-41', 'f-42'] },
    assignedUsers: ['usr-3'],
  },
  {
    id: 'attr-3',
    label: 'Auto Parts - South',
    description: 'Automotive parts logistics for Chennai and Bengaluru branches',
    scope: 'branch',
    createdBy: 'Anita Desai',
    createdByUserId: 'usr-4',
    createdByActorType: 'branch_admin',
    createdAt: '2026-01-05T09:00:00Z',
    masterDataMapping: {
      onboardingType: 'branch',
      selectedBranches: ['br-3', 'br-4'],
      selectedItems: withFullCrud(['md-3', 'md-14', 'md-22', 'md-23', 'md-34', 'md-40', 'md-41', 'md-52', 'md-53', 'md-62']),
    },
    fieldMapping: { selectedFields: ['f-1', 'f-2', 'f-3', 'f-4', 'f-5', 'f-10', 'f-11', 'f-12', 'f-13', 'f-14', 'f-15', 'f-16', 'f-40', 'f-41', 'f-42', 'f-43'] },
    assignedUsers: ['usr-4', 'usr-5'],
  },
  {
    id: 'attr-4',
    label: 'Pan India Admin',
    description: 'Full company-level master data access across all branches',
    scope: 'company',
    createdBy: 'Vikram Mehta',
    createdByUserId: 'usr-7',
    createdByActorType: 'company_admin',
    createdAt: '2026-01-10T11:00:00Z',
    masterDataMapping: {
      onboardingType: 'company',
      selectedBranches: 'ALL',
      selectedItems: withFullCrud(MASTER_DATA_ITEMS.filter((i) => i.onboardedAt === 'company').map((i) => i.id)),
    },
    fieldMapping: { selectedFields: FIELD_ITEMS.map((f) => f.id) },
    assignedUsers: ['usr-6'],
  },
];

export const DEFAULT_USERS: User[] = [
  { id: 'usr-1', name: 'Rajesh Nair', email: 'rajesh.nair@company.com', role: 'Branch Admin', legoActorType: 'branch_admin', level: 'branch', branchId: 'br-1', assignedAttributes: ['attr-1'] },
  { id: 'usr-2', name: 'Priya Sharma', email: 'priya.sharma@company.com', role: 'Branch User', legoActorType: 'branch_user', level: 'branch', branchId: 'br-2', assignedAttributes: ['attr-1'] },
  { id: 'usr-3', name: 'Deepak Gupta', email: 'deepak.gupta@company.com', role: 'Company User', legoActorType: 'company_user', level: 'company', assignedAttributes: ['attr-2'] },
  { id: 'usr-4', name: 'Kavitha Rajan', email: 'kavitha.rajan@company.com', role: 'Branch Admin', legoActorType: 'branch_admin', level: 'branch', branchId: 'br-3', assignedAttributes: ['attr-3'] },
  { id: 'usr-5', name: 'Sunil Reddy', email: 'sunil.reddy@company.com', role: 'Branch User', legoActorType: 'branch_user', level: 'branch', branchId: 'br-4', assignedAttributes: ['attr-3'] },
  { id: 'usr-6', name: 'Anita Desai', email: 'anita.desai@company.com', role: 'Company Admin', legoActorType: 'company_admin', level: 'company', assignedAttributes: ['attr-4'] },
  { id: 'usr-7', name: 'Vikram Mehta', email: 'vikram.mehta@company.com', role: 'Company Admin', legoActorType: 'company_admin', level: 'company', assignedAttributes: [] },
];

export const MOCK_DASHBOARD_DATA = {
  totalIndents: 1245,
  activeTrips: 328,
  delivered: 892,
  indentRows: [
    { id: 'IND-2026-001', origin: 'Bhiwandi Warehouse', destination: 'Chakan Industrial Area', route: 'Mumbai → Pune (Expressway)', material: 'FMCG - Packaged Food', status: 'In Transit', date: '2026-02-18', attribute: 'attr-1' },
    { id: 'IND-2026-002', origin: 'Manesar Industrial Area', destination: 'Bhiwandi Warehouse', route: 'Delhi → Jaipur (NH48)', material: 'Cement OPC 53 Grade', status: 'Delivered', date: '2026-02-17', attribute: 'attr-1' },
    { id: 'IND-2026-003', origin: 'Dankuni Logistics Park', destination: 'Chakan Industrial Area', route: 'Delhi → Kolkata (NH19)', material: 'Steel Rebar TMT', status: 'Pending', date: '2026-02-19', attribute: 'attr-2' },
    { id: 'IND-2026-004', origin: 'Peenya Industrial Estate', destination: 'Sriperumbudur Hub', route: 'Chennai → Bengaluru (NH48)', material: 'Auto Parts - Engine', status: 'In Transit', date: '2026-02-18', attribute: 'attr-3' },
    { id: 'IND-2026-005', origin: 'Sanand GIDC', destination: 'Bhiwandi Warehouse', route: 'Ahmedabad → Mumbai (NH48)', material: 'Aggregates - Stone', status: 'Delivered', date: '2026-02-16', attribute: 'attr-4' },
    { id: 'IND-2026-006', origin: 'Jawaharlal Nehru Port', destination: 'Manesar Industrial Area', route: 'Mumbai → Delhi (NH48)', material: 'Paints & Coatings', status: 'In Transit', date: '2026-02-19', attribute: 'attr-4' },
    { id: 'IND-2026-007', origin: 'Bhiwandi Warehouse', destination: 'Shamshabad Logistics Hub', route: 'Mumbai → Delhi (NH48)', material: 'Pharma - Cold Chain', status: 'Pending', date: '2026-02-19', attribute: 'attr-1' },
    { id: 'IND-2026-008', origin: 'Manesar Industrial Area', destination: 'Dankuni Logistics Park', route: 'Delhi → Kolkata (NH19)', material: 'Cement OPC 53 Grade', status: 'Delivered', date: '2026-02-15', attribute: 'attr-2' },
  ],
};

export interface MockJourney {
  id: string;
  branchId: string;
  from: string;
  to: string;
  routeItemId: string;
  vehicleNumber: string;
  vehicleType: string;
  vehicleTypeItemId: string;
  materialItemId: string;
  transporterItemId: string;
  sim: boolean;
  gps: boolean;
  phone: string;
  slaStatus: 'On Time' | 'Delayed' | 'At Risk';
  eta: string;
  alert: string | null;
  alertTime: string | null;
  attribute: string;
}

export const MOCK_JOURNEYS: MockJourney[] = [
  { id: 'JRN-e1a603e4', branchId: 'br-1', from: 'TATA MOTORS LIMITED – SPD, Plot No 317', to: 'TATA MOTORS LIMITED – SPD, Pune', routeItemId: 'md-1', vehicleNumber: 'CG04NM8299', vehicleType: 'Flatbed (Open)', vehicleTypeItemId: 'md-40', materialItemId: 'md-32', transporterItemId: 'md-60', sim: true, gps: false, phone: '9982437105', slaStatus: 'On Time', eta: '06:02 pm, 21 Feb', alert: 'Long Stoppage', alertTime: '30 min ago', attribute: 'attr-1' },
  { id: 'JRN-b7f24a01', branchId: 'br-1', from: 'Bhiwandi Warehouse, Mumbai', to: 'Chakan Industrial Area, Pune', routeItemId: 'md-4', vehicleNumber: 'MH04AB1234', vehicleType: 'Reefer', vehicleTypeItemId: 'md-43', materialItemId: 'md-33', transporterItemId: 'md-65', sim: true, gps: true, phone: '9876543210', slaStatus: 'On Time', eta: '11:30 am, 20 Feb', alert: null, alertTime: null, attribute: 'attr-1' },
  { id: 'JRN-c3d90f82', branchId: 'br-2', from: 'Manesar Industrial Area, Delhi NCR', to: 'Dankuni Logistics Park, Kolkata', routeItemId: 'md-2', vehicleNumber: 'DL01CX5678', vehicleType: 'Trailer - Multi-Axle', vehicleTypeItemId: 'md-44', materialItemId: 'md-31', transporterItemId: 'md-63', sim: false, gps: true, phone: '9123456789', slaStatus: 'Delayed', eta: '03:45 pm, 22 Feb', alert: 'Route Deviation', alertTime: '1 hr ago', attribute: 'attr-2' },
  { id: 'JRN-a8e51d93', branchId: 'br-4', from: 'Peenya Industrial Estate, Bengaluru', to: 'Sriperumbudur Hub, Chennai', routeItemId: 'md-3', vehicleNumber: 'KA01MN9012', vehicleType: 'Container (20/40 ft)', vehicleTypeItemId: 'md-41', materialItemId: 'md-34', transporterItemId: 'md-62', sim: true, gps: true, phone: '9988776655', slaStatus: 'On Time', eta: '09:00 am, 20 Feb', alert: null, alertTime: null, attribute: 'attr-3' },
  { id: 'JRN-d4f67b04', branchId: 'br-6', from: 'Sanand GIDC, Ahmedabad', to: 'Bhiwandi Warehouse, Mumbai', routeItemId: 'md-2', vehicleNumber: 'GJ01PQ3456', vehicleType: 'Tanker', vehicleTypeItemId: 'md-42', materialItemId: 'md-30', transporterItemId: 'md-60', sim: true, gps: false, phone: '9871234560', slaStatus: 'At Risk', eta: '05:00 pm, 20 Feb', alert: 'Excessive Halt', alertTime: '15 min ago', attribute: 'attr-4' },
  { id: 'JRN-f2a8c615', branchId: 'br-1', from: 'Jawaharlal Nehru Port, Mumbai', to: 'Manesar Industrial Area, Delhi NCR', routeItemId: 'md-1', vehicleNumber: 'MH01RS7890', vehicleType: 'Container (20/40 ft)', vehicleTypeItemId: 'md-41', materialItemId: 'md-32', transporterItemId: 'md-62', sim: true, gps: true, phone: '9009876543', slaStatus: 'On Time', eta: '08:30 pm, 21 Feb', alert: null, alertTime: null, attribute: 'attr-4' },
  { id: 'JRN-e5b91a26', branchId: 'br-8', from: 'Bhiwandi Warehouse, Mumbai', to: 'Shamshabad Logistics Hub, Hyderabad', routeItemId: 'md-1', vehicleNumber: 'MH04TU2345', vehicleType: 'Reefer', vehicleTypeItemId: 'md-43', materialItemId: 'md-33', transporterItemId: 'md-61', sim: true, gps: true, phone: '9345678901', slaStatus: 'On Time', eta: '04:15 am, 22 Feb', alert: null, alertTime: null, attribute: 'attr-1' },
  { id: 'JRN-g7c03b37', branchId: 'br-5', from: 'Dankuni Logistics Park, Kolkata', to: 'Manesar Industrial Area, Delhi NCR', routeItemId: 'md-2', vehicleNumber: 'WB01VW6789', vehicleType: 'Trailer - Multi-Axle', vehicleTypeItemId: 'md-44', materialItemId: 'md-30', transporterItemId: 'md-61', sim: false, gps: true, phone: '9567890123', slaStatus: 'Delayed', eta: '10:00 am, 23 Feb', alert: 'SIM Unreachable', alertTime: '2 hr ago', attribute: 'attr-2' },
];
