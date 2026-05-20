import { useEffect, useState } from 'react';
import API from '../api/axios';
import Modal from '../components/Modal';
import { ListChecks, Plus, Pencil, Trash2, Calendar } from 'lucide-react';

const emptyForm = { title: '', description: '', projectId: '', assignedTo: '', priority: 'MEDIUM', dueDate: '' };

const STATUS_LABELS = { TO_DO: 'Queued', IN_PROGRESS: 'Working', REVIEW: 'Review', COMPLETED: 'Done' };
const PRIORITY_STYLES = {
  HIGH: 'bg-rose-500/10 text-rose-500 dark:bg-rose-500/15 dark:text-rose-400 border border-rose-500/20',
  MEDIUM: 'bg-amber-500/10 text-amber-500 dark:bg-amber-500/15 dark:text-amber-400 border border-amber-500/20',
  LOW: 'bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-500/20',
};
const STATUS_STYLES = {
  TO_DO: 'bg-zinc-500/10 text-zinc-500 dark:text-zinc-400',
  IN_PROGRESS: 'bg-blue-500/10 text-blue-500 dark:text-blue-400',
  REVIEW: 'bg-violet-500/10 text-violet-500 dark:text-violet-400',
  COMPLETED: 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400',
};

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.assignee?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProject = !filterProject || task.projectId === Number(filterProject);
    const matchesPriority = !filterPriority || task.priority === filterPriority;
    const matchesStatus = !filterStatus || task.status === filterStatus;
    return matchesSearch && matchesProject && matchesPriority && matchesStatus;
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [t, p] = await Promise.all([API.get('/tasks'), API.get('/projects')]);
      setTasks(t.data);
      setProjects(p.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);
  useEffect(() => {
    if (!form.projectId) { setMembers([]); return; }
    API.get(`/projects/${form.projectId}/members`).then((r) => setMembers(r.data));
  }, [form.projectId]);

  const openCreate = () => { setEditId(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (t) => {
    setEditId(t.id);
    setForm({
      title: t.title, description: t.description || '', projectId: String(t.projectId),
      assignedTo: t.assignedTo ? String(t.assignedTo) : '', priority: t.priority,
      dueDate: t.dueDate ? String(t.dueDate).split('T')[0] : '',
    });
    setShowModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    const p = { ...form, projectId: Number(form.projectId), assignedTo: form.assignedTo ? Number(form.assignedTo) : null };
    if (editId) await API.put(`/tasks/${editId}`, p);
    else await API.post('/tasks', p);
    setShowModal(false); setEditId(null); setForm(emptyForm); loadData();
  };

  const remove = async (id) => { if (window.confirm('Remove this assignment?')) { await API.delete(`/tasks/${id}`); loadData(); } };
  const setStatus = async (id, s) => { await API.put(`/tasks/${id}/status`, { status: s }); loadData(); };

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center text-secondary">Loading assignments...</div>;
  if (error) return <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-red-500 dark:text-red-400">{error}</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-primary flex items-center gap-2">
            <ListChecks size={22} className="text-[var(--accent)]" /> Assignments
          </h1>
          <p className="text-sm text-secondary mt-1">Manage and monitor all work items</p>
        </div>
        {user.role === 'ADMIN' && (
          <button onClick={openCreate} className="btn-primary rounded-xl px-4 py-2.5 text-sm flex items-center gap-2">
            <Plus size={16} /> Add assignment
          </button>
        )}
      </div>

      {/* ── Search & Filters Bar ── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 bg-[var(--surface-raised)] border border-theme p-4 rounded-2xl">
        <div className="relative sm:col-span-2 lg:col-span-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assignments or assignees..."
            className="w-full rounded-xl input-field pl-10 pr-4 py-2.5 text-sm"
          />
          <svg
            className="absolute left-3.5 top-3.5 h-4 w-4 text-[var(--text-muted)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <div>
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="w-full rounded-xl input-field px-3 py-2.5 text-sm cursor-pointer"
          >
            <option value="">All Workspaces</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="w-full rounded-xl input-field px-3 py-2.5 text-sm cursor-pointer"
          >
            <option value="">All Urgencies</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>

        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full rounded-xl input-field px-3 py-2.5 text-sm cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="TO_DO">Queued</option>
            <option value="IN_PROGRESS">Working</option>
            <option value="REVIEW">Review</option>
            <option value="COMPLETED">Done</option>
          </select>
        </div>
      </div>

      {/* ── Table-like list ── */}
      {filteredTasks.length === 0 ? (
        <div className="rounded-2xl card border-dashed p-12 text-center">
          <ListChecks size={36} className="mx-auto text-muted mb-3" />
          <p className="text-secondary font-medium">No assignments found</p>
          <p className="text-muted text-sm mt-1">Try resetting or modifying your search/filters.</p>
        </div>
      ) : (
        <div className="rounded-2xl card overflow-hidden">
          {/* Header Row */}
          <div className="hidden md:grid md:grid-cols-12 gap-4 px-5 py-3 bg-[var(--surface-overlay)] text-xs font-bold text-muted uppercase tracking-wider border-b border-theme">
            <div className="col-span-4">Title</div>
            <div className="col-span-2">Workspace</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1">Priority</div>
            <div className="col-span-2">Due</div>
            <div className="col-span-1"></div>
          </div>

          {/* Rows */}
          {filteredTasks.map((task) => (
            <div key={task.id} className="grid md:grid-cols-12 gap-4 items-center px-5 py-4 border-b border-theme last:border-b-0 hover:bg-[var(--surface-overlay)] transition group">
              {/* Title + Assignee */}
              <div className="md:col-span-4">
                <p className="text-sm font-semibold text-primary">{task.title}</p>
                <p className="text-xs text-muted mt-0.5">{task.assignee?.name || 'Unassigned'}</p>
              </div>

              {/* Workspace */}
              <div className="md:col-span-2">
                <span className="text-xs text-secondary">{task.project?.name || '—'}</span>
              </div>

              {/* Status */}
              <div className="md:col-span-2">
                <select
                  value={task.status}
                  onChange={(e) => setStatus(task.id, e.target.value)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold border-none outline-none cursor-pointer ${STATUS_STYLES[task.status]}`}
                >
                  <option value="TO_DO">Queued</option>
                  <option value="IN_PROGRESS">Working</option>
                  <option value="REVIEW">Review</option>
                  <option value="COMPLETED">Done</option>
                </select>
              </div>

              {/* Priority */}
              <div className="md:col-span-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${PRIORITY_STYLES[task.priority]}`}>
                  {task.priority}
                </span>
              </div>

              {/* Due date */}
              <div className="md:col-span-2 flex items-center gap-1.5 text-xs text-muted">
                <Calendar size={12} />
                {new Date(task.dueDate).toLocaleDateString()}
              </div>

              {/* Actions */}
              <div className="md:col-span-1 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {user.role === 'ADMIN' && (
                  <>
                    <button onClick={() => openEdit(task)} className="rounded-lg p-1.5 text-muted hover:text-[var(--accent)] hover:bg-[var(--accent-surface)] transition">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => remove(task.id)} className="rounded-lg p-1.5 text-muted hover:text-red-500 hover:bg-red-500/10 transition">
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Create/Edit Modal ── */}
      {showModal && (
        <Modal title={editId ? 'Edit assignment' : 'New assignment'} onClose={() => setShowModal(false)}>
          <form onSubmit={save} className="space-y-4">
            <FInput label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="What needs to be done?" />
            <FTextarea label="Details" value={form.description} onChange={(v) => setForm({ ...form, description: v })} placeholder="Add more context..." />

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1.5 uppercase tracking-wider">Workspace</label>
                <select value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value, assignedTo: '' })} className="w-full rounded-xl input-field px-4 py-2.5 text-sm">
                  <option value="">Pick workspace</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1.5 uppercase tracking-wider">Assign to</label>
                <select value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} className="w-full rounded-xl input-field px-4 py-2.5 text-sm">
                  <option value="">Nobody</option>
                  {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-secondary mb-1.5 uppercase tracking-wider">Urgency</label>
                <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="w-full rounded-xl input-field px-4 py-2.5 text-sm">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <FInput label="Deadline" type="date" value={form.dueDate} onChange={(v) => setForm({ ...form, dueDate: v })} />
            </div>

            <button className="w-full rounded-xl btn-primary py-2.5 text-sm">{editId ? 'Update' : 'Create'} assignment</button>
          </form>
        </Modal>
      )}
    </div>
  );
}

function FInput({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-secondary mb-1.5 uppercase tracking-wider">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-xl input-field px-4 py-2.5 text-sm" />
    </div>
  );
}

function FTextarea({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-secondary mb-1.5 uppercase tracking-wider">{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} placeholder={placeholder} className="w-full rounded-xl input-field px-4 py-2.5 text-sm" />
    </div>
  );
}