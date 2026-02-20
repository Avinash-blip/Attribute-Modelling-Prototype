import { Layout, Menu } from 'antd';
import {
  TagsOutlined,
  TeamOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Sider } = Layout;

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    {
      type: 'group' as const,
      label: 'LEGO Config',
      children: [
        {
          key: '/settings/attributes',
          icon: <TagsOutlined />,
          label: 'Attributes',
        },
        {
          key: '/settings/users',
          icon: <TeamOutlined />,
          label: 'Users',
        },
      ],
    },
    {
      type: 'group' as const,
      label: 'In-Product',
      children: [
        {
          key: '/transactions/journeys',
          icon: <SwapOutlined />,
          label: 'Transactions',
        },
      ],
    },
  ];

  return (
    <Sider width={220} theme="light" style={{ borderRight: '1px solid #f0f0f0' }}>
      <div style={{ padding: '20px 16px 12px', fontWeight: 700, fontSize: 15, color: '#1a1a1a' }}>
        Freight Tiger
      </div>
      <div style={{ padding: '0 16px 16px', fontSize: 11, color: '#8c8c8c', marginTop: -8 }}>
        Attribute Modelling
      </div>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={items}
        onClick={({ key }) => navigate(key)}
        style={{ border: 'none' }}
      />
    </Sider>
  );
}
