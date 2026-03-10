import { useState, useEffect, useCallback } from 'react';
import { MapPin, Clock, Image } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/layout/PageHeader';
import { getFeedTasks, sendRequest } from '../services/api';

const CATEGORY_COLORS = {
  moving: 'cat-moving', gardening: 'cat-gardening', painting: 'cat-painting',
  tech: 'cat-tech', cleaning: 'cat-cleaning', 'car care': 'cat-carcare',
  general: 'cat-general', other: 'cat-other',
};

const formatDate = (d) => {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatDateTime = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
};

export default function FeedPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState({});
  const [search, setSearch] = useState('');

  const fetchTasks = useCallback(async (q = '') => {
    setLoading(true);
    try {
      const { data } = await getFeedTasks(q ? { search: q } : {});
      setTasks(data.tasks);
    } catch {
      toast.error('Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleSearch = (q) => {
    setSearch(q);
    const t = setTimeout(() => fetchTasks(q), 400);
    return () => clearTimeout(t);
  };

  const handleRequest = async (taskId) => {
    setRequesting((p) => ({ ...p, [taskId]: true }));
    try {
      await sendRequest({ task_id: taskId, message: '' });
      toast.success('Request sent!');
      setTasks((prev) =>
        prev.map((t) => t._id === taskId ? { ...t, myRequestStatus: 'pending' } : t)
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request.');
    } finally {
      setRequesting((p) => ({ ...p, [taskId]: false }));
    }
  };

  const getInitials = (u) => u ? `${u.first_name?.[0] || ''}${u.last_name?.[0] || ''}`.toUpperCase() : '?';
  const getCatClass = (cat) => CATEGORY_COLORS[cat?.toLowerCase()] || 'cat-other';

  return (
    <>
      <PageHeader title="Feed" subtitle="Find tasks that need help" onSearch={handleSearch} />
      <div className="page-content">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--gray-400)' }}>
            <div className="spinner" style={{ borderTopColor: 'var(--primary)', borderColor: 'var(--gray-200)', width: 32, height: 32, margin: '0 auto' }} />
            <p style={{ marginTop: 12 }}>Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <Image />
            <h3>No tasks found</h3>
            <p>{search ? 'Try a different search term.' : 'No tasks available right now. Check back soon!'}</p>
          </div>
        ) : (
          <div className="tasks-grid">
            {tasks.map((task) => (
              <div className="task-card" key={task._id}>
                <div className="task-card-img">
                  {task.picture ? (
                    <img src={task.picture} alt={task.title} />
                  ) : (
                    <Image size={40} />
                  )}
                </div>
                <div className="task-card-body">
                  <div className="task-card-top">
                    <span className={`task-category ${getCatClass(task.category)}`}>
                      {task.category}
                    </span>
                    <span className="task-date">{formatDate(task.createdAt)}</span>
                  </div>
                  <h3 className="task-title">{task.title}</h3>
                  <p className="task-desc">{task.description}</p>
                  <div className="task-meta">
                    <div className="task-meta-item">
                      <MapPin size={13} /> {task.location}
                    </div>
                    <div className="task-meta-item">
                      <Clock size={13} /> {formatDateTime(task.start_time)}
                      {task.end_time && ` – ${formatDateTime(task.end_time)}`}
                    </div>
                  </div>
                  <div className="task-card-footer">
                    <div className="task-owner">
                      <div className="task-owner-avatar">
                        {task.user_id?.profile_picture ? (
                          <img src={task.user_id.profile_picture} alt="" />
                        ) : (
                          getInitials(task.user_id)
                        )}
                      </div>
                      <span className="task-owner-name">
                        {task.user_id?.first_name} {task.user_id?.last_name?.charAt(0)}.
                      </span>
                    </div>

                    {task.myRequestStatus ? (
                      <span className="btn-request-sent">
                        {task.myRequestStatus === 'accepted' ? '✓ Accepted' :
                         task.myRequestStatus === 'rejected' ? '✗ Rejected' : 'Request Sent'}
                      </span>
                    ) : (
                      <button
                        className="btn btn-primary"
                        style={{ padding: '7px 14px', fontSize: 13 }}
                        onClick={() => handleRequest(task._id)}
                        disabled={requesting[task._id]}
                      >
                        {requesting[task._id] ? <span className="spinner" style={{ width: 14, height: 14 }} /> : 'Request'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
