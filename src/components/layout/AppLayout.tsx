import { useMemo } from 'react';
import { Layout, Avatar, Select, Space, Typography, Segmented, Tooltip } from 'antd';
import { UserOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAppContext } from '../../context/AppContext';
import { DEFAULT_USERS } from '../../data/mockData';

const { Header, Content } = Layout;

const LEGO_ROLE_OPTIONS = [
  { value: 'company_admin', label: 'Company Admin' },
  { value: 'branch_admin', label: 'Branch Admin' },
];

export default function AppLayout() {
  const {
    currentUser,
    setCurrentUser,
    users,
    pocOnboardingScenario,
    setPocOnboardingScenario,
  } = useAppContext();
  const location = useLocation();
  const isLegoSection = location.pathname.startsWith('/settings');

  const legoRoleValue = isLegoSection ? currentUser.legoActorType : undefined;

  const inProductUserOptions = useMemo(
    () => users.map((u) => ({ value: u.id, label: u.name })),
    [users],
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            borderBottom: '1px solid #f0f0f0',
            height: 56,
          }}
        >
          <Space size="middle">
            <Space size={6}>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                POC Scenario
              </Typography.Text>
              <Tooltip title="POC toggle to preview both onboarding experiences across LEGO Config and In-Product workflows.">
                <InfoCircleOutlined style={{ color: '#8c8c8c', fontSize: 12 }} />
              </Tooltip>
              <Segmented
                size="small"
                value={pocOnboardingScenario}
                onChange={(val) => setPocOnboardingScenario(val as 'central_onboarding' | 'branch_specific_onboarding')}
                options={[
                  { value: 'central_onboarding', label: 'Central Onboarding' },
                  { value: 'branch_specific_onboarding', label: 'Branch Specific Onboarding' },
                ]}
              />
            </Space>
            {isLegoSection ? (
              <Space size={4}>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>Acting as</Typography.Text>
                <Select
                  value={legoRoleValue}
                  onChange={(role) => {
                    const match = DEFAULT_USERS.find((u) => u.legoActorType === role);
                    if (match) setCurrentUser(match);
                  }}
                  style={{ width: 160 }}
                  size="small"
                  options={LEGO_ROLE_OPTIONS}
                />
              </Space>
            ) : (
              <Space size={4}>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>User</Typography.Text>
                <Select
                  value={currentUser.id}
                  onChange={(val) => {
                    const u = users.find((u) => u.id === val);
                    if (u) setCurrentUser(u);
                  }}
                  style={{ width: 200 }}
                  size="small"
                  placeholder="Select user"
                  options={inProductUserOptions}
                />
              </Space>
            )}
            <Space size={8}>
              <Avatar size="small" icon={<UserOutlined />} />
              <Typography.Text style={{ fontSize: 13 }}>{currentUser.name}</Typography.Text>
            </Space>
          </Space>
        </Header>
        <Content style={{ padding: 24, background: '#fafafa', overflow: 'auto' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
