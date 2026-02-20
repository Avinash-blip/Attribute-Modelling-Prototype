import { useState, useMemo } from 'react';
import { Table, Button, Tag, Space, Typography, Input, Tooltip, Select } from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  PhoneOutlined,
  EditOutlined,
  InfoCircleOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { useAppContext } from '../../context/AppContext';
import { BRANCHES, MASTER_DATA_ITEMS } from '../../data/mockData';
import CreateTripDrawer from './CreateTripDrawer';
import { buildUserPermissionMap, resolveJourneyAccess } from './transactionAccess';

const SLA_COLOR: Record<string, string> = {
  'On Time': 'green',
  'Delayed': 'red',
  'At Risk': 'orange',
};

export default function JourneyListPage() {
  const { currentUser, attributes, journeys, pocOnboardingScenario } = useAppContext();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedBranchFilters, setSelectedBranchFilters] = useState<string[]>([]);
  const [selectedAttributeFilters, setSelectedAttributeFilters] = useState<string[]>([]);

  const isCentralScenario = pocOnboardingScenario === 'central_onboarding';

  const itemNameMap = useMemo(
    () => new Map(MASTER_DATA_ITEMS.map((item) => [item.id, item.name])),
    []
  );

  const assignedAttributes = useMemo(
    () => attributes.filter((a) => currentUser.assignedAttributes.includes(a.id)),
    [attributes, currentUser.assignedAttributes]
  );

  const permissionMap = useMemo(
    () => buildUserPermissionMap(attributes, currentUser),
    [attributes, currentUser]
  );

  const journeysWithAccess = useMemo(
    () =>
      journeys.map((journey) => ({
        ...journey,
        access: resolveJourneyAccess(journey, permissionMap),
      })),
    [journeys, permissionMap]
  );

  const readableJourneys = useMemo(
    () => journeysWithAccess.filter((journey) => journey.access.canReadRow),
    [journeysWithAccess]
  );

  const isCompanyUser = currentUser.level === 'company';
  const showBranchFilter = !isCentralScenario && isCompanyUser;
  const showAttributeFilter = isCentralScenario || (!isCentralScenario && assignedAttributes.length > 0);

  const visibleJourneys = useMemo(() => {
    let list = readableJourneys;

    if (isCentralScenario && selectedAttributeFilters.length > 0) {
      list = list.filter((j) => selectedAttributeFilters.includes(j.attribute));
    }

    if (!isCentralScenario && selectedBranchFilters.length > 0) {
      list = list.filter((j) => selectedBranchFilters.includes(j.branchId));
    }

    if (!isCentralScenario && showAttributeFilter && selectedAttributeFilters.length > 0) {
      list = list.filter((j) => selectedAttributeFilters.includes(j.attribute));
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (j) =>
          j.id.toLowerCase().includes(q) ||
          j.from.toLowerCase().includes(q) ||
          j.to.toLowerCase().includes(q) ||
          j.vehicleNumber.toLowerCase().includes(q)
      );
    }
    return list;
  }, [
    readableJourneys,
    search,
    isCentralScenario,
    selectedBranchFilters,
    selectedAttributeFilters,
    showAttributeFilter,
  ]);

  const branchOptions = useMemo(() => {
    const ids = new Set(readableJourneys.map((j) => j.branchId));
    return BRANCHES.filter((b) => ids.has(b.id)).map((b) => ({
      value: b.id,
      label: `${b.name} (${b.code})`,
    }));
  }, [readableJourneys]);

  const attributeOptions = useMemo(
    () => assignedAttributes.map((a) => ({ value: a.id, label: a.label })),
    [assignedAttributes]
  );

  type JourneyRow = (typeof journeysWithAccess)[number];

  const columns = [
    {
      title: 'Journey ID',
      dataIndex: 'id',
      key: 'id',
      width: 140,
      render: (id: string) => <Typography.Text copyable={{ text: id }} style={{ fontSize: 12 }}>{id}</Typography.Text>,
    },
    {
      title: 'Route (From → To)',
      key: 'route',
      width: 280,
      render: (_: unknown, r: JourneyRow) => (
        <div style={{ fontSize: 12 }}>
          <div><Typography.Text ellipsis style={{ maxWidth: 260 }}>{r.from}</Typography.Text></div>
          <div style={{ color: '#8c8c8c' }}>↓</div>
          <div><Typography.Text ellipsis style={{ maxWidth: 260 }}>{r.to}</Typography.Text></div>
        </div>
      ),
    },
    {
      title: 'Vehicle Info',
      key: 'vehicle',
      width: 160,
      render: (_: unknown, r: JourneyRow) => (
        <div style={{ fontSize: 12 }}>
          <div style={{ fontWeight: 500 }}>{r.vehicleNumber}</div>
          <div style={{ color: '#8c8c8c' }}>{r.vehicleType}</div>
        </div>
      ),
    },
    {
      title: 'Journey Info',
      key: 'info',
      width: 140,
      render: (_: unknown, r: JourneyRow) => (
        <Space size={6}>
          {r.sim && <Tooltip title="SIM Tracking"><Tag color="blue" style={{ fontSize: 10 }}>SIM</Tag></Tooltip>}
          {r.gps && <Tooltip title="GPS Tracking"><Tag color="cyan" style={{ fontSize: 10 }}>GPS</Tag></Tooltip>}
          <Tooltip title={r.phone}>
            <Space size={2} style={{ fontSize: 11, color: '#595959' }}>
              <PhoneOutlined style={{ fontSize: 10 }} />
              {r.phone.slice(-4)}
            </Space>
          </Tooltip>
        </Space>
      ),
    },
    {
      title: 'SLA',
      key: 'sla',
      width: 150,
      render: (_: unknown, r: JourneyRow) => (
        <div style={{ fontSize: 12 }}>
          <Tag color={SLA_COLOR[r.slaStatus]}>{r.slaStatus}</Tag>
          <div style={{ color: '#8c8c8c', fontSize: 11, marginTop: 2 }}>ETA: {r.eta}</div>
        </div>
      ),
    },
    {
      title: 'Alerts',
      key: 'alerts',
      width: 140,
      render: (_: unknown, r: JourneyRow) =>
        r.alert ? (
          <div>
            <Tag color="red" style={{ fontSize: 10 }}>{r.alert}</Tag>
            <div style={{ fontSize: 10, color: '#8c8c8c', marginTop: 2 }}>{r.alertTime}</div>
          </div>
        ) : (
          <Typography.Text type="secondary" style={{ fontSize: 11 }}>—</Typography.Text>
        ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 140,
      render: (_: unknown, r: JourneyRow) => {
        const missing = r.access.missingUpdateItems.map((id) => itemNameMap.get(id) || id);
        const reason = missing.length > 0
          ? `Update blocked: missing update access for ${missing.slice(0, 2).join(', ')}${missing.length > 2 ? '...' : ''}`
          : 'Edit';
        return (
          <Space size={4}>
            <Tooltip title={reason}>
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                disabled={!r.access.canUpdateRow}
              >
                Edit
              </Button>
            </Tooltip>
            <Button type="text" size="small" icon={<MoreOutlined />} />
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
            In-Product
          </Typography.Text>
          <Space size={6}>
            <Typography.Title level={4} style={{ margin: 0 }}>Journeys</Typography.Title>
            <Tooltip title="Visible transactions require read access on linked master data items. Edit requires update access on all linked items.">
              <InfoCircleOutlined style={{ color: '#1677ff' }} />
            </Tooltip>
          </Space>
          <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
            {visibleJourneys.length} journeys visible by permission scope
          </Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {isCentralScenario
              ? 'Central Onboarding: use Attribute filter to slice cross-branch data.'
              : isCompanyUser
                ? 'Branch Specific: use Branch and Attribute filters in tandem.'
                : 'Branch Specific: use Attribute filter to narrow your branch data.'}
          </Typography.Text>
          {currentUser.defaultBranchAccess && currentUser.branchId && (
            <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
              Default fallback active: full CRUD access is applied for your branch until branch-admin attributes are created.
            </Typography.Text>
          )}
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setDrawerOpen(true)}>
          Create Trip
        </Button>
      </div>

      <Space style={{ marginBottom: 16 }} wrap>
        {showBranchFilter && (
          <Select
            mode="multiple"
            allowClear
            placeholder="Filter by branch"
            value={selectedBranchFilters}
            onChange={setSelectedBranchFilters}
            style={{ minWidth: 260 }}
            options={branchOptions}
          />
        )}
        {showAttributeFilter && (
          <Select
            mode="multiple"
            allowClear
            placeholder="Filter by attribute"
            value={selectedAttributeFilters}
            onChange={setSelectedAttributeFilters}
            style={{ minWidth: 260 }}
            options={attributeOptions}
          />
        )}
        <Input
          prefix={<SearchOutlined />}
          placeholder="Search by Journey ID, route, vehicle..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ minWidth: 320 }}
          allowClear
        />
      </Space>

      <Table
        dataSource={visibleJourneys}
        columns={columns}
        rowKey="id"
        size="small"
        pagination={{ pageSize: 10, showSizeChanger: false }}
        scroll={{ x: 1000 }}
      />

      <CreateTripDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
