import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownRight, ArrowUpRight, BookOpen, CalendarDays, ChevronDown, CirclePlus, Clock3, MessageSquareText, MoreHorizontal, Pencil, Search, SlidersHorizontal, Sparkles, Star, Trash2, Users, X } from 'lucide-react';
import api, { getErrorMessage } from '../api.js';
import RatingStars from '../components/RatingStars.jsx';

function StatCard({ icon: Icon, label, value, note, tone, trend }) {
  return <article className="stat-card">
    <div className={`stat-icon ${tone}`}><Icon size={20}/></div>
    <div className="stat-label">{label}</div>
    <div className="stat-value">{value}</div>
    <div className="stat-note">{trend && <span className="trend"><ArrowUpRight size={13}/>{trend}</span>}{note}</div>
  </article>;
}
function courseRows(items) {
  const groups = new Map();
  items.forEach(item => {
    const key = item.courseName.trim().toLowerCase();
    if (!groups.has(key)) groups.set(key, { courseName: item.courseName, courseDuration: item.courseDuration, feedbacks: [], latest: item.createdAt });
    const group = groups.get(key);
    group.feedbacks.push(item);
    if (new Date(item.createdAt) > new Date(group.latest)) {
      group.latest = item.createdAt;
      group.courseDuration = item.courseDuration;
    }
  });
  return [...groups.values()].map((group, i) => ({
    ...group,
    courseId: `CRS-${String(group.feedbacks[0]._id).slice(-6).toUpperCase()}`,
    averageRating: group.feedbacks.reduce((sum, f) => sum + Number(f.rating), 0) / group.feedbacks.length,
    feedbackCount: group.feedbacks.length,
    latestComment: group.feedbacks[0]?.comments || '',
    latestFeedbackId: group.feedbacks[0]?._id,
  })).sort((a,b) => new Date(b.latest) - new Date(a.latest));
}
export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [notice, setNotice] = useState('');

  const loadFeedback = useCallback(async () => {
    setLoading(true); setError('');
    try { const response = await api.get('/feedback'); setItems(response.data); }
    catch (err) { setError(getErrorMessage(err)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { loadFeedback(); }, [loadFeedback]);

  const rows = useMemo(() => courseRows(items), [items]);
  const filteredRows = useMemo(() => rows.filter(row => {
    const matchesText = `${row.courseName} ${row.courseId} ${row.courseDuration}`.toLowerCase().includes(search.toLowerCase());
    const matchesRating = ratingFilter === 'all' || (ratingFilter === 'high' ? row.averageRating >= 4 : row.averageRating < 4);
    return matchesText && matchesRating;
  }), [rows, search, ratingFilter]);
  const overallRating = items.length ? items.reduce((s, item) => s + Number(item.rating), 0) / items.length : 0;

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/feedback/${deleteTarget._id}`);
      setItems(current => current.filter(item => item._id !== deleteTarget._id));
      setNotice('Feedback deleted successfully.');
      setDeleteTarget(null);
      window.setTimeout(() => setNotice(''), 3500);
    } catch (err) { setError(getErrorMessage(err)); setDeleteTarget(null); }
    finally { setDeleting(false); }
  }

  return <div className="dashboard-page">
    <div className="page-heading">
      <div><div className="eyebrow"><span className="eyebrow-line"/>OVERVIEW</div><h1>Feedback dashboard<span className="heading-period">.</span></h1><p className="page-subtitle">A clear view of how your courses are performing.</p></div>
      <Link className="primary-button" to="/feedback/new"><CirclePlus size={17}/> Add feedback</Link>
    </div>

    {notice && <div className="notice success-notice"><Sparkles size={17}/>{notice}<button className="notice-close" onClick={() => setNotice('')} aria-label="Dismiss"><X size={16}/></button></div>}
    {error && <div className="notice error-notice">{error}<button className="text-button" onClick={loadFeedback}>Try again</button></div>}

    <section className="stats-grid">
      <StatCard icon={BookOpen} label="COURSES REVIEWED" value={rows.length} note="Unique courses" tone="purple"/>
      <StatCard icon={MessageSquareText} label="TOTAL RESPONSES" value={items.length} note="Feedback entries" tone="blue"/>
      <StatCard icon={Star} label="AVERAGE RATING" value={items.length ? overallRating.toFixed(1) : '—'} note="Out of 5.0 stars" tone="amber"/>
      <StatCard icon={Users} label="COURSES RATED 4+" value={rows.filter(r => r.averageRating >= 4).length} note="High-rated courses" tone="green"/>
    </section>

    <section className="table-card">
      <div className="table-card-header">
        <div><div className="section-title-row"><h2>Course feedback</h2><span className="count-pill">{rows.length}</span></div><p>Review ratings and manage submitted feedback.</p></div>
        <div className="table-header-actions"><span className="updated-label"><span className="status-dot"/> Live data</span></div>
      </div>
      <div className="table-toolbar">
        <label className="search-box"><Search size={17}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses..." aria-label="Search courses"/>{search && <button onClick={() => setSearch('')} aria-label="Clear search"><X size={14}/></button>}</label>
        <label className="filter-select"><SlidersHorizontal size={15}/><select value={ratingFilter} onChange={e => setRatingFilter(e.target.value)} aria-label="Filter by rating"><option value="all">All ratings</option><option value="high">4.0 and above</option><option value="low">Below 4.0</option></select><ChevronDown size={14}/></label>
      </div>
      <div className="table-scroll">
        <table>
          <thead><tr><th>COURSE</th><th>DURATION</th><th>FEEDBACK</th><th>OVERALL RATING</th><th className="actions-heading">ACTIONS</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan="5"><div className="table-state"><span className="spinner"/><span>Loading course feedback…</span></div></td></tr>
            : filteredRows.length === 0 ? <tr><td colSpan="5"><div className="empty-state"><div className="empty-icon"><MessageSquareText size={22}/></div><strong>{items.length ? 'No matching courses' : 'Your feedback space is ready'}</strong><p>{items.length ? 'Try a different search or filter.' : 'Add your first course feedback to see insights here.'}</p>{!items.length && <Link className="primary-button small-button" to="/feedback/new"><CirclePlus size={15}/> Add first feedback</Link>}</div></td></tr>
            : filteredRows.map(row => <tr key={row.courseName.toLowerCase()}>
              <td><div className="course-cell"><div className="course-avatar">{row.courseName.split(/\s+/).slice(0,2).map(w => w[0]).join('').toUpperCase()}</div><div className="course-info"><strong>{row.courseName}</strong><span>{row.courseId}</span></div></div></td>
              <td><span className="duration-cell"><Clock3 size={14}/>{row.courseDuration}</span></td>
              <td><span className="feedback-count">{row.feedbackCount}</span><span className="feedback-label">{row.feedbackCount === 1 ? ' response' : ' responses'}</span></td>
              <td><div className="rating-cell"><RatingStars value={row.averageRating}/><span className={`rating-badge ${row.averageRating >= 4 ? 'rating-good' : row.averageRating >= 3 ? 'rating-mid' : 'rating-low'}`}>{row.averageRating >= 4.5 ? 'Excellent' : row.averageRating >= 4 ? 'Great' : row.averageRating >= 3 ? 'Average' : 'Needs focus'}</span></div></td>
              <td><div className="action-buttons"><Link className="action-button edit-action" to={`/feedback/edit/${row.latestFeedbackId}`} title="Update latest feedback" aria-label={`Update feedback for ${row.courseName}`}><Pencil size={15}/></Link><button className="action-button delete-action" title="Delete latest feedback" aria-label={`Delete latest feedback for ${row.courseName}`} onClick={() => setDeleteTarget(items.find(item => item._id === row.latestFeedbackId))}><Trash2 size={15}/></button></div></td>
            </tr>)}
          </tbody>
        </table>
      </div>
      <div className="table-footer"><span>Showing <strong>{filteredRows.length}</strong> of <strong>{rows.length}</strong> courses</span><span><span className="footer-live-dot"/>Synced with database</span></div>
    </section>

    <section className="insight-banner"><div className="insight-sparkle"><Sparkles size={21}/></div><div className="insight-copy"><strong>Small feedback, meaningful progress.</strong><p>Use course ratings and comments to find what learners value most.</p></div><div className="insight-decoration"><span/><span/><span/></div></section>

    {deleteTarget && <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget && !deleting) setDeleteTarget(null); }}><section className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="delete-title"><div className="modal-icon"><Trash2 size={22}/></div><h2 id="delete-title">Delete this feedback?</h2><p>This will permanently remove the feedback for <strong>{deleteTarget.courseName}</strong>. This action cannot be undone.</p><div className="modal-actions"><button className="secondary-button" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</button><button className="danger-button" onClick={confirmDelete} disabled={deleting}>{deleting ? 'Deleting…' : 'Delete feedback'}</button></div></section></div>}
  </div>;
}
