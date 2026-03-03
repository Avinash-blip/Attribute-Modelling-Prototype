import { useMemo, useState } from 'react';
import { Collapse, Checkbox, Input, Tag, Space, Typography, Empty, Segmented } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { MASTER_DATA_TYPE_LABELS, BRANCHES } from '../../data/mockData';
import { MASTER_DATA_TYPE_KEYS } from '../../types';
import type { MasterDataItem, MasterDataTypeRestriction } from '../../types';

interface Props {
  onboardingType: 'company' | 'branch';
  selectedBranches: string[] | 'ALL';
  typeRestrictions: Record<string, MasterDataTypeRestriction>;
  onChange: (restrictions: Record<string, MasterDataTypeRestriction>) => void;
  groupBy?: 'type' | 'branch_then_type';
  availableItems: MasterDataItem[];
}

export default function MasterDataPicker({
  typeRestrictions,
  onChange,
  groupBy = 'type',
  availableItems,
}: Props) {
  const [search, setSearch] = useState('');

  const updateTypeMode = (type: string, mode: 'all' | 'specific' | 'none') => {
    if (mode === 'specific') {
      const typeItems = availableItems.filter((i) => i.type === type);
      onChange({
        ...typeRestrictions,
        [type]: { mode: 'specific', selectedItemIds: typeItems.map((i) => i.id) },
      });
    } else {
      onChange({
        ...typeRestrictions,
        [type]: { mode, selectedItemIds: [] },
      });
    }
  };

  const updateTypeIds = (type: string, ids: string[]) => {
    onChange({
      ...typeRestrictions,
      [type]: { mode: 'specific', selectedItemIds: ids },
    });
  };

  const filtered = useMemo(() => {
    if (!search) return availableItems;
    const q = search.toLowerCase();
    return availableItems.filter(
      (i) => i.name.toLowerCase().includes(q) || i.type.toLowerCase().includes(q)
    );
  }, [availableItems, search]);

  const branchName = (branchId?: string) => {
    if (!branchId) return '';
    return BRANCHES.find((b) => b.id === branchId)?.name || branchId;
  };

  const groupBadge = (
    restriction: MasterDataTypeRestriction,
    typeItems: MasterDataItem[]
  ): React.ReactNode => {
    if (restriction.mode === 'all') {
      return <Tag color="blue">ALL</Tag>;
    }
    if (restriction.mode === 'none') {
      return <Tag color="red">NONE</Tag>;
    }
    const sel = typeItems.filter((i) => restriction.selectedItemIds.includes(i.id)).length;
    return (
      <Tag color={sel > 0 ? 'blue' : 'default'}>
        {sel}/{typeItems.length}
      </Tag>
    );
  };

  const renderTypeSectionContent = (type: string, typeItems: MasterDataItem[]) => {
    const restriction = typeRestrictions[type] || { mode: 'all', selectedItemIds: [] };
    const selectedIds = new Set(restriction.mode === 'specific' ? restriction.selectedItemIds : []);

    const toggleItem = (id: string, checked: boolean) => {
      if (restriction.mode !== 'specific') return;
      const next = checked
        ? [...restriction.selectedItemIds, id]
        : restriction.selectedItemIds.filter((sid) => sid !== id);
      updateTypeIds(type, next);
    };

    const toggleItemSet = (ids: Set<string>, checked: boolean) => {
      if (restriction.mode !== 'specific') return;
      const next = checked
        ? [...restriction.selectedItemIds, ...ids]
        : restriction.selectedItemIds.filter((sid) => !ids.has(sid));
      updateTypeIds(type, next);
    };

    const renderItemRow = (item: MasterDataItem, showBranch = true) => (
      <div
        key={item.id}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '3px 8px 3px 0',
          borderRadius: 4,
          background: selectedIds.has(item.id) ? '#f0f5ff' : 'transparent',
        }}
      >
        <Checkbox
          checked={selectedIds.has(item.id)}
          onChange={(e) => toggleItem(item.id, e.target.checked)}
        >
          <Space size={4}>
            <span>{item.name}</span>
            {showBranch && item.branch && (
              <Tag style={{ fontSize: 11, marginRight: 0 }}>{branchName(item.branch)}</Tag>
            )}
          </Space>
        </Checkbox>
      </div>
    );

    return (
      <div>
        <Segmented
          size="small"
          value={restriction.mode}
          onChange={(val) => updateTypeMode(type, val as 'all' | 'specific' | 'none')}
          options={[
            { value: 'all', label: 'All Items' },
            { value: 'specific', label: 'Select Specific' },
            { value: 'none', label: 'None' },
          ]}
          style={{ marginBottom: 8, display: 'block' }}
        />
        {restriction.mode === 'all' && (
          <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
            No restriction — all items of this type are accessible
          </Typography.Text>
        )}
        {restriction.mode === 'none' && (
          <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
            Blocked — this type cannot be used through this attribute
          </Typography.Text>
        )}
        {restriction.mode === 'specific' && (
          <div>
            <Checkbox
              checked={
                typeItems.length > 0 && typeItems.every((i) => selectedIds.has(i.id))
              }
              indeterminate={
                typeItems.some((i) => selectedIds.has(i.id)) &&
                !typeItems.every((i) => selectedIds.has(i.id))
              }
              onChange={(e) => toggleItemSet(new Set(typeItems.map((i) => i.id)), e.target.checked)}
              style={{ marginBottom: 8, fontWeight: 500 }}
            >
              Select All ({typeItems.length})
            </Checkbox>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {typeItems.map((item) => renderItemRow(item, groupBy === 'branch_then_type'))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderFlatByType = () => {
    const grouped: Record<string, MasterDataItem[]> = {};
    for (const t of MASTER_DATA_TYPE_KEYS) {
      const items = filtered.filter((i) => i.type === t);
      if (items.length > 0) grouped[t] = items;
    }
    if (Object.keys(grouped).length === 0) {
      return <Empty description="No items match your search" />;
    }
    const collapseItems = Object.entries(grouped).map(([type, items]) => ({
      key: type,
      label: (
        <Space>
          <span>{MASTER_DATA_TYPE_LABELS[type] || type}</span>
          {groupBadge(typeRestrictions[type] || { mode: 'all', selectedItemIds: [] }, items)}
        </Space>
      ),
      children: renderTypeSectionContent(type, items),
    }));
    return <Collapse items={collapseItems} defaultActiveKey={Object.keys(grouped).slice(0, 2)} />;
  };

  const totalSelected = useMemo(
    () =>
      Object.values(typeRestrictions).reduce(
        (sum, r) => (r.mode === 'specific' ? sum + r.selectedItemIds.length : sum),
        0
      ),
    [typeRestrictions]
  );

  if (availableItems.length === 0) {
    return (
      <Empty
        description="Select at least one branch to view master data"
        style={{ padding: 40 }}
      />
    );
  }

  return (
    <div>
      <Space direction="vertical" style={{ width: '100%', marginBottom: 12 }}>
        <Input
          prefix={<SearchOutlined />}
          placeholder="Search master data items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
        />
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {totalSelected} of {availableItems.length} items selected (specific only)
        </Typography.Text>
      </Space>
      {renderFlatByType()}
    </div>
  );
}
