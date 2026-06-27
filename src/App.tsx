import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, TrendingUp, GraduationCap, BarChart3, PieChart,
  X, Menu
} from 'lucide-react';

import { Dashboard } from './sections/Dashboard';
import { MarknadsOversikt } from './sections/MarknadsOversikt';
import { AktieAnalys } from './sections/AktieAnalys';
import { Portfolio } from './sections/Portfolio';
import { Larande } from './sections/Larande';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'marknad', label: 'Marknad', icon: TrendingUp },
  { id: 'analys', label: 'Aktieanalys', icon: BarChart3 },
  { id: 'portfolio', label: 'Portfölj', icon: PieChart },
  { id: 'larande', label: 'Lärande', icon: GraduationCap },
];

function Navigation() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname.replace('/', '') || 'dashboard';

  return (
    <>
      <button onClick={() => setOpen(!open)} style={{ position: 'fixed', top: 12, left: 12, zIndex: 1000, background: '#1a1f35', border: '1px solid #2a3050', borderRadius: 8, padding: '8px 12px', color: '#e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
        {open ? <X size={20} /> : <Menu size={20} />}
        <span style={{ fontSize: 14, fontWeight: 600 }}>AK1nvestor</span>
      </button>
      {open && (
        <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.5)' }}>
          <div onClick={e => e.stopPropagation()} style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 260, background: '#0f1425', borderRight: '1px solid #2a3050', padding: '60px 0 20px', overflowY: 'auto', zIndex: 1000 }}>
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const active = currentPath === item.id;
              return (
                <button key={item.id} onClick={() => { navigate('/' + item.id); setOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 20px', background: active ? 'rgba(212,175,55,0.15)' : 'transparent', border: 'none', borderLeft: active ? '3px solid #d4af37' : '3px solid transparent', color: active ? '#d4af37' : '#94a3b8', cursor: 'pointer', fontSize: 14, textAlign: 'left' }}>
                  <Icon size={18} />{item.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#0f1425', borderTop: '1px solid #2a3050', display: 'flex', justifyContent: 'space-around', padding: '8px 0', zIndex: 100 }}>
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const active = currentPath === item.id;
          return (
            <button key={item.id} onClick={() => navigate('/' + item.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: active ? '#d4af37' : '#94a3b8', cursor: 'pointer', fontSize: 11, padding: '4px 8px' }}>
              <Icon size={20} /><span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}

export default function App() {
  return (
    <div style={{ minHeight: '100dvh', paddingBottom: 60 }}>
      <Navigation />
      <div style={{ padding: '60px 16px 80px' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/marknad" element={<MarknadsOversikt />} />
          <Route path="/analys" element={<AktieAnalys />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/larande" element={<Larande />} />
        </Routes>
      </div>
    </div>
  );
}
