import { Select, Typography, Space } from 'antd';
import { BRANCHES } from '../../data/mockData';

interface Props {
  value: string[] | 'ALL';
  onChange: (value: string[] | 'ALL') => void;
  disabled?: boolean;
  singleSelect?: boolean;
}

const ALL_OPTION = { value: 'ALL', label: 'ALL Branches' };

export default function BranchSelector({ value, onChange, disabled = false, singleSelect = false }: Props) {
  const isAll = value === 'ALL';
  const branchOptions = BRANCHES.map((b) => ({ value: b.id, label: `${b.name} (${b.code})` }));

  if (singleSelect) {
    const singleValue = isAll ? undefined : (value as string[])[0];
    return (
      <Space direction="vertical" style={{ width: '100%' }}>
        <Typography.Text strong style={{ fontSize: 13 }}>Branch</Typography.Text>
        <Select
          style={{ width: '100%' }}
          placeholder="Select a branch"
          value={singleValue}
          onChange={(val: string) => onChange([val])}
          options={branchOptions}
          disabled={disabled}
        />
      </Space>
    );
  }

  const selectedValues = isAll ? ['ALL'] : value;
  const options = [ALL_OPTION, ...branchOptions];

  const handleChange = (vals: string[]) => {
    if (vals.includes('ALL') && !(selectedValues as string[]).includes('ALL')) {
      onChange('ALL');
    } else if ((selectedValues as string[]).includes('ALL') && !vals.includes('ALL')) {
      onChange(vals.filter((v) => v !== 'ALL'));
    } else if (vals.length === 0) {
      onChange([]);
    } else {
      onChange(vals.filter((v) => v !== 'ALL'));
    }
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Typography.Text strong style={{ fontSize: 13 }}>Branch</Typography.Text>
      <Select
        mode="multiple"
        style={{ width: '100%' }}
        placeholder="Select branches"
        value={selectedValues}
        onChange={handleChange}
        options={options}
        maxTagCount="responsive"
        disabled={disabled}
      />
    </Space>
  );
}
