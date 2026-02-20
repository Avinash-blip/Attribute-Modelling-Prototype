import { useState, useMemo } from 'react';
import { Table, Button, Tag, Space, Input, Select, Typography, Modal, Avatar, Tooltip } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, TagsOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import CreateAttributeDrawer from './CreateAttributeDrawer';
import { useAppContext } from '../../context/AppContext';
import type { Attribute } from '../../types';

export default function AttributeListPage() {
  const { attributes, users, deleteAttribute, pocOnboardingScenario } = useAppContext();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Attribute | null>(null);
  const [search, setSearch] = useState('');
  const [scopeFilter, setScopeFilter] = useState<string | null>(null);
  const isCentralScenario = pocOnboardingScenario === 'central_onboarding';

  const filtered = useMemo(() => {
    let list = attributes;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((a) => a.label.toLowerCase().includes(q));
    }
    if (scopeFilter) {
      list = list.filter((a) => a.scope === scopeFilter);
    }
    return list;
  }, [attributes, search, scopeFilter]);

  const handleEdit = (attr: Attribute) => {
    setEditing(attr);
    setDrawerOpen(true);
  };

  const handleDelete = (attr: Attribute) => {
    const affectedUsers = users.filter((u) => u.assignedAttributes.includes(attr.id));
    Modal.confirm({
      title: `Delete "${attr.label}"?`,
      content: affectedUsers.length > 0
        ? `This will affect ${affectedUsers.length} user(s) who have this attribute assigned.`
        : 'This attribute has no assigned users.',
      okText: 'Delete',
      okButtonProps: { danger: true },
      onOk: () => deleteAttribute(attr.id),
    });
  };

  const columns = [
    {
      title: 'Label',
      dataIndex: 'label',
      key: 'label',
      render: (text: string) => <Typography.Text strong>{text}</Typography.Text>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text?: string) => text
        ? <Typography.Text type="secondary" style={{ fontSize: 12 }}>{text}</Typography.Text>
        : <Typography.Text type="secondary" style={{ fontSize: 12 }}>—</Typography.Text>,
    },
    ...(!isCentralScenario
      ? [{
          title: 'Scope',
          dataIndex: 'scope',
          key: 'scope',
          width: 110,
          render: (scope: string) => (
            <Tag color={scope === 'company' ? 'purple' : 'blue'}>
              {scope === 'company' ? 'Company Level' : 'Branch Specific'}
            </Tag>
          ),
        }]
      : []),
    {
      title: 'Master Data',
      key: 'masterData',
      width: 110,
      render: (_: unknown, r: Attribute) => (
        <Tag>{r.masterDataMapping.selectedItems.length} items</Tag>
      ),
    },
    {
      title: 'Fields',
      key: 'fields',
      width: 90,
      render: (_: unknown, r: Attribute) => (
        <Tag>{r.fieldMapping.selectedFields.length} fields</Tag>
      ),
    },
    {
      title: 'Users',
      key: 'users',
      width: 100,
      render: (_: unknown, r: Attribute) => {
        const assigned = users.filter((u) => u.assignedAttributes.includes(r.id));
        return (
          <Avatar.Group max={{ count: 3 }} size="small">
            {assigned.map((u) => (
              <Tooltip key={u.id} title={u.name}>
                <Avatar size="small" style={{ backgroundColor: '#1677ff' }}>
                  {u.name.charAt(0)}
                </Avatar>
              </Tooltip>
            ))}
          </Avatar.Group>
        );
      },
    },
    {
      title: 'Created By',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 140,
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 110,
      render: (d: string) => dayjs(d).format('DD MMM YYYY'),
    },
    {
      title: '',
      key: 'actions',
      width: 80,
      render: (_: unknown, r: Attribute) => (
        <Space>
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleEdit(r)} />
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
          <Typography.Title level={4} style={{ margin: 0 }}>Attributes</Typography.Title>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); setDrawerOpen(true); }}>
          Create Attribute
        </Button>
      </div>

      {attributes.length > 0 ? (
        <>
          <Space style={{ marginBottom: 16 }}>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search attributes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
              style={{ width: 240 }}
            />
            {!isCentralScenario && (
              <Select
                placeholder="Filter by scope"
                allowClear
                value={scopeFilter}
                onChange={setScopeFilter}
                style={{ width: 180 }}
                options={[
                  { value: 'company', label: 'Company Level' },
                  { value: 'branch', label: 'Branch Specific' },
                ]}
              />
            )}
          </Space>

          <Table
            dataSource={filtered}
            columns={columns}
            rowKey="id"
            pagination={false}
            size="middle"
            onRow={(record) => ({
              style: { cursor: 'pointer' },
              onClick: (e) => {
                if ((e.target as HTMLElement).closest('button')) return;
                handleEdit(record);
              },
            })}
          />
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <TagsOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
          <Typography.Title level={5} type="secondary">No attributes yet</Typography.Title>
          <Typography.Paragraph type="secondary">
            Create your first attribute to control data access for users.
          </Typography.Paragraph>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); setDrawerOpen(true); }}>
            Create Your First Attribute
          </Button>
        </div>
      )}

      <CreateAttributeDrawer
        open={drawerOpen}
        editingAttribute={editing}
        onClose={() => { setDrawerOpen(false); setEditing(null); }}
      />
    </div>
  );
}
