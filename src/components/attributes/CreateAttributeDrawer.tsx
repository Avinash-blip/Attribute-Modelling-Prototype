import { useState, useEffect, useMemo } from 'react';
import { Drawer, Button, Input, Tabs, Space, Typography, message, Alert, Radio, Tooltip, Select, Checkbox } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import MasterDataTab from './MasterDataTab';
import FieldsTab from './FieldsTab';
import { useAppContext } from '../../context/AppContext';
import { BRANCHES } from '../../data/mockData';
import type { Attribute, CrudPreset, CrudPermission } from '../../types';

const PRESET_OPTIONS: { value: CrudPreset; label: string }[] = [
  { value: 'full_crud', label: 'Full CRUD' },
  { value: 'read_only', label: 'Read Only' },
  { value: 'create_read', label: 'Create + Read' },
  { value: 'custom', label: 'Custom' },
];

const CRUD_OPTIONS: { value: CrudPermission; label: string }[] = [
  { value: 'create', label: 'Create' },
  { value: 'read', label: 'Read' },
  { value: 'update', label: 'Update' },
  { value: 'delete', label: 'Delete' },
];

interface Props {
  open: boolean;
  editingAttribute?: Attribute | null;
  onClose: () => void;
}

export default function CreateAttributeDrawer({ open, editingAttribute, onClose }: Props) {
  const { addAttribute, updateAttribute, pocOnboardingScenario, currentUser } = useAppContext();
  const isEdit = !!editingAttribute;
  const isCentralScenario = pocOnboardingScenario === 'central_onboarding';
  const isCompanyAdminInBranchScenario =
    !isCentralScenario && currentUser.legoActorType === 'company_admin';
  const isBranchAdminInBranchScenario =
    !isCentralScenario &&
    currentUser.legoActorType === 'branch_admin' &&
    !!currentUser.branchId;
  const lockedBranchName =
    isBranchAdminInBranchScenario
      ? BRANCHES.find((b) => b.id === currentUser.branchId)?.name
      : undefined;
  const radioDisabled = isCentralScenario || isBranchAdminInBranchScenario;

  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [onboardingType, setOnboardingType] = useState<'company' | 'branch'>('company');
  const [selectedBranches, setSelectedBranches] = useState<string[] | 'ALL'>('ALL');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [crudPreset, setCrudPreset] = useState<CrudPreset>('full_crud');
  const [customPermissions, setCustomPermissions] = useState<CrudPermission[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  const [originalItemIds, setOriginalItemIds] = useState<string[]>([]);
  const [originalPreset, setOriginalPreset] = useState<CrudPreset>('full_crud');
  const [originalCustomPermissions, setOriginalCustomPermissions] = useState<CrudPermission[]>([]);
  const [originalFields, setOriginalFields] = useState<string[]>([]);

  const defaultOnboardingType: 'company' | 'branch' = isCentralScenario
    ? 'company'
    : isBranchAdminInBranchScenario
      ? 'branch'
      : 'company';

  useEffect(() => {
    if (open && editingAttribute) {
      setLabel(editingAttribute.label);
      setDescription(editingAttribute.description || '');
      setOnboardingType(editingAttribute.masterDataMapping.onboardingType);
      if (isBranchAdminInBranchScenario && currentUser.branchId) {
        setSelectedBranches([currentUser.branchId]);
      } else {
        setSelectedBranches(editingAttribute.masterDataMapping.selectedBranches);
      }
      setSelectedItemIds([...editingAttribute.masterDataMapping.selectedItemIds]);
      setCrudPreset(editingAttribute.masterDataMapping.crudPreset);
      setCustomPermissions([...editingAttribute.masterDataMapping.customPermissions]);
      setSelectedFields([...editingAttribute.fieldMapping.selectedFields]);
      setOriginalItemIds([...editingAttribute.masterDataMapping.selectedItemIds]);
      setOriginalPreset(editingAttribute.masterDataMapping.crudPreset);
      setOriginalCustomPermissions([...editingAttribute.masterDataMapping.customPermissions]);
      setOriginalFields([...editingAttribute.fieldMapping.selectedFields]);
    } else if (open) {
      setLabel('');
      setDescription('');
      setOnboardingType(defaultOnboardingType);
      if (isBranchAdminInBranchScenario && currentUser.branchId) {
        setSelectedBranches([currentUser.branchId]);
      } else {
        setSelectedBranches('ALL');
      }
      setSelectedItemIds([]);
      setCrudPreset('full_crud');
      setCustomPermissions([]);
      setSelectedFields([]);
      setOriginalItemIds([]);
      setOriginalPreset('full_crud');
      setOriginalCustomPermissions([]);
      setOriginalFields([]);
    }
  }, [open, editingAttribute, defaultOnboardingType, isBranchAdminInBranchScenario, currentUser.branchId]);

  const handleOnboardingTypeChange = (type: 'company' | 'branch') => {
    if (type === onboardingType) return;
    setOnboardingType(type);
    setSelectedItemIds([]);
    if (isBranchAdminInBranchScenario && type === 'branch' && currentUser.branchId) {
      setSelectedBranches([currentUser.branchId]);
    } else if (type === 'company') {
      setSelectedBranches('ALL');
    } else {
      setSelectedBranches([]);
    }
  };

  const changeSummary = useMemo(() => {
    if (!isEdit) return null;
    const origIds = new Set(originalItemIds);
    const currIds = new Set(selectedItemIds);
    const addedItems = selectedItemIds.filter((id) => !origIds.has(id)).length;
    const removedItems = originalItemIds.filter((id) => !currIds.has(id)).length;
    const presetChanged = originalPreset !== crudPreset;
    const customChanged =
      crudPreset === 'custom' &&
      (originalCustomPermissions.length !== customPermissions.length ||
        customPermissions.some((p) => !originalCustomPermissions.includes(p)));
    const addedFields = selectedFields.filter((id) => !originalFields.includes(id)).length;
    const removedFields = originalFields.filter((id) => !selectedFields.includes(id)).length;
    const total = addedItems + removedItems + (presetChanged || customChanged ? 1 : 0) + addedFields + removedFields;
    if (total === 0) return null;
    const parts: string[] = [];
    if (addedItems) parts.push(`+${addedItems} items`);
    if (removedItems) parts.push(`-${removedItems} items`);
    if (presetChanged || customChanged) parts.push('permission preset changed');
    if (addedFields) parts.push(`+${addedFields} fields`);
    if (removedFields) parts.push(`-${removedFields} fields`);
    return parts.join(', ');
  }, [isEdit, selectedItemIds, selectedFields, originalItemIds, originalPreset, originalCustomPermissions, originalFields, crudPreset, customPermissions]);

  const handleSave = () => {
    if (!label.trim()) {
      message.error('Attribute label is required');
      return;
    }
    if (selectedItemIds.length === 0 && selectedFields.length === 0) {
      message.error('Select at least one master data item or field');
      return;
    }

    const attr: Attribute = {
      id: editingAttribute?.id || `attr-${Date.now()}`,
      label: label.trim(),
      description: description.trim() || undefined,
      scope: onboardingType === 'company' ? 'company' : 'branch',
      createdBy: editingAttribute?.createdBy || currentUser.name,
      createdByUserId: editingAttribute?.createdByUserId || currentUser.id,
      createdByActorType: editingAttribute?.createdByActorType || currentUser.legoActorType,
      createdAt: editingAttribute?.createdAt || new Date().toISOString(),
      masterDataMapping: {
        onboardingType,
        selectedBranches,
        selectedItemIds,
        crudPreset,
        customPermissions: crudPreset === 'custom' ? customPermissions : [],
      },
      fieldMapping: { selectedFields },
      assignedUsers: editingAttribute?.assignedUsers || [],
    };

    if (isEdit) {
      updateAttribute(attr);
      message.success('Attribute updated');
    } else {
      addAttribute(attr);
      message.success('Attribute created');
    }
    onClose();
  };

  const tabItems = [
    {
      key: 'master-data',
      label: `Master Data (${selectedItemIds.length})`,
      children: (
        <MasterDataTab
          onboardingType={onboardingType}
          selectedBranches={selectedBranches}
          selectedItemIds={selectedItemIds}
          onChangeBranches={setSelectedBranches}
          onChangeItems={setSelectedItemIds}
          branchSelectorDisabled={isBranchAdminInBranchScenario}
          lockedBranchName={lockedBranchName}
          branchSingleSelect={!isCentralScenario && onboardingType === 'branch' && !isBranchAdminInBranchScenario}
          forceBranchSelector={!isCentralScenario && onboardingType === 'company'}
        />
      ),
    },
    {
      key: 'fields',
      label: `Fields (${selectedFields.length})`,
      children: <FieldsTab selectedFields={selectedFields} onChange={setSelectedFields} />,
    },
  ];

  return (
    <Drawer
      title={isEdit ? `Edit Attribute: ${editingAttribute?.label}` : 'Create Attribute'}
      open={open}
      onClose={onClose}
      width={720}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {changeSummary && (
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                Changes: {changeSummary}
              </Typography.Text>
            )}
          </div>
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" onClick={handleSave}>
              {isEdit ? 'Update Attribute' : 'Save Attribute'}
            </Button>
          </Space>
        </div>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <Typography.Text strong style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>
            {isCentralScenario ? 'Onboarding Type' : 'Attribute Scope'}
          </Typography.Text>
          <Radio.Group
            value={onboardingType}
            onChange={(e) => handleOnboardingTypeChange(e.target.value)}
            disabled={radioDisabled}
          >
            <Space direction="vertical" size={8}>
              <Radio value="company">
                <Space size={4}>
                  {isCentralScenario ? 'Centrally Onboarded' : 'Company Level'}
                  <Tooltip title={isCentralScenario
                    ? 'One pool of master data at company level. Attributes are lenses/slices carved out of this single pool.'
                    : 'Maps master data across one or many branches. These attributes can only be assigned to company-level users.'
                  }>
                    <InfoCircleOutlined style={{ color: '#1677ff', fontSize: 13 }} />
                  </Tooltip>
                </Space>
              </Radio>
              <Radio value="branch">
                <Space size={4}>
                  {isCentralScenario ? 'Branch Wise' : 'Branch Specific'}
                  <Tooltip title={isCentralScenario
                    ? 'Each branch owns its own data independently.'
                    : 'Scoped to a single branch\'s data. These attributes can only be assigned to branch-level users of that branch.'
                  }>
                    <InfoCircleOutlined style={{ color: '#1677ff', fontSize: 13 }} />
                  </Tooltip>
                </Space>
              </Radio>
            </Space>
          </Radio.Group>
          {isCentralScenario && (
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Controlled by POC Scenario: Central Onboarding
            </Typography.Text>
          )}
          {isBranchAdminInBranchScenario && (
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Branch Admin — scope locked to Branch Specific
            </Typography.Text>
          )}
          {isCompanyAdminInBranchScenario && (
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {onboardingType === 'company'
                ? 'Company Level attributes can only be mapped to company users.'
                : 'Branch Specific attributes can only be mapped to branch users of the selected branch.'}
            </Typography.Text>
          )}
        </div>

        <div>
          <Typography.Text strong style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>
            Attribute Label
          </Typography.Text>
          <Input
            placeholder="e.g., SPD_N, SPD_S, FMCG Ops"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            size="large"
          />
        </div>

        <div>
          <Typography.Text strong style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>
            Description
          </Typography.Text>
          <Input.TextArea
            placeholder="e.g., SPD Business units segment covering north region"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            maxLength={200}
            showCount
          />
        </div>

        <div>
          <Typography.Text strong style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>
            Attribute Permissions
          </Typography.Text>
          <Select
            value={crudPreset}
            onChange={(val) => {
              setCrudPreset(val);
              if (val !== 'custom') setCustomPermissions([]);
            }}
            options={PRESET_OPTIONS}
            style={{ width: '100%', marginBottom: 8 }}
          />
          {crudPreset === 'custom' && (
            <div style={{ marginTop: 8 }}>
              {CRUD_OPTIONS.map(({ value, label: l }) => (
                <Checkbox
                  key={value}
                  checked={customPermissions.includes(value)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setCustomPermissions([...customPermissions, value]);
                    } else {
                      setCustomPermissions(customPermissions.filter((p) => p !== value));
                    }
                  }}
                  style={{ marginRight: 16 }}
                >
                  {l}
                </Checkbox>
              ))}
            </div>
          )}
          <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
            This permission applies to all master data items in this attribute. Individual users can override this during assignment.
          </Typography.Text>
        </div>

        {isEdit && changeSummary && (
          <Alert message={`Pending changes: ${changeSummary}`} type="info" showIcon />
        )}

        <Tabs items={tabItems} />
      </Space>
    </Drawer>
  );
}
