import { useMemo, useState } from 'react';
import { Collapse, Checkbox, Input, Badge, Tag, Space, Typography, Empty } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { FIELD_ITEMS, MODULES } from '../../data/mockData';

interface Props {
  selectedFields: string[];
  onChange: (fields: string[]) => void;
}

export default function FieldsTab({ selectedFields, onChange }: Props) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return FIELD_ITEMS;
    const q = search.toLowerCase();
    return FIELD_ITEMS.filter(
      (f) => f.name.toLowerCase().includes(q) || f.module.toLowerCase().includes(q)
    );
  }, [search]);

  const grouped = useMemo(() => {
    const map: Record<string, typeof FIELD_ITEMS> = {};
    for (const mod of MODULES) {
      const items = filtered.filter((f) => f.module === mod);
      if (items.length > 0) map[mod] = items;
    }
    return map;
  }, [filtered]);

  const toggleField = (id: string, checked: boolean) => {
    onChange(checked ? [...selectedFields, id] : selectedFields.filter((f) => f !== id));
  };

  const toggleModule = (mod: string, checked: boolean) => {
    const modIds = (grouped[mod] || []).map((f) => f.id);
    if (checked) {
      const merged = new Set([...selectedFields, ...modIds]);
      onChange([...merged]);
    } else {
      onChange(selectedFields.filter((id) => !modIds.includes(id)));
    }
  };

  const collapseItems = Object.entries(grouped).map(([mod, items]) => {
    const selectedInMod = items.filter((f) => selectedFields.includes(f.id)).length;
    const allSelected = selectedInMod === items.length;

    return {
      key: mod,
      label: (
        <Space>
          <span>{mod}</span>
          <Badge
            count={`${selectedInMod}/${items.length}`}
            style={{ backgroundColor: selectedInMod > 0 ? '#1677ff' : '#d9d9d9' }}
          />
        </Space>
      ),
      children: (
        <div>
          <Checkbox
            checked={allSelected}
            indeterminate={selectedInMod > 0 && !allSelected}
            onChange={(e) => toggleModule(mod, e.target.checked)}
            style={{ marginBottom: 8, fontWeight: 500 }}
          >
            Select All ({items.length})
          </Checkbox>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {items.map((field) => (
              <Checkbox
                key={field.id}
                checked={selectedFields.includes(field.id)}
                onChange={(e) => toggleField(field.id, e.target.checked)}
              >
                <Space size={4}>
                  <span>{field.name}</span>
                  <Tag color={field.type === 'primary' ? 'blue' : 'green'} style={{ fontSize: 11 }}>
                    {field.type}
                  </Tag>
                </Space>
              </Checkbox>
            ))}
          </div>
        </div>
      ),
    };
  });

  return (
    <div>
      <Space direction="vertical" style={{ width: '100%', marginBottom: 12 }}>
        <Input
          prefix={<SearchOutlined />}
          placeholder="Search fields..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
        />
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {selectedFields.length} of {FIELD_ITEMS.length} fields selected
        </Typography.Text>
      </Space>
      {Object.keys(grouped).length === 0 ? (
        <Empty description="No fields match your search" />
      ) : (
        <Collapse items={collapseItems} defaultActiveKey={Object.keys(grouped).slice(0, 2)} />
      )}
    </div>
  );
}
