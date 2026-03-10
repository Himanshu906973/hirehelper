import { useState, useEffect } from 'react';
import { MapPin, Clock, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/layout/PageHeader';
import { getReceivedRequests, acceptRequest, rejectRequest } from '../services/api';

export default function RequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getReceivedRequests();
        setRequests(data.requests);
      } catch {
        toast.error('Failed to load requests.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleAccept = async (id) => {
    setProcessing((p) => ({ ...p, [id]: 'accepting' }));
    try {
      await acceptRequest(id);
      setRequests((prev) => prev.map((r) => r._id === id ? { ...r, status: 'accepted' } : r));
      toast.success('Request accepted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept.');
    } finally {
      setProcessing((p) => ({ ...p, [id]: null }));
    }
  };

  const handleReject = async (id) => {
    setProcessing((p) => ({ ...p, [id]: 'rejecting' }));
    try {
      await rejectRequest(id);
      setRequests((prev) => prev.map((r) => r._id === id ? { ...r, status: 'rejected' } : r));
      toast.success('Request declined.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject.');
    } finally {
      setProcessing((p) => ({ ...p, [id]: null }));
    }
  };

  const getInitials = (u) => u ? `${u.first_name?.[0] || ''}${u.last_name?.[0] || ''}`.toUpperCase() : '?';
  const formatDateTime = (d) => d ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '';

  return (
    <>
      <PageHeader title="Requests" subtitle="People who want to help with your tasks" />
      <div className="page-content">
        <div className="section-header">
          <div>
            <h2 className="section-title">Incoming Requests</h2>
            <p className="section-subtitle">People who want to help with your tasks</p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div className="spinner" style={{ borderTopColor: 'var(--primary)', borderColor: 'var(--gray-200)', width: 32, height: 32, margin: '0 auto' }} />
          </div>
        ) : requests.length === 0 ? (
          <div className="empty-state">
            <Check size={48} />
            <h3>No requests yet</h3>
            <p>When helpers request your tasks, they'll appear here.</p>
          </div>
        ) : (
          <div className="requests-list">
            {requests.map((req) => (
              <div className="request-card" key={req._id}>
                <div className="request-card-header">
                  <div className="requester-info">
                    <div className="requester-avatar">
                      {req.requester_id?.profile_picture ? (
                        <img src={req.requester_id.profile_picture} alt="" />
                      ) : (
                        getInitials(req.requester_id)
                      )}
                    </div>
                    <div>
                      <div className="requester-name">
                        {req.requester_id?.first_name} {req.requester_id?.last_name}
                      </div>
                      <div className="requester-email">{req.requester_id?.email_id}</div>
                    </div>
                  </div>

                  {req.status === 'pending' ? (
                    <div className="request-actions">
                      <button
                        className="btn btn-success"
                        style={{ padding: '7px 16px', fontSize: 13 }}
                        onClick={() => handleAccept(req._id)}
                        disabled={!!processing[req._id]}
                      >
                        {processing[req._id] === 'accepting' ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <><Check size={14} /> Accept</>}
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ padding: '7px 16px', fontSize: 13 }}
                        onClick={() => handleReject(req._id)}
                        disabled={!!processing[req._id]}
                      >
                        {processing[req._id] === 'rejecting' ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <><X size={14} /> Decline</>}
                      </button>
                    </div>
                  ) : (
                    <span className={`status-badge status-${req.status}`}>
                      {req.status}
                    </span>
                  )}
                </div>

                {req.message && (
                  <div className="request-message">{req.message}</div>
                )}

                <div className="request-task-info">
                  <p><strong>Requesting for:</strong> {req.task_id?.title}</p>
                  {req.task_id?.start_time && (
                    <p style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={12} /> {formatDateTime(req.task_id.start_time)}
                      {req.task_id?.location && (
                        <><MapPin size={12} style={{ marginLeft: 8 }} /> {req.task_id.location}</>
                      )}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
