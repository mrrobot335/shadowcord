import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username.trim(), password);
      navigate('/app');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg-1)' }}>
      <div className="w-full max-w-md p-8 rounded-xl" style={{ background: 'var(--color-bg-3)', border: '1px solid var(--color-border)' }}>
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="App Logo" className="w-16 h-16 rounded-xl mb-4 object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-1)' }}>Welcome back</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-2)' }}>Sign in with your username or full tag</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg mb-4" style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)' }}>
            <AlertCircle size={16} style={{ color: 'var(--color-primary)' }} />
            <span className="text-sm" style={{ color: 'var(--color-primary)' }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: 'var(--color-text-2)' }}>
              Username or Tag
            </label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: 'var(--color-bg-5)', border: '1px solid var(--color-border)', color: 'var(--color-text-1)' }}
              placeholder="username or username#1234" />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: 'var(--color-text-2)' }}>Password</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm outline-none"
                style={{ background: 'var(--color-bg-5)', border: '1px solid var(--color-border)', color: 'var(--color-text-1)' }}
                placeholder="Your password" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-3)', background: 'none', border: 'none', cursor: 'pointer' }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', cursor: 'pointer' }}>
            {loading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <><LogIn size={16} />Sign In</>}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button onClick={() => setShowRecovery(!showRecovery)} className="text-sm" style={{ color: 'var(--color-text-3)', background: 'none', border: 'none', cursor: 'pointer' }}>
            Forgot password? Use recovery key
          </button>
        </div>

        {showRecovery && <RecoveryForm />}

        <p className="text-center mt-4 text-sm" style={{ color: 'var(--color-text-2)' }}>
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold hover:underline" style={{ color: 'var(--color-primary)' }}>Create one</Link>
        </p>
      </div>
    </div>
  );
};

// Inline recovery form
const RecoveryForm = () => {
  const [form, setForm] = useState({ displayId: '', recoveryKey: '', newPassword: '' });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { default: apiClient } = await import('../../api/client');
      await apiClient.post('/auth/recover', form);
      setStatus('success');
    } catch (err) {
      setStatus(err.response?.data?.error || 'Recovery failed');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'success') {
    return (
      <div className="mt-4 p-3 rounded-lg text-sm text-center" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>
        Password reset. You can now log in with your new password.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 p-4 rounded-lg space-y-3" style={{ background: 'var(--color-bg-2)', border: '1px solid var(--color-border)' }}>
      <p className="text-xs font-semibold uppercase" style={{ color: 'var(--color-text-3)' }}>Account Recovery</p>
      {status && <p className="text-xs" style={{ color: 'var(--color-primary)' }}>{status}</p>}
      {[
        { name: 'displayId', placeholder: 'Your tag e.g. shadow#4821' },
        { name: 'recoveryKey', placeholder: 'XXXX-XXXX-XXXX-XXXX-XXXX-XXXX' },
        { name: 'newPassword', placeholder: 'New password', type: 'password' }
      ].map(f => (
        <input key={f.name} type={f.type || 'text'} placeholder={f.placeholder} required
          value={form[f.name]} onChange={(e) => setForm(p => ({ ...p, [f.name]: e.target.value }))}
          className="w-full px-3 py-2 rounded-lg text-sm outline-none"
          style={{ background: 'var(--color-bg-5)', border: '1px solid var(--color-border)', color: 'var(--color-text-1)' }} />
      ))}
      <button type="submit" disabled={loading} className="w-full py-2 rounded-lg text-sm font-semibold"
        style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', cursor: 'pointer' }}>
        {loading ? 'Recovering...' : 'Reset Password'}
      </button>
    </form>
  );
};

export default LoginPage;