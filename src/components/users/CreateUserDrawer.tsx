import { useState, useEffect, useMemo } from 'react';
import { Drawer, Button, Input, Select, Space, Form, Tag, Tooltip, message, Alert, Typography } from 'antd';
import { useAppContext } from '../../context/AppContext';
import { BRANCHES } from '../../data/mockData';
import type { User } from '../../types';

interface Props {
  open: boolean;
  editingUser?: User | null;
  onClose: () => void;
}

const ROLES = ['Operations Manager', 'Branch Coordinator', 'Logistics Head', 'Regional Manager', 'Admin', 'Super Admin'];

export default function CreateUserDrawer({ open, editingUser, onClose }: Props) {
  const { addUser, updateUser, attributes, pocOnboardingScenario, currentUser } = useAppContext();
  const isEdit = !!editingUser;
  const isCentralScenario = pocOnboardingScenario === 'central_onboarding';
  const isBranchAdmin = !isCentralScenario && currentUser.legoActorType === 'branch_admin';

  const [form] = Form.useForm();
  const [userKind, setUserKind] = useState<'company_user' | 'branch_user'>('company_user');

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
        assignedAttributes: editingUser.assignedAttributes,
        userKind: isBranchAdmin ? 'branch_user' : editingKind,
      });
      setUserKind(isBranchAdmin ? 'branch_user' : editingKind);
      if (isBranchAdmin && currentUser.branchId) {
        form.setFieldValue('branchId', currentUser.branchId);
      }
    } else {
      form.resetFields();
      const defaultKind = isBranchAdmin ? 'branch_user' : 'company_user';
      setUserKind(defaultKind);
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
        return selectedScopeBranches.some((bid) => ab.includes(bid));
      });
    }

    if (!selectedBranchId) return [];
    return attributes.filter((a) => {
      if (a.scope !== 'branch') return false;
      const ab = a.masterDataMapping.selectedBranches;
      return ab === 'ALL' || ab.includes(selectedBranchId);
    });
  }, [isCentralScenario, attributes, userKind, selectedBranchId, selectedScopeBranches]);

  const noAttrsForBranch =
    !isCentralScenario &&
    userKind === 'branch_user' &&
    !!selectedBranchId &&
    assignableAttributes.length === 0;

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
        assignedAttributes: noAttrsForBranch ? [] : values.assignedAttributes || [],
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

  const resetAttrs = () => form.setFieldValue('assignedAttributes', []);

  return (
    <Drawer
      title={isEdit ? `Edit User: ${editingUser?.name}` : 'Create User'}
      open={open}
      onClose={onClose}
      width={520}
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

        <Form.Item
          name="assignedAttributes"
          label={isCentralScenario ? 'Attributes (defines user access scope)' : 'Assigned Attributes'}
        >
          <Select
            mode="multiple"
            placeholder={
              isCentralScenario
                ? 'Select attributes to define access scope'
                : assignableAttributes.length === 0
                  ? userKind === 'company_user'
                    ? 'Select branches above to see matching attributes'
                    : 'Select a branch above first'
                  : 'Select attributes to assign'
            }
            options={assignableAttributes.map((a) => ({ value: a.id, label: a.label }))}
            disabled={noAttrsForBranch || (!isCentralScenario && assignableAttributes.length === 0)}
            tagRender={({ label, closable, onClose }) => (
              <Tag closable={closable} onClose={onClose} style={{ marginRight: 4 }}>
                <Tooltip title={`Attribute: ${label}`}>{label}</Tooltip>
              </Tag>
            )}
          />
        </Form.Item>

        {!isCentralScenario && (
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {userKind === 'company_user'
              ? 'Company users receive company-level attributes. Use the branch filter above to narrow down relevant attributes.'
              : 'Branch users receive branch-specific attributes scoped to their branch.'}
          </Typography.Text>
        )}
      </Form>
    </Drawer>
  );
}
