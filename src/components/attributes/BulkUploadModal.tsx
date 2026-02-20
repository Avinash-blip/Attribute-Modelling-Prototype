import { useState } from 'react';
import { Modal, Upload, Button, Table, Tag, Space, Typography, message, Alert } from 'antd';
import { InboxOutlined, DownloadOutlined } from '@ant-design/icons';
import { MASTER_DATA_ITEMS } from '../../data/mockData';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (matchedIds: string[]) => void;
}

interface ParsedRow {
  row: number;
  name: string;
  matchedId: string | null;
  status: 'matched' | 'not_found';
}

export default function BulkUploadModal({ open, onClose, onConfirm }: Props) {
  const [parsed, setParsed] = useState<ParsedRow[]>([]);
  const [uploaded, setUploaded] = useState(false);

  const handleDownloadTemplate = () => {
    const header = 'item_name\n';
    const rows = 'Mumbai → Delhi (NH48)\nBhiwandi Warehouse\nCement OPC 53 Grade\nRamesh Kumar\n';
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'master_data_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter((l) => l.trim());
      const dataLines = lines.slice(1); // skip header

      const results: ParsedRow[] = dataLines.map((line, idx) => {
        const name = line.trim().replace(/^"|"$/g, '');
        const match = MASTER_DATA_ITEMS.find(
          (i) => i.name.toLowerCase() === name.toLowerCase()
        );
        return {
          row: idx + 2,
          name,
          matchedId: match?.id || null,
          status: match ? 'matched' : 'not_found',
        };
      });

      setParsed(results);
      setUploaded(true);
    };
    reader.readAsText(file);
    return false;
  };

  const matchedIds = parsed.filter((r) => r.matchedId).map((r) => r.matchedId!);
  const matchCount = matchedIds.length;
  const failCount = parsed.length - matchCount;

  const handleConfirm = () => {
    onConfirm(matchedIds);
    handleReset();
    message.success(`${matchCount} items added`);
  };

  const handleReset = () => {
    setParsed([]);
    setUploaded(false);
    onClose();
  };

  return (
    <Modal
      title="Bulk Upload Master Data"
      open={open}
      onCancel={handleReset}
      width={640}
      footer={
        uploaded
          ? [
              <Button key="cancel" onClick={handleReset}>Cancel</Button>,
              <Button key="ok" type="primary" onClick={handleConfirm} disabled={matchCount === 0}>
                Add {matchCount} Matched Items
              </Button>,
            ]
          : null
      }
    >
      {!uploaded ? (
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Button icon={<DownloadOutlined />} onClick={handleDownloadTemplate}>
            Download CSV Template
          </Button>
          <Upload.Dragger
            accept=".csv"
            showUploadList={false}
            beforeUpload={handleFileUpload}
          >
            <p className="ant-upload-drag-icon"><InboxOutlined /></p>
            <p className="ant-upload-text">Click or drag CSV file here</p>
            <p className="ant-upload-hint">Upload a CSV with item names to bulk-add master data</p>
          </Upload.Dragger>
        </Space>
      ) : (
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Alert
            type={failCount > 0 ? 'warning' : 'success'}
            message={`${matchCount} matched, ${failCount} not found out of ${parsed.length} rows`}
          />
          <Table
            dataSource={parsed}
            rowKey="row"
            size="small"
            pagination={false}
            scroll={{ y: 300 }}
            columns={[
              { title: 'Row', dataIndex: 'row', width: 60 },
              { title: 'Item Name', dataIndex: 'name' },
              {
                title: 'Status',
                dataIndex: 'status',
                width: 120,
                render: (s: string) =>
                  s === 'matched' ? (
                    <Tag color="success">Matched</Tag>
                  ) : (
                    <Tag color="error">Not Found</Tag>
                  ),
              },
            ]}
          />
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Only matched items will be added to the attribute.
          </Typography.Text>
        </Space>
      )}
    </Modal>
  );
}
