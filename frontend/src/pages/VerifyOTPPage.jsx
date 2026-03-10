import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { verifyOTP, resendOTP } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function VerifyOTPPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const userId = location.state?.userId;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!userId) navigate('/register');
  }, [userId, navigate]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  const handleOtpChange = (index, val) => {
    if (!/^\d?$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);
    if (val && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').slice(0, 6).split('');
    const newOtp = [...otp];
    pasted.forEach((char, i) => { if (/\d/.test(char)) newOtp[i] = char; });
    setOtp(newOtp);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) return toast.error('Please enter all 6 digits.');
    setLoading(true);
    try {
      const { data } = await verifyOTP({ userId, otp: code });
      login(data.token, data.user);
      toast.success('Email verified! Welcome to HireHelper 🎉');
      navigate('/feed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await resendOTP({ userId });
      toast.success('OTP resent to your email.');
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-wrapper" style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%)' }}>
      <div className="auth-card">
        <div className="auth-icon" style={{ background: '#fed7aa' }}>
          <ShieldCheck size={24} color="var(--warning)" />
        </div>
        <h2 className="auth-title">Verify Your Email</h2>
        <p className="auth-subtitle">
          Enter the 6-digit code sent to your email
        </p>

        <form onSubmit={handleSubmit}>
          <div className="otp-inputs" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                className="otp-input"
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
              />
            ))}
          </div>

          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Verify Code'}
          </button>
        </form>

        <p className="auth-link" style={{ marginTop: 20 }}>
          Didn't receive the code?{' '}
          {countdown > 0 ? (
            <span style={{ color: 'var(--gray-400)' }}>Resend in {countdown}s</span>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              style={{ background:'none', border:'none', color:'var(--primary)', fontWeight:600, cursor:'pointer', fontSize:14 }}
            >
              {resending ? 'Resending...' : 'Resend'}
            </button>
          )}
        </p>
      </div>
    </div>
  );
}
