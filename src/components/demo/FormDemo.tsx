import { useState, useMemo } from 'react';
import { Card, Select, Switch, Space, Typography, Form, Alert, Divider, Tag, Button, message } from 'antd';
import { useAppContext } from '../../context/AppContext';
import { MASTER_DATA_ITEMS } from '../../data/mockData';

export default function FormDemo() {
  const { currentUser, attributes } = useAppContext();
  const [showAll, setShowAll] = useState(false);

  const userAttribute = useMemo(() => {
    if (currentUser.assignedAttributes.length === 0) return null;
    return attributes.find((a) => a.id === currentUser.assignedAttributes[0]) || null;
  }, [currentUser, attributes]);

  const getOptions = (type: string) => {
    const all = MASTER_DATA_ITEMS.filter((i) => i.type === type);
    if (showAll || !userAttribute) return all;
    const mappedIds = new Set(userAttribute.masterDataMapping.selectedItems.map((s) => s.itemId));
    return all.filter((i) => mappedIds.has(i.id));
  };

  const types: { key: string; label: string }[] = [
    { key: 'routes', label: 'Route' },
    { key: 'route_master', label: 'Route Master' },
    { key: 'location_master', label: 'Location' },
    { key: 'material_master', label: 'Material' },
    { key: 'vehicle_type_master', label: 'Vehicle Type' },
    { key: 'driver_master', label: 'Driver' },
  ];

  return (
    <div>
      <Typography.Title level={4}>Demo: Create Indent</Typography.Title>

      <Card size="small" style={{ marginBottom: 16, background: '#f6f8fa' }}>
        <Space split={<Divider type="vertical" />}>
          <span>
            Logged in as: <strong>{currentUser.name}</strong>
          </span>
          <span>
            Attribute:{' '}
            {userAttribute ? <Tag color="blue">{userAttribute.label}</Tag> : <Tag>None</Tag>}
          </span>
          <Space>
            <Typography.Text style={{ fontSize: 13 }}>Show all data (admin view)</Typography.Text>
            <Switch checked={showAll} onChange={setShowAll} size="small" />
          </Space>
        </Space>
      </Card>

      {!showAll && userAttribute && (
        <Alert
          message={`Data filtered by your attribute: ${userAttribute.label}`}
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          closable
        />
      )}

      {!userAttribute && !showAll && (
        <Alert
          message="No attribute assigned to this user. Showing all data."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Card title="New Indent">
        <Form layout="vertical" style={{ maxWidth: 560 }}>
          {types.map(({ key, label }) => {
            const opts = getOptions(key);
            return (
              <Form.Item key={key} label={`${label} (${opts.length} available)`}>
                <Select
                  showSearch
                  placeholder={`Select ${label}`}
                  optionFilterProp="label"
                  options={opts.map((i) => ({ value: i.id, label: i.name }))}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            );
          })}
          <Form.Item>
            <Button type="primary" onClick={() => message.info('This is a demo — no actual submission')}>
              Create Indent
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
