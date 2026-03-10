import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MapPin, Clock, Trash2, Image } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/layout/PageHeader';
import { getMyTasks, deleteTask } from '../services/api';

const formatDateTime = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
};

export default function MyTasksPage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState({});

  const fetchTasks = useCallback(async (search = '') => {
    setLoading(true);
    try {
      const { data } = await getMyTasks(search ? { search } : {});
      setTasks(data.tasks);
    } catch {
      toast.error('Failed to load your tasks.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    setDeleting((p) => ({ ...p, [id]: true }));
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      toast.success('Task deleted.');
    } catch {
      toast.error('Failed to delete task.');
    } finally {
      setDeleting((p) => ({ ...p, [id]: false }));
    }
  };

  const CATEGORY_COLORS = {
    moving: 'cat-moving', gardening: 'cat-gardening', painting: 'cat-painting',
    tech: 'cat-tech', cleaning: 'cat-cleaning', 'car care': 'cat-carcare',
    general: 'cat-general', other: 'cat-other',
  };

  const getCatClass = (cat) => CATEGORY_COLORS[cat?.toLowerCase()] || 'cat-other';

  return (
    <>
      <PageHeader title="My Tasks" subtitle="Manage your posted tasks" onSearch={fetchTasks} />
      <div className="page-content">
        <div className="section-header">
          <div>
            <h2 className="section-title">My Tasks</h2>
            <p className="section-subtitle">Manage your posted tasks</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/add-task')}>
            <Plus size={16} /> Add New Task
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--gray-400)' }}>
            <div className="spinner" style={{ borderTopColor: 'var(--primary)', borderColor: 'var(--gray-200)', width: 32, height: 32, margin: '0 auto' }} />
            <p style={{ marginTop: 12 }}>Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <Image />
            <h3>No tasks yet</h3>
            <p>Post your first task and find someone to help you!</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/add-task')}>
              <Plus size={16} /> Post a Task
            </button>
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
                    <span className={`status-badge status-${task.status}`}>
                      {task.status === 'in_progress' ? 'in progress' : task.status}
                    </span>
                  </div>
                  <h3 className="task-title">{task.title}</h3>
                  <p className="task-desc">{task.description}</p>
                  <div className="task-meta">
                    <div className="task-meta-item">
                      <MapPin size={13} /> {task.location}
                    </div>
                    <div className="task-meta-item">
                      <Clock size={13} /> {formatDateTime(task.start_time)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button
                      className="btn btn-danger"
                      style={{ fontSize: 12, padding: '6px 12px' }}
                      onClick={() => handleDelete(task._id)}
                      disabled={deleting[task._id]}
                    >
                      <Trash2 size={13} />
                      {deleting[task._id] ? 'Deleting...' : 'Delete'}
                    </button>
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
