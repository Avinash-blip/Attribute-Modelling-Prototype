import { Collapse, Typography, Badge, Alert, Button, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';

const EDGE_CASES = [
  {
    title: 'Attribute does not restrict a master data type',
    what: 'Admin creates attribute with specific routes/vehicles but no materials selected.',
    how: [
      'Unmapped type defaults to ALL — no restriction.',
      'User can use any material with the mapped routes/vehicles.',
      'System skips that type in access checks.',
    ],
    example:
      'Vedanta ships multiple raw materials. Admin maps routes and vehicles but leaves materials unmapped. Vedanta can create indents for any material on those routes.',
    configurable: 'Admin can set to NONE to explicitly block a type.',
  },
  {
    title: 'Two attributes overlap but differ on a type restriction',
    what: 'User has Attr A (routes r1,r2 + vehicles v1 + materials ALL) and Attr B (routes r1,r3 + vehicles v2 + materials m1,m2). Route r1 shared.',
    how: [
      'Each attribute evaluated independently.',
      'r1+v1+any material → A covers it.',
      'r1+v2+m1 → B covers it.',
      'r1+v2+m5 → neither covers it.',
      'ALL on A does not leak into B.',
    ],
    example:
      'North Region Ops (materials ALL) + FMCG Specialist (materials restricted). Same route, different vehicles, different material rules.',
  },
  {
    title: 'Same transaction covered by two attributes with different CRUD',
    what: 'User has Attr A (Full CRUD) and Attr B (Read Only), both cover same journey.',
    how: ['Most permissive CRUD wins.', 'Full CRUD beats Read Only.'],
    example:
      'Lakshmi has SPD_NORTH (Full CRUD) + SPD_ALL (Read Only). North journey → CRUD wins. South journey → Read Only only.',
    configurable: 'Tenant can choose most permissive (default) or most restrictive.',
  },
  {
    title: 'No attribute covers the transaction',
    what: "Transaction items don't fully match any of the active desk's attributes.",
    how: [
      'Transaction is invisible.',
      'Partial matches do not count.',
      'No error shown — transaction does not exist in user\'s view.',
    ],
    example:
      'FMCG user shares routes/vehicles with Cement team but Cement materials not in their attribute. Cement journey invisible.',
  },
  {
    title: 'User has no desks',
    what: 'New user, no desks assigned yet.',
    how: [
      'No access to any data.',
      'Empty state: "No access configured. Please contact your administrator."',
    ],
    example:
      'Sunil joins Pune branch, account created but no desks assigned. Sees empty dashboard until admin configures access.',
    configurable: 'Tenant can choose no access (default) or full branch access.',
  },
  {
    title: 'Desk switching changes context and permissions',
    what: 'User with multiple desks switches active desk to change which data they see and whether they can edit.',
    how: [
      'Each desk has a role (CRUD) and a set of attributes (data scope).',
      'Active desk determines current permissions; switching desk recalculates journey access.',
      'Same user can have full CRUD on one desk and read-only on another.',
    ],
    example:
      'Ramesh has South Ops (Operations Manager) and West Monitor (Supervisor). Switch to South Ops to edit South journeys; switch to West Monitor to view West only.',
  },
  {
    title: 'Cross-branch attribute with selective items',
    what: 'Supplier attribute spans multiple branches with specific items from each.',
    how: [
      'Evaluated same as any attribute.',
      'Branch users see their own data independently.',
      'Cross-branch user sees only transactions matching their selective items.',
    ],
    example:
      'Vedanta sees indents across Pune/Chennai/Hyderabad (selective items). Each plant ops user sees only their own branch.',
  },
  {
    title: 'NONE set for a master data type',
    what: 'Admin explicitly sets a type to NONE.',
    how: [
      'Attribute can never match a transaction on that dimension.',
      'Different from not selecting items (which = ALL).',
    ],
    example:
      'Finance attribute with routes=NONE. Can never match any transaction alone. Needs a second attribute to grant access.',
  },
];

export default function EdgeCasesPage() {
  const navigate = useNavigate();

  const collapseItems = EDGE_CASES.map((ec, i) => ({
    key: String(i + 1),
    label: (
      <Space>
        <Badge count={i + 1} style={{ backgroundColor: '#1677ff' }} />
        <span>{ec.title}</span>
      </Space>
    ),
    children: (
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div>
          <Typography.Text strong style={{ fontSize: 12, color: '#595959' }}>
            What is this?
          </Typography.Text>
          <Alert
            message={ec.what}
            type="info"
            showIcon={false}
            style={{ background: '#f5f5f5', border: 'none', marginTop: 4 }}
          />
        </div>
        <div>
          <Typography.Text strong style={{ fontSize: 12, color: '#595959' }}>
            How the system handles this
          </Typography.Text>
          <ul style={{ marginTop: 4, paddingLeft: 20 }}>
            {ec.how.map((h, j) => (
              <li key={j}>
                <Typography.Text style={{ fontSize: 13 }}>{h}</Typography.Text>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <Typography.Text strong style={{ fontSize: 12, color: '#595959' }}>
            Example
          </Typography.Text>
          <Alert
            message={ec.example}
            type="success"
            showIcon={false}
            style={{ background: '#f6ffed', border: '1px solid #b7eb8f', marginTop: 4 }}
          />
        </div>
        {ec.configurable && (
          <div>
            <Typography.Text strong style={{ fontSize: 12, color: '#595959' }}>
              Configurable?
            </Typography.Text>
            <Alert
              message={ec.configurable}
              type="warning"
              showIcon={false}
              style={{ background: '#fffbe6', border: '1px solid #ffe58f', marginTop: 4 }}
            />
          </div>
        )}
      </Space>
    ),
  }));

  return (
    <div>
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/scenarios')}
        style={{ marginBottom: 16 }}
      >
        ← Back to Scenarios
      </Button>

      <Typography.Title level={4} style={{ marginBottom: 8 }}>
        Edge Cases — Resolver Behavior
      </Typography.Title>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 24 }}>
        Reference for how the attribute resolver handles tricky situations.
      </Typography.Paragraph>

      <Collapse items={collapseItems} defaultActiveKey={['1']} />

      <Alert
        type="error"
        showIcon
        message="Important Note for Product Teams"
        description="Individual product teams must ensure that during attribute creation, the mandatory fields required to create transactions in each module are all included in the attribute mapping. Without this, certain master data types may not be mapped, which could unintentionally block transaction creation."
        style={{ marginTop: 32 }}
      />
    </div>
  );
}
