import { useState, useEffect, useMemo } from 'react';
import { Space, Divider, Button, Typography } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import BranchSelector from './BranchSelector';
import MasterDataPicker from './MasterDataPicker';
import BulkUploadModal from './BulkUploadModal';
import { MASTER_DATA_ITEMS, BRANCHES } from '../../data/mockData';
import type { ItemPermission } from '../../types';
import { ALL_CRUD } from '../../types';

interface Props {
  onboardingType: 'company' | 'branch';
  selectedBranches: string[] | 'ALL';
  selectedItems: ItemPermission[];
  onChangeBranches: (branches: string[] | 'ALL') => void;
  onChangeItems: (items: ItemPermission[]) => void;
  branchSelectorDisabled?: boolean;
  lockedBranchName?: string;
  branchSingleSelect?: boolean;
  forceBranchSelector?: boolean;
}

export default function MasterDataTab({
  onboardingType,
  selectedBranches,
  selectedItems,
  onChangeBranches,
  onChangeItems,
  branchSelectorDisabled = false,
  lockedBranchName,
  branchSingleSelect = false,
  forceBranchSelector = false,
}: Props) {
  const [bulkOpen, setBulkOpen] = useState(false);

  useEffect(() => {
    if (selectedItems.length > 0) return;
    if (onboardingType === 'company' && !forceBranchSelector) {
      const items = MASTER_DATA_ITEMS.filter((i) => i.onboardedAt === 'company');
      if (items.length > 0) {
        onChangeItems(items.map((i) => ({ itemId: i.id, permissions: [...ALL_CRUD] })));
      }
    } else {
      const branchIds = selectedBranches === 'ALL' ? BRANCHES.map((b) => b.id) : selectedBranches;
      if (branchIds.length === 0) return;
      const items = MASTER_DATA_ITEMS.filter(
        (i) => i.onboardedAt === 'company' || (i.branch && branchIds.includes(i.branch))
      );
      if (items.length > 0) {
        onChangeItems(items.map((i) => ({ itemId: i.id, permissions: [...ALL_CRUD] })));
      }
    }
  }, [onboardingType, selectedBranches, selectedItems.length, onChangeItems, forceBranchSelector]);

  const handleBranchChange = (branches: string[] | 'ALL') => {
    onChangeBranches(branches);
    const branchIds = branches === 'ALL' ? BRANCHES.map((b) => b.id) : branches;
    const available = MASTER_DATA_ITEMS.filter(
      (i) => i.onboardedAt === 'company' || (i.branch && branchIds.includes(i.branch))
    );
    onChangeItems(available.map((i) => ({ itemId: i.id, permissions: [...ALL_CRUD] })));
  };

  const handleBulkConfirm = (ids: string[]) => {
    const existingIds = new Set(selectedItems.map((s) => s.itemId));
    const newItems: ItemPermission[] = ids
      .filter((id) => !existingIds.has(id))
      .map((id) => ({ itemId: id, permissions: [...ALL_CRUD] }));
    onChangeItems([...selectedItems, ...newItems]);
  };

  const availableCount = useMemo(() => {
    if (onboardingType === 'company' && !forceBranchSelector) {
      return MASTER_DATA_ITEMS.filter((i) => i.onboardedAt === 'company').length;
    }
    const branchIds = selectedBranches === 'ALL' ? BRANCHES.map((b) => b.id) : selectedBranches;
    return MASTER_DATA_ITEMS.filter(
      (i) => i.onboardedAt === 'company' || (i.branch && branchIds.includes(i.branch))
    ).length;
  }, [onboardingType, selectedBranches, forceBranchSelector]);

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
            Master Data ({selectedItems.length}/{availableCount})
          </Typography.Text>
          <Button size="small" icon={<UploadOutlined />} onClick={() => setBulkOpen(true)}>
            Bulk Upload
          </Button>
        </div>

        <MasterDataPicker
          onboardingType={onboardingType}
          selectedBranches={selectedBranches}
          selectedItems={selectedItems}
          onChange={onChangeItems}
          groupBy={groupBy}
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
