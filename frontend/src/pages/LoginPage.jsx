import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Handshake, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email_id: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await loginUser(form);
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.first_name}!`);
      navigate('/feed');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed.';
      if (err.response?.data?.requiresVerification) {
        toast.error('Please verify your email first.');
        navigate('/verify-otp', { state: { userId: err.response.data.userId } });
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)' }}>
      <div className="auth-card">
        <div className="auth-icon" style={{ background: '#dbeafe' }}>
          <Handshake size={24} color="var(--primary)" />
        </div>
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Sign in to your Hire-a-Helper account</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input
              className="form-input"
              type="email"
              name="email_id"
              placeholder="Enter your email"
              value={form.email_id}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group" style={{ position: 'relative' }}>
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type={showPass ? 'text' : 'password'}
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
              style={{ paddingRight: 40 }}
            />
            <button
              type="button"
              onClick={() => setShowPass((p) => !p)}
              style={{ position:'absolute', right:12, bottom:10, background:'none', border:'none', color:'var(--gray-400)', cursor:'pointer' }}
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <div className="checkbox-row">
            <label className="checkbox-label">
              <input type="checkbox" style={{ accentColor: 'var(--primary)' }} />
              Remember me
            </label>
          </div>

          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Sign in'}
          </button>
        </form>

        <p className="auth-link" style={{ marginTop: 20 }}>
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
