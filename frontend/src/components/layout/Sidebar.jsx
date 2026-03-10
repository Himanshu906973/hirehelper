import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home, ClipboardList, Inbox, Send, PlusCircle, Settings, LogOut, Menu, X, Handshake,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getReceivedRequests } from '../../services/api';

const navLinks = [
  { to: '/feed', icon: Home, label: 'Feed' },
  { to: '/my-tasks', icon: ClipboardList, label: 'My Tasks' },
  { to: '/requests', icon: Inbox, label: 'Requests', badge: true },
  { to: '/my-requests', icon: Send, label: 'My Requests' },
  { to: '/add-task', icon: PlusCircle, label: 'Add Task' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const { data } = await getReceivedRequests();
        const pending = data.requests.filter((r) => r.status === 'pending').length;
        setPendingCount(pending);
      } catch {}
    };
    fetchPending();
    const interval = setInterval(fetchPending, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user
    ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase()
    : 'U';

  return (
    <>
      {/* Mobile hamburger */}
      <button className="hamburger" style={{ position:'fixed', top:16, left:16, zIndex:150 }} onClick={() => setOpen(true)}>
        <Menu size={22} />
      </button>

      {/* Overlay */}
      <div className={`sidebar-overlay ${open ? 'open' : ''}`} onClick={() => setOpen(false)} />

      {/* Sidebar */}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Handshake size={18} />
          </div>
          <span className="sidebar-logo-text">HireHelper</span>
          <button className="hamburger" style={{ marginLeft:'auto', display:'flex' }} onClick={() => setOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {navLinks.map(({ to, icon: Icon, label, badge }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setOpen(false)}
            >
              <Icon size={18} />
              {label}
              {badge && pendingCount > 0 && (
                <span className="nav-badge">{pendingCount}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {user?.profile_picture ? (
              <img src={user.profile_picture} alt="avatar" />
            ) : (
              initials
            )}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">
              {user?.first_name} {user?.last_name}
            </div>
            <div className="sidebar-user-email">{user?.email_id}</div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  );
}
