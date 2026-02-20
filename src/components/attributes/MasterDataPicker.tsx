import { useMemo, useState } from 'react';
import { Collapse, Checkbox, Input, Badge, Tag, Space, Typography, Empty } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { MASTER_DATA_ITEMS, MASTER_DATA_TYPE_LABELS, MASTER_DATA_TYPES, BRANCHES } from '../../data/mockData';
import type { MasterDataItem, ItemPermission, CrudPermission } from '../../types';
import { ALL_CRUD } from '../../types';

interface Props {
  onboardingType: 'company' | 'branch';
  selectedBranches: string[] | 'ALL';
  selectedItems: ItemPermission[];
  onChange: (items: ItemPermission[]) => void;
  groupBy?: 'type' | 'branch_then_type';
}

const CRUD_LABELS: { key: CrudPermission; label: string }[] = [
  { key: 'create', label: 'C' },
  { key: 'read', label: 'R' },
  { key: 'update', label: 'U' },
  { key: 'delete', label: 'D' },
];

export default function MasterDataPicker({
  onboardingType,
  selectedBranches,
  selectedItems,
  onChange,
  groupBy = 'type',
}: Props) {
  const [search, setSearch] = useState('');

  const selectedIds = useMemo(() => new Set(selectedItems.map((s) => s.itemId)), [selectedItems]);

  const permMap = useMemo(() => {
    const map = new Map<string, CrudPermission[]>();
    for (const s of selectedItems) map.set(s.itemId, s.permissions);
    return map;
  }, [selectedItems]);

  const availableItems = useMemo(() => {
    if (onboardingType === 'company') {
      return MASTER_DATA_ITEMS.filter((i) => i.onboardedAt === 'company');
    }
    const branchIds = selectedBranches === 'ALL' ? BRANCHES.map((b) => b.id) : selectedBranches;
    return MASTER_DATA_ITEMS.filter(
      (i) => i.onboardedAt === 'company' || (i.branch && branchIds.includes(i.branch))
    );
  }, [onboardingType, selectedBranches]);

  const filtered = useMemo(() => {
    if (!search) return availableItems;
    const q = search.toLowerCase();
    return availableItems.filter((i) => i.name.toLowerCase().includes(q) || i.type.toLowerCase().includes(q));
  }, [availableItems, search]);

  // --- shared toggle helpers ---

  const toggleItem = (id: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedItems, { itemId: id, permissions: [...ALL_CRUD] }]);
    } else {
      onChange(selectedItems.filter((s) => s.itemId !== id));
    }
  };

  const toggleCrud = (itemId: string, perm: CrudPermission, checked: boolean) => {
    onChange(
      selectedItems.map((s) => {
        if (s.itemId !== itemId) return s;
        const perms = checked
          ? [...s.permissions, perm]
          : s.permissions.filter((p) => p !== perm);
        return { ...s, permissions: perms };
      })
    );
  };

  const toggleItemSet = (ids: Set<string>, checked: boolean) => {
    if (checked) {
      const existing = selectedItems.filter((s) => !ids.has(s.itemId));
      const newItems: ItemPermission[] = [...ids].map((id) => ({ itemId: id, permissions: [...ALL_CRUD] }));
      onChange([...existing, ...newItems]);
    } else {
      onChange(selectedItems.filter((s) => !ids.has(s.itemId)));
    }
  };

  const branchName = (branchId?: string) => {
    if (!branchId) return '';
    return BRANCHES.find((b) => b.id === branchId)?.name || branchId;
  };

  // --- shared item row renderer ---

  const renderItemRow = (item: MasterDataItem, showBranch = true) => {
    const isChecked = selectedIds.has(item.id);
    const perms = permMap.get(item.id) || [];
    return (
      <div
        key={item.id}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '3px 8px 3px 0',
          borderRadius: 4,
          background: isChecked ? '#f0f5ff' : 'transparent',
        }}
      >
        <Checkbox
          checked={isChecked}
          onChange={(e) => toggleItem(item.id, e.target.checked)}
        >
          <Space size={4}>
            <span>{item.name}</span>
            {showBranch && item.branch && (
              <Tag style={{ fontSize: 11, marginRight: 0 }}>{branchName(item.branch)}</Tag>
            )}
          </Space>
        </Checkbox>
        {isChecked && (
          <Space size={2} style={{ flexShrink: 0 }}>
            {CRUD_LABELS.map(({ key, label }) => (
              <Checkbox
                key={key}
                checked={perms.includes(key)}
                onChange={(e) => toggleCrud(item.id, key, e.target.checked)}
                style={{ fontSize: 11, marginInlineStart: 0 }}
              >
                <span style={{ fontSize: 11, fontWeight: 500 }}>{label}</span>
              </Checkbox>
            ))}
          </Space>
        )}
      </div>
    );
  };

  // --- group badge helper ---

  const groupBadge = (items: MasterDataItem[]) => {
    const sel = items.filter((i) => selectedIds.has(i.id)).length;
    const restricted = items.filter((i) => {
      const p = permMap.get(i.id);
      return p && p.length < 4;
    }).length;
    const text = restricted > 0
      ? `${sel}/${items.length} (${restricted} restricted)`
      : `${sel}/${items.length}`;
    return (
      <Badge count={text} style={{ backgroundColor: sel > 0 ? '#1677ff' : '#d9d9d9' }} />
    );
  };

  // --- groupBy = 'type' (flat) ---

  const renderFlatByType = () => {
    const grouped: Record<string, MasterDataItem[]> = {};
    for (const t of MASTER_DATA_TYPES) {
      const items = filtered.filter((i) => i.type === t);
      if (items.length > 0) grouped[t] = items;
    }

    const collapseItems = Object.entries(grouped).map(([type, items]) => {
      const groupIds = new Set(items.map((i) => i.id));
      const selectedInGroup = items.filter((i) => selectedIds.has(i.id)).length;
      const allSelected = selectedInGroup === items.length;

      return {
        key: type,
        label: (
          <Space>
            <span>{MASTER_DATA_TYPE_LABELS[type] || type}</span>
            {groupBadge(items)}
          </Space>
        ),
        children: (
          <div>
            <Checkbox
              checked={allSelected}
              indeterminate={selectedInGroup > 0 && !allSelected}
              onChange={(e) => toggleItemSet(groupIds, e.target.checked)}
              style={{ marginBottom: 8, fontWeight: 500 }}
            >
              Select All ({items.length})
            </Checkbox>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {items.map((item) => renderItemRow(item))}
            </div>
          </div>
        ),
      };
    });

    if (Object.keys(grouped).length === 0) {
      return <Empty description="No items match your search" />;
    }

    return <Collapse items={collapseItems} defaultActiveKey={Object.keys(grouped).slice(0, 2)} />;
  };

  // --- groupBy = 'branch_then_type' (nested) ---

  const renderBranchThenType = () => {
    const companyItems = filtered.filter((i) => i.onboardedAt === 'company');
    const branchIds = selectedBranches === 'ALL' ? BRANCHES.map((b) => b.id) : (selectedBranches as string[]);
    const branchesWithItems = branchIds
      .map((bId) => {
        const branch = BRANCHES.find((b) => b.id === bId);
        const items = filtered.filter((i) => i.branch === bId);
        return { branch, items };
      })
      .filter((b) => b.items.length > 0);

    if (companyItems.length === 0 && branchesWithItems.length === 0) {
      return <Empty description="No items match your search" />;
    }

    const buildTypeCollapse = (items: MasterDataItem[], showBranch: boolean) => {
      const byType: Record<string, MasterDataItem[]> = {};
      for (const t of MASTER_DATA_TYPES) {
        const typeItems = items.filter((i) => i.type === t);
        if (typeItems.length > 0) byType[t] = typeItems;
      }
      return Object.entries(byType).map(([type, typeItems]) => {
        const groupIds = new Set(typeItems.map((i) => i.id));
        const sel = typeItems.filter((i) => selectedIds.has(i.id)).length;
        const allSel = sel === typeItems.length;
        return {
          key: type,
          label: (
            <Space>
              <span>{MASTER_DATA_TYPE_LABELS[type] || type}</span>
              {groupBadge(typeItems)}
            </Space>
          ),
          children: (
            <div>
              <Checkbox
                checked={allSel}
                indeterminate={sel > 0 && !allSel}
                onChange={(e) => toggleItemSet(groupIds, e.target.checked)}
                style={{ marginBottom: 8, fontWeight: 500 }}
              >
                Select All ({typeItems.length})
              </Checkbox>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {typeItems.map((item) => renderItemRow(item, showBranch))}
              </div>
            </div>
          ),
        };
      });
    };

    const outerItems: { key: string; label: React.ReactNode; children: React.ReactNode }[] = [];

    if (companyItems.length > 0) {
      const allCompanyIds = new Set(companyItems.map((i) => i.id));
      const compSel = companyItems.filter((i) => selectedIds.has(i.id)).length;
      const compAll = compSel === companyItems.length;
      outerItems.push({
        key: 'company-global',
        label: (
          <Space>
            <span style={{ fontWeight: 600 }}>Company (Global)</span>
            {groupBadge(companyItems)}
          </Space>
        ),
        children: (
          <div>
            <Checkbox
              checked={compAll}
              indeterminate={compSel > 0 && !compAll}
              onChange={(e) => toggleItemSet(allCompanyIds, e.target.checked)}
              style={{ marginBottom: 8, fontWeight: 500 }}
            >
              Select All Company Items ({companyItems.length})
            </Checkbox>
            <Collapse items={buildTypeCollapse(companyItems, false)} />
          </div>
        ),
      });
    }

    for (const { branch, items } of branchesWithItems) {
      if (!branch) continue;
      const allBranchIds = new Set(items.map((i) => i.id));
      const bSel = items.filter((i) => selectedIds.has(i.id)).length;
      const bAll = bSel === items.length;
      outerItems.push({
        key: branch.id,
        label: (
          <Space>
            <span style={{ fontWeight: 600 }}>{branch.name} ({branch.code})</span>
            {groupBadge(items)}
          </Space>
        ),
        children: (
          <div>
            <Checkbox
              checked={bAll}
              indeterminate={bSel > 0 && !bAll}
              onChange={(e) => toggleItemSet(allBranchIds, e.target.checked)}
              style={{ marginBottom: 8, fontWeight: 500 }}
            >
              Select All {branch.name} Items ({items.length})
            </Checkbox>
            <Collapse items={buildTypeCollapse(items, false)} />
          </div>
        ),
      });
    }

    return <Collapse items={outerItems} defaultActiveKey={outerItems.slice(0, 2).map((i) => i.key)} />;
  };

  // --- empty state ---

  if (onboardingType === 'branch' && selectedBranches !== 'ALL' && (selectedBranches as string[]).length === 0) {
    return <Empty description="Select at least one branch to view master data" style={{ padding: 40 }} />;
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
          {selectedItems.filter((s) => availableItems.some((i) => i.id === s.itemId)).length} of{' '}
          {availableItems.length} items selected
        </Typography.Text>
      </Space>
      {groupBy === 'branch_then_type' ? renderBranchThenType() : renderFlatByType()}
    </div>
  );
}
