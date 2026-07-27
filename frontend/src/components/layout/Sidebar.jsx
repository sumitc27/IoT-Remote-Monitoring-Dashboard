import { Activity, LayoutDashboard, Settings } from 'lucide-react';

export const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}>
          <Activity size={18} />
        </div>
        <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>IoT Monitor</h2>
      </div>

      <nav style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <a href="#" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          borderRadius: '12px',
          background: 'var(--status-green-bg)',
          color: 'var(--status-green)',
          textDecoration: 'none',
          fontWeight: '600'
        }}>
          <LayoutDashboard size={20} />
          Dashboard
        </a>
        <a href="#" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          borderRadius: '12px',
          color: 'var(--text-secondary)',
          textDecoration: 'none',
          fontWeight: '500'
        }}>
          <Settings size={20} />
          Settings
        </a>
      </nav>
    </aside>
  );
};
