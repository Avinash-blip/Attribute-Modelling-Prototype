import { useMemo } from 'react';
import { Drawer, Form, Select, Button, Space, Typography, Tooltip, Tag, Alert } from 'antd';
import {
  InfoCircleOutlined,
  CheckCircleFilled,
  EyeOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { useAppContext } from '../../context/AppContext';
import { MASTER_DATA_ITEMS } from '../../data/mockData';
import type { CrudPermission } from '../../types';
import type { MockJourney } from '../../data/mockData';
import { buildUserPermissionMap } from './transactionAccess';

interface Props {
  open: boolean;
  onClose: () => void;
}

type AccessLevel = 'create' | 'read_only' | 'no_access';

interface DropdownOption {
  id: string;
  name: string;
  access: AccessLevel;
}

const DROPDOWN_FIELDS: { key: string; label: string; type: string }[] = [
  { key: 'route', label: 'Route', type: 'routes' },
  { key: 'vehicle', label: 'Vehicle Type', type: 'vehicle_type_master' },
  { key: 'material', label: 'Material', type: 'material_master' },
  { key: 'transporter', label: 'Transporter', type: 'transporter_master' },
];

export default function CreateTripDrawer({ open, onClose }: Props) {
  const { currentUser, attributes, addJourney } = useAppContext();
  const [form] = Form.useForm();
  const itemById = useMemo(
    () => new Map(MASTER_DATA_ITEMS.map((item) => [item.id, item])),
    []
  );

  const userPermMap = useMemo(() => {
    const map = new Map<string, CrudPermission[]>();
    const rawMap = buildUserPermissionMap(attributes, currentUser);
    for (const [itemId, perms] of rawMap.entries()) {
      map.set(itemId, [...perms]);
    }
    return map;
  }, [currentUser, attributes]);

  const buildOptions = (mdType: string): DropdownOption[] => {
    const allOfType = MASTER_DATA_ITEMS.filter((i) => i.type === mdType);
    return allOfType.map((item) => {
      const perms = userPermMap.get(item.id);
      let access: AccessLevel = 'no_access';
      if (perms?.includes('create')) access = 'create';
      else if (perms && perms.length > 0) access = 'read_only';
      return { id: item.id, name: item.name, access };
    });
  };

  const renderOption = (opt: DropdownOption) => {
    if (opt.access === 'create') {
      return (
        <Space size={6} style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space size={6}>
            <CheckCircleFilled style={{ color: '#52c41a', fontSize: 12 }} />
            <span>{opt.name}</span>
          </Space>
        </Space>
      );
    }
    if (opt.access === 'read_only') {
      return (
        <Space size={6} style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space size={6}>
            <EyeOutlined style={{ color: '#bfbfbf', fontSize: 12 }} />
            <span style={{ color: '#bfbfbf' }}>{opt.name}</span>
          </Space>
          <Tag color="default" style={{ fontSize: 10, lineHeight: '16px', marginRight: 0 }}>Read Only</Tag>
        </Space>
      );
    }
    return (
      <Space size={6} style={{ width: '100%', justifyContent: 'space-between' }}>
        <Space size={6}>
          <StopOutlined style={{ color: '#d9d9d9', fontSize: 12 }} />
          <span style={{ color: '#d9d9d9' }}>{opt.name}</span>
        </Space>
        <Tag color="default" style={{ fontSize: 10, lineHeight: '16px', marginRight: 0, color: '#d9d9d9' }}>No Access</Tag>
      </Space>
    );
  };

  const handleSubmit = () => {
    form.validateFields().then((values: Record<string, string>) => {
      const routeItem = itemById.get(values.route);
      const routeName = routeItem?.name ?? 'Unknown Route';
      const [from = 'Origin', to = 'Destination'] = routeName.split('→').map((part) => part.trim());
      const statuses: MockJourney['slaStatus'][] = ['On Time', 'At Risk', 'Delayed'];
      const newJourney: MockJourney = {
        id: `JRN-${Math.random().toString(16).slice(2, 10)}`,
        branchId: routeItem?.branch ?? currentUser.branchId ?? 'br-1',
        from,
        to,
        routeItemId: values.route,
        vehicleNumber: `MH${Math.floor(10 + Math.random() * 89)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(1000 + Math.random() * 8999)}`,
        vehicleType: itemById.get(values.vehicle)?.name ?? 'Unknown Vehicle',
        vehicleTypeItemId: values.vehicle,
        materialItemId: values.material,
        transporterItemId: values.transporter,
        sim: true,
        gps: Math.random() > 0.3,
        phone: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
        slaStatus: statuses[Math.floor(Math.random() * statuses.length)],
        eta: '06:30 pm, 24 Feb',
        alert: null,
        alertTime: null,
        attribute: currentUser.assignedAttributes[0] ?? attributes[0]?.id ?? 'unscoped',
      };
      addJourney(newJourney);
      onClose();
      form.resetFields();
    });
  };

  return (
    <Drawer
      title={
        <Space>
          <span>Create Trip</span>
          <Tooltip title="Transactions can only be created using master data available to the user within their create scope. Items outside the user's attribute are visible but not selectable.">
            <InfoCircleOutlined style={{ color: '#1677ff', fontSize: 14, cursor: 'pointer' }} />
          </Tooltip>
        </Space>
      }
      open={open}
      onClose={onClose}
      width={520}
      footer={
        <div style={{ textAlign: 'right' }}>
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" onClick={handleSubmit}>Create Trip</Button>
          </Space>
        </div>
      }
    >
      <Alert
        message="Only master data within your attribute's create scope is selectable. Restricted items are shown for reference."
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        style={{ marginBottom: 20, fontSize: 12 }}
      />

      {currentUser.assignedAttributes.length === 0 && (
        <Alert
          message="No attributes assigned to this user. All items will show as No Access."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      {currentUser.defaultBranchAccess && (
        <Alert
          message="Default branch fallback access is active (full CRUD) because no branch-admin attributes are assigned yet."
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Form form={form} layout="vertical">
        {DROPDOWN_FIELDS.map((field) => {
          const options = buildOptions(field.type);
          const createCount = options.filter((o) => o.access === 'create').length;

          return (
            <Form.Item
              key={field.key}
              name={field.key}
              label={
                <Space size={4}>
                  <span>{field.label}</span>
                  <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                    ({createCount} selectable)
                  </Typography.Text>
                </Space>
              }
              rules={[{ required: true, message: `Select a ${field.label.toLowerCase()}` }]}
            >
              <Select
                placeholder={`Select ${field.label.toLowerCase()}`}
                showSearch
                optionFilterProp="label"
                options={options
                  .sort((a, b) => {
                    const order: Record<AccessLevel, number> = { create: 0, read_only: 1, no_access: 2 };
                    return order[a.access] - order[b.access];
                  })
                  .map((opt) => ({
                    value: opt.id,
                    label: opt.name,
                    disabled: opt.access !== 'create',
                    className: opt.access !== 'create' ? 'abac-disabled-option' : '',
                  }))}
                optionRender={(option) => {
                  const opt = options.find((o) => o.id === option.value);
                  return opt ? renderOption(opt) : null;
                }}
              />
            </Form.Item>
          );
        })}
      </Form>
    </Drawer>
  );
}
