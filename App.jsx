import { useEffect, useState } from 'react';
import { NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { Activity, BookOpen, ChevronRight, LayoutDashboard, Menu, MessageSquarePlus, X } from 'lucide-react';
import Dashboard from './pages/Dashboard.jsx';
import FeedbackForm from './pages/FeedbackForm.jsx';

function Sidebar({ open, onClose }) {
  return <>
    {open && <button aria-label="Close navigation overlay" className="sidebar-overlay" onClick={onClose} />}
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <div className="brand">
        <div className="brand-mark"><Activity size={22} strokeWidth={2.6} /></div>
        <div><span className="brand-name">ClassEcho</span><span className="brand-caption">COURSE FEEDBACK</span></div>
        <button className="icon-button sidebar-close" aria-label="Close menu" onClick={onClose}><X size={18}/></button>
      </div>
      <div className="workspace-label">WORKSPACE</div>
      <nav className="side-nav">
        <NavLink to="/" end onClick={onClose} className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={18}/><span>Dashboard</span>
        </NavLink>
        <NavLink to="/feedback/new" onClick={onClose} className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
          <MessageSquarePlus size={18}/><span>Add Feedback</span>
        </NavLink>
      </nav>
      <div className="sidebar-bottom">
        <div className="help-card">
          <div className="help-icon"><BookOpen size={17}/></div>
          <strong>Listen. Learn. Improve.</strong>
          <p>Use learner feedback to spot what is working and what needs attention.</p>
        </div>
        <div className="profile-row">
          <div className="avatar">AD</div>
          <div className="profile-copy"><strong>CourseEcho admin</strong><span>Administrator</span></div>
          <span className="online-dot"/>
        </div>
      </div>
    </aside>
  </>;
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setMenuOpen(false), [location.pathname]);
  return <div className="app-shell">
    <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
    <main className="main-area">
      <header className="topbar">
        <button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setMenuOpen(true)}><Menu size={21}/></button>
        <div className="breadcrumb"><span>Workspace</span><ChevronRight size={14}/><strong>{location.pathname === '/' ? 'Dashboard' : location.pathname.includes('/edit/') ? 'Update feedback' : 'Add feedback'}</strong></div>
        <div className="topbar-right"><span className="status-dot"/><span className="system-status">All systems operational</span><div className="topbar-avatar">AD</div></div>
      </header>
      <div className="page-content">
        <Routes>
          <Route path="/" element={<Dashboard/>}/>
          <Route path="/feedback/new" element={<FeedbackForm/>}/>
          <Route path="/feedback/edit/:id" element={<FeedbackForm/>}/>
          <Route path="*" element={<Dashboard/>}/>
        </Routes>
      </div>
      <footer className="app-footer"><span>© {new Date().getFullYear()} ClassEcho</span><span>Small feedback, better courses <span className="footer-heart">♥</span></span></footer>
    </main>
  </div>;
}
