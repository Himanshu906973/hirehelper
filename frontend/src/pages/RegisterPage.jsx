import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { registerUser } from '../services/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: '', last_name: '', email_id: '', phone_number: '', password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      return toast.error('Password must be at least 6 characters.');
    }
    setLoading(true);
    try {
      const { data } = await registerUser(form);
      toast.success('Account created! Please verify your email.');
      navigate('/verify-otp', { state: { userId: data.userId } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #eff6ff 100%)' }}>
      <div className="auth-card">
        <div className="auth-icon" style={{ background: '#dcfce7' }}>
          <UserPlus size={24} color="var(--success)" />
        </div>
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Join the Hire-a-Helper community</p>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input className="form-input" name="first_name" placeholder="First name"
                value={form.first_name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input className="form-input" name="last_name" placeholder="Last name"
                value={form.last_name} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email address</label>
            <input className="form-input" type="email" name="email_id" placeholder="Enter your email"
              value={form.email_id} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number <span>(Optional)</span></label>
            <input className="form-input" name="phone_number" placeholder="Enter your phone number"
              value={form.phone_number} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" name="password" placeholder="Create a password"
              value={form.password} onChange={handleChange} required />
          </div>

          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Create Account'}
          </button>
        </form>

        <p className="auth-link" style={{ marginTop: 20 }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
