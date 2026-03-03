import { useMemo } from 'react';
import {
  Alert,
  Button,
  Card,
  Collapse,
  Empty,
  Result,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
  Tooltip,
} from 'antd';
import { ArrowLeftOutlined, EditOutlined, LeftOutlined, RightOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { getScenarioById, SCENARIO_FIXTURES } from '../../data/scenarioFixtures';
import { MASTER_DATA_TYPE_LABELS } from '../../data/mockData';
import { ScenarioProvider, useScenarioContext } from '../../context/ScenarioContext';
import { buildScenarioPermissionMap, resolveJourneyAccess } from './scenarioTransactionAccess';
import type { ScenarioFixture } from '../../types/scenarios';
import type { CrudPreset } from '../../types';

const SLA_COLOR: Record<string, string> = {
  'On Time': 'green',
  Delayed: 'red',
  'At Risk': 'orange',
};

const PRESET_LABELS: Record<CrudPreset, string> = {
  full_crud: 'Full CRUD',
  read_only: 'Read Only',
  create_read: 'Create + Read',
  custom: 'Custom',
};

const ATTRIBUTE_COLORS = ['blue', 'green', 'orange', 'purple', 'cyan', 'magenta', 'geekblue', 'gold'];
const ATTRIBUTE_BORDER_COLORS = ['#1677ff', '#52c41a', '#fa8c16', '#722ed1', '#13c2c2', '#eb2f96', '#2f54eb', '#faad14'];

function SetupTab({ scenario }: { scenario: ScenarioFixture }) {
  const { attributes, users, scenarioBranches } = useScenarioContext();
  const branchName = (id: string) => scenarioBranches.find((b: { id: string; name: string }) => b.id === id)?.name ?? id;
  const attrColorByIndex = (i: number) => ATTRIBUTE_COLORS[i % ATTRIBUTE_COLORS.length];

  if (users.length === 0) {
    return <Empty description="No users in this scenario" />;
  }

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Alert
        type="info"
        showIcon
        message="The situation"
        description={scenario.situation}
        style={{ marginBottom: 8 }}
      />
      <Alert
        type="info"
        showIcon
        message="How it works"
        description={scenario.howItWorks}
      />

      <Typography.Title level={5} style={{ marginTop: 16 }}>
        Attributes
      </Typography.Title>
      {attributes.length === 0 ? (
        <Empty description="No attributes in this scenario" />
      ) : (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {attributes.map((a, i) => (
          <Card
            key={a.id}
            size="small"
            title={a.label}
            style={{ borderLeft: `4px solid ${ATTRIBUTE_BORDER_COLORS[i % ATTRIBUTE_BORDER_COLORS.length]}` }}
          >
            <Space direction="vertical" size={4}>
              <Tag>{a.scope}</Tag>
              {a.description && (
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {a.description}
                </Typography.Text>
              )}
              <Typography.Text style={{ fontSize: 12 }}>
                {a.masterDataMapping.selectedItemIds.length} items ·{' '}
                {users.filter((u) => u.attributeAssignments.some((x) => x.attributeId === a.id)).length} users
              </Typography.Text>
            </Space>
          </Card>
        ))}
      </div>
      )}

      <Typography.Title level={5} style={{ marginTop: 16 }}>
        Users (colored tags match attributes above)
      </Typography.Title>
      <Table
        size="small"
        dataSource={users}
        rowKey="id"
        pagination={false}
        columns={[
          { title: 'Name', dataIndex: 'name', key: 'name', width: 160 },
          { title: 'Role', dataIndex: 'role', key: 'role', width: 140 },
          {
            title: 'Level / Branch',
            key: 'level',
            width: 140,
            render: (_: unknown, r: (typeof users)[number]) =>
              r.level === 'company' ? 'Company' : branchName(r.branchId ?? ''),
          },
          {
            title: 'Assigned attributes',
            key: 'attrs',
            render: (_: unknown, r: (typeof users)[number]) => (
              <Space size={4} wrap>
                {r.attributeAssignments.map((assignment) => {
                  const attr = attributes.find((x) => x.id === assignment.attributeId);
                  if (!attr) return null;
                  const effectivePreset = assignment.crudOverride ?? attr.masterDataMapping.crudPreset;
                  const label = PRESET_LABELS[effectivePreset] ?? effectivePreset;
                  const overridden = assignment.crudOverride != null;
                  const idx = attributes.indexOf(attr);
                  const color = idx >= 0 ? attrColorByIndex(idx) : 'default';
                  return (
                    <Tag key={assignment.attributeId} color={color}>
                      {attr.label} ({label}{overridden ? ' ← overridden' : ''})
                    </Tag>
                  );
                })}
              </Space>
            ),
          },
        ]}
      />
    </Space>
  );
}

