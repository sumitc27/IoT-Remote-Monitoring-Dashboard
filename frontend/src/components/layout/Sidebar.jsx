import { Activity, LayoutDashboard, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

export const Sidebar = () => {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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

      <div style={{ marginTop: 'auto', padding: '16px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', padding: '0 8px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--status-gray-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>{user?.username}</span>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{user?.role}</span>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: '12px',
            color: 'var(--status-red)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '500',
            width: '100%',
            textAlign: 'left'
          }}
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
