import { useState, useEffect, useMemo } from 'react';
import { Drawer, Button, Input, Tabs, Space, Typography, message, Alert, Radio, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import MasterDataTab from './MasterDataTab';
import FieldsTab from './FieldsTab';
import { useAppContext } from '../../context/AppContext';
import { BRANCHES } from '../../data/mockData';
import type { Attribute, MasterDataTypeRestriction } from '../../types';
import { MASTER_DATA_TYPE_KEYS } from '../../types';

function defaultTypeRestrictions(): Record<string, MasterDataTypeRestriction> {
  const defaults: Record<string, MasterDataTypeRestriction> = {};
  for (const type of MASTER_DATA_TYPE_KEYS) {
    defaults[type] = { mode: 'all', selectedItemIds: [] };
  }
  return defaults;
}

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
  const [typeRestrictions, setTypeRestrictions] = useState<Record<string, MasterDataTypeRestriction>>(
    defaultTypeRestrictions
  );
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  const [originalTypeRestrictions, setOriginalTypeRestrictions] = useState<
    Record<string, MasterDataTypeRestriction>
  >(defaultTypeRestrictions());
  const [originalFields, setOriginalFields] = useState<string[]>([]);

  const defaultOnboardingType: 'company' | 'branch' = isCentralScenario
    ? 'company'
    : isBranchAdminInBranchScenario
      ? 'branch'
      : 'company';

  const totalSelectedItems = useMemo(
    () =>
      Object.values(typeRestrictions).reduce(
        (sum, r) => (r.mode === 'specific' ? sum + r.selectedItemIds.length : sum),
        0
      ),
    [typeRestrictions]
  );

  const hasAnyMasterDataCoverage = useMemo(() => {
    for (const r of Object.values(typeRestrictions)) {
      if (r.mode === 'all') return true;
      if (r.mode === 'specific' && r.selectedItemIds.length > 0) return true;
    }
    return false;
  }, [typeRestrictions]);

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
      const tr = editingAttribute.masterDataMapping.typeRestrictions;
      const merged: Record<string, MasterDataTypeRestriction> = { ...defaultTypeRestrictions() };
      for (const key of MASTER_DATA_TYPE_KEYS) {
        if (tr[key]) merged[key] = { ...tr[key], selectedItemIds: [...(tr[key].selectedItemIds || [])] };
      }
      setTypeRestrictions(merged);
      setSelectedFields([...editingAttribute.fieldMapping.selectedFields]);
      setOriginalTypeRestrictions(JSON.parse(JSON.stringify(merged)));
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
      setTypeRestrictions(defaultTypeRestrictions());
      setSelectedFields([]);
      setOriginalTypeRestrictions(defaultTypeRestrictions());
      setOriginalFields([]);
    }
  }, [open, editingAttribute, defaultOnboardingType, isBranchAdminInBranchScenario, currentUser.branchId]);

  const handleOnboardingTypeChange = (type: 'company' | 'branch') => {
    if (type === onboardingType) return;
    setOnboardingType(type);
    setTypeRestrictions(defaultTypeRestrictions());
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
    let itemsChanged = 0;
    for (const key of MASTER_DATA_TYPE_KEYS) {
      const a = originalTypeRestrictions[key];
      const b = typeRestrictions[key];
      if (!a || !b) continue;
      if (a.mode !== b.mode) itemsChanged += 1;
      else if (a.mode === 'specific' && b.mode === 'specific') {
        const setA = new Set(a.selectedItemIds);
        const setB = new Set(b.selectedItemIds);
        if (setA.size !== setB.size || a.selectedItemIds.some((id) => !setB.has(id)))
          itemsChanged += 1;
      }
    }
    const addedFields = selectedFields.filter((id) => !originalFields.includes(id)).length;
    const removedFields = originalFields.filter((id) => !selectedFields.includes(id)).length;
    const total = itemsChanged + addedFields + removedFields;
    if (total === 0) return null;
    const parts: string[] = [];
    if (itemsChanged) parts.push('master data changed');
    if (addedFields) parts.push(`+${addedFields} fields`);
    if (removedFields) parts.push(`-${removedFields} fields`);
    return parts.join(', ');
  }, [isEdit, typeRestrictions, selectedFields, originalTypeRestrictions, originalFields]);

  const handleSave = () => {
    if (!label.trim()) {
      message.error('Attribute label is required');
      return;
    }
    if (!hasAnyMasterDataCoverage && selectedFields.length === 0) {
      message.error('Select at least one master data type (All/Specific) or field');
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
        typeRestrictions: { ...typeRestrictions },
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
      label: `Master Data (${totalSelectedItems})`,
      children: (
        <MasterDataTab
          onboardingType={onboardingType}
          selectedBranches={selectedBranches}
          typeRestrictions={typeRestrictions}
          onChangeBranches={setSelectedBranches}
          onChangeRestrictions={setTypeRestrictions}
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
                  <Tooltip
                    title={
                      isCentralScenario
                        ? 'One pool of master data at company level. Attributes are lenses/slices carved out of this single pool.'
                        : 'Maps master data across one or many branches. These attributes can only be assigned to company-level users.'
                    }
                  >
                    <InfoCircleOutlined style={{ color: '#1677ff', fontSize: 13 }} />
                  </Tooltip>
                </Space>
              </Radio>
              <Radio value="branch">
                <Space size={4}>
                  {isCentralScenario ? 'Branch Wise' : 'Branch Specific'}
                  <Tooltip
                    title={
                      isCentralScenario
                        ? 'Each branch owns its own data independently.'
                        : "Scoped to a single branch's data. These attributes can only be assigned to branch-level users of that branch."
                    }
                  >
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

        <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
          CRUD permissions are set when assigning this attribute to users, not on the attribute itself.
        </Typography.Text>

        {isEdit && changeSummary && (
          <Alert message={`Pending changes: ${changeSummary}`} type="info" showIcon />
        )}

        <Tabs items={tabItems} />
      </Space>
    </Drawer>
  );
}
