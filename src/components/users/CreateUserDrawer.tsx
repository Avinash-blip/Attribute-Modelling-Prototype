import { useState, useEffect, useMemo } from 'react';
import { Drawer, Button, Input, Select, Space, Form, Tag, message, Alert, Typography, Card } from 'antd';
import { PlusOutlined, CloseOutlined } from '@ant-design/icons';
import { useAppContext } from '../../context/AppContext';
import { BRANCHES } from '../../data/mockData';
import type { User, Desk } from '../../types';
import { PREDEFINED_ROLES, getRolePermissions } from '../../types';

interface Props {
  open: boolean;
  editingUser?: User | null;
  onClose: () => void;
}

const emptyDesk = (): Desk => ({
  id: `desk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  name: '',
  roleId: '',
  attributeIds: [],
});

export default function CreateUserDrawer({ open, editingUser, onClose }: Props) {
  const { addUser, updateUser, attributes, pocOnboardingScenario, currentUser } = useAppContext();
  const isEdit = !!editingUser;
  const isCentralScenario = pocOnboardingScenario === 'central_onboarding';
  const isBranchAdmin = !isCentralScenario && currentUser.legoActorType === 'branch_admin';

  const [form] = Form.useForm();
  const [userKind, setUserKind] = useState<'company_user' | 'branch_user'>('company_user');
  const [desks, setDesks] = useState<Desk[]>([emptyDesk()]);
  const [defaultDeskId, setDefaultDeskId] = useState('');

  useEffect(() => {
    if (!open) return;
    if (editingUser) {
      const editingKind = editingUser.level === 'branch' ? 'branch_user' : 'company_user';
      form.setFieldsValue({
        name: editingUser.name,
        email: editingUser.email,
        branchId: editingUser.branchId,
        scopeBranches: [],
        userKind: isBranchAdmin ? 'branch_user' : editingKind,
      });
      setUserKind(isBranchAdmin ? 'branch_user' : editingKind);
      const existingDesks = editingUser.desks.length > 0 ? editingUser.desks.map((d) => ({ ...d })) : [emptyDesk()];
      setDesks(existingDesks);
      setDefaultDeskId(editingUser.activeDeskId || existingDesks[0].id);
      if (isBranchAdmin && currentUser.branchId) {
        form.setFieldValue('branchId', currentUser.branchId);
      }
    } else {
      form.resetFields();
      const defaultKind = isBranchAdmin ? 'branch_user' : 'company_user';
      setUserKind(defaultKind);
      const d = emptyDesk();
      setDesks([d]);
      setDefaultDeskId(d.id);
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

  const addDesk = () => {
    const d = emptyDesk();
    setDesks((prev) => [...prev, d]);
    if (desks.length === 0) setDefaultDeskId(d.id);
  };

  const removeDesk = (index: number) => {
    setDesks((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (prev[index].id === defaultDeskId && next.length > 0) {
        setDefaultDeskId(next[0].id);
      }
      return next;
    });
  };

  const updateDesk = (index: number, field: keyof Desk, value: unknown) => {
    setDesks((prev) => prev.map((d, i) => (i === index ? { ...d, [field]: value } : d)));
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      if (desks.length === 0) { message.error('At least one desk is required'); return; }
      for (const d of desks) {
        if (!d.name.trim()) { message.error('Every desk needs a name'); return; }
        if (!d.roleId) { message.error(`Desk "${d.name}" needs a role`); return; }
        if (d.attributeIds.length === 0) { message.error(`Desk "${d.name}" needs at least one attribute`); return; }
      }

      const isCompanyUser = isCentralScenario || values.userKind === 'company_user';
      const user: User = {
        id: editingUser?.id || `usr-${Date.now()}`,
        name: values.name,
        email: values.email,
        legoActorType: isCentralScenario ? 'company_user' : values.userKind,
        level: isCompanyUser ? 'company' : 'branch',
        branchId: isCompanyUser ? undefined : values.branchId,
        desks,
        activeDeskId: defaultDeskId || desks[0].id,
      };

      if (isEdit) { updateUser(user); message.success('User updated'); }
      else { addUser(user); message.success('User created'); }
      onClose();
    });
  };

  const resetDesks = () => { const d = emptyDesk(); setDesks([d]); setDefaultDeskId(d.id); };

  return (
    <Drawer
      title={isEdit ? `Edit User: ${editingUser?.name}` : 'Create User'}
      open={open}
      onClose={onClose}
      width={600}
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

        {!isCentralScenario && (
          <Form.Item name="userKind" label="User Type" rules={[{ required: true }]}>
            <Select
              disabled={isBranchAdmin}
              options={[
                { value: 'company_user', label: 'Company' },
                { value: 'branch_user', label: 'Branch' },
              ]}
              onChange={(val) => { setUserKind(val); form.setFieldValue('branchId', isBranchAdmin ? currentUser.branchId : undefined); form.setFieldValue('scopeBranches', []); resetDesks(); }}
            />
          </Form.Item>
        )}

        {!isCentralScenario && userKind === 'company_user' && (
          <Form.Item name="scopeBranches" label="Branches (scope filter)">
            <Select mode="multiple" placeholder="Select branches to filter attributes" options={BRANCHES.map((b) => ({ value: b.id, label: b.name }))} onChange={() => resetDesks()} />
          </Form.Item>
        )}

        {!isCentralScenario && userKind === 'branch_user' && (
          <Form.Item name="branchId" label="Branch" rules={[{ required: true }]}>
            <Select disabled={isBranchAdmin} placeholder="Select branch" options={BRANCHES.map((b) => ({ value: b.id, label: b.name }))} onChange={() => resetDesks()} />
          </Form.Item>
        )}

        <Typography.Text strong style={{ display: 'block', marginBottom: 12 }}>Desks</Typography.Text>

        {desks.map((desk, index) => (
          <Card
            key={desk.id}
            size="small"
            style={{ marginBottom: 12 }}
            title={
              <Space>
                <span>Desk {index + 1}</span>
                {desk.id === defaultDeskId && <Tag color="blue">Default</Tag>}
              </Space>
            }
            extra={
              <Space>
                {desk.id !== defaultDeskId && desks.length > 1 && (
                  <Button size="small" onClick={() => setDefaultDeskId(desk.id)}>Set Default</Button>
                )}
                {desks.length > 1 && (
                  <Button size="small" danger icon={<CloseOutlined />} onClick={() => removeDesk(index)} />
                )}
              </Space>
            }
          >
            <Form.Item label="Desk Name" style={{ marginBottom: 8 }}>
              <Input value={desk.name} onChange={(e) => updateDesk(index, 'name', e.target.value)} placeholder="e.g., South Operations" />
            </Form.Item>
            <Form.Item label="Role" style={{ marginBottom: 8 }}>
              <Select
                value={desk.roleId || undefined}
                onChange={(val) => updateDesk(index, 'roleId', val)}
                placeholder="Select role"
                options={PREDEFINED_ROLES.map((r) => ({ value: r.id, label: `${r.name} — ${r.description}` }))}
              />
              {desk.roleId && (
                <div style={{ marginTop: 4 }}>
                  <Space size={4}>
                    {getRolePermissions(desk.roleId).map((p) => (
                      <Tag key={p} color="blue" style={{ fontSize: 11 }}>{p.charAt(0).toUpperCase()}</Tag>
                    ))}
                  </Space>
                </div>
              )}
            </Form.Item>
            <Form.Item label="Attributes" style={{ marginBottom: 0 }}>
              <Select
                mode="multiple"
                value={desk.attributeIds}
                onChange={(vals) => updateDesk(index, 'attributeIds', vals)}
                placeholder="Select attributes"
                options={assignableAttributes.map((a) => ({ value: a.id, label: a.label }))}
              />
            </Form.Item>
          </Card>
        ))}

        <Button onClick={addDesk} icon={<PlusOutlined />} style={{ marginBottom: 16 }}>Add Desk</Button>

        {!isCentralScenario && (
          <Alert
            type="info"
            showIcon
            message={userKind === 'company_user'
              ? 'Company users receive company-level attributes.'
              : 'Branch users receive branch-specific attributes scoped to their branch.'}
            style={{ marginTop: 8 }}
          />
        )}
      </Form>
    </Drawer>
  );
}
