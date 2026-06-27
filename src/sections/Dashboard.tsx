import { useState } from 'react';
import { Activity, BarChart3, DollarSign, Zap, TrendingUp, PieChart, Newspaper } from 'lucide-react';

export function Dashboard() {
  const stats = [
    { label: 'OMX Stockholm 30', value: '2,847.52', change: '+1.24%', up: true, icon: Activity },
    { label: 'Nasdaq Stockholm', value: '485.21', change: '+0.87%', up: true, icon: BarChart3 },
    { label: 'EUR/SEK', value: '11.4523', change: '-0.15%', up: false, icon: DollarSign },
    { label: 'Guld (USD/oz)', value: '2,745.80', change: '+0.62%', up: true, icon: Zap },
  ];

  const quickLinks = [
    { label: 'Marknadsöversikt', icon: TrendingUp, desc: 'Real-tidsdata och trender' },
    { label: 'Aktieanalys', icon: PieChart, desc: 'Djupanalys med AI' },
    { label: 'Nyheter', icon: Newspaper, desc: 'Senaste marknadsnyheter' },
    { label: 'Top Picks', icon: Zap, desc: 'Dagens bästa lägen' },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#d4af37', marginBottom: 20, textAlign: 'center' }}>AK1nvestor Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} style={{ background: '#1a1f35', border: '1px solid #2a3050', borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ color: '#94a3b8', fontSize: 12 }}>{s.label}</span>
                <Icon size={16} color="#d4af37" />
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#e2e8f0' }}>{s.value}</div>
              <div style={{ fontSize: 13, color: s.up ? '#4ade80' : '#f87171', marginTop: 4 }}>{s.change}</div>
            </div>
          );
        })}
      </div>
      <h2 style={{ fontSize: 18, fontWeight: 600, color: '#e2e8f0', marginBottom: 12 }}>Snabblänkar</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        {quickLinks.map((link, i) => {
          const Icon = link.icon;
          return (
            <div key={i} style={{ background: '#1a1f35', border: '1px solid #2a3050', borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <Icon size={20} color="#d4af37" />
                <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{link.label}</span>
              </div>
              <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>{link.desc}</p>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 24, padding: 20, borderRadius: 12, background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05))', border: '1px solid rgba(212,175,55,0.3)', textAlign: 'center' }}>
        <h3 style={{ color: '#d4af37', margin: '0 0 8px', fontSize: 18 }}>Utbildning → Inkomst</h3>
        <p style={{ color: '#94a3b8', margin: 0, fontSize: 14 }}>Sveriges mest omfattande AI-drivna aktieanalysplattform. Lär dig, analysera, investera.</p>
      </div>
    </div>
  );
}
