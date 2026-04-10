import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, AlertCircle, Copy, Check, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const RegisterPage = () => {
  const [form, setForm] = useState({ username: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [recoveryKey, setRecoveryKey] = useState(null); // shown after register
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      const data = await register(form.username, form.password);
      // Don't navigate yet — show recovery key first
      setRecoveryKey(data.recoveryKey);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(recoveryKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleContinue = () => {
    navigate('/app');
  };

  const inputStyle = {
    background: 'var(--color-bg-5)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-1)'
  };

  // Recovery key screen — shown after successful registration
  if (recoveryKey) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg-1)' }}>
        <div className="w-full max-w-md p-8 rounded-xl" style={{ background: 'var(--color-bg-3)', border: '1px solid var(--color-border)' }}>
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: 'rgba(220,38,38,0.15)' }}>
              <ShieldAlert size={28} style={{ color: 'var(--color-primary)' }} />
            </div>
            <h1 className="text-xl font-bold text-center" style={{ color: 'var(--color-text-1)' }}>
              Save Your Recovery Key
            </h1>
            <p className="text-sm text-center mt-2" style={{ color: 'var(--color-text-2)' }}>
              This key is shown <strong>once only</strong>. If you lose your password, this is the only way to recover your account. Store it somewhere safe.
            </p>
          </div>

          {/* Recovery key display */}
          <div className="p-4 rounded-lg mb-4 text-center" style={{ background: 'var(--color-bg-1)', border: '1px solid var(--color-border)' }}>
            <p className="font-mono text-lg tracking-widest font-bold" style={{ color: 'var(--color-primary)', letterSpacing: '0.15em' }}>
              {recoveryKey}
            </p>
          </div>

          <button onClick={handleCopy} className="w-full py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 mb-4"
            style={{ background: 'var(--color-bg-5)', color: 'var(--color-text-1)', border: '1px solid var(--color-border)' }}>
            {copied ? <><Check size={16} style={{ color: '#22c55e' }} /> Copied!</> : <><Copy size={16} /> Copy to Clipboard</>}
          </button>

          {/* Must confirm before continuing */}
          <label className="flex items-start gap-3 cursor-pointer mb-4">
            <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1" />
            <span className="text-sm" style={{ color: 'var(--color-text-2)' }}>
              I have saved my recovery key in a safe place. I understand this key will not be shown again.
            </span>
          </label>

          <button onClick={handleContinue} disabled={!confirmed}
            className="w-full py-2.5 rounded-lg font-semibold text-sm disabled:opacity-40"
            style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', cursor: confirmed ? 'pointer' : 'not-allowed' }}>
            Enter ShadowCord
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg-1)' }}>
      <div className="w-full max-w-md p-8 rounded-xl" style={{ background: 'var(--color-bg-3)', border: '1px solid var(--color-border)' }}>
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="Logo" className="w-16 h-16 rounded-xl mb-4 object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-1)' }}>Create an account</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-2)' }}>No email required</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg mb-4" style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)' }}>
            <AlertCircle size={16} style={{ color: 'var(--color-primary)' }} />
            <span className="text-sm" style={{ color: 'var(--color-primary)' }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: 'var(--color-text-2)' }}>Username</label>
            <input type="text" name="username" value={form.username} onChange={handleChange}
              required placeholder="cooluser" className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-3)' }}>You will be assigned a unique tag like username#1234</p>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: 'var(--color-text-2)' }}>Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange}
              required placeholder="Min. 6 characters" className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: 'var(--color-text-2)' }}>Confirm Password</label>
            <input type="password" name="confirm" value={form.confirm} onChange={handleChange}
              required placeholder="Repeat password" className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', cursor: 'pointer' }}>
            {loading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <><UserPlus size={16} />Create Account</>}
          </button>
        </form>

        <p className="text-center mt-6 text-sm" style={{ color: 'var(--color-text-2)' }}>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold hover:underline" style={{ color: 'var(--color-primary)' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;