function MappingTab({ scenario }: { scenario: ScenarioFixture }) {
  const { attributes } = useScenarioContext();
  const itemById = useMemo(
    () => new Map(scenario.masterDataItems.map((m) => [m.id, m])),
    [scenario.masterDataItems]
  );

  const panels = attributes.map((attr) => {
    const byType = new Map<string, { id: string; name: string }[]>();
    for (const itemId of attr.masterDataMapping.selectedItemIds) {
      const item = itemById.get(itemId);
      if (!item) continue;
      const list = byType.get(item.type) ?? [];
      list.push({ id: item.id, name: item.name });
      byType.set(item.type, list);
    }

    const presetLabel = PRESET_LABELS[attr.masterDataMapping.crudPreset] ?? attr.masterDataMapping.crudPreset;
    const children = Array.from(byType.entries()).map(([type, items]) => (
      <div key={type} style={{ marginBottom: 16 }}>
        <Typography.Text strong style={{ fontSize: 12 }}>
          {MASTER_DATA_TYPE_LABELS[type] ?? type} ({items.length})
        </Typography.Text>
        <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {items.map((i) => (
            <Typography.Text key={i.id} style={{ fontSize: 12 }}>{i.name}</Typography.Text>
          ))}
        </div>
      </div>
    ));

    return {
      key: attr.id,
      label: (
        <Space size={8}>
          <span>{attr.label}</span>
          <Tag color={attr.masterDataMapping.crudPreset === 'full_crud' ? 'blue' : attr.masterDataMapping.crudPreset === 'read_only' ? 'default' : 'cyan'}>
            {presetLabel}
          </Tag>
        </Space>
      ),
      children: <div style={{ padding: '8px 0' }}>{children}</div>,
    };
  });

  if (attributes.length === 0) {
    return <Empty description="No attributes in this scenario" />;
  }
  return <Collapse items={panels} defaultActiveKey={attributes.map((a) => a.id)} />;
}

function LiveDemoTab({ scenario }: { scenario: ScenarioFixture }) {
  const {
    currentUser,
    setCurrentUser,
    attributes,
    users,
    journeys,
    scenarioMasterDataItems,
  } = useScenarioContext();

  const highlightUsers = users.filter((u) => scenario.highlightUsers.includes(u.id));
  const currentOutcome = scenario.expectedOutcomes.find((o) => o.userId === currentUser.id);

  const itemNameMap = useMemo(
    () => new Map(scenarioMasterDataItems.map((m) => [m.id, m.name])),
    [scenarioMasterDataItems]
  );

  const permissionMap = useMemo(
    () => buildScenarioPermissionMap(attributes, currentUser, scenarioMasterDataItems),
    [attributes, currentUser, scenarioMasterDataItems]
  );

  const journeysWithAccess = useMemo(
    () =>
      journeys.map((j) => ({
        ...j,
        access: resolveJourneyAccess(j, permissionMap),
      })),
    [journeys, permissionMap]
  );

  const visible = journeysWithAccess.filter((j) => j.access.canReadRow);
  const editable = visible.filter((j) => j.access.canUpdateRow);

  type Row = (typeof journeysWithAccess)[number];

  const columns = [
    {
      title: 'Journey ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (id: string) => (
        <Typography.Text copyable={{ text: id }} style={{ fontSize: 12 }}>
          {id}
        </Typography.Text>
      ),
    },
    {
      title: 'Route',
      key: 'route',
      width: 180,
      render: (_: unknown, r: Row) => (
        <Typography.Text style={{ fontSize: 12 }}>
          {r.from} → {r.to}
        </Typography.Text>
      ),
    },
    {
      title: 'Vehicle',
      key: 'vehicle',
      width: 140,
      render: (_: unknown, r: Row) => (
        <Typography.Text style={{ fontSize: 12 }}>{r.vehicleType}</Typography.Text>
      ),
    },
    {
      title: 'Material',
      key: 'material',
      width: 120,
      render: (_: unknown, r: Row) => {
        const name = itemNameMap.get(r.materialItemId) ?? r.materialItemId;
        return <Typography.Text style={{ fontSize: 12 }}>{name}</Typography.Text>;
      },
    },
    {
      title: 'SLA',
      key: 'sla',
      width: 100,
      render: (_: unknown, r: Row) => (
        <Tag color={SLA_COLOR[r.slaStatus]} style={{ fontSize: 11 }}>
          {r.slaStatus}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_: unknown, r: Row) => {
        const missing = r.access.missingUpdateItems.map((id) => itemNameMap.get(id) ?? id);
        const reason =
          missing.length > 0
            ? `Update blocked: missing update access for ${missing.slice(0, 2).join(', ')}${missing.length > 2 ? '...' : ''}`
            : 'Edit';
        return (
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
        );
      },
    },
  ];

  if (journeys.length === 0) {
    return <Empty description="No journeys in this scenario" />;
  }

  if (visible.length === 0) {
    return (
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div>
          <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
            Switch user to see different permissions
          </Typography.Text>
          <Space size={8} wrap style={{ marginTop: 8 }}>
            {highlightUsers.map((u) => (
              <Button
                key={u.id}
                type={currentUser.id === u.id ? 'primary' : 'default'}
                icon={<UserOutlined />}
                onClick={() => setCurrentUser(u)}
              >
                {u.name} ({u.role})
              </Button>
            ))}
          </Space>
        </div>
        <Empty description={`No journeys visible for ${currentUser.name} with current attribute permissions`} />
      </Space>
    );
  }

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }} key={currentUser.id}>
      <div>
        <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
          Switch user to see different permissions
        </Typography.Text>
        <Space size={8} wrap style={{ marginTop: 8 }}>
          {highlightUsers.map((u) => (
            <Button
              key={u.id}
              type={currentUser.id === u.id ? 'primary' : 'default'}
              icon={<UserOutlined />}
              onClick={() => setCurrentUser(u)}
            >
              {u.name} ({u.role})
            </Button>
          ))}
        </Space>
      </div>

      {currentOutcome && (
        <Alert
          type="info"
          showIcon
          message={`${currentOutcome.userName}: ${currentOutcome.description}`}
          description={`Visible: ${currentOutcome.canSeeJourneys} journeys · Editable: ${currentOutcome.canEditJourneys}`}
        />
      )}

      <Table
        size="small"
        dataSource={visible}
        rowKey="id"
        columns={columns}
        pagination={{ pageSize: 10, showSizeChanger: false }}
        scroll={{ x: 800 }}
      />

      <Typography.Text
        type="secondary"
        style={{ fontSize: 12, transition: 'opacity 0.2s ease' }}
      >
        {visible.length} journeys visible, {editable.length} editable out of {journeys.length}{' '}
        total in scenario.
      </Typography.Text>

      <Alert
        type="success"
        showIcon
        message="Key insight"
        description={scenario.keyInsight}
      />
    </Space>
  );
}

