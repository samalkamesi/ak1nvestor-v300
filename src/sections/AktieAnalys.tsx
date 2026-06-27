import { Search, BarChart3, TrendingUp, Activity, PieChart, Star } from 'lucide-react';
import { useState } from 'react';

export function AktieAnalys() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStock, setSelectedStock] = useState<string | null>(null);

  const stocks = [
    { ticker: 'ERIC B', name: 'Ericsson', price: '86.45', change: '+1.2%', up: true, sector: 'Telekom' },
    { ticker: 'VOLV B', name: 'Volvo', price: '312.80', change: '-0.5%', up: false, sector: 'Industri' },
    { ticker: 'SEB A', name: 'SEB', price: '145.20', change: '+0.8%', up: true, sector: 'Bank' },
    { ticker: 'EVO', name: 'Evolution', price: '425.60', change: '+2.1%', up: true, sector: 'Tech' },
    { ticker: 'ASSA B', name: 'Assa Abloy', price: '218.40', change: '-0.3%', up: false, sector: 'Industri' },
    { ticker: 'ATCO A', name: 'Atlas Copco', price: '185.30', change: '+0.6%', up: true, sector: 'Industri' },
  ];

  const filtered = stocks.filter(s =>
    s.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#d4af37', marginBottom: 20 }}>
        <BarChart3 size={24} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />Aktieanalys
      </h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#1a1f35', border: '1px solid #2a3050', borderRadius: 10, padding: '10px 14px', marginBottom: 20 }}>
        <Search size={18} color="#94a3b8" />
        <input type="text" placeholder="Sök aktie..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          style={{ background: 'none', border: 'none', outline: 'none', color: '#e2e8f0', fontSize: 15, width: '100%' }} />
      </div>
      <div style={{ display: 'grid', gap: 10 }}>
        {filtered.map((stock, i) => (
          <div key={i} onClick={() => setSelectedStock(selectedStock === stock.ticker ? null : stock.ticker)}
            style={{ background: '#1a1f35', border: '1px solid', borderRadius: 12, padding: 16, cursor: 'pointer',
              borderColor: selectedStock === stock.ticker ? '#d4af37' : '#2a3050' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(212,175,55,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#d4af37', fontSize: 12 }}>{stock.ticker.split(' ')[0]}</div>
                <div><div style={{ fontWeight: 600, color: '#e2e8f0' }}>{stock.name}</div><div style={{ fontSize: 12, color: '#94a3b8' }}>{stock.ticker} · {stock.sector}</div></div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: 16 }}>{stock.price} kr</div>
                <div style={{ fontSize: 13, color: stock.up ? '#4ade80' : '#f87171' }}>{stock.change}</div>
              </div>
            </div>
            {selectedStock === stock.ticker && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #2a3050' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 8 }}>
                  {[{ label: 'RSI (14)', value: '58.4', icon: Activity }, { label: 'MA 50', value: (parseFloat(stock.price) * 0.98).toFixed(2), icon: BarChart3 }, { label: 'P/E', value: '14.2', icon: PieChart }, { label: 'AK1 Rating', value: '7.5/10', icon: Star }].map((item, j) => {
                    const Icon = item.icon;
                    return (
                      <div key={j} style={{ textAlign: 'center', padding: 8, background: '#0f1425', borderRadius: 8 }}>
                        <Icon size={16} color="#d4af37" style={{ display: 'block', margin: '0 auto 4px' }} />
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{item.label}</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>{item.value}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
