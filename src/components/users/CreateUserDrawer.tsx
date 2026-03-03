import { useState, useEffect, useMemo } from 'react';
import { Drawer, Button, Input, Select, Space, Form, Tag, message, Alert, Typography, Card, Checkbox } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useAppContext } from '../../context/AppContext';
import { BRANCHES } from '../../data/mockData';
import type { User, CrudPreset, CrudPermission, UserAttributeAssignment } from '../../types';

const PRESET_LABELS: Record<string, string> = {
  full_crud: 'Full CRUD',
  read_only: 'Read Only',
  create_read: 'Create + Read',
  custom: 'Custom',
};

const CRUD_OPTIONS: { value: CrudPermission; label: string }[] = [
  { value: 'create', label: 'Create' },
  { value: 'read', label: 'Read' },
  { value: 'update', label: 'Update' },
  { value: 'delete', label: 'Delete' },
];

const ROLES = ['Operations Manager', 'Branch Coordinator', 'Logistics Head', 'Regional Manager', 'Admin', 'Super Admin'];

interface Props {
  open: boolean;
  editingUser?: User | null;
  onClose: () => void;
}

export default function CreateUserDrawer({ open, editingUser, onClose }: Props) {
  const { addUser, updateUser, attributes, pocOnboardingScenario, currentUser } = useAppContext();
  const isEdit = !!editingUser;
  const isCentralScenario = pocOnboardingScenario === 'central_onboarding';
  const isBranchAdmin = !isCentralScenario && currentUser.legoActorType === 'branch_admin';

  const [form] = Form.useForm();
  const [userKind, setUserKind] = useState<'company_user' | 'branch_user'>('company_user');
  const [attributeAssignments, setAttributeAssignments] = useState<UserAttributeAssignment[]>([]);
  const [addAttributeId, setAddAttributeId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (editingUser) {
      const editingKind = editingUser.level === 'branch' ? 'branch_user' : 'company_user';
      form.setFieldsValue({
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role,
        branchId: editingUser.branchId,
        scopeBranches: [],
        userKind: isBranchAdmin ? 'branch_user' : editingKind,
      });
      setUserKind(isBranchAdmin ? 'branch_user' : editingKind);
      setAttributeAssignments(editingUser.attributeAssignments?.length ? [...editingUser.attributeAssignments] : []);
      setAddAttributeId(null);
      if (isBranchAdmin && currentUser.branchId) {
        form.setFieldValue('branchId', currentUser.branchId);
      }
    } else {
      form.resetFields();
      const defaultKind = isBranchAdmin ? 'branch_user' : 'company_user';
      setUserKind(defaultKind);
      setAttributeAssignments([]);
      setAddAttributeId(null);
      form.setFieldValue('userKind', defaultKind);
      if (isBranchAdmin && currentUser.branchId) {
        form.setFieldValue('branchId', currentUser.branchId);
      }
    }
  }, [open, editingUser, form, isCentralScenario, isBranchAdmin, currentUser.branchId]);

  const selectedBranchId = Form.useWatch('branchId', form);
  const selectedScopeBranches: string[] = Form.useWatch('scopeBranches', form) || [];

  const assignableAttributes = useMemo(() => {
    if (isCentralScenario) return attributes;

    if (userKind === 'company_user') {
      const companyAttrs = attributes.filter((a) => a.scope === 'company');
      if (selectedScopeBranches.length === 0) return [];
      return companyAttrs.filter((a) => {
        const ab = a.masterDataMapping.selectedBranches;
        if (ab === 'ALL') return true;
        return selectedScopeBranches.some((bid) => Array.isArray(ab) && ab.includes(bid));
      });
    }

    if (!selectedBranchId) return [];
    return attributes.filter((a) => {
      if (a.scope !== 'branch') return false;
      const ab = a.masterDataMapping.selectedBranches;
      return ab === 'ALL' || (Array.isArray(ab) && ab.includes(selectedBranchId));
    });
  }, [isCentralScenario, attributes, userKind, selectedBranchId, selectedScopeBranches]);

  const noAttrsForBranch =
    !isCentralScenario &&
    userKind === 'branch_user' &&
    !!selectedBranchId &&
    assignableAttributes.length === 0;

  const assignedIds = useMemo(() => new Set(attributeAssignments.map((a) => a.attributeId)), [attributeAssignments]);
  const addAttributeOptions = useMemo(
    () =>
      assignableAttributes
        .filter((a) => !assignedIds.has(a.id))
        .map((a) => ({ value: a.id, label: a.label })),
    [assignableAttributes, assignedIds]
  );

  const resetAttrs = () => setAttributeAssignments([]);

  const handleAddAttribute = (attributeId: string) => {
    setAttributeAssignments((prev) => [...prev, { attributeId }]);
    setAddAttributeId(null);
  };

  const handleRemoveAssignment = (attributeId: string) => {
    setAttributeAssignments((prev) => prev.filter((a) => a.attributeId !== attributeId));
  };

  const handleOverrideChange = (attributeId: string, crudOverride: CrudPreset | '' | undefined) => {
    const value = crudOverride === '' ? undefined : crudOverride;
    setAttributeAssignments((prev) =>
      prev.map((a) =>
        a.attributeId === attributeId
          ? {
              ...a,
              crudOverride: value,
              customOverridePermissions: value === 'custom' ? a.customOverridePermissions ?? [] : undefined,
            }
          : a
      )
    );
  };

  const handleCustomPermissionsChange = (attributeId: string, perms: CrudPermission[]) => {
    setAttributeAssignments((prev) =>
      prev.map((a) =>
        a.attributeId === attributeId ? { ...a, customOverridePermissions: perms } : a
      )
    );
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      const isCompanyUser = isCentralScenario || values.userKind === 'company_user';

      const user: User = {
        id: editingUser?.id || `usr-${Date.now()}`,
        name: values.name,
        email: values.email,
        role: values.role,
        legoActorType: isCentralScenario ? 'company_user' : values.userKind,
        level: isCompanyUser ? 'company' : 'branch',
        branchId: isCompanyUser ? undefined : values.branchId,
        attributeAssignments: noAttrsForBranch ? [] : attributeAssignments.map((a) => ({
          attributeId: a.attributeId,
          ...(a.crudOverride != null ? { crudOverride: a.crudOverride } : {}),
          ...(a.crudOverride === 'custom' && a.customOverridePermissions?.length
            ? { customOverridePermissions: a.customOverridePermissions }
            : {}),
        })),
        defaultBranchAccess: noAttrsForBranch || false,
      };

      if (isEdit) {
        updateUser(user);
        message.success('User updated');
      } else {
        addUser(user);
        message.success('User created');
      }
      onClose();
    });
  };

  return (
    <Drawer
      title={isEdit ? `Edit User: ${editingUser?.name}` : 'Create User'}
      open={open}
      onClose={onClose}
      width={560}
      footer={
        <Space style={{ float: 'right' }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" onClick={handleSave}>
            {isEdit ? 'Update User' : 'Save User'}
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical" initialValues={{ userKind: 'company_user', scopeBranches: [] }}>
        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
          <Input placeholder="e.g., Rajesh Nair" />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
          <Input placeholder="e.g., rajesh@company.com" />
        </Form.Item>
        <Form.Item name="role" label="Role" rules={[{ required: true }]}>
          <Select placeholder="Select role" options={ROLES.map((r) => ({ value: r, label: r }))} />
        </Form.Item>

        {!isCentralScenario && (
          <Form.Item name="userKind" label="User Type" rules={[{ required: true }]}>
            <Select
              disabled={isBranchAdmin}
              options={[
                { value: 'company_user', label: 'Company' },
                { value: 'branch_user', label: 'Branch' },
              ]}
              onChange={(val) => {
                setUserKind(val);
                form.setFieldValue('branchId', isBranchAdmin ? currentUser.branchId : undefined);
                form.setFieldValue('scopeBranches', []);
                resetAttrs();
              }}
            />
          </Form.Item>
        )}

        {!isCentralScenario && userKind === 'company_user' && (
          <Form.Item name="scopeBranches" label="Branches (scope filter)">
            <Select
              mode="multiple"
              placeholder="Select branches to filter attributes"
              options={BRANCHES.map((b) => ({ value: b.id, label: b.name }))}
              onChange={() => resetAttrs()}
            />
          </Form.Item>
        )}

        {!isCentralScenario && userKind === 'branch_user' && (
          <Form.Item name="branchId" label="Branch" rules={[{ required: true }]}>
            <Select
              disabled={isBranchAdmin}
              placeholder="Select branch"
              options={BRANCHES.map((b) => ({ value: b.id, label: b.name }))}
              onChange={() => resetAttrs()}
            />
          </Form.Item>
        )}

        {noAttrsForBranch && (
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
            message="No branch-specific attributes found for this branch. Default full CRUD branch access will be applied."
          />
        )}

        <div style={{ marginBottom: 16 }}>
          <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
            {isCentralScenario ? 'Attributes (defines user access scope)' : 'Assigned Attributes'}
          </Typography.Text>
          <Select
            showSearch
            placeholder={
              isCentralScenario
                ? 'Add attribute'
                : assignableAttributes.length === 0
                  ? userKind === 'company_user'
                    ? 'Select branches above to see matching attributes'
                    : 'Select a branch above first'
                  : addAttributeOptions.length === 0
                    ? 'All assignable attributes added'
                    : 'Add attribute'
            }
            optionFilterProp="label"
            options={addAttributeOptions}
            disabled={noAttrsForBranch || (!isCentralScenario && assignableAttributes.length === 0)}
            value={addAttributeId}
            onChange={(value) => {
              if (value) handleAddAttribute(value);
              else setAddAttributeId(null);
            }}
            style={{ width: '100%' }}
            allowClear
          />
        </div>

        {attributeAssignments.length > 0 && (
          <Space direction="vertical" style={{ width: '100%' }} size="small">
            {attributeAssignments.map((assignment) => {
              const attr = attributes.find((a) => a.id === assignment.attributeId);
              const defaultPreset = attr?.masterDataMapping?.crudPreset ?? 'full_crud';
              const overrideValue = assignment.crudOverride ?? '';
              const customPerms = assignment.crudOverride === 'custom' ? (assignment.customOverridePermissions ?? []) : [];

              return (
                <Card size="small" key={assignment.attributeId} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <Tag color="blue" style={{ marginRight: 8 }}>
                      {attr?.label ?? assignment.attributeId}
                    </Tag>
                    <Button
                      type="text"
                      size="small"
                      icon={<CloseOutlined />}
                      onClick={() => handleRemoveAssignment(assignment.attributeId)}
                      aria-label="Remove attribute"
                    />
                  </div>
                  <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
                    Default: {PRESET_LABELS[defaultPreset] ?? defaultPreset}
                  </Typography.Text>
                  <div style={{ marginBottom: 4 }}>
                    <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                      CRUD override
                    </Typography.Text>
                    <Select
                      value={overrideValue === '' ? '__default__' : overrideValue}
                      onChange={(val) => handleOverrideChange(assignment.attributeId, val === '__default__' ? '' : (val as CrudPreset))}
                      options={[
                        { value: '__default__', label: 'Use Default' },
                        ...Object.entries(PRESET_LABELS).map(([value, label]) => ({ value, label })),
                      ]}
                      style={{ width: '100%' }}
                    />
                  </div>
                  {assignment.crudOverride === 'custom' && (
                    <div style={{ marginTop: 8 }}>
                      {CRUD_OPTIONS.map(({ value, label: l }) => (
                        <Checkbox
                          key={value}
                          checked={customPerms.includes(value)}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...customPerms, value]
                              : customPerms.filter((p) => p !== value);
                            handleCustomPermissionsChange(assignment.attributeId, next);
                          }}
                          style={{ marginRight: 16 }}
                        >
                          {l}
                        </Checkbox>
                      ))}
                    </div>
                  )}
                  <Typography.Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 6 }}>
                    Override permissions for this user only
                  </Typography.Text>
                </Card>
              );
            })}
          </Space>
        )}

        {!isCentralScenario && (
          <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
            {userKind === 'company_user'
              ? 'Company users receive company-level attributes. Use the branch filter above to narrow down relevant attributes.'
              : 'Branch users receive branch-specific attributes scoped to their branch.'}
          </Typography.Text>
        )}
      </Form>
    </Drawer>
  );
}
