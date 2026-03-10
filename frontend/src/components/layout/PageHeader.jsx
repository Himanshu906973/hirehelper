import { useState, useEffect, useRef } from 'react';
import { Bell, Search } from 'lucide-react';
import { getNotifications, markAllRead } from '../../services/api';

const timeAgo = (dateStr) => {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

export default function PageHeader({ title, subtitle, onSearch }) {
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [searchVal, setSearchVal] = useState('');
  const dropdownRef = useRef(null);

  const fetchNotifs = async () => {
    try {
      const { data } = await getNotifications();
      setNotifications(data.notifications);
      setUnread(data.unreadCount);
    } catch {}
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleBellClick = async () => {
    setShowNotifs((v) => !v);
    if (!showNotifs && unread > 0) {
      await markAllRead();
      setUnread(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    }
  };

  const handleSearchChange = (e) => {
    setSearchVal(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <header className="page-header">
      <div className="page-header-left">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="header-actions" ref={dropdownRef}>
        {onSearch && (
          <div className="search-box">
            <Search size={15} color="var(--gray-400)" />
            <input
              value={searchVal}
              onChange={handleSearchChange}
              placeholder="Search tasks..."
            />
          </div>
        )}
        <button className="notif-btn" onClick={handleBellClick}>
          <Bell size={18} />
          {unread > 0 && <span className="notif-badge">{unread > 9 ? '9+' : unread}</span>}
        </button>

        {showNotifs && (
          <div className="notif-dropdown">
            <div className="notif-header">
              <h3>Notifications</h3>
            </div>
            {notifications.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--gray-400)', fontSize: 13 }}>
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n._id} className={`notif-item ${!n.is_read ? 'unread' : ''}`}>
                  <div className="notif-body">{n.body}</div>
                  <div className="notif-time">{timeAgo(n.createdAt)}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </header>
  );
}