function ScenarioWalkthroughContent({
  scenario,
  onBack,
}: {
  scenario: ScenarioFixture;
  onBack: () => void;
}) {
  const navigate = useNavigate();
  const currentIndex = SCENARIO_FIXTURES.findIndex((s) => s.id === scenario.id);
  const prevScenario = currentIndex > 0 ? SCENARIO_FIXTURES[currentIndex - 1] : null;
  const nextScenario =
    currentIndex >= 0 && currentIndex < SCENARIO_FIXTURES.length - 1
      ? SCENARIO_FIXTURES[currentIndex + 1]
      : null;

  const tabItems = [
    {
      key: 'setup',
      label: 'Setup',
      children: <SetupTab scenario={scenario} />,
    },
    {
      key: 'mapping',
      label: 'Mapping',
      children: <MappingTab scenario={scenario} />,
    },
    {
      key: 'demo',
      label: 'Live Demo',
      children: <LiveDemoTab scenario={scenario} />,
    },
  ];

  return (
    <div>
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={onBack}
        style={{ marginBottom: 16 }}
      >
        Back to Scenarios
      </Button>

      <div style={{ marginBottom: 24 }}>
        <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
          Scenario {scenario.number}
        </Typography.Text>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {scenario.title}
        </Typography.Title>
        <Typography.Text type="secondary">{scenario.subtitle}</Typography.Text>
      </div>

      <Tabs items={tabItems} />

      <div style={{ marginTop: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          type="text"
          icon={<LeftOutlined />}
          disabled={!prevScenario}
          onClick={() => prevScenario && navigate(`/scenarios/${prevScenario.id}`)}
        >
          Previous Scenario
        </Button>
        <Button
          type="text"
          icon={<RightOutlined />}
          iconPosition="end"
          disabled={!nextScenario}
          onClick={() => nextScenario && navigate(`/scenarios/${nextScenario.id}`)}
        >
          Next Scenario
        </Button>
      </div>
    </div>
  );
}

export default function ScenarioWalkthroughPage() {
  const navigate = useNavigate();
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const scenario = scenarioId ? getScenarioById(scenarioId) : null;
  console.log('scenarioId:', scenarioId, 'found:', !!scenario);

  if (!scenario) {
    return (
      <Result
        status="404"
        title="Scenario not found"
        subTitle={`No scenario with id "${scenarioId}" was found.`}
        extra={
          <Button type="primary" onClick={() => navigate('/scenarios')}>
            Back to Scenarios
          </Button>
        }
      />
    );
  }

  return (
    <ScenarioProvider scenarioId={scenario.id}>
      <ScenarioWalkthroughContent scenario={scenario} onBack={() => navigate('/scenarios')} />
    </ScenarioProvider>
  );
}
