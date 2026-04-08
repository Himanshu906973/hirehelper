import { useState, useEffect } from 'react';
import { MapPin, Clock, Send, Image } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/layout/PageHeader';
import { getMyRequests } from '../services/api';
import { getImageUrl } from '../services/helper';

const CATEGORY_COLORS = {
  moving: 'cat-moving', gardening: 'cat-gardening', painting: 'cat-painting',
  tech: 'cat-tech', cleaning: 'cat-cleaning', 'car care': 'cat-carcare',
  general: 'cat-general', other: 'cat-other',
};

const formatDateTime = (d) => d
  ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
  : '';

export default function MyRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getMyRequests();
        setRequests(data.requests);
      } catch {
        toast.error('Failed to load your requests.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const getCatClass = (cat) => CATEGORY_COLORS[cat?.toLowerCase()] || 'cat-other';

  return (
    <>
      <PageHeader title="My Requests" subtitle="Track the help requests you've sent" />
      <div className="page-content">
        <div className="section-header">
          <div>
            <h2 className="section-title">My Requests</h2>
            <p className="section-subtitle">Track the help requests you've sent</p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div className="spinner" style={{ borderTopColor: 'var(--primary)', borderColor: 'var(--gray-200)', width: 32, height: 32, margin: '0 auto' }} />
          </div>
        ) : requests.length === 0 ? (
          <div className="empty-state">
            <Send size={48} />
            <h3>No requests sent</h3>
            <p>Browse the feed and request tasks you'd like to help with.</p>
          </div>
        ) : (
          <div className="requests-list">
            {requests.map((req) => (
              <div className="my-request-card" key={req._id}>
                <div className="my-request-header">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span className="my-request-task-title">{req.task_id?.title}</span>
                      <span className={`task-category ${getCatClass(req.task_id?.category)}`}>
                        {req.task_id?.category}
                      </span>
                    </div>
                    <div className="my-request-owner">
                      Task owner: {req.task_id?.user_id?.first_name} {req.task_id?.user_id?.last_name}
                    </div>
                  </div>
                  <span className={`status-badge status-${req.status}`}>{req.status}</span>
                </div>

                {req.message && (
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-600)', marginBottom: 4 }}>Your message:</p>
                    <div className="my-request-message">{req.message}</div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--gray-500)', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} /> Sent {formatDateTime(req.createdAt)}
                  </span>
                  {req.task_id?.location && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={12} /> {req.task_id.location}
                    </span>
                  )}
                </div>

                {req.task_id?.picture && (
                  <div className="my-request-task-img">
                  <img src={getImageUrl(req.task_id.picture)} alt={req.task_id.title} />
                  </div>
               )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
