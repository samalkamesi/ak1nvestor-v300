import { PieChart, TrendingUp, DollarSign, Target } from 'lucide-react';

export function Portfolio() {
  const holdings = [
    { ticker: 'ERIC B', name: 'Ericsson', shares: 100, avgPrice: '78.50', currentPrice: '86.45', value: '8,645', pnl: '+10.1%', up: true },
    { ticker: 'VOLV B', name: 'Volvo', shares: 50, avgPrice: '295.00', currentPrice: '312.80', value: '15,640', pnl: '+6.0%', up: true },
    { ticker: 'EVO', name: 'Evolution', shares: 20, avgPrice: '450.00', currentPrice: '425.60', value: '8,512', pnl: '-5.4%', up: false },
  ];

  const totalValue = holdings.reduce((sum, h) => sum + parseFloat(h.value.replace(',', '')), 0);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#d4af37', marginBottom: 20 }}>
        <PieChart size={24} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />Min Portfölj
      </h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 20 }}>
        <div style={{ background: '#1a1f35', border: '1px solid #2a3050', borderRadius: 12, padding: 16, textAlign: 'center' }}>
          <DollarSign size={20} color="#d4af37" style={{ margin: '0 auto 8px' }} />
          <div style={{ fontSize: 12, color: '#94a3b8' }}>Totalt värde</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#e2e8f0' }}>{totalValue.toLocaleString()} kr</div>
        </div>
        <div style={{ background: '#1a1f35', border: '1px solid #2a3050', borderRadius: 12, padding: 16, textAlign: 'center' }}>
          <TrendingUp size={20} color="#4ade80" style={{ margin: '0 auto 8px' }} />
          <div style={{ fontSize: 12, color: '#94a3b8' }}>Total avkastning</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#4ade80' }}>+10.9%</div>
        </div>
        <div style={{ background: '#1a1f35', border: '1px solid #2a3050', borderRadius: 12, padding: 16, textAlign: 'center' }}>
          <Target size={20} color="#d4af37" style={{ margin: '0 auto 8px' }} />
          <div style={{ fontSize: 12, color: '#94a3b8' }}>Antal innehav</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#e2e8f0' }}>{holdings.length}</div>
        </div>
      </div>
      <h2 style={{ fontSize: 16, fontWeight: 600, color: '#e2e8f0', marginBottom: 12 }}>Innehav</h2>
      <div style={{ display: 'grid', gap: 10 }}>
        {holdings.map((h, i) => (
          <div key={i} style={{ background: '#1a1f35', border: '1px solid #2a3050', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><div style={{ fontWeight: 600, color: '#e2e8f0' }}>{h.name}</div><div style={{ fontSize: 12, color: '#94a3b8' }}>{h.ticker} · {h.shares} st</div></div>
              <div style={{ textAlign: 'right' }}><div style={{ fontWeight: 700, color: '#e2e8f0' }}>{h.value} kr</div><div style={{ fontSize: 13, color: h.up ? '#4ade80' : '#f87171' }}>{h.pnl}</div></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
