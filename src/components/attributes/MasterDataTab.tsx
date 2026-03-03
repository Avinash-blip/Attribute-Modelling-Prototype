import { useState, useEffect, useMemo } from 'react';
import { Space, Divider, Button, Typography } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import BranchSelector from './BranchSelector';
import MasterDataPicker from './MasterDataPicker';
import BulkUploadModal from './BulkUploadModal';
import { MASTER_DATA_ITEMS, BRANCHES } from '../../data/mockData';
import { MASTER_DATA_TYPE_KEYS } from '../../types';
import type { MasterDataTypeRestriction, MasterDataItem } from '../../types';

interface Props {
  onboardingType: 'company' | 'branch';
  selectedBranches: string[] | 'ALL';
  typeRestrictions: Record<string, MasterDataTypeRestriction>;
  onChangeBranches: (branches: string[] | 'ALL') => void;
  onChangeRestrictions: (restrictions: Record<string, MasterDataTypeRestriction>) => void;
  branchSelectorDisabled?: boolean;
  lockedBranchName?: string;
  branchSingleSelect?: boolean;
  forceBranchSelector?: boolean;
}

function getAvailableItems(
  onboardingType: 'company' | 'branch',
  selectedBranches: string[] | 'ALL'
): MasterDataItem[] {
  if (onboardingType === 'company') {
    return MASTER_DATA_ITEMS.filter((i) => i.onboardedAt === 'company');
  }
  const branchIds = selectedBranches === 'ALL' ? BRANCHES.map((b) => b.id) : selectedBranches;
  return MASTER_DATA_ITEMS.filter(
    (i) => i.onboardedAt === 'company' || (i.branch && branchIds.includes(i.branch))
  );
}

export default function MasterDataTab({
  onboardingType,
  selectedBranches,
  typeRestrictions,
  onChangeBranches,
  onChangeRestrictions,
  branchSelectorDisabled = false,
  lockedBranchName,
  branchSingleSelect = false,
  forceBranchSelector = false,
}: Props) {
  const [bulkOpen, setBulkOpen] = useState(false);

  const availableItems = useMemo(
    () => getAvailableItems(onboardingType, selectedBranches),
    [onboardingType, selectedBranches]
  );

  const totalSelectedItems = useMemo(
    () =>
      Object.values(typeRestrictions).reduce(
        (sum, r) => (r.mode === 'specific' ? sum + r.selectedItemIds.length : sum),
        0
      ),
    [typeRestrictions]
  );

  useEffect(() => {
    if (totalSelectedItems > 0) return;
    const branchIds = selectedBranches === 'ALL' ? BRANCHES.map((b) => b.id) : selectedBranches;
    if (onboardingType === 'branch' && branchIds.length === 0) return;
    const byType: Record<string, string[]> = {};
    for (const type of MASTER_DATA_TYPE_KEYS) {
      byType[type] = availableItems.filter((i) => i.type === type).map((i) => i.id);
    }
    const next: Record<string, MasterDataTypeRestriction> = {};
    for (const type of MASTER_DATA_TYPE_KEYS) {
      const ids = byType[type] || [];
      next[type] =
        ids.length > 0
          ? { mode: 'specific', selectedItemIds: ids }
          : { mode: 'all', selectedItemIds: [] };
    }
    onChangeRestrictions(next);
  }, [onboardingType, selectedBranches, totalSelectedItems, availableItems, onChangeRestrictions]);

  const handleBranchChange = (branches: string[] | 'ALL') => {
    onChangeBranches(branches);
    const nextItems = getAvailableItems(onboardingType, branches);
    const byType: Record<string, string[]> = {};
    for (const type of MASTER_DATA_TYPE_KEYS) {
      byType[type] = nextItems.filter((i) => i.type === type).map((i) => i.id);
    }
    const next: Record<string, MasterDataTypeRestriction> = {};
    for (const type of MASTER_DATA_TYPE_KEYS) {
      const ids = byType[type] || [];
      next[type] =
        ids.length > 0
          ? { mode: 'specific', selectedItemIds: ids }
          : { mode: 'all', selectedItemIds: [] };
    }
    onChangeRestrictions(next);
  };

  const handleBulkConfirm = (ids: string[]) => {
    const itemMap = new Map(availableItems.map((i) => [i.id, i]));
    const next = { ...typeRestrictions };
    for (const id of ids) {
      const item = itemMap.get(id);
      if (!item || !next[item.type]) continue;
      const rest = next[item.type];
      if (rest.mode !== 'specific') {
        next[item.type] = { mode: 'specific', selectedItemIds: [id] };
      } else if (!rest.selectedItemIds.includes(id)) {
        next[item.type] = { mode: 'specific', selectedItemIds: [...rest.selectedItemIds, id] };
      }
    }
    onChangeRestrictions(next);
  };

  const availableCount = availableItems.length;

  const isCentral = onboardingType === 'company';
  const groupBy: 'type' | 'branch_then_type' = isCentral ? 'type' : 'branch_then_type';
  const showBranchSelector = !isCentral || forceBranchSelector;

  return (
    <div>
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {isCentral && (
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Centrally Onboarded — selecting cuts from company-level master data
          </Typography.Text>
        )}

        {!isCentral && (
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {branchSelectorDisabled && lockedBranchName
              ? `Branch Wise — you are creating as Branch Admin; scope is locked to ${lockedBranchName}`
              : 'Branch Wise — select one or more branches to scope this attribute'}
          </Typography.Text>
        )}

        {showBranchSelector && (
          <BranchSelector
            value={selectedBranches}
            onChange={handleBranchChange}
            disabled={branchSelectorDisabled}
            singleSelect={branchSingleSelect}
          />
        )}

        <Divider style={{ margin: '8px 0' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography.Text strong style={{ fontSize: 13 }}>
            Master Data ({totalSelectedItems}/{availableCount})
          </Typography.Text>
          <Button size="small" icon={<UploadOutlined />} onClick={() => setBulkOpen(true)}>
            Bulk Upload
          </Button>
        </div>

        <MasterDataPicker
          onboardingType={onboardingType}
          selectedBranches={selectedBranches}
          typeRestrictions={typeRestrictions}
          onChange={onChangeRestrictions}
          groupBy={groupBy}
          availableItems={availableItems}
        />
      </Space>

      <BulkUploadModal
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        onConfirm={handleBulkConfirm}
      />
    </div>
  );
}
