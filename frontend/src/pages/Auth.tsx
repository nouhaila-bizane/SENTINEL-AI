import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Eye, EyeOff, Loader2 } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/app');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your SENTINEL AI account">
      <form onSubmit={submit} className="space-y-4">
        {error && <div className="p-3 rounded-lg bg-sentinel-danger/10 border border-sentinel-danger/30 text-sentinel-danger text-sm">{error}</div>}
        <Field label="Email">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="auth-input" placeholder="you@company.com" />
        </Field>
        <Field label="Password">
          <div className="relative">
            <input type={show ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} className="auth-input pr-10" placeholder="••••••••" />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-sentinel-muted hover:text-sentinel-text">
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </Field>
        <button disabled={loading} className="w-full py-3 rounded-lg bg-gradient-to-r from-sentinel-blue to-sentinel-cyan text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
          {loading ? <Loader2 className="animate-spin" size={18} /> : 'Sign in'}
        </button>
        <p className="text-center text-sm text-sentinel-muted">
          Don't have an account? <Link to="/register" className="text-sentinel-cyan hover:underline">Create one</Link>
        </p>
      </form>
    </AuthShell>
  );
}

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const strength = (() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) return setError('Passwords do not match');
    if (!terms) return setError('You must accept the terms');
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/app');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Start verifying your software in minutes">
      <form onSubmit={submit} className="space-y-4">
        {error && <div className="p-3 rounded-lg bg-sentinel-danger/10 border border-sentinel-danger/30 text-sentinel-danger text-sm">{error}</div>}
        <Field label="Full name">
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="auth-input" placeholder="Jane Doe" />
        </Field>
        <Field label="Email">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="auth-input" placeholder="you@company.com" />
        </Field>
        <Field label="Password">
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="auth-input" placeholder="Minimum 8 characters" />
          {password && (
            <div className="flex gap-1 mt-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`h-1 flex-1 rounded-full ${i < strength ? (strength <= 1 ? 'bg-sentinel-danger' : strength <= 2 ? 'bg-sentinel-warning' : 'bg-sentinel-success') : 'bg-sentinel-border'}`} />
              ))}
            </div>
          )}
        </Field>
        <Field label="Confirm password">
          <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} className="auth-input" placeholder="Repeat password" />
        </Field>
        <label className="flex items-start gap-2 text-sm text-sentinel-muted">
          <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-1" />
          <span>I accept the Terms of Service and Privacy Policy</span>
        </label>
        <button disabled={loading} className="w-full py-3 rounded-lg bg-gradient-to-r from-sentinel-blue to-sentinel-cyan text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
          {loading ? <Loader2 className="animate-spin" size={18} /> : 'Create account'}
        </button>
        <p className="text-center text-sm text-sentinel-muted">
          Already have an account? <Link to="/login" className="text-sentinel-cyan hover:underline">Sign in</Link>
        </p>
      </form>
    </AuthShell>
  );
}

function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-sentinel-cyan/10 rounded-full blur-[120px]" />
      <div className="relative w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sentinel-cyan to-sentinel-purple flex items-center justify-center">
            <ShieldCheck size={22} className="text-white" />
          </div>
          <span className="font-bold tracking-wider text-lg">SENTINEL AI</span>
        </Link>
        <div className="glass-panel rounded-2xl p-8">
          <h1 className="text-2xl font-bold mb-1">{title}</h1>
          <p className="text-sentinel-muted text-sm mb-6">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-sentinel-text mb-1.5">{label}</label>
      {children}
    </div>
  );
}