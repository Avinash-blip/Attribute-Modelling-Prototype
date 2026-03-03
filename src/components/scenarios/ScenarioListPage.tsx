import { useState, useMemo } from 'react';
import { Card, Tag, Typography, Space, Button, Badge, Row, Col } from 'antd';
import { RightOutlined, ExperimentOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { SCENARIO_FIXTURES } from '../../data/scenarioFixtures';

const CATEGORY_COLORS: Record<string, string> = {
  'Branch Access': 'blue',
  'Data Isolation': 'purple',
  Hierarchy: 'orange',
  'Cross-Branch': 'cyan',
  'Shared Entities': 'magenta',
  'Department Roles': 'green',
  Reporting: 'geekblue',
  'Default Behaviour': 'gold',
  'External Users': 'red',
  'Bulk Operations': 'lime',
  'Conflict Resolution': 'volcano',
};

export default function ScenarioListPage() {
  const navigate = useNavigate();
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const filtered = categoryFilter
    ? SCENARIO_FIXTURES.filter((s) => s.category === categoryFilter)
    : SCENARIO_FIXTURES;

  const categories = [...new Set(SCENARIO_FIXTURES.map((s) => s.category))].sort();

  const stats = useMemo(() => {
    let attributes = 0;
    let users = 0;
    let journeys = 0;
    SCENARIO_FIXTURES.forEach((s) => {
      attributes += s.attributes.length;
      users += s.users.length;
      journeys += s.journeys.length;
    });
    return { attributes, users, journeys };
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
          Scenario Showcase
        </Typography.Text>
        <Typography.Title level={4} style={{ margin: 0 }}>
          ABAC Use Cases
        </Typography.Title>
        <Typography.Text type="secondary">
          {SCENARIO_FIXTURES.length} real-world scenarios demonstrating attribute-based access
          control patterns
        </Typography.Text>
      </div>

      <Card size="small" style={{ marginBottom: 24 }}>
        <Space align="start" size={12}>
          <ExperimentOutlined style={{ fontSize: 24, color: '#1677ff', marginTop: 2 }} />
          <div>
            <Typography.Text>
              These scenarios demonstrate how Freight Tiger&apos;s attribute model handles
              real-world logistics access control challenges. Click any scenario to see a live,
              interactive demo.
            </Typography.Text>
            <Row gutter={16} style={{ marginTop: 12 }}>
              <Col>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  <strong>{SCENARIO_FIXTURES.length}</strong> scenarios
                </Typography.Text>
              </Col>
              <Col>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  <strong>{stats.attributes}</strong> attributes
                </Typography.Text>
              </Col>
              <Col>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  <strong>{stats.users}</strong> users
                </Typography.Text>
              </Col>
              <Col>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  <strong>{stats.journeys}</strong> journeys
                </Typography.Text>
              </Col>
            </Row>
          </div>
        </Space>
      </Card>

      <Space wrap style={{ marginBottom: 20 }}>
        <Tag.CheckableTag
          checked={categoryFilter === null}
          onChange={() => setCategoryFilter(null)}
        >
          All ({SCENARIO_FIXTURES.length})
        </Tag.CheckableTag>
        {categories.map((cat) => (
          <Tag.CheckableTag
            key={cat}
            checked={categoryFilter === cat}
            onChange={(checked) => setCategoryFilter(checked ? cat : null)}
          >
            {cat}
          </Tag.CheckableTag>
        ))}
      </Space>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: 16,
        }}
      >
        {filtered.map((scenario) => (
          <Card
            key={scenario.id}
            hoverable
            onClick={() => navigate(`/scenarios/${scenario.id}`)}
            style={{ height: '100%' }}
          >
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Space>
                <Badge count={scenario.number} style={{ backgroundColor: '#1677ff' }} />
                <Tag color={CATEGORY_COLORS[scenario.category] ?? 'default'}>
                  {scenario.category}
                </Tag>
                <Tag>{scenario.priority}</Tag>
              </Space>
              <Typography.Text strong style={{ fontSize: 15 }}>
                {scenario.title}
              </Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                {scenario.subtitle}
              </Typography.Text>
              <Button type="link" style={{ padding: 0 }} icon={<RightOutlined />}>
                View Demo
              </Button>
            </Space>
          </Card>
        ))}
      </div>

      <Card
        size="small"
        hoverable
        onClick={() => navigate('/scenarios/edge-cases')}
        style={{ marginTop: 24 }}
      >
        <Typography.Text>
          📋 Edge Cases Reference — See how the system handles tricky access control situations
        </Typography.Text>
        <Button type="link" style={{ padding: 0, marginTop: 8 }} icon={<RightOutlined />}>
          View Edge Cases
        </Button>
      </Card>
    </div>
  );
}
