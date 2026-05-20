import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, CheckSquare, LogOut, Sun, Moon, Workflow } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const links = [
  { label: 'Overview', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Workspaces', to: '/projects', icon: FolderKanban },
  { label: 'Assignments', to: '/tasks', icon: CheckSquare },
];

export default function Layout() {
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className={`min-h-screen bg-page md:flex transition-colors duration-300 ${dark ? 'mesh-dark' : 'mesh-light'}`}>
      {/* ── Sidebar (Desktop) ── */}
      <aside className="hidden md:flex fixed top-0 bottom-0 left-0 z-50 w-64 flex-col justify-between border-r border-theme card-raised p-5">
        <div className="space-y-6">
          {/* Logo / Branding */}
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-amber-500 text-white shadow-lg shadow-violet-500/25">
              <Workflow size={20} />
            </div>
            <div>
              <span className="text-lg font-black text-primary tracking-wide">TaskerTrack</span>
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest leading-none mt-0.5">Workspace</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {links.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 relative group ${
                    isActive
                      ? 'bg-[var(--accent-surface)] text-[var(--accent)]'
                      : 'text-secondary hover:text-primary hover:bg-[var(--surface-overlay)]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={18} className={isActive ? 'text-[var(--accent)]' : 'text-secondary group-hover:text-primary transition-colors'} />
                    <span>{label}</span>
                    {isActive && (
                      <span className="absolute left-0 top-3 bottom-3 w-1 rounded-r-md bg-[var(--accent)]" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="space-y-4">
          {/* Theme Toggle Button */}
          <button
            onClick={toggle}
            className="flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-sm font-semibold text-secondary hover:text-primary hover:bg-[var(--surface-overlay)] transition-all border border-transparent hover:border-theme"
          >
            <span className="flex items-center gap-3">
              {dark ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-indigo-500" />}
              <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>
            </span>
            <span className="text-[10px] font-bold text-muted bg-[var(--surface-overlay)] px-1.5 py-0.5 rounded uppercase">
              Theme
            </span>
          </button>

          <div className="h-px bg-theme" />

          {/* Profile & Logout */}
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-amber-500 text-sm font-bold text-white shadow-md shadow-violet-500/10">
                {(user.name || 'U')[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-primary truncate leading-tight">{user.name || 'User'}</p>
                <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mt-0.5">{user.role || 'MEMBER'}</p>
              </div>
            </div>

            <button
              onClick={logout}
              className="rounded-xl p-2.5 text-secondary hover:text-red-500 hover:bg-red-500/10 transition-all shrink-0 border border-transparent hover:border-red-500/10"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Mobile Header ── */}
      <header className="md:hidden sticky top-0 z-50 border-b border-theme card-raised">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-amber-500 text-white">
              <Workflow size={16} />
            </div>
            <span className="text-base font-bold text-primary">TaskerTrack</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggle} className="rounded-lg p-2 text-secondary">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button onClick={logout} className="rounded-lg p-2 text-secondary hover:text-red-500">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 md:pl-64">
        <div className="mx-auto max-w-6xl p-4 md:p-8 pb-20 md:pb-8">
          <Outlet />
        </div>
      </main>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-theme card-raised flex justify-around py-2">
        {links.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1 text-[11px] font-medium transition ${
                isActive ? 'text-[var(--accent)]' : 'text-muted'
              }`
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}