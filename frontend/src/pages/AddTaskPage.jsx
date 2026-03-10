import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/layout/PageHeader';
import { createTask } from '../services/api';

const CATEGORIES = ['general', 'moving', 'gardening', 'painting', 'tech', 'cleaning', 'car care', 'other'];

export default function AddTaskPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', location: '',
    start_date: '', start_time: '', end_date: '', end_time: '', category: 'general',
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleFile = (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error('Image must be under 5MB.');
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.start_date || !form.start_time) {
      return toast.error('Please provide a start date and time.');
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('location', form.location);
      formData.append('start_time', new Date(`${form.start_date}T${form.start_time}`).toISOString());
      if (form.end_date && form.end_time) {
        formData.append('end_time', new Date(`${form.end_date}T${form.end_time}`).toISOString());
      }
      formData.append('category', form.category);
      if (image) formData.append('picture', image);

      await createTask(formData);
      toast.success('Task posted successfully!');
      navigate('/my-tasks');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post task.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader title="Add Task" subtitle="Create a task and find someone to help you" />
      <div className="page-content">
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div className="settings-section">
            <h3 className="settings-section-title">Add New Task</h3>
            <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 20, marginTop: -12 }}>
              Create a task and find someone to help you.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Task Title</label>
                <input className="form-input" name="title" placeholder="e.g., Help moving furniture"
                  value={form.title} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" name="description" rows={4}
                  placeholder="Describe what help you need, any requirements, and what you'll provide..."
                  value={form.description} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label className="form-label">Location</label>
                <input className="form-input" name="location" placeholder="e.g., Downtown Seattle, WA or specific address"
                  value={form.location} onChange={handleChange} required />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input className="form-input" type="date" name="start_date"
                    value={form.start_date} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Start Time</label>
                  <input className="form-input" type="time" name="start_time"
                    value={form.start_time} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">End Date <span>(Optional)</span></label>
                  <input className="form-input" type="date" name="end_date"
                    value={form.end_date} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">End Time <span>(Optional)</span></label>
                  <input className="form-input" type="time" name="end_time"
                    value={form.end_time} onChange={handleChange} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-input" name="category" value={form.category} onChange={handleChange}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c} style={{ textTransform: 'capitalize' }}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Task Image <span>(Optional)</span></label>
                {preview ? (
                  <div style={{ position: 'relative', width: '100%', borderRadius: 8, overflow: 'hidden', height: 180 }}>
                    <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => { setImage(null); setPreview(''); }}
                      style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div
                    className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('task-img-input').click()}
                  >
                    <Upload size={28} color="var(--gray-400)" style={{ margin: '0 auto' }} />
                    <p><span style={{ color: 'var(--primary)', fontWeight: 600 }}>Upload a file</span> or drag and drop</p>
                    <p style={{ fontSize: 12 }}>PNG, JPG, GIF up to 5MB</p>
                  </div>
                )}
                <input
                  id="task-img-input"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFile(e.target.files[0])}
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-primary" type="submit" disabled={loading} style={{ flex: 1 }}>
                  {loading ? <span className="spinner" /> : 'Post Task'}
                </button>
                <button className="btn btn-ghost" type="button" onClick={() => navigate('/my-tasks')}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
