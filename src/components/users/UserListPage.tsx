import { useState } from 'react';
import { Table, Button, Tag, Space, Typography, Modal } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import CreateUserDrawer from './CreateUserDrawer';
import { useAppContext } from '../../context/AppContext';
import { BRANCHES } from '../../data/mockData';
import type { User } from '../../types';
import { getActiveDesk, getRoleById } from '../../types';

export default function UserListPage() {
  const { users, attributes, deleteUser, pocOnboardingScenario } = useAppContext();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const isCentralScenario = pocOnboardingScenario === 'central_onboarding';
  const handleDelete = (user: User) => {
    Modal.confirm({
      title: `Delete "${user.name}"?`,
      content: 'This action cannot be undone.',
      okText: 'Delete',
      okButtonProps: { danger: true },
      onOk: () => deleteUser(user.id),
    });
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (t: string, r: User) => (
        <Space>
          <Typography.Text strong>{t}</Typography.Text>
          {isCentralScenario && r.legoActorType === 'company_admin' && (
            <Tag color="geekblue" style={{ marginLeft: 4 }}>Company Admin</Tag>
          )}
        </Space>
      ),
    },
    { title: 'Email', dataIndex: 'email', key: 'email', width: 220 },
    {
      title: 'Active Role',
      key: 'role',
      width: 160,
      render: (_: unknown, r: User) => {
        const desk = getActiveDesk(r);
        const role = desk ? getRoleById(desk.roleId) : null;
        return role ? <Tag color="purple">{role.name}</Tag> : <Tag>No Role</Tag>;
      },
    },
    ...(isCentralScenario
      ? [
          {
            title: 'Desks',
            key: 'desks',
            render: (_: unknown, r: User) =>
              r.desks.length > 0
                ? r.desks.map((d) => {
                    const role = getRoleById(d.roleId);
                    return <Tag key={d.id} color="blue">{d.name} ({role?.name ?? d.roleId})</Tag>;
                  })
                : <Tag color="gold">No Desks</Tag>,
          },
        ]
      : [
          {
            title: 'User Type',
            key: 'userType',
            width: 120,
            render: (_: unknown, r: User) => (
              <Tag color={r.level === 'company' ? 'purple' : 'blue'}>
                {r.level === 'company' ? 'Company' : 'Branch'}
              </Tag>
            ),
          },
          {
            title: 'Branch',
            key: 'branch',
            width: 120,
            render: (_: unknown, r: User) =>
              r.branchId ? BRANCHES.find((b) => b.id === r.branchId)?.name || '—' : '—',
          },
          {
            title: 'Desks',
            key: 'desks',
            render: (_: unknown, r: User) =>
              r.defaultBranchAccess
                ? <Tag color="gold">Default Branch Access</Tag>
                : r.desks.length > 0
                ? r.desks.map((d) => {
                    const role = getRoleById(d.roleId);
                    return <Tag key={d.id}>{d.name} ({role?.name ?? d.roleId})</Tag>;
                  })
                : <Typography.Text type="secondary">None</Typography.Text>,
          },
        ]),
    {
      title: '',
      key: 'actions',
      width: 80,
      render: (_: unknown, r: User) => (
        <Space>
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => { setEditing(r); setDrawerOpen(true); }} />
          <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(r)} />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
            LEGO Config
          </Typography.Text>
          <Typography.Title level={4} style={{ margin: 0 }}>Users</Typography.Title>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); setDrawerOpen(true); }}>
          Create User
        </Button>
      </div>

      <Table dataSource={users} columns={columns} rowKey="id" pagination={false} size="middle" />

      <CreateUserDrawer
        open={drawerOpen}
        editingUser={editing}
        onClose={() => { setDrawerOpen(false); setEditing(null); }}
      />
    </div>
  );
}
