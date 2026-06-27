import { TrendingUp, TrendingDown, Globe, Activity } from 'lucide-react';
import { useState } from 'react';

export function MarknadsOversikt() {
  const [activeTab, setActiveTab] = useState('sverige');

  const markets: Record<string, Array<{name: string; value: string; change: string; up: boolean}>> = {
    sverige: [
      { name: 'OMX Stockholm 30', value: '2,847.52', change: '+1.24%', up: true },
      { name: 'OMX Stockholm PI', value: '892.45', change: '+1.18%', up: true },
      { name: 'First North 25', value: '4,521.30', change: '-0.45%', up: false },
    ],
    usa: [
      { name: 'S&P 500', value: '6,124.65', change: '+0.52%', up: true },
      { name: 'Nasdaq 100', value: '21,456.78', change: '+0.78%', up: true },
      { name: 'Dow Jones', value: '44,231.45', change: '-0.12%', up: false },
    ],
    europa: [
      { name: 'DAX 30', value: '21,023.45', change: '+0.95%', up: true },
      { name: 'FTSE 100', value: '8,456.12', change: '-0.23%', up: false },
      { name: 'CAC 40', value: '7,845.23', change: '+0.67%', up: true },
    ],
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#d4af37', marginBottom: 20 }}>
        <Globe size={24} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />Marknadsöversikt
      </h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['sverige', 'usa', 'europa'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '8px 16px', borderRadius: 8, border: '1px solid #2a3050',
            background: activeTab === tab ? 'rgba(212,175,55,0.2)' : '#1a1f35',
            color: activeTab === tab ? '#d4af37' : '#94a3b8', cursor: 'pointer', fontWeight: 600, fontSize: 14,
          }}>{tab === 'sverige' ? 'Sverige' : tab === 'usa' ? 'USA' : 'Europa'}</button>
        ))}
      </div>
      <div style={{ display: 'grid', gap: 12 }}>
        {(markets[activeTab] || []).map((m, i) => (
          <div key={i} style={{ background: '#1a1f35', border: '1px solid #2a3050', borderRadius: 12, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: 15 }}>{m.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                {m.up ? <TrendingUp size={14} color="#4ade80" /> : <TrendingDown size={14} color="#f87171" />}
                <span style={{ color: m.up ? '#4ade80' : '#f87171', fontSize: 13 }}>{m.change}</span>
              </div>
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#e2e8f0' }}>{m.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
