import { useState, useMemo } from 'react';
import { Card, Select, Table, Tag, Space, Typography, Statistic, Row, Col, Alert } from 'antd';
import { useAppContext } from '../../context/AppContext';
import { MOCK_DASHBOARD_DATA } from '../../data/mockData';

export default function DashboardDemo() {
  const { currentUser, attributes } = useAppContext();
  const [filterAttrId, setFilterAttrId] = useState<string | null>(() =>
    currentUser.assignedAttributes.length === 1 ? currentUser.assignedAttributes[0] : null
  );

  const autoApplied = currentUser.assignedAttributes.length === 1;
  const selectedAttr = filterAttrId ? attributes.find((a) => a.id === filterAttrId) : null;

  const rows = useMemo(() => {
    if (!filterAttrId) return MOCK_DASHBOARD_DATA.indentRows;
    return MOCK_DASHBOARD_DATA.indentRows.filter((r) => r.attribute === filterAttrId);
  }, [filterAttrId]);

  const stats = useMemo(() => {
    if (!filterAttrId) return MOCK_DASHBOARD_DATA;
    const ratio = rows.length / MOCK_DASHBOARD_DATA.indentRows.length;
    return {
      totalIndents: Math.round(MOCK_DASHBOARD_DATA.totalIndents * ratio),
      activeTrips: Math.round(MOCK_DASHBOARD_DATA.activeTrips * ratio),
      delivered: Math.round(MOCK_DASHBOARD_DATA.delivered * ratio),
    };
  }, [filterAttrId, rows]);

  const columns = [
    { title: 'Indent #', dataIndex: 'id', key: 'id' },
    { title: 'Origin', dataIndex: 'origin', key: 'origin' },
    { title: 'Destination', dataIndex: 'destination', key: 'destination' },
    { title: 'Route', dataIndex: 'route', key: 'route' },
    { title: 'Material', dataIndex: 'material', key: 'material' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (s: string) => {
        const color = s === 'Delivered' ? 'green' : s === 'In Transit' ? 'blue' : 'orange';
        return <Tag color={color}>{s}</Tag>;
      },
    },
    { title: 'Date', dataIndex: 'date', key: 'date', width: 110 },
  ];

  return (
    <div>
      <Typography.Title level={4}>Demo: Dashboard</Typography.Title>

      {autoApplied && selectedAttr && (
        <Alert
          message={`Data filtered by your attribute: ${selectedAttr.label}`}
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          closable
        />
      )}

      <Space style={{ marginBottom: 16 }} wrap>
        <Select
          placeholder="Filter by Attribute"
          allowClear
          value={filterAttrId}
          onChange={setFilterAttrId}
          style={{ width: 220 }}
          options={attributes.map((a) => ({ value: a.id, label: a.label }))}
        />
        {selectedAttr && (
          <Tag color="blue" closable onClose={() => setFilterAttrId(null)}>
            Showing: {selectedAttr.label}
          </Tag>
        )}
      </Space>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card><Statistic title="Total Indents" value={stats.totalIndents} /></Card>
        </Col>
        <Col span={8}>
          <Card><Statistic title="Active Trips" value={stats.activeTrips} valueStyle={{ color: '#1677ff' }} /></Card>
        </Col>
        <Col span={8}>
          <Card><Statistic title="Delivered" value={stats.delivered} valueStyle={{ color: '#52c41a' }} /></Card>
        </Col>
      </Row>

      <Card title="Recent Indents" size="small">
        <Table dataSource={rows} columns={columns} rowKey="id" pagination={false} size="small" />
      </Card>
    </div>
  );
}
