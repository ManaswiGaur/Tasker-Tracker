import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { GoogleLogin } from '@react-oauth/google';
import * as z from 'zod';
import { Workflow, Sun, Moon, Crown, Users } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import API from '../api/axios';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('MEMBER');
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();

  const schema = isLogin ? loginSchema : registerSchema;
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema),
    mode: 'onTouched',
  });

  useEffect(() => {
    if (localStorage.getItem('token')) navigate('/dashboard');
  }, [navigate]);

  const submitHandler = async (data) => {
    setLoading(true);
    setServerError('');
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin
        ? { email: data.email, password: data.password }
        : { ...data, role: selectedRole };
      const res = await API.post(endpoint, payload);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setServerError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async (credentialResponse) => {
    setLoading(true);
    setServerError('');
    try {
      const res = await API.post('/auth/google', { token: credentialResponse.credential });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setServerError(err.response?.data?.error || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => { setIsLogin((p) => !p); setServerError(''); setSelectedRole('MEMBER'); reset(); };

  return (
    <div className={`min-h-screen bg-page flex flex-col md:grid md:grid-cols-12 transition-colors duration-300 ${dark ? 'mesh-dark' : 'mesh-light'}`}>
      
      {/* ── Left Side Panel (Desktop only) ── */}
      <div className="hidden md:flex md:col-span-5 lg:col-span-6 xl:col-span-7 relative flex-col justify-between p-12 overflow-hidden border-r border-theme bg-slate-900/10 dark:bg-slate-950/10 backdrop-blur-md">
        {/* Glow circles */}
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-violet-500/10 dark:bg-violet-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-amber-500/10 dark:bg-amber-500/5 blur-3xl" />

        {/* Branding top */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-amber-500 text-white shadow-lg shadow-violet-500/25">
            <Workflow size={20} />
          </div>
          <div>
            <span className="text-xl font-black text-primary tracking-wide">TaskerTrack</span>
            <p className="text-[10px] font-bold text-muted uppercase tracking-widest leading-none mt-0.5">Enterprise</p>
          </div>
        </div>

        {/* Dynamic Graphic Content */}
        <div className="space-y-8 my-auto relative z-10 max-w-lg">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-surface)] px-3 py-1 text-xs font-bold text-[var(--accent)] border border-[var(--accent-border)]">
              ✨ Premium Team Workspaces
            </span>
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-black text-primary leading-tight tracking-tight">
              Manage work <br />
              <span className="gradient-text">effortlessly.</span>
            </h2>
            <p className="text-secondary text-sm lg:text-base leading-relaxed">
              TaskerTrack gives teams a beautiful, visual, and high-performance canvas to manage workspaces, track assignments, and collaborate in real-time.
            </p>
          </div>

          {/* Value props list */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-surface)] text-[var(--accent)] border border-[var(--accent-border)]">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
              </div>
              <div>
                <p className="text-sm font-bold text-primary">Sleek Sidebar Navigation</p>
                <p className="text-xs text-muted">A dedicated workspace experience built for high speed.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-surface)] text-[var(--accent)] border border-[var(--accent-border)]">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
              </div>
              <div>
                <p className="text-sm font-bold text-primary">Dynamic Mesh Aesthetics</p>
                <p className="text-xs text-muted">Seamless light and dark themes styled with gorgeous gradients.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-surface)] text-[var(--accent)] border border-[var(--accent-border)]">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
              </div>
              <div>
                <p className="text-sm font-bold text-primary">Powerful Filters & Search</p>
                <p className="text-xs text-muted">Quickly locate tasks and projects across multiple variables.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-xs text-muted relative z-10">
          &copy; 2026 TaskerTrack Inc. All rights reserved.
        </div>
      </div>

      {/* ── Right Side Panel (Form) ── */}
      <div className="col-span-12 md:col-span-7 lg:col-span-6 xl:col-span-5 flex flex-col justify-between min-h-screen p-6 md:p-12">
        {/* Mobile Header / Desktop Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-amber-500 text-white">
              <Workflow size={16} />
            </div>
            <span className="text-base font-bold text-primary">TaskerTrack</span>
          </div>
          <div className="hidden md:block" /> {/* spacer */}
          <button onClick={toggle} className="rounded-xl p-2.5 border border-theme bg-surface/30 hover:bg-surface/50 text-secondary hover:text-primary transition-all">
            {dark ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-indigo-500" />}
          </button>
        </div>

        {/* Form Container */}
        <div className="my-auto py-8 flex justify-center">
          <div className="w-full max-w-sm space-y-6">
            <div className="space-y-1">
              <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-primary">
                {isLogin
                  ? 'Welcome back'
                  : selectedRole === 'ADMIN'
                    ? 'Start as Admin'
                    : 'Join as Member'}
              </h1>
              <p className="text-secondary text-sm">
                {isLogin ? 'Enter your credentials to access your workspace' : 'Create your account to start collaborating'}
              </p>
            </div>



            {/* ── Google Login ── */}
            <div className="flex justify-center w-full">
              <GoogleLogin
                onSuccess={handleGoogle}
                onError={() => setServerError('Google sign-in failed')}
                theme={dark ? 'filled_black' : 'outline'}
                shape="pill"
                width="384"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-[var(--border)]" />
              <span className="text-[10px] font-bold text-muted uppercase tracking-widest shrink-0">or continue with email</span>
              <div className="h-px flex-1 bg-[var(--border)]" />
            </div>

            {serverError && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-500 dark:text-red-400">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
              {!isLogin && (
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-secondary uppercase tracking-widest">Your name</label>
                  <input type="text" {...register('name')} placeholder="John Doe" className="w-full rounded-xl input-field px-4 py-2.5 text-sm" />
                  {errors.name?.message && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-secondary uppercase tracking-widest">Email address</label>
                <input type="email" {...register('email')} placeholder="john@company.com" className="w-full rounded-xl input-field px-4 py-2.5 text-sm" />
                {errors.email?.message && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold text-secondary uppercase tracking-widest">Password</label>
                  {isLogin && (
                    <Link to="/forgot-password" className="text-xs font-semibold text-[var(--accent)] hover:underline">
                      Forgot password?
                    </Link>
                  )}
                </div>
                <input type="password" {...register('password')} placeholder="Min 6 characters" className="w-full rounded-xl input-field px-4 py-2.5 text-sm" />
                {errors.password?.message && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
              </div>

              {!isLogin && (
                <div className="space-y-2 pt-1">
                  <label className="block text-[10px] font-bold text-secondary uppercase tracking-widest">I want to join as</label>
                  <div className="flex rounded-xl bg-[var(--surface-overlay)] border border-theme p-1 w-full">
                    <button
                      type="button"
                      onClick={() => setSelectedRole('MEMBER')}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition-all duration-300 ${
                        selectedRole === 'MEMBER'
                          ? 'bg-gradient-to-r from-violet-500 to-amber-500 text-white shadow-md shadow-violet-500/10'
                          : 'text-secondary hover:text-primary'
                      }`}
                    >
                      <Users size={14} />
                      <span>Member</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole('ADMIN')}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition-all duration-300 ${
                        selectedRole === 'ADMIN'
                          ? 'bg-gradient-to-r from-violet-500 to-amber-500 text-white shadow-md shadow-violet-500/10'
                          : 'text-secondary hover:text-primary'
                      }`}
                    >
                      <Crown size={14} />
                      <span>Admin</span>
                    </button>
                  </div>
                </div>
              )}

              <button type="submit" disabled={loading} className="w-full rounded-xl btn-primary px-4 py-3 text-sm flex items-center justify-center gap-2">
                {loading ? 'Please wait...' : isLogin ? 'Sign In →' : 'Create Account →'}
              </button>
            </form>

            <p className="text-center text-sm text-secondary">
              {isLogin ? 'New to TaskerTrack? ' : 'Have an account? '}
              <button onClick={toggleMode} className="font-bold text-[var(--accent)] hover:underline">
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>
        </div>

        {/* Mobile-only Footer */}
        <div className="text-center text-[10px] text-muted md:hidden mt-4">
          &copy; 2026 TaskerTrack Inc. All rights reserved.
        </div>
      </div>
    </div>
  );
